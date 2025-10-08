import { useRef, useState, useEffect, useCallback } from "react"
import CanvasElement from "./CanvasElement"
import useDragAndDrop from "../hooks/useDragAndDrop.js"

const ELEMENT_CONSTANTS = {
  CHAIR_RADIUS: 15
}

const DrawingCanvas = ({
  elements = [],
  selectedElementId = null,
  selectedIds = new Set(),
  onSelect,
  onMultiSelect,
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
  isSectionCreationMode = false,
  selectedChairsForSection = new Set(),
  selectedSeatPositionsForSection = new Set(),
  onChairSelectForSection,
  onSeatPositionSelectForSection,
  chairsWithSections = new Map(),
  existingChairsWithSections = new Map(),
  zoom: externalZoom,
  setZoom: externalSetZoom,
  offset: externalOffset,
  setOffset: externalSetOffset,
  onLabelEdit,
  selectedSection,
}) => {
  const svgRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentElement, setCurrentElement] = useState(null)
  const [startPoint, setStartPoint] = useState(null)
  const [hoveredSeat, setHoveredSeat] = useState(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState(null)
  const [selectionEnd, setSelectionEnd] = useState(null)
  const [guides, setGuides] = useState({ vertical: null, horizontal: null })

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

    const svgRect = svg.getBoundingClientRect()
    const viewBoxWidth = viewWidth / zoom
    const viewBoxHeight = viewHeight / zoom

    // Calcular la escala manteniendo aspect ratio (preserveAspectRatio="xMidYMid meet")
    const scale = Math.min(svgRect.width / viewBoxWidth, svgRect.height / viewBoxHeight)

    // Calcular offsets para centrar el viewBox
    const offsetX = (svgRect.width - viewBoxWidth * scale) / 2
    const offsetY = (svgRect.height - viewBoxHeight * scale) / 2

    // Coordenadas relativas al viewBox
    const relX = clientX - svgRect.left - offsetX
    const relY = clientY - svgRect.top - offsetY

    // Convertir al espacio del viewBox
    const x = offset.x + relX / scale
    const y = offset.y + relY / scale

    return { x, y }
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
    let closestSeat = null
    let minDistance = Infinity
    for (const seat of seats) {
      const dx = px - seat.x
      const dy = py - seat.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance <= 20 && distance < minDistance) {
        minDistance = distance
        closestSeat = seat
      }
    }

    return closestSeat
  }

  const getChairAt = (pos) => {
    const { x: px, y: py } = pos

    // Buscar en elementos de tipo 'chair' del canvas - área de clic exacta sobre la silla
    for (const element of elements) {
      if (element.type === 'chair') {
        const chairSize = 50 // Tamaño visual exacto de la silla
        if (px >= element.x - chairSize / 2 && px <= element.x + chairSize / 2 &&
            py >= element.y - chairSize / 2 && py <= element.y + chairSize / 2) {
          return element
        }
      }
    }

    return null
  }

  const getSeatPositionForSectionAt = (pos) => {
    const { x: px, y: py } = pos

    // Buscar en posiciones de seatRow para selección de sección - área de clic exacta
    for (const element of elements) {
      if (element.type === 'seatRow' && element.seatPositions) {
        for (let i = 0; i < element.seatPositions.length; i++) {
          const seatPos = element.seatPositions[i]
          const chairSize = 50 // Tamaño visual exacto de la silla
          if (px >= seatPos.x - chairSize/2 && px <= seatPos.x + chairSize/2 &&
              py >= seatPos.y - chairSize/2 && py <= seatPos.y + chairSize/2) {
            return { seatRowId: element.id, seatIndex: i, seatPos, element }
          }
        }
      }
    }

    return null
  }

  const getSeatPositionAt = (pos) => {
    const { x: px, y: py } = pos

    // Buscar en posiciones generadas por seatRow - área de clic exacta
    let closestPosition = null
    let minDistance = Infinity
    for (const element of elements) {
      if (element.type === 'seatRow' && element.seatPositions) {
        for (let i = 0; i < element.seatPositions.length; i++) {
          const seatPos = element.seatPositions[i]
          const dx = px - seatPos.x
          const dy = py - seatPos.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const chairSize = 50 // Tamaño visual exacto de la silla
          if (distance <= chairSize/2 && distance < minDistance) {
            minDistance = distance
            closestPosition = { seatRowId: element.id, seatIndex: i, seatPos }
          }
        }
      }
    }

    return closestPosition
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

      // Solo permitir selección de posiciones de layout si no hay asientos de BD
      if (seats.length === 0) {
        const clickedSeatPosition = getSeatPositionAt(pos)
        if (clickedSeatPosition) {
          onSeatPositionSelect && onSeatPositionSelect(clickedSeatPosition.seatRowId, clickedSeatPosition.seatIndex)
          return
        }
      }
    }

    // Modo creación de sección - selección simplificada
    if (isSectionCreationMode) {
      // Buscar posiciones de asiento individuales en filas (prioridad alta)
      const clickedSeatPosition = getSeatPositionForSectionAt(pos);
      if (clickedSeatPosition) {
        const positionKey = `${clickedSeatPosition.seatRowId}-${clickedSeatPosition.seatIndex}`;
        onSeatPositionSelectForSection && onSeatPositionSelectForSection(positionKey);
        return;
      }

      // Buscar sillas individuales
      const clickedChair = getChairAt(pos);
      if (clickedChair) {
        onChairSelectForSection && onChairSelectForSection(clickedChair.id);
        return;
      }
    }

    // Primero verificar sillas y posiciones de asiento (prioridad alta)
    let clickedSeatPosition = null;
    if (!isSeatSelectionMode && !isSectionCreationMode && activeTool === 'select') {
      clickedSeatPosition = getSeatPositionAt(pos);
    }

    // Si se hizo clic en una posición de asiento, seleccionarla
    if (clickedSeatPosition && !isSeatSelectionMode && !isSectionCreationMode && activeTool === 'select') {
      const positionKey = `${clickedSeatPosition.seatRowId}-${clickedSeatPosition.seatIndex}`;
      onSelect && onSelect(positionKey);
      return;
    }

    // Después verificar otros elementos
    const clickedElement = getElementAt(pos)

    if (clickedElement) {
      if (activeTool === 'select') {
        onSelect && onSelect(clickedElement.id)
        startDrag(clickedElement, pos)
      }
      return
    }

    // Si no se hizo clic en ningún elemento y estamos en modo select, iniciar selección múltiple rectangular
    if (!isSeatSelectionMode && !isSectionCreationMode && activeTool === 'select' && !clickedElement && !clickedSeatPosition) {
      setIsSelecting(true);
      setSelectionStart(pos);
      setSelectionEnd(pos);
      // Limpiar selección actual
      onSelect && onSelect(null);
      return;
    }

    // If tool is select and something is selected, drag the selected element or group
    if (activeTool === 'select' && (selectedElementId || (selectedIds && selectedIds.size > 0))) {
      // Si hay selección múltiple, permitir arrastrar cualquier elemento del grupo
      if (selectedIds && selectedIds.size > 0) {
        const clickedElement = getElementAt(pos);
        if (clickedElement && selectedIds.has(clickedElement.id)) {
          startDrag(clickedElement, pos);
          return;
        }
        // Si no se hizo clic en un elemento específico del grupo, buscar posiciones de asiento
        const clickedSeatPosition = getSeatPositionAt(pos);
        if (clickedSeatPosition) {
          const positionKey = `${clickedSeatPosition.seatRowId}-${clickedSeatPosition.seatIndex}`;
          if (selectedIds.has(positionKey)) {
            // Para posiciones de asiento, no iniciamos arrastre, solo selección
            return;
          }
        }
      } else if (selectedElementId) {
        const selectedElement = elements.find(el => el.id === selectedElementId);
        if (selectedElement) {
          startDrag(selectedElement, pos);
          return;
        }
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
      const snappedPos = snapToWallEnds(pos, elements);
      const newEl = {
        id: Date.now(),
        type: "wall",
        x1: snappedPos.x,
        y1: snappedPos.y,
        x2: snappedPos.x,
        y2: snappedPos.y,
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
      const svg = svgRef.current
      const rect = svg.getBoundingClientRect()
      const viewBoxWidth = viewWidth / zoom
      const viewBoxHeight = viewHeight / zoom
      const scale = Math.min(rect.width / viewBoxWidth, rect.height / viewBoxHeight)
      const dx = (panOrigin.current.x - e.clientX) / scale
      const dy = (panOrigin.current.y - e.clientY) / scale
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

    // Actualizar rectángulo de selección múltiple
    if (isSelecting && selectionStart) {
      setSelectionEnd(pos);
      return;
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
      const snappedPos = snapToWallEnds(pos, elements);
      const verticalGuide = findVerticalGuide(pos, elements);
      const horizontalGuide = findHorizontalGuide(pos, elements);
      setGuides({ vertical: verticalGuide, horizontal: horizontalGuide });
      updated.x2 = snappedPos.x
      updated.y2 = snappedPos.y
    }

    setCurrentElement(updated)
  }

  const getElementsInSelectionRect = (start, end) => {
    if (!start || !end) return new Set();

    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    const selectedElements = new Set();

    // Buscar elementos dentro del rectángulo
    for (const element of elements) {
      let elementX, elementY;

      if (element.type === 'wall') {
        elementX = (element.x1 + element.x2) / 2;
        elementY = (element.y1 + element.y2) / 2;
      } else {
        elementX = element.x;
        elementY = element.y;
      }

      if (elementX >= minX && elementX <= maxX && elementY >= minY && elementY <= maxY) {
        selectedElements.add(element.id);
      }
    }

    // Buscar posiciones de asiento dentro del rectángulo (solo en modo normal)
    if (!isSeatSelectionMode && !isSectionCreationMode) {
      for (const element of elements) {
        if (element.type === 'seatRow' && element.seatPositions) {
          for (let i = 0; i < element.seatPositions.length; i++) {
            const seatPos = element.seatPositions[i];
            if (seatPos.x >= minX && seatPos.x <= maxX && seatPos.y >= minY && seatPos.y <= maxY) {
              selectedElements.add(`${element.id}-${i}`);
            }
          }
        }
      }
    }

    return selectedElements;
  };

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

    // Finalizar selección múltiple rectangular
    if (isSelecting && selectionStart && selectionEnd) {
      const selectedElements = getElementsInSelectionRect(selectionStart, selectionEnd);

      // Notificar al padre sobre la selección múltiple
      if (selectedElements.size > 0) {
        const selectedArray = Array.from(selectedElements);

        if (selectedElements.size === 1) {
          // Selección simple
          onSelect && onSelect(selectedArray[0]);
        } else {
          // Selección múltiple
          onMultiSelect && onMultiSelect(selectedArray);
        }
      }

      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionEnd(null);
      return;
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

         // Snap wall end to nearby wall ends
         if (activeTool === 'wall') {
           const snappedEnd = snapToWallEnds({x: elementToCreate.x2, y: elementToCreate.y2}, elements);
           elementToCreate.x2 = snappedEnd.x;
           elementToCreate.y2 = snappedEnd.y;
         }

         // Generate seat positions for seatRow (will be converted to individual chairs in parent)
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
       setGuides({ vertical: null, horizontal: null })
    }
  }

  const handleDoubleClick = (e) => {
    e.preventDefault()
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = -e.deltaY
    const zoomFactor = 0.001 // Increased sensitivity for better user experience
    let newZoom = zoom + delta * zoomFactor
    newZoom = Math.max(0.2, Math.min(4, newZoom)) // Consistent zoom limits with keyboard shortcuts

    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    const cursorX = e.clientX - rect.left
    const cursorY = e.clientY - rect.top

    const viewBoxWidth = viewWidth / zoom
    const viewBoxHeight = viewHeight / zoom
    const scale = Math.min(rect.width / viewBoxWidth, rect.height / viewBoxHeight)
    const offsetX = (rect.width - viewBoxWidth * scale) / 2
    const offsetY = (rect.height - viewBoxHeight * scale) / 2
    const relCursorX = cursorX - offsetX
    const relCursorY = cursorY - offsetY
    const cursorViewX = offset.x + relCursorX / scale
    const cursorViewY = offset.y + relCursorY / scale

    const newViewBoxWidth = viewWidth / newZoom
    const newViewBoxHeight = viewHeight / newZoom
    const newScale = Math.min(rect.width / newViewBoxWidth, rect.height / newViewBoxHeight)
    const newOffsetX = (rect.width - newViewBoxWidth * newScale) / 2
    const newOffsetY = (rect.height - newViewBoxHeight * newScale) / 2
    const newRelCursorX = cursorX - newOffsetX
    const newRelCursorY = cursorY - newOffsetY
    const newOffsetX_final = cursorViewX - newRelCursorX / newScale
    const newOffsetY_final = cursorViewY - newRelCursorY / newScale

    setZoom(newZoom)
    setOffset({ x: newOffsetX_final, y: newOffsetY_final })
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

  const snapToWallEnds = (pos, elements, snapDistance = 100) => {
    let closest = null;
    let minDist = snapDistance;
    for (const el of elements) {
      if (el.type === 'wall') {
        const ends = [[el.x1, el.y1], [el.x2, el.y2]];
        for (const [ex, ey] of ends) {
          const dx = pos.x - ex;
          const dy = pos.y - ey;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) {
            minDist = dist;
            closest = { x: ex, y: ey };
          }
        }
      }
    }
    return closest || pos;
  };

  const findVerticalGuide = (pos, elements) => {
    for (const el of elements) {
      if (el.type === 'wall') {
        if (Math.abs(pos.x - el.x1) < 20) return el.x1;
        if (Math.abs(pos.x - el.x2) < 20) return el.x2;
      }
    }
    return null;
  };

  const findHorizontalGuide = (pos, elements) => {
    for (const el of elements) {
      if (el.type === 'wall') {
        if (Math.abs(pos.y - el.y1) < 20) return el.y1;
        if (Math.abs(pos.y - el.y2) < 20) return el.y2;
      }
    }
    return null;
  };


  const getCursor = () => {
    if (isPanning) return 'grabbing'
    if (isDragging) return 'grabbing'
    if (isSeatSelectionMode || isSectionCreationMode) return 'pointer'
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
              isSelected={selectedElementId === el.id || (selectedIds && selectedIds.has(el.id))}
              onSelect={onSelect}
              onUpdate={onUpdate}
              onDelete={onDelete}
              units={units}
              elements={elements}
              onLabelEdit={onLabelEdit}
              isSeatSelectionMode={isSeatSelectionMode}
            />
          ))}

        {/* Renderizar cubitos rojos para sillas bloqueadas (de secciones existentes) siempre visible */}
        {(
          <>
            {/* Cubitos para sillas individuales bloqueadas */}
            {elements
              .filter(el => el.type === 'chair')
              .map((chair) => {
                const sectionName = chairsWithSections.get(chair.id)
                const isAlreadyInSection = !!sectionName
                const isSelectedForRemoval = isSectionCreationMode && selectedChairsForSection.has(chair.id)

                // Solo mostrar si está en alguna sección (existente o pendiente)
                if (!isAlreadyInSection) return null

                return (
                  <g key={`blocked-chair-${chair.id}`} data-chair-id={chair.id}>
                    <rect
                      x={chair.x - 15}
                      y={chair.y - 15}
                      width={30}
                      height={30}
                      fill={isSelectedForRemoval ? "#3b82f6" : "#dc2626"} // Azul si seleccionada para quitar, rojo si bloqueada
                      stroke={isSelectedForRemoval ? "#1e40af" : "#b91c1c"}
                      strokeWidth={2}
                      rx={4}
                      className={isSelectedForRemoval ? "cursor-pointer" : "cursor-not-allowed"}
                    />
                    <text
                      x={chair.x}
                      y={chair.y + 4}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="white"
                      pointerEvents="none"
                    >
                      {sectionName}
                    </text>
                  </g>
                )
              })}

            {/* Cubitos para posiciones de asiento bloqueadas */}
            {elements
              .filter(el => el.type === 'seatRow' && el.seatPositions)
              .map(el => el.seatPositions.map((seatPos, index) => {
                const positionKey = `${el.id}-${index}`;
                const sectionName = chairsWithSections.get(positionKey)
                const isAlreadyInSection = !!sectionName
                const isSelectedForRemoval = isSectionCreationMode && selectedSeatPositionsForSection.has(positionKey)

                // Solo mostrar si está en alguna sección (existente o pendiente)
                if (!isAlreadyInSection) return null

                return (
                  <g key={`blocked-seat-${positionKey}`} data-seat-position-id={positionKey}>
                    <rect
                      x={seatPos.x - 15}
                      y={seatPos.y - 15}
                      width={30}
                      height={30}
                      fill={isSelectedForRemoval ? "#3b82f6" : "#dc2626"} // Azul si seleccionada para quitar, rojo si bloqueada
                      stroke={isSelectedForRemoval ? "#1e40af" : "#b91c1c"}
                      strokeWidth={2}
                      rx={4}
                      className={isSelectedForRemoval ? "cursor-pointer" : "cursor-not-allowed"}
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
                      {sectionName}
                    </text>
                  </g>
                );
              }))}
          </>
        )}

        {/* Renderizar sillas cuando está en modo creación de sección */}
        {isSectionCreationMode && (
          <>
            {/* Sillas individuales - solo las que NO están en secciones existentes */}
            {elements
              .filter(el => el.type === 'chair')
              .filter(chair => !chairsWithSections.has(chair.id)) // Excluir sillas ya en secciones
              .map((chair) => {
                const isSelected = selectedChairsForSection.has(chair.id)
                const isHovered = hoveredSeat && hoveredSeat.id === chair.id

                // Determinar colores basados en el estado
                let fillColor = '#6b7280' // Gris por defecto
                let strokeColor = '#374151'
                let strokeWidth = 2

                if (isSelected) {
                  fillColor = '#8b5cf6' // Púrpura para seleccionado
                  strokeColor = '#7c3aed'
                  strokeWidth = 3
                }

                return (
                  <g key={chair.id} data-chair-id={chair.id}>
                    <rect
                      x={chair.x - 25}
                      y={chair.y - 25}
                      width={50}
                      height={50}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      rx={4}
                      className="cursor-pointer"
                    />
                    <text
                      x={chair.x}
                      y={chair.y + 4}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill="white"
                      pointerEvents="none"
                    >
                      🪑
                    </text>
                  </g>
                )
              })}

            {/* Posiciones de asiento en filas - solo las que NO están en secciones existentes */}
            {elements
              .filter(el => el.type === 'seatRow' && el.seatPositions)
              .map(el => el.seatPositions
                .map((seatPos, index) => {
                  const positionKey = `${el.id}-${index}`;
                  // Excluir posiciones que ya están en secciones existentes
                  if (chairsWithSections.has(positionKey)) return null;

                  const isSelected = selectedSeatPositionsForSection.has(positionKey);
                  const isHovered = hoveredSeat && hoveredSeat.positionKey === positionKey;

                  // Determinar colores basados en el estado
                  let fillColor = '#6b7280' // Gris por defecto
                  let strokeColor = '#374151'
                  let strokeWidth = 2

                  if (isSelected) {
                    fillColor = '#8b5cf6' // Púrpura para seleccionado
                    strokeColor = '#7c3aed'
                    strokeWidth = 3
                  }

                  return (
                    <g key={positionKey} data-seat-position-id={positionKey}>
                      <rect
                        x={seatPos.x - 25}
                        y={seatPos.y - 25}
                        width={50}
                        height={50}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        rx={4}
                        className="cursor-pointer"
                      />
                      <text
                        x={seatPos.x}
                        y={seatPos.y + 4}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="bold"
                        fill="white"
                        pointerEvents="none"
                      >
                        {seatPos.row}{seatPos.seatNumber}
                      </text>
                    </g>
                  );
                })
                .filter(Boolean) // Remover nulls
              )}
          </>
        )}

        {/* Renderizar posiciones de asiento en filas en modo normal - como rectángulos igual que sillas */}
        {!isSeatSelectionMode && !isSectionCreationMode && (
          <>
            {elements
              .filter(el => el.type === 'seatRow' && el.seatPositions)
              .map(el => el.seatPositions.map((seatPos, index) => {
                const positionKey = `${el.id}-${index}`;
                // Para modo normal, verificar en selectedIds, para otros modos usar selectedElementId
                const isSelected = (!isSeatSelectionMode && !isSectionCreationMode) ?
                  (selectedIds && selectedIds.has(positionKey)) :
                  selectedElementId === positionKey;
                return (
                  <g key={positionKey} data-seat-position-id={positionKey}>
                    <rect
                      x={seatPos.x - 25}
                      y={seatPos.y - 25}
                      width={50}
                      height={50}
                      fill={isSelected ? '#3b82f6' : '#6b7280'}
                      stroke={isSelected ? '#1e40af' : '#374151'}
                      strokeWidth={isSelected ? 3 : 2}
                      rx={4}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <text
                      x={seatPos.x}
                      y={seatPos.y + 4}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill="white"
                      pointerEvents="none"
                    >
                      {seatPos.row}{seatPos.seatNumber}
                    </text>
                  </g>
                );
              }))}
          </>
        )}

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
                    x={seat.x - 20}
                    y={seat.y - 20}
                    width={40}
                    height={40}
                    fill={fillColor}
                    stroke="#374151"
                    strokeWidth={2}
                    rx={4}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onMouseEnter={() => setHoveredSeat(seat)}
                    onMouseLeave={() => setHoveredSeat(null)}
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
                    {seat.row}{seat.seatNumber}
                  </text>
                  {isSelected && (
                    <circle
                      cx={seat.x + 12}
                      cy={seat.y - 12}
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

            {/* Asientos generados por seatRow (solo si no hay asientos de BD) */}
            {seats.length === 0 && elements
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

        {/* Rectángulo de selección múltiple */}
        {isSelecting && selectionStart && selectionEnd && (
          <rect
            x={Math.min(selectionStart.x, selectionEnd.x)}
            y={Math.min(selectionStart.y, selectionEnd.y)}
            width={Math.abs(selectionEnd.x - selectionStart.x)}
            height={Math.abs(selectionEnd.y - selectionStart.y)}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="5,5"
            pointerEvents="none"
          />
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

        {/* Alignment guides */}
        {guides.vertical && (
          <line
            x1={guides.vertical}
            y1={offset.y - 1000}
            x2={guides.vertical}
            y2={offset.y + viewHeight / zoom + 1000}
            stroke="#3b82f6"
            strokeWidth="1"
            strokeDasharray="5,5"
            pointerEvents="none"
          />
        )}
        {guides.horizontal && (
          <line
            x1={offset.x - 1000}
            y1={guides.horizontal}
            x2={offset.x + viewWidth / zoom + 1000}
            y2={guides.horizontal}
            stroke="#3b82f6"
            strokeWidth="1"
            strokeDasharray="5,5"
            pointerEvents="none"
          />
        )}

      </svg>

      {/* Tooltip para asientos */}
      {hoveredSeat && (
        <div
          className="absolute bg-black text-white p-2 rounded text-sm pointer-events-none z-10"
          style={{ left: hoveredSeat.x + 25, top: hoveredSeat.y - 25 }}
        >
          Fila {hoveredSeat.row} Asiento {hoveredSeat.seatNumber} - ${selectedSection?.price || 30000}
        </div>
      )}

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
          {isSectionCreationMode ? '🎯 Haz clic en cualquier silla para seleccionar/deseleccionar | Las sillas seleccionadas se marcan con ✓ | Clic derecho pan | Rueda zoom' :
          activeTool === 'select' ? '🖱️ Arrastra para seleccionar múltiples elementos | Clic para seleccionar individual | Ctrl+Z/Y deshacer/rehacer | Ctrl+C/V copiar/pegar | Delete eliminar' :
          '🎨 Haz clic para colocar elementos | Clic derecho pan | Rueda zoom | Ctrl+Z deshacer'}
        </div>
      </div>
    </div>
  )
}

export default DrawingCanvas