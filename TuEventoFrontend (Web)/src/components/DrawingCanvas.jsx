import { useRef, useState, useEffect, useCallback } from "react"
import CanvasElement from "./CanvasElement"
import useDragAndDrop from "../components/views/Hooks/useDragAndDrop.js"

const ELEMENT_CONSTANTS = {
  CHAIR_RADIUS: 15
}

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
  seats = [],
  selectedSeats = [],
  onSeatSelect,
  isSeatSelectionMode = false,
  selectedSeatPositions = new Set(),
  onSeatPositionSelect,
  zoom: externalZoom,
  setZoom: externalSetZoom,
  offset: externalOffset,
  setOffset: externalSetOffset,
  onLabelEdit,
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
  const [internalZoom, setInternalZoom] = useState(1)
  const [internalOffset, setInternalOffset] = useState({ x: 0, y: 0 })
  const zoom = externalZoom !== undefined ? externalZoom : internalZoom
  const setZoom = externalSetZoom || setInternalZoom
  const offset = externalOffset !== undefined ? externalOffset : internalOffset
  const setOffset = externalSetOffset || setInternalOffset
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

  const getSeatAt = (pos) => {
    const { x: px, y: py } = pos

    // Primero buscar en asientos reales de la base de datos
    for (const seat of seats) {
      const seatSize = 30
      if (px >= seat.x - seatSize/2 && px <= seat.x + seatSize/2 &&
          py >= seat.y - seatSize/2 && py <= seat.y + seatSize/2) {
        return seat
      }
    }

    return null
  }

  const getSeatPositionAt = (pos) => {
    const { x: px, y: py } = pos

    // Buscar en posiciones generadas por seatRow
    for (const element of elements) {
      if (element.type === 'seatRow' && element.seatPositions) {
        for (let i = 0; i < element.seatPositions.length; i++) {
          const seatPos = element.seatPositions[i]
          const seatSize = ELEMENT_CONSTANTS.CHAIR_RADIUS * 2
          if (px >= seatPos.x - seatSize/2 && px <= seatPos.x + seatSize/2 &&
              py >= seatPos.y - seatSize/2 && py <= seatPos.y + seatSize/2) {
            return { seatRowId: element.id, seatIndex: i, seatPos }
          }
        }
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

    // Modo selección de asientos
    if (isSeatSelectionMode) {
      // Verificar si se hizo clic en un asiento de base de datos
      const clickedSeat = getSeatAt(pos)
      if (clickedSeat && clickedSeat.status === 'AVAILABLE') {
        onSeatSelect && onSeatSelect(clickedSeat.id)
        return
      }

      // Verificar si se hizo clic en una posición de asiento en seatRow
      const clickedSeatPosition = getSeatPositionAt(pos)
      if (clickedSeatPosition) {
        onSeatPositionSelect && onSeatPositionSelect(clickedSeatPosition.seatRowId, clickedSeatPosition.seatIndex)
        return
      }
    }

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

    if (["zone", "section", "seatRow", "chair", "door", "exit", "stage", "field", "bleacher"].includes(activeTool)) {
      const newEl = {
        id: Date.now(),
        type: activeTool,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        fill: getDefaultFill(activeTool),
        stroke: getDefaultStroke(activeTool),
        meta: activeTool === 'section' ? { label: 'Nueva Sección', category: 'General' } : { label: activeTool },
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
        let elementToCreate = { ...currentElement }

        // Generate seat positions for seatRow
        if (activeTool === 'seatRow' && currentElement.width > 0) {
          const seatSpacing = 60 // Distance between seats
          const numSeats = Math.max(1, Math.floor(currentElement.width / seatSpacing))
          const startX = currentElement.x
          const seatY = currentElement.y + currentElement.height / 2

          elementToCreate.seatPositions = []
          for (let i = 0; i < numSeats; i++) {
            elementToCreate.seatPositions.push({
              id: `${currentElement.id}-seat-${i}`,
              x: startX + i * seatSpacing + 30, // Center the seats
              y: seatY,
              row: 'A', // Default row, can be changed later
              seatNumber: i + 1,
              status: 'AVAILABLE'
            })
          }
        }

        onCreate && onCreate(elementToCreate)
      }

      setIsDrawing(false)
      setCurrentElement(null)
      setStartPoint(null)
    }
  }

  const handleDoubleClick = (e) => {
    e.preventDefault()
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
      case 'section': return 'url(#sectionGradient)'
      case 'seatRow': return 'url(#seatRowPattern)'
      case 'stage': return 'url(#stageGradient)'
      case 'exit': return 'url(#exitPattern)'
      default: return 'transparent'
    }
  }

  const getDefaultStroke = (type) => {
    switch (type) {
      case 'zone': return '#3b82f6'
      case 'section': return '#8b5cf6'
      case 'seatRow': return '#22c55e'
      case 'stage': return '#ef4444'
      case 'exit': return '#f59e0b'
      default: return '#000'
    }
  }

  const getCursor = () => {
    if (isPanning) return 'grabbing'
    if (isDragging) return 'grabbing'
    if (isSeatSelectionMode) return 'pointer'
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
          <pattern id="sectionPattern" patternUnits="userSpaceOnUse" width="20" height="20">
            <rect x="2" y="2" width="16" height="16" fill="#8b5cf6" opacity="0.3"/>
            <rect x="6" y="6" width="8" height="8" fill="#8b5cf6" opacity="0.5"/>
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

          <linearGradient id="sectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: '#a855f7', stopOpacity: 0.6 }} />
          </linearGradient>

          <linearGradient id="stageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: '#f87171', stopOpacity: 0.6 }} />
          </linearGradient>

        </defs>




        {[...elements]
          .sort((a, b) => {
            // Render sections and zones last so they appear above other elements
            const order = { section: 3, zone: 2, stage: 1 };
            return (order[a.type] || 0) - (order[b.type] || 0);
          })
          .map((el) => (
            <CanvasElement
              key={el.id}
              element={el}
              isSelected={selectedElementId === el.id}
              onSelect={onSelect}
              onUpdate={onUpdate}
              onDelete={onDelete}
              units={units}
              elements={elements}
              onLabelEdit={onLabelEdit}
              isSeatSelectionMode={isSeatSelectionMode}
            />
          ))}

        {/* Renderizar asientos cuando está en modo selección */}
        {isSeatSelectionMode && (
          <>
            {/* Asientos reales de la base de datos */}
            {seats.map((seat) => {
              const isSelected = selectedSeats.includes(seat.id)
              const isOccupied = seat.status === 'OCCUPIED'
              const isReserved = seat.status === 'RESERVED'

              let fillColor = '#22c55e' // Verde para disponible
              if (isSelected) fillColor = '#3b82f6' // Azul para seleccionado
              else if (isOccupied) fillColor = '#ef4444' // Rojo para ocupado
              else if (isReserved) fillColor = '#f59e0b' // Amarillo para reservado

              return (
                <g key={seat.id} data-seat-id={seat.id}>
                  <rect
                    x={seat.x - 15}
                    y={seat.y - 15}
                    width={30}
                    height={30}
                    fill={fillColor}
                    stroke="#374151"
                    strokeWidth={2}
                    rx={4}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                  <text
                    x={seat.x}
                    y={seat.y + 4}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill="white"
                    pointerEvents="none"
                  >
                    {seat.seatNumber}
                  </text>
                  {isSelected && (
                    <circle
                      cx={seat.x + 8}
                      cy={seat.y - 8}
                      r={6}
                      fill="#ffffff"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      className="pointer-events-none"
                    />
                  )}
                </g>
              )
            })}

            {/* Asientos generados por seatRow */}
            {elements
              .filter(el => el.type === 'seatRow' && el.seatPositions)
              .map(el => el.seatPositions.map((seatPos, index) => {
                const seatKey = `${el.id}-${index}`;
                const isSelected = selectedSeatPositions.has(seatKey);
                const isOccupied = seatPos.status === 'OCCUPIED';
                const isReserved = seatPos.status === 'RESERVED';

                let fillColor = '#22c55e'; // Verde para disponible
                if (isSelected) fillColor = '#10b981'; // Verde más brillante para seleccionado
                else if (isOccupied) fillColor = '#ef4444'; // Rojo para ocupado
                else if (isReserved) fillColor = '#f59e0b'; // Amarillo para reservado

                return (
                  <g key={seatPos.id} data-seat-id={seatPos.id}>
                    <circle
                      cx={seatPos.x}
                      cy={seatPos.y}
                      r={ELEMENT_CONSTANTS.CHAIR_RADIUS}
                      fill={fillColor}
                      stroke="#374151"
                      strokeWidth={2}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <text
                      x={seatPos.x}
                      y={seatPos.y + 4}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="white"
                      pointerEvents="none"
                    >
                      {seatPos.row}{seatPos.seatNumber}
                    </text>
                    {isSelected && (
                      <circle
                        cx={seatPos.x + ELEMENT_CONSTANTS.CHAIR_RADIUS * 0.5}
                        cy={seatPos.y - ELEMENT_CONSTANTS.CHAIR_RADIUS * 0.5}
                        r={5}
                        fill="#22c55e"
                        stroke="#ffffff"
                        strokeWidth={2}
                        className="pointer-events-none"
                      />
                    )}
                  </g>
                );
              }))
            }
          </>
        )}

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
          {isSeatSelectionMode ? '🎯 Haz clic en asientos individuales para seleccionar/deseleccionar | Clic derecho pan | Rueda zoom' :
           activeTool === 'select' ? '🖱️ Selecciona y arrastra elementos | Ctrl+Z/Y deshacer/rehacer | Ctrl+C/V copiar/pegar | Delete eliminar' :
           '🎨 Haz clic para colocar elementos | Clic derecho pan | Rueda zoom | Ctrl+Z deshacer'}
        </div>
      </div>
    </div>
  )
}

export default DrawingCanvas