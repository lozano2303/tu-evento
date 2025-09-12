import React from "react"

const CanvasElement = ({ element, isSelected, onSelect, onDelete }) => {
  const handleClick = (e) => {
    e.stopPropagation()
    onSelect && onSelect(element.id)
  }

  const handleDoubleClick = (e) => {
    e.stopPropagation()
    onDelete && onDelete(element.id)
  }

  const getElementProps = () => {
    const baseProps = {
      onClick: handleClick,
      onDoubleClick: handleDoubleClick,
      style: { cursor: "pointer" },
      opacity: isSelected ? 0.9 : 1,
      strokeWidth: isSelected ? 3 : element.strokeWidth || 2,
      filter: isSelected ? "url(#dropShadow)" : undefined,
    }

    switch (element.type) {
      case "zone":
        return {
          ...baseProps,
          fill: "url(#zonePattern)",
          stroke: element.stroke || "#164e63",
        }
      case "seatRow":
        return {
          ...baseProps,
          fill: "rgba(29, 78, 216, 0.05)",
          stroke: "#1d4ed8",
        }
      case "wall":
        return {
          ...baseProps,
          stroke: "#94a3b8",
          strokeWidth: isSelected ? 10 : 8,
        }
      case "curvedWall":
        return {
          ...baseProps,
          fill: "none",
          stroke: "#dc2626",
          strokeWidth: isSelected ? 4 : 3,
        }
      case "stage":
        return {
          ...baseProps,
          fill: "url(#stagePattern)",
          stroke: "#9333ea",
        }
      case "chair":
        return {
          ...baseProps,
          fill: "#facc15",
          stroke: "#ca8a04",
        }
      case "door":
        return {
          ...baseProps,
          fill: "#e2e8f0",
          stroke: "#94a3b8",
        }
      case "exit":
        return {
          ...baseProps,
          fill: "#dc2626",
          stroke: "#b91c1c",
        }
      default:
        return {
          ...baseProps,
          fill: element.fill || "#64748b",
          stroke: element.stroke || "#475569",
        }
    }
  }

  const renderElement = () => {
    const props = getElementProps()

    switch (element.type) {
      case "zone":
      case "seatRow":
      case "stage":
        return (
          <rect
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            rx={2}
            {...props}
          />
        )

 case "chair":
  const chairSize = 50 
  return (
    <image
      href="/src/assets/images/silla-de-oficina.png"
      x={element.x - chairSize / 2}
      y={element.y - chairSize / 2}
      width={chairSize}
      height={chairSize}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={{ cursor: "pointer" }}
      opacity={isSelected ? 0.8 : 1}
    />
  )

  

      case "wall":
        return (
          <g>
            {/* Double line wall */}
            <line
              x1={element.x1}
              y1={element.y1}
              x2={element.x2}
              y2={element.y2}
              stroke="#cbd5e1"
              strokeWidth={10}
            />
            <line
              x1={element.x1 + 2}
              y1={element.y1 + 2}
              x2={element.x2 + 2}
              y2={element.y2 + 2}
              stroke="#94a3b8"
              strokeWidth={10}
            />
          </g>
        )

      case "door":
        return (
          <g>
            <rect
              x={element.x}
              y={element.y}
              width={element.width}
              height={element.height}
              rx={2}
              fill={props.fill}
              stroke={props.stroke}
            />
            {/* Arco de apertura */}
            <path
              d={`
                M ${element.x + element.width} ${element.y}
                A ${element.width} ${element.height} 0 0 1 ${element.x} ${element.y + element.height}
              `}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1"
            />
          </g>
        )

      case "exit":
        return (
          <rect
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            rx={2}
            {...props}
          />
        )

      case "curvedWall":
        return (
          <polyline
            points={element.points?.map((p) => `${p.x},${p.y}`).join(" ") || ""}
            {...props}
          />
        )

      default:
        return null
    }
  }

  const renderLabel = () => {
    if (!element.meta?.label) return null

    const isWall = element.type === "wall"
    const x = isWall
      ? (element.x1 + element.x2) / 2
      : element.x + (element.width || 0) / 2
    const y = isWall
      ? (element.y1 + element.y2) / 2 - 5
      : element.y + (element.height || 0) / 2

    return (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="11"
        fontFamily="monospace"
        fontWeight="500"
        fill="#334155"
        pointerEvents="none"
        style={{
          textShadow: "1px 1px 2px rgba(255,255,255,0.8)",
        }}
      >
        {element.meta.label}
      </text>
    )
  }

  return (
    <g>
      {/* SVG patterns for textures */}
      <defs>
        <pattern id="zonePattern" patternUnits="userSpaceOnUse" width="8" height="8">
          <path d="M0,0 L8,8" stroke="#bae6fd" strokeWidth="1" />
        </pattern>
        <pattern id="stagePattern" patternUnits="userSpaceOnUse" width="6" height="6">
          <rect width="3" height="3" fill="#d8b4fe" />
        </pattern>
      </defs>

      {renderElement()}
      {renderLabel()}
    </g>
  )
}

export default CanvasElement
