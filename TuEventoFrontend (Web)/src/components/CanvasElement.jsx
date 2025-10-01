import React from "react";

const ELEMENT_CONSTANTS = {
  CHAIR_SIZE: 50,
  DOOR_SIZE: 100,
  WALL_THICKNESS: 15,
  CHAIR_SPACING: 45,
  CHAIR_RADIUS: 18,
  CIRCLE_STROKE_WIDTH: 3,
};

const CanvasElement = ({ element, isSelected, onSelect, onDelete, onUpdate, units, elements = [], onLabelEdit, isSeatSelectionMode = false }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    onSelect && onSelect(element.id);
  };

  const baseProps = {
    onClick: handleClick,
    style: {
      cursor: isSeatSelectionMode ? (isSelected ? "move" : "pointer") : "default",
      pointerEvents: isSeatSelectionMode ? 'auto' : 'none',
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
        pointerEvents="auto"
        onClick={(e) => {
          e.stopPropagation();
          onLabelEdit && onLabelEdit(element.id);
        }}
        style={{
          textShadow: "1px 1px 2px rgba(255,255,255,0.9)",
          cursor: 'pointer'
        }}
      >
        {element.meta.label}
      </text>
    );
  };

  const renderElement = () => {
    switch (element.type) {
      case "zone":
      case "section":
      case "stage": {
        const isSection = element.type === 'section';
        return (
          <g data-element-id={element.id} transform={transform} {...baseProps}>
            <rect
              x={element.x - (element.width || 0) / 2}
              y={element.y - (element.height || 0) / 2}
              width={element.width}
              height={element.height}
              rx={2}
              fill={isSection ? 'transparent' : element.fill}
              stroke={element.stroke}
              strokeWidth={isSection ? 2 : 1}
              strokeDasharray={isSection ? '5,5' : undefined}
            />
            {renderLabelElement(element.x, element.y - (isSection ? 10 : 0))}
            {isSection && element.meta && (
              <text
                x={element.x}
                y={element.y + 5}
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill="#1f2937"
                pointerEvents="none"
                style={{
                  textShadow: "1px 1px 2px rgba(255,255,255,0.9)",
                }}
              >
                {element.meta.category || 'General'} - ${element.meta.price || 0}
              </text>
            )}
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
        const numChairs = element.seatPositions ? element.seatPositions.length : Math.max(1, Math.floor((element.width || 0) / ELEMENT_CONSTANTS.CHAIR_SPACING));
        const startX = element.x - (element.width || 0) / 2 + ELEMENT_CONSTANTS.CHAIR_SPACING / 2;
        const chairs = [];

        // Usar las posiciones de asientos existentes o generar nuevas
        let seatPositions = element.seatPositions;
        if (!seatPositions) {
          seatPositions = [];
          for (let i = 0; i < numChairs; i++) {
            const chairX = startX + i * ELEMENT_CONSTANTS.CHAIR_SPACING;
            seatPositions.push({
              id: `${element.id}-seat-${i}`,
              x: chairX,
              y: element.y,
              seatNumber: i + 1,
              row: element.meta?.row || 'A',
              status: 'AVAILABLE'
            });
          }
          element.seatPositions = seatPositions;
        }

        for (let i = 0; i < seatPositions.length; i++) {
          const seatPos = seatPositions[i];
          chairs.push(
            <g key={i} style={{ cursor: 'pointer' }}>
              <rect
                x={seatPos.x - ELEMENT_CONSTANTS.CHAIR_RADIUS}
                y={seatPos.y - ELEMENT_CONSTANTS.CHAIR_RADIUS}
                width={ELEMENT_CONSTANTS.CHAIR_RADIUS * 2}
                height={ELEMENT_CONSTANTS.CHAIR_RADIUS * 2}
                fill="#6b7280"
                stroke="#374151"
                strokeWidth="1"
                rx="2"
              />
              <text
                x={seatPos.x}
                y={seatPos.y + 3}
                textAnchor="middle"
                fontSize="8"
                fill="white"
                pointerEvents="none"
              >
                {seatPos.row}{seatPos.seatNumber}
              </text>
            </g>
          );
        }

        return (
          <g data-element-id={element.id} transform={transform}>
            {/* Área clickeable para seleccionar toda la fila */}
            <rect
              x={element.x - (element.width || 0) / 2}
              y={element.y - ELEMENT_CONSTANTS.CHAIR_RADIUS - 10}
              width={element.width || 0}
              height={ELEMENT_CONSTANTS.CHAIR_RADIUS * 2 + 20}
              fill="transparent"
              stroke={isSelected ? "#3b82f6" : "transparent"}
              strokeWidth={isSelected ? 2 : 0}
              strokeDasharray={isSelected ? "5,5" : undefined}
              style={{
                cursor: isSelected ? "move" : "pointer",
                pointerEvents: isSeatSelectionMode ? 'none' : 'auto',
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelect && onSelect(element.id);
              }}
              opacity={isSelected ? 0.9 : 1}
              filter={isSelected ? "url(#dropShadow)" : undefined}
              className={isSelected ? "canvas-element selected" : "canvas-element"}
            />
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
                {seatPositions.length} sillas × {Math.round(element.width || 0)}{units}
              </text>
            )}
          </g>
        );
      }

      case "chair": {
        return (
          <g data-element-id={element.id} transform={transform} {...baseProps}>
            <rect
              x={element.x - ELEMENT_CONSTANTS.CHAIR_SIZE / 2}
              y={element.y - ELEMENT_CONSTANTS.CHAIR_SIZE / 2}
              width={ELEMENT_CONSTANTS.CHAIR_SIZE}
              height={ELEMENT_CONSTANTS.CHAIR_SIZE}
              fill="transparent"
              stroke="none"
              pointerEvents="auto"
            />
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

        const midX = element.x1 + dx / 2;
        const midY = element.y1 + dy / 2;

        return (
          <g
            data-element-id={element.id}
            transform={transform}
            {...baseProps}
          >
            <line
              x1={element.x1}
              y1={element.y1}
              x2={element.x2}
              y2={element.y2}
              stroke="#6b7280"
              strokeWidth={ELEMENT_CONSTANTS.WALL_THICKNESS}
              strokeLinecap="square"
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

export default React.memo(CanvasElement);
