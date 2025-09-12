import { useRef, useState, useEffect } from "react"
import CanvasElement from "./CanvasElement"

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

  const handleMouseDown = (e) => {
    e.preventDefault()

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
    setStartPoint(pos)

    if (["zone", "seatRow", "chair", "door", "exit", "stage"].includes(activeTool)) {
      setIsDrawing(true)
      const fillColors = {
        zone: "rgba(22, 78, 99, 0.1)",
        seatRow: "rgba(29, 78, 216, 0.1)",
        chair: "#f59e0b",
        door: "#64748b",
        exit: "#dc2626",
        stage: "rgba(147, 51, 234, 0.2)",
      }
      const strokeColors = {
        zone: "#164e63",
        seatRow: "#1d4ed8",
        chair: "#d97706",
        door: "#475569",
        exit: "#dc2626",
        stage: "#9333ea",
      }
      const labels = {
        zone: "Zona",
        seatRow: "Fila de sillas",
        chair: "Silla",
        door: "Puerta",
        exit: "Salida",
        stage: "Escenario",
      }
      const newEl = {
        id: Date.now(),
        type: activeTool,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        fill: fillColors[activeTool],
        stroke: strokeColors[activeTool],
        meta: { label: labels[activeTool] },
      }
      setCurrentElement(newEl)
    } else if (activeTool === "wall") {
      setIsDrawing(true)
      setCurrentElement({
        id: Date.now(),
        type: "wall",
        x1: pos.x,
        y1: pos.y,
        x2: pos.x,
        y2: pos.y,
        stroke: "#475569",
        strokeWidth: 3,
      })
    } else if (activeTool === "curvedWall") {
      setIsDrawing(true)
      setCurrentElement({
        id: Date.now(),
        type: "curvedWall",
        x: pos.x,
        y: pos.y,
        points: [{ x: pos.x, y: pos.y }],
        stroke: "#dc2626",
        strokeWidth: 3,
      })
    }
  }

  const handleMouseMove = (e) => {
    e.preventDefault()
    if (isPanning) {
      const dx = (panOrigin.current.x - e.clientX) * (viewWidth / (zoom * svgRef.current.clientWidth))
      const dy = (panOrigin.current.y - e.clientY) * (viewHeight / (zoom * svgRef.current.clientHeight))
      setOffset({
        x: panOrigin.current.offset.x + dx,
        y: panOrigin.current.offset.y + dy,
      })
      return
    }

    if (!isDrawing || !currentElement || !startPoint) return

    const pos = toViewCoords(e.clientX, e.clientY)
    const updated = { ...currentElement }

    if (["zone", "seatRow", "chair", "door", "exit", "stage"].includes(activeTool)) {
      updated.width = pos.x - startPoint.x
      updated.height = pos.y - startPoint.y
      if (updated.width < 0) {
        updated.x = pos.x
        updated.width = startPoint.x - pos.x
      } else {
        updated.x = startPoint.x
      }
      if (updated.height < 0) {
        updated.y = pos.y
        updated.height = startPoint.y - pos.y
      } else {
        updated.y = startPoint.y
      }
    } else if (activeTool === "wall") {
      updated.x2 = pos.x
      updated.y2 = pos.y
    } else if (activeTool === "curvedWall") {
      updated.points = [...(updated.points || []), { x: pos.x, y: pos.y }]
    }

    setCurrentElement(updated)
  }

  const handleMouseUp = (e) => {
    e.preventDefault()

    if (isPanning) {
      setIsPanning(false)
      return
    }

    if (!isDrawing || !currentElement) return

    if (activeTool === "curvedWall") {
      return
    }

    setIsDrawing(false)
    onCreate && onCreate(currentElement)
    setCurrentElement(null)
    setStartPoint(null)
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = -e.deltaY
    const zoomFactor = 0.001
    let newZoom = zoom + delta * zoomFactor
    if (newZoom < 0.2) newZoom = 0.2
    if (newZoom > 4) newZoom = 4

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

  const handleClickCanvas = () => {
    if (!isDrawing) onSelect && onSelect(null)
  }

  return (
    <div className="w-full h-full relative bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/40" />
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`${offset.x} ${offset.y} ${viewWidth / zoom} ${viewHeight / zoom}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleClickCanvas}
        className="relative z-10 bg-white shadow-inner border border-border/50"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)
          `,
          backgroundSize: "20px 20px",
        }}
      >
        <defs>
          <pattern id="zonePattern" patternUnits="userSpaceOnUse" width="8" height="8">
            <rect width="8" height="8" fill="rgba(22, 78, 99, 0.05)" />
            <path d="M0,8 L8,0 M-2,2 L2,-2 M6,10 L10,6" stroke="rgba(22, 78, 99, 0.2)" strokeWidth="1" />
          </pattern>
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.1)" />
          </filter>
        </defs>

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

      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
          <div className="text-xs text-muted-foreground text-center mb-2">Zoom: {Math.round(zoom * 100)}%</div>
          <div className="text-xs text-muted-foreground text-center">Click derecho + arrastrar para mover</div>
        </div>
      </div>
    </div>
  )
}

export default DrawingCanvas
