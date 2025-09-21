import React from "react";

const ELEMENT_CONSTANTS = {
  CHAIR_SIZE: 50,
  DOOR_SIZE: 100,
  WALL_THICKNESS: 15,
  CHAIR_SPACING: 45,
  CHAIR_RADIUS: 18,
  CIRCLE_STROKE_WIDTH: 3,
};

const CanvasElement = ({ element, isSelected, onSelect, onDelete, onUpdate, units, elements = [] }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    onSelect && onSelect(element.id);
  };

  const baseProps = {
    onClick: handleClick,
    style: {
      cursor: isSelected ? "move" : "pointer",
      transition: 'transform 0.1s ease'
    },
    opacity: isSelected ? 0.9 : 1,
    strokeWidth: isSelected ? 3 : element.strokeWidth || 2,
    filter: isSelected ? "url(#dropShadow)" : undefined,
    className: isSelected ? "canvas-element selected" : "canvas-element",
  };

  const getCenter = () => {
    if (element.type === 'wall') {
      return { x: element.x1 + (element.x2 - element.x1) / 2, y: element.y1 + (element.y2 - element.y1) / 2 };
    } else if (element.type === 'curvedWall') {
      const points = element.points || [];
      if (points.length === 0) return { x: 0, y: 0 };
      const mid = Math.floor(points.length / 2);
      return { x: points[mid].x, y: points[mid].y };
    } else if (element.type === 'chair' || element.type === 'door') {
      return { x: element.x, y: element.y };
    } else {
      return { x: element.x + (element.width || 0) / 2, y: element.y + (element.height || 0) / 2 };
    }
  };

  const center = getCenter();
  const rotation = element.rotation || 0;
  const transform = `rotate(${rotation}, ${center.x}, ${center.y})`;

  const renderLabelElement = (labelX, labelY) => {
    if (!element.meta?.label) return null;

    // Tamaño de fuente según tipo de elemento
    const fontSize = element.type === 'chair' ? '8' :
                     element.type === 'door' || element.type === 'exit' ? '12' :
                     element.type === 'stage' || element.type === 'zone' ? '14' : '11';

    const fontWeight = element.type === 'stage' || element.type === 'zone' ? 'bold' : '500';

    return (
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize}
        fontFamily="Arial, sans-serif"
        fontWeight={fontWeight}
        fill="#1f2937"
        pointerEvents="none"
        style={{
          textShadow: "1px 1px 2px rgba(255,255,255,0.9)",
        }}
      >
        {element.meta.label}
      </text>
    );
  };

  const renderElement = () => {
    switch (element.type) {
      case "zone":
      case "stage": {
        return (
          <g data-element-id={element.id} transform={transform} {...baseProps}>
            <rect
              x={element.x - (element.width || 0) / 2}
              y={element.y - (element.height || 0) / 2}
              width={element.width}
              height={element.height}
              rx={2}
              fill={element.fill}
              stroke={element.stroke}
            />
            {renderLabelElement(element.x, element.y)}
            {isSelected && element.width && element.height && (
              <>
                {/* Líneas de dimensión horizontal */}
                <line
                  x1={element.x - (element.width || 0) / 2}
                  y1={element.y - (element.height || 0) / 2 - 10}
                  x2={element.x + (element.width || 0) / 2}
                  y2={element.y - (element.height || 0) / 2 - 10}
                  stroke="#3b82f6"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <line
                  x1={element.x - (element.width || 0) / 2}
                  y1={element.y - (element.height || 0) / 2 - 15}
                  x2={element.x - (element.width || 0) / 2}
                  y2={element.y - (element.height || 0) / 2 - 5}
                  stroke="#3b82f6"
                  strokeWidth="1"
                />
                <line
                  x1={element.x + (element.width || 0) / 2}
                  y1={element.y - (element.height || 0) / 2 - 15}
                  x2={element.x + (element.width || 0) / 2}
                  y2={element.y - (element.height || 0) / 2 - 5}
                  stroke="#3b82f6"
                  strokeWidth="1"
                />
                {/* Líneas de dimensión vertical */}
                <line
                  x1={element.x + (element.width || 0) / 2 + 10}
                  y1={element.y - (element.height || 0) / 2}
                  x2={element.x + (element.width || 0) / 2 + 10}
                  y2={element.y + (element.height || 0) / 2}
                  stroke="#3b82f6"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <line
                  x1={element.x + (element.width || 0) / 2 + 5}
                  y1={element.y - (element.height || 0) / 2}
                  x2={element.x + (element.width || 0) / 2 + 15}
                  y2={element.y - (element.height || 0) / 2}
                  stroke="#3b82f6"
                  strokeWidth="1"
                />
                <line
                  x1={element.x + (element.width || 0) / 2 + 5}
                  y1={element.y + (element.height || 0) / 2}
                  x2={element.x + (element.width || 0) / 2 + 15}
                  y2={element.y + (element.height || 0) / 2}
                  stroke="#3b82f6"
                  strokeWidth="1"
                />
                <text
                  x={element.x}
                  y={element.y - (element.height || 0) / 2 - 20}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#3b82f6"
                  pointerEvents="none"
                >
                  {units === 'cm' ? Math.round(element.width || 0) : ((element.width || 0) / 100).toFixed(2)}{units}
                </text>
                <text
                  x={element.x + (element.width || 0) / 2 + 25}
                  y={element.y}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#3b82f6"
                  pointerEvents="none"
                  transform={`rotate(90, ${element.x + (element.width || 0) / 2 + 25}, ${element.y})`}
                >
                  {units === 'cm' ? Math.round(element.height || 0) : ((element.height || 0) / 100).toFixed(2)}{units}
                </text>
              </>
            )}
          </g>
        );
      }

      case "seatRow": {
        const numChairs = Math.max(1, Math.floor((element.width || 0) / ELEMENT_CONSTANTS.CHAIR_SPACING));
        const startX = element.x - (element.width || 0) / 2 + ELEMENT_CONSTANTS.CHAIR_SPACING / 2;
        const chairs = [];

        for (let i = 0; i < numChairs; i++) {
          const chairX = startX + i * ELEMENT_CONSTANTS.CHAIR_SPACING;
          chairs.push(
            <circle
              key={i}
              cx={chairX}
              cy={element.y}
              r={ELEMENT_CONSTANTS.CHAIR_RADIUS}
              fill="#6b7280"
              stroke="#374151"
              strokeWidth="1"
            />
          );
        }

        return (
          <g data-element-id={element.id} transform={transform} {...baseProps}>
            {chairs}
            {renderLabelElement(element.x, element.y - 20)}
            {isSelected && (
              <text
                x={element.x}
                y={element.y + 25}
                textAnchor="middle"
                fontSize="10"
                fill="#374151"
                pointerEvents="none"
              >
                {numChairs} sillas × {Math.round(element.width || 0)}{units}
              </text>
            )}
          </g>
        );
      }

      case "chair": {
        return (
          <g data-element-id={element.id} transform={transform} {...baseProps}>
            <image
              href="/src/assets/images/silla-de-oficina.png"
              x={element.x - ELEMENT_CONSTANTS.CHAIR_SIZE / 2}
              y={element.y - ELEMENT_CONSTANTS.CHAIR_SIZE / 2}
              width={ELEMENT_CONSTANTS.CHAIR_SIZE}
              height={ELEMENT_CONSTANTS.CHAIR_SIZE}
              preserveAspectRatio="xMidYMid meet"
            />
            {renderLabelElement(element.x, element.y + ELEMENT_CONSTANTS.CHAIR_SIZE / 2 + 10)}
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
            transform={`rotate(${angle}, ${element.x1}, ${element.y1}) ${transform}`}
            {...baseProps}
          >
            <rect
              x={element.x1}
              y={element.y1 - ELEMENT_CONSTANTS.WALL_THICKNESS / 2}
              width={length}
              height={ELEMENT_CONSTANTS.WALL_THICKNESS}
              fill="#6b7280"
              stroke="#4b5563"
              strokeWidth={1}
            />
            {renderLabelElement(midX, midY - 10)}
            {isSelected && (
              <text
                x={midX}
                y={midY + 15}
                textAnchor="middle"
                fontSize="10"
                fill="#374151"
                pointerEvents="none"
              >
                {units === 'cm' ? Math.round(length) + 'cm' : (length / 100).toFixed(2) + 'm'}
              </text>
            )}
          </g>
        );
      }

      case "door": {
        const { x, y } = element;
        return (
          <g data-element-id={element.id} transform={transform} {...baseProps}>
            <image
              href="/src/assets/images/door.png"
              x={x - ELEMENT_CONSTANTS.DOOR_SIZE / 2}
              y={y - ELEMENT_CONSTANTS.DOOR_SIZE / 2}
              width={ELEMENT_CONSTANTS.DOOR_SIZE}
              height={ELEMENT_CONSTANTS.DOOR_SIZE}
              preserveAspectRatio="xMidYMid meet"
            />
            {renderLabelElement(x, y + ELEMENT_CONSTANTS.DOOR_SIZE / 2 + 10)}
          </g>
        );
      }

      case "circle": {
        return (
          <g data-element-id={element.id} transform={transform} {...baseProps}>
            <circle
              cx={element.x}
              cy={element.y}
              r={element.radius || 50}
              fill="transparent"
              stroke="#495463ff"
              strokeWidth={ELEMENT_CONSTANTS.CIRCLE_STROKE_WIDTH}
            />
            {renderLabelElement(element.x, element.y)}
            {isSelected && (
              <text
                x={element.x}
                y={element.y + 15}
                textAnchor="middle"
                fontSize="10"
                fill="#374151"
                pointerEvents="none"
              >
                Ø {units === 'cm' ? Math.round((element.radius || 0) * 2) : ((element.radius || 0) * 2 / 100).toFixed(2)}{units}
              </text>
            )}
          </g>
        );
      }

      case "exit": {
        return (
          <g data-element-id={element.id} transform={transform} {...baseProps}>
            <rect
              x={element.x - (element.width || 0) / 2}
              y={element.y - (element.height || 0) / 2}
              width={element.width}
              height={element.height}
              rx={2}
              fill={element.fill}
              stroke={element.stroke}
            />
            {renderLabelElement(element.x, element.y)}
          </g>
        );
      }

      case "curvedWall": {
        return (
          <g data-element-id={element.id} transform={transform} {...baseProps}>
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
