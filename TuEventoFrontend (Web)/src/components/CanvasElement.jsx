import React from "react";

const CanvasElement = ({ element, isSelected, onSelect, onDelete, onUpdate }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    onSelect && onSelect(element.id);
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    onDelete && onDelete(element.id);
  };

  const baseProps = {
    onClick: handleClick,
    onDoubleClick: handleDoubleClick,
    style: { cursor: isSelected ? "move" : "pointer" },
    opacity: isSelected ? 0.9 : 1,
    strokeWidth: isSelected ? 3 : element.strokeWidth || 2,
    filter: isSelected ? "url(#dropShadow)" : undefined,
    className: isSelected ? "canvas-element selected" : "canvas-element", 
  };

  const renderLabelElement = (labelX, labelY) => {
    if (!element.meta?.label) return null;

    return (
      <text
        x={labelX}
        y={labelY}
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
    );
  };

  const renderElement = () => {
    switch (element.type) {
      case "zone":
      case "seatRow":
      case "stage": {
        return (
          <g data-element-id={element.id} {...baseProps}>
            <rect
              x={element.x}
              y={element.y}
              width={element.width}
              height={element.height}
              rx={2}
              fill={element.fill}
              stroke={element.stroke}
            />
            {renderLabelElement(
              element.x + (element.width || 0) / 2,
              element.y + (element.height || 0) / 2
            )}
          </g>
        );
      }

      case "chair": {
        const chairSize = 50;
        return (
          <g data-element-id={element.id} {...baseProps}>
            <image
              href="/src/assets/images/silla-de-oficina.png"
              x={element.x - chairSize / 2}
              y={element.y - chairSize / 2}
              width={chairSize}
              height={chairSize}
              preserveAspectRatio="xMidYMid meet"
            />
            {renderLabelElement(element.x, element.y + chairSize / 2 + 10)}
          </g>
        );
      }

      case "wall": {
        const dx = element.x2 - element.x1;
        const dy = element.y2 - element.y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        const midX = element.x1 + dx / 2;
        const midY = element.y1 + dy / 2;

        return (
          <g
            data-element-id={element.id}
            transform={`rotate(${angle}, ${element.x1}, ${element.y1})`}
            {...baseProps}
          >
            <rect
              x={element.x1}
              y={element.y1 - (element.thickness || 15) / 2}
              width={length}
              height={element.thickness || 15}
              fill="gray"
              stroke="#495463ff"
              strokeWidth={2}
            />
            {renderLabelElement(midX, midY - 10)}
          </g>
        );
      }

      case "door": {
        const { x, y } = element;
        const doorSize = 100;
        return (
          <g data-element-id={element.id} {...baseProps}>
            <image
              href="/src/assets/images/door.png"
              x={x}
              y={y}
              width={doorSize}
              height={doorSize}
              preserveAspectRatio="xMidYMid meet"
            />
            {renderLabelElement(x + doorSize / 2, y + doorSize + 10)}
          </g>
        );
      }

      case "exit": {
        return (
          <g data-element-id={element.id} {...baseProps}>
            <rect
              x={element.x}
              y={element.y}
              width={element.width}
              height={element.height}
              rx={2}
              fill={element.fill}
              stroke={element.stroke}
            />
            {renderLabelElement(
              element.x + (element.width || 0) / 2,
              element.y + (element.height || 0) / 2
            )}
          </g>
        );
      }

      case "curvedWall": {
        return (
          <g data-element-id={element.id} {...baseProps}>
            <polyline
              points={element.points?.map((p) => `${p.x},${p.y}`).join(" ") || ""}
              fill="none"
              stroke={element.stroke}
              strokeWidth={element.strokeWidth || 3}
            />
            {element.points?.length > 0 &&
              renderLabelElement(
                element.points[Math.floor(element.points.length / 2)].x,
                element.points[Math.floor(element.points.length / 2)].y - 8
              )}
          </g>
        );
      }

      default:
        return null;
    }
  };

  return <>{renderElement()}</>;
};

export default CanvasElement;
