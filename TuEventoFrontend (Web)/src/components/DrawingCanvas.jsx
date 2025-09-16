import { useRef, useState, useEffect } from "react"
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
}) => {
  const svgRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentElement, setCurrentElement] = useState(null)
  const [startPoint, setStartPoint] = useState(null)
  
  // Drag and Drop
  const { 
    dragState, 
    startDrag, 
    updateDrag, 
    endDrag, 
    calculateNewPosition,
    isDragging,
    draggedElementId 
  } = useDragAndDrop()

  // Viewport y zoom
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

    const rect = svg.getBoundingClientRect()
    const scaleX = viewWidth / zoom / rect.width
    const scaleY = viewHeight / zoom / rect.height

    const x = offset.x + (clientX - rect.left) * scaleX
    const y = offset.y + (clientY - rect.top) * scaleY

    return { x, y }
  }

  const getElementAt = (pos) => {
    // Buscar elemento en la posición dada
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
      // Para muros, verificar proximidad a la línea
      const { x1, y1, x2, y2 } = element
      const thickness = element.thickness || 15
      const distance = distanceFromPointToLine(px, py, x1, y1, x2, y2)
      return distance <= thickness / 2
    } else if (element.type === 'curvedWall') {
      // Para muros curvos, verificar proximidad a cualquier segmento
      if (!element.points || element.points.length < 2) return false
      const thickness = element.strokeWidth || 3
      
      for (let i = 0; i < element.points.length - 1; i++) {
        const p1 = element.points[i]
        const p2 = element.points[i + 1]
        const distance = distanceFromPointToLine(px, py, p1.x, p1.y, p2.x, p2.y)
        if (distance <= thickness * 2) return true
      }
      return false
    } else if (element.type === 'chair') {
      // Para sillas, usar el tamaño fijo
      const chairSize = 50
      return px >= element.x - chairSize / 2 && 
             px <= element.x + chairSize / 2 && 
             py >= element.y - chairSize / 2 && 
             py <= element.y + chairSize / 2
    } else if (element.type === 'door') {
      // Para puertas, usar el tamaño fijo
      const doorSize = 100
      return px >= element.x && 
             px <= element.x + doorSize && 
             py >= element.y && 
             py <= element.y + doorSize
    } else {
      // Para elementos rectangulares
      return px >= element.x && 
             px <= element.x + (element.width || 0) && 
             py >= element.y && 
             py <= element.y + (element.height || 0)
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

    // Herramienta de selección o sin herramienta activa (modo selección por defecto)
    if (activeTool === 'select' || !activeTool) {
      const elementAtPos = getElementAt(pos)
      
      if (elementAtPos) {
        // Seleccionar elemento si no está seleccionado
        if (selectedElementId !== elementAtPos.id) {
          onSelect && onSelect(elementAtPos.id)
          return
        }
        
        // Iniciar arrastre del elemento seleccionado
        startDrag(elementAtPos, pos)
        return
      } else {
        // Deseleccionar si se hace clic en área vacía
        onSelect && onSelect(null)
        return
      }
    }

    // Si hay un elemento seleccionado y hacemos clic sobre él, permitir moverlo
    if (selectedElementId) {
      const selectedElement = elements.find(el => el.id === selectedElementId)
      if (selectedElement && getElementAt(pos)?.id === selectedElementId) {
        startDrag(selectedElement, pos)
        return
      }
    }

    // Crear nuevo elemento
    setStartPoint(pos)

    if (["zone", "seatRow", "chair", "door", "exit", "stage"].includes(activeTool)) {
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

    // Manejo de panning
    if (isPanning) {
      const dx = (panOrigin.current.x - e.clientX) * (viewWidth / (zoom * svgRef.current.clientWidth))
      const dy = (panOrigin.current.y - e.clientY) * (viewHeight / (zoom * svgRef.current.clientHeight))
      setOffset({
        x: panOrigin.current.offset.x + dx,
        y: panOrigin.current.offset.y + dy,
      })
      return
    }

    // Manejo de drag and drop
    if (isDragging && draggedElementId) {
      const dragOffset = updateDrag(pos)
      const elementToDrag = elements.find(el => el.id === draggedElementId)
      
      if (elementToDrag && dragOffset) {
        const updatedElement = calculateNewPosition(elementToDrag, dragOffset)
        onUpdate && onUpdate(updatedElement)
      }
      return
    }

    // Manejo de dibujo de nuevos elementos
    if (!isDrawing || !currentElement || !startPoint) return

    const updated = { ...currentElement }

    if (["zone", "seatRow", "chair", "door", "exit", "stage"].includes(activeTool)) {
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

    // Terminar panning
    if (isPanning) {
      setIsPanning(false)
      return
    }

    // Terminar drag and drop
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
      
      if (["zone", "seatRow", "exit", "stage"].includes(activeTool)) {
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
    
    // Finalizar muro curvo en doble clic
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
      case 'zone': return 'rgba(59, 130, 246, 0.1)'
      case 'seatRow': return 'rgba(34, 197, 94, 0.1)'
      case 'stage': return 'rgba(239, 68, 68, 0.1)'
      case 'exit': return 'rgba(245, 158, 11, 0.1)'
      default: return 'transparent'
    }
  }

  const getDefaultStroke = (type) => {
    switch (type) {
      case 'zone': return '#3b82f6'
      case 'seatRow': return '#22c55e'
      case 'stage': return '#ef4444'
      case 'exit': return '#f59e0b'
      default: return '#000'
    }
  }

  const getCursor = () => {
    if (isPanning) return 'grabbing'
    if (isDragging) return 'grabbing'
    if (activeTool === 'select' || !activeTool) return 'default'
    return 'crosshair'
  }

  return (
    <div className="w-full h-full relative bg-background">
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
        className="relative z-10 bg-white shadow-inner border border-border/50"
        style={{ cursor: getCursor() }}
      >
        {/* Filtros SVG */}
        <defs>
          <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3"/>
          </filter>
        </defs>

        {/* Elementos existentes */}
        {elements.map((el) => (
          <CanvasElement
            key={el.id}
            element={el}
            isSelected={selectedElementId === el.id}
            onSelect={onSelect}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
        
        {/* Elemento siendo creado */}
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
      <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-2 rounded text-sm">
        <div>Zoom: {(zoom * 100).toFixed(0)}%</div>
        <div>Herramienta: {activeTool || 'seleccionar'}</div>
        {isDragging && <div className="text-blue-300">🖱️ Arrastrando...</div>}
        {selectedElementId && <div className="text-green-300">✓ Seleccionado</div>}
      </div>

      {/* Ayuda contextual */}
      {(!activeTool || activeTool === 'select') && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow-md border border-blue-200">
          <div className="text-sm text-center">
            ✨ Haz clic en un elemento para seleccionarlo y arrastrarlo libremente | Clic derecho para hacer pan | Rueda para zoom
          </div>
        </div>
      )}
    </div>
  )
}

export default DrawingCanvas