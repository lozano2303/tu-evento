import { useRef, useState, useEffect, useCallback } from "react"
import CanvasElement from "./CanvasElement"
import useDragAndDrop from "../components/views/Hooks/useDragAndDrop.js"

const DrawingCanvas = ({
  elements = [],
  selectedElementId = null,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
  activeTool,
  setActiveTool,
  units,
}) => {
  const svgRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentElement, setCurrentElement] = useState(null)
  const [startPoint, setStartPoint] = useState(null)
  
  const {
    dragState,
    startDrag,
    updateDrag,
    endDrag,
    calculateNewPosition,
    isDragging,
    draggedElementId
  } = useDragAndDrop()

  const viewWidth = 2000
  const viewHeight = 1200
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panOrigin = useRef({ x: 0, y: 0, offset: { x: 0, y: 0 } })

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    svg.style.touchAction = "none"
  }, [])

  const toViewCoords = (clientX, clientY) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }

    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }

    const point = svg.createSVGPoint()
    point.x = clientX
    point.y = clientY
    const svgPoint = point.matrixTransform(ctm.inverse())

    return { x: svgPoint.x, y: svgPoint.y }
  }


  const handleDragMove = useCallback((pos) => {
    const dragOffset = updateDrag(pos)
    const elementToDrag = elements.find(el => el.id === draggedElementId)

    if (elementToDrag && dragOffset) {
      const updatedElement = calculateNewPosition(elementToDrag, dragOffset)
      let updates = {}
      if (elementToDrag.type === 'wall') {
        updates = { x1: updatedElement.x1, y1: updatedElement.y1, x2: updatedElement.x2, y2: updatedElement.y2 }
      } else if (elementToDrag.type === 'curvedWall') {
        updates = { points: updatedElement.points }
      } else {
        updates = { x: updatedElement.x, y: updatedElement.y }
      }
      onUpdate && onUpdate(elementToDrag.id, updates)
    }
  }, [elements, draggedElementId, updateDrag, calculateNewPosition, onUpdate])

  useEffect(() => {
    if (!isDragging) return

    const handleGlobalMouseMove = (e) => {
      e.preventDefault()
      const pos = toViewCoords(e.clientX, e.clientY)
      handleDragMove(pos)
    }

    const handleGlobalMouseUp = (e) => {
      e.preventDefault()
      endDrag()
    }

    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging, handleDragMove, endDrag])

  const getElementAt = (pos) => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i]

      if (isPointInElement(pos, element)) {
        return element
      }
    }
    return null
  }

  const isPointInElement = (point, element) => {
    const { x: px, y: py } = point

    if (element.type === 'wall') {
      const { x1, y1, x2, y2 } = element
      const thickness = element.thickness || 15
      const distance = distanceFromPointToLine(px, py, x1, y1, x2, y2)
      return distance <= thickness / 2 + 10
    } else if (element.type === 'curvedWall') {
      if (!element.points || element.points.length < 2) return false
      const thickness = element.strokeWidth || 3

      for (let i = 0; i < element.points.length - 1; i++) {
        const p1 = element.points[i]
        const p2 = element.points[i + 1]
        const distance = distanceFromPointToLine(px, py, p1.x, p1.y, p2.x, p2.y)
        if (distance <= thickness * 2 + 10) return true
      }
      return false
    } else if (element.type === 'chair') {
      const chairSize = 50
      return px >= element.x - chairSize / 2 &&
             px <= element.x + chairSize / 2 &&
             py >= element.y - chairSize / 2 &&
             py <= element.y + chairSize / 2
    } else if (element.type === 'door') {
      const doorSize = 100
      return px >= element.x - doorSize / 2 &&
             px <= element.x + doorSize / 2 &&
             py >= element.y - doorSize / 2 &&
             py <= element.y + doorSize / 2
    } else if (element.type === 'circle') {
      const dx = px - element.x
      const dy = py - element.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      return distance <= (element.radius || 50)
    } else {
      const maxDim = Math.max(element.width || 0, element.height || 0) * 1.5
      return px >= element.x - maxDim / 2 &&
             px <= element.x + maxDim / 2 &&
             py >= element.y - maxDim / 2 &&
             py <= element.y + maxDim / 2
    }
  }

  const distanceFromPointToLine = (px, py, x1, y1, x2, y2) => {
    const A = px - x1
    const B = py - y1
    const C = x2 - x1
    const D = y2 - y1

    const dot = A * C + B * D
    const lenSq = C * C + D * D
    let param = -1

    if (lenSq !== 0) {
      param = dot / lenSq
    }

    let xx, yy

    if (param < 0) {
      xx = x1
      yy = y1
    } else if (param > 1) {
      xx = x2
      yy = y2
    } else {
      xx = x1 + param * C
      yy = y1 + param * D
    }

    const dx = px - xx
    const dy = py - yy
    return Math.sqrt(dx * dx + dy * dy)
  }


  const handleMouseDown = (e) => {
    e.preventDefault()

    // Clic derecho para pan
    if (e.button === 2) {
      setIsPanning(true)
      panOrigin.current = {
        x: e.clientX,
        y: e.clientY,
        offset: { ...offset },
      }
      return
    }

    if (e.button !== 0) return

    const pos = toViewCoords(e.clientX, e.clientY)

    const clickedElement = getElementAt(pos)

    if (clickedElement) {
      if (activeTool === 'select') {
        onSelect && onSelect(clickedElement.id)
        startDrag(clickedElement, pos)
      }
      return
    }

    // If tool is select and something is selected, drag the selected element
    if (activeTool === 'select' && selectedElementId) {
      const selectedElement = elements.find(el => el.id === selectedElementId)
      if (selectedElement) {
        startDrag(selectedElement, pos)
        return
      }
    }


    onSelect && onSelect(null)

    // Crear nuevo elemento
    setStartPoint(pos)

    if (["zone", "seatRow", "chair", "door", "exit", "stage", "field", "bleacher"].includes(activeTool)) {
      const newEl = {
        id: Date.now(),
        type: activeTool,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        fill: getDefaultFill(activeTool),
        stroke: getDefaultStroke(activeTool),
        meta: { label: activeTool },
      }
      setIsDrawing(true)
      setCurrentElement(newEl)
    } else if (activeTool === "wall") {
      const newEl = {
        id: Date.now(),
        type: "wall",
        x1: pos.x,
        y1: pos.y,
        x2: pos.x,
        y2: pos.y,
        stroke: "#475569",
        strokeWidth: 3,
        thickness: 15,
        meta: { label: "Pared" },
      }
      setIsDrawing(true)
      setCurrentElement(newEl)
    } else if (activeTool === "curvedWall") {
      const newEl = {
        id: Date.now(),
        type: "curvedWall",
        points: [{ x: pos.x, y: pos.y }],
        stroke: "#dc2626",
        strokeWidth: 3,
        meta: { label: "Muro curvo" },
      }
      setIsDrawing(true)
      setCurrentElement(newEl)
    }
  }

  const handleMouseMove = (e) => {
    e.preventDefault()
    const pos = toViewCoords(e.clientX, e.clientY)

    if (isPanning) {
      const dx = (panOrigin.current.x - e.clientX) * (viewWidth / (zoom * svgRef.current.clientWidth))
      const dy = (panOrigin.current.y - e.clientY) * (viewHeight / (zoom * svgRef.current.clientHeight))
      setOffset({
        x: panOrigin.current.offset.x + dx,
        y: panOrigin.current.offset.y + dy,
      })
      return
    }

    if (isDragging && draggedElementId) {
      handleDragMove(pos)
      return
    }

    // Manejo de dibujo de nuevos elementos
    if (!isDrawing || !currentElement || !startPoint) return

    const updated = { ...currentElement }

    if (activeTool === "circle") {
      const dx = pos.x - startPoint.x
      const dy = pos.y - startPoint.y
      updated.radius = Math.sqrt(dx * dx + dy * dy)
      updated.x = startPoint.x
      updated.y = startPoint.y
    } else if (["zone", "seatRow", "chair", "door", "exit", "stage"].includes(activeTool)) {
      // Calcular dimensiones del rectángulo
      const width = pos.x - startPoint.x
      const height = pos.y - startPoint.y

      updated.x = width < 0 ? pos.x : startPoint.x
      updated.y = height < 0 ? pos.y : startPoint.y
      updated.width = Math.abs(width)
      updated.height = Math.abs(height)

      // Tamaños mínimos para ciertos elementos
      if (activeTool === "chair") {
        updated.width = Math.max(updated.width, 50)
        updated.height = Math.max(updated.height, 50)
      } else if (activeTool === "door") {
        updated.width = Math.max(updated.width, 100)
        updated.height = Math.max(updated.height, 100)
      }
    } else if (activeTool === "wall") {
      updated.x2 = pos.x
      updated.y2 = pos.y
    } else if (activeTool === "curvedWall") {
      // Para muros curvos, solo agregar puntos si hay suficiente distancia
      const lastPoint = updated.points[updated.points.length - 1]
      const distance = Math.sqrt(
        Math.pow(pos.x - lastPoint.x, 2) + Math.pow(pos.y - lastPoint.y, 2)
      )
      
      if (distance > 10) {
        updated.points = [...updated.points, { x: pos.x, y: pos.y }]
      }
    }

    setCurrentElement(updated)
  }

  const handleMouseUp = (e) => {
    e.preventDefault()

    if (isPanning) {
      setIsPanning(false)
      return
    }

    if (isDragging) {
      endDrag()
      return
    }

    // Terminar dibujo
    if (isDrawing && currentElement) {
      // Para muros curvos, no crear automáticamente
      if (activeTool === "curvedWall") {
        return
      }
      
      // Validar que el elemento tenga dimensiones mínimas
      let isValidElement = true
      
      if (activeTool === "circle") {
        isValidElement = currentElement.radius > 10
      } else if (["zone", "seatRow", "exit", "stage"].includes(activeTool)) {
        isValidElement = currentElement.width > 10 && currentElement.height > 10
      } else if (activeTool === "wall") {
        const dx = currentElement.x2 - currentElement.x1
        const dy = currentElement.y2 - currentElement.y1
        const length = Math.sqrt(dx * dx + dy * dy)
        isValidElement = length > 10
      }
      
      if (isValidElement) {
        onCreate && onCreate(currentElement)
      }
      
      setIsDrawing(false)
      setCurrentElement(null)
      setStartPoint(null)
    }
  }

  const handleDoubleClick = (e) => {
    e.preventDefault()

    if (isDrawing && activeTool === "curvedWall" && currentElement) {
      if (currentElement.points.length >= 2) {
        onCreate && onCreate(currentElement)
      }
      setIsDrawing(false)
      setCurrentElement(null)
      setStartPoint(null)
    }
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = -e.deltaY
    const zoomFactor = 0.001
    let newZoom = zoom + delta * zoomFactor
    newZoom = Math.max(0.2, Math.min(4, newZoom))

    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    const cursorX = e.clientX - rect.left
    const cursorY = e.clientY - rect.top

    const scaleX = viewWidth / zoom / rect.width
    const scaleY = viewHeight / zoom / rect.height

    const cursorViewX = offset.x + cursorX * scaleX
    const cursorViewY = offset.y + cursorY * scaleY

    const newScaleX = viewWidth / newZoom / rect.width
    const newScaleY = viewHeight / newZoom / rect.height

    const newOffsetX = cursorViewX - cursorX * newScaleX
    const newOffsetY = cursorViewY - cursorY * newScaleY

    setZoom(newZoom)
    setOffset({ x: newOffsetX, y: newOffsetY })
  }

  const getDefaultFill = (type) => {
    switch (type) {
      case 'zone': return 'url(#zonePattern)'
      case 'seatRow': return 'url(#seatRowPattern)'
      case 'stage': return 'url(#stagePattern)'
      case 'circle': return '#f97316'
      case 'exit': return 'url(#exitPattern)'
      default: return 'transparent'
    }
  }

  const getDefaultStroke = (type) => {
    switch (type) {
      case 'zone': return '#3b82f6'
      case 'seatRow': return '#22c55e'
      case 'stage': return '#ef4444'
      case 'circle': return '#f97316'
      case 'exit': return '#f59e0b'
      default: return '#000'
    }
  }

  const getCursor = () => {
    if (isPanning) return 'grabbing'
    if (isDragging) return 'grabbing'
    if (activeTool === 'select' || !activeTool) return 'pointer'
    return 'crosshair'
  }

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-white to-gray-50">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`${offset.x} ${offset.y} ${viewWidth / zoom} ${viewHeight / zoom}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        className="relative z-10 bg-white shadow-lg border border-gray-200 rounded-lg"
        style={{ cursor: getCursor() }}
      >
        <defs>
          <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3"/>
          </filter>

          <pattern id="zonePattern" patternUnits="userSpaceOnUse" width="20" height="20">
            <circle cx="10" cy="10" r="2" fill="#3b82f6" opacity="0.3"/>
          </pattern>
          <pattern id="seatRowPattern" patternUnits="userSpaceOnUse" width="20" height="20">
            <rect x="5" y="5" width="10" height="10" fill="#22c55e" opacity="0.3"/>
          </pattern>
          <pattern id="stagePattern" patternUnits="userSpaceOnUse" width="10" height="10">
            <rect width="10" height="10" fill="#ef4444" opacity="0.5"/>
            <path d="M0,0 L10,10 M10,0 L0,10" stroke="#ef4444" strokeWidth="1" opacity="0.7"/>
          </pattern>
          <pattern id="exitPattern" patternUnits="userSpaceOnUse" width="20" height="20">
            <polygon points="10,2 18,10 10,18 2,10" fill="#f59e0b" opacity="0.3"/>
          </pattern>
          <pattern id="circlePattern" patternUnits="userSpaceOnUse" width="20" height="20">
            <circle cx="10" cy="10" r="8" fill="#f97316" opacity="0.3"/>
          </pattern>

        </defs>




        {elements.map((el) => (
          <CanvasElement
            key={el.id}
            element={el}
            isSelected={selectedElementId === el.id}
            onSelect={onSelect}
            onUpdate={onUpdate}
            onDelete={onDelete}
            units={units}
            elements={elements}
          />
        ))}

        {currentElement && (
          <CanvasElement
            element={currentElement}
            isSelected={true}
            onSelect={() => {}}
            onUpdate={() => {}}
            onDelete={() => {}}
          />
        )}
      </svg>
      
      {/* Información de estado */}
      <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-2 rounded text-sm flex items-center gap-4">
        <div>
          <div>Zoom: {(zoom * 100).toFixed(0)}%</div>
          <div>Herramienta: {activeTool || 'seleccionar'}</div>
          {isDragging && <div className="text-blue-300">🖱️ Arrastrando...</div>}
          {selectedElementId && <div className="text-green-300">✓ Seleccionado</div>}
        </div>
        <div className="flex flex-col gap-1">
          <button onClick={() => setZoom(Math.min(4, zoom + 0.2))} className="bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded text-xs">+</button>
          <button onClick={() => setZoom(Math.max(0.2, zoom - 0.2))} className="bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded text-xs">-</button>
          <button onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} className="bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded text-xs">1:1</button>
        </div>
      </div>

      {/* Ayuda contextual */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow-md border border-blue-200">
        <div className="text-sm text-center">
          {activeTool === 'select' ? '🖱️ Selecciona y arrastra elementos | Ctrl+Z/Y deshacer/rehacer | Ctrl+C/V copiar/pegar | Delete eliminar' :
           '🎨 Haz clic para colocar elementos | Clic derecho pan | Rueda zoom | Ctrl+Z deshacer'}
        </div>
      </div>
    </div>
  )
}

export default DrawingCanvas