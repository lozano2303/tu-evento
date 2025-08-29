
import React, { useRef, useEffect } from 'react';
import interact from 'interactjs';


 
const CanvasElement = ({ element, isSelected, onSelect, onUpdate, onDelete }) => {
  const nodeRef = useRef(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    // draggable
    interact(node).draggable({
      listeners: {
        move(event) {
         
          const dy = event.dy;
          // update coordinates incrementally
          onUpdate(element.id, { x: (element.x || 0) + dx, y: (element.y || 0) + dy });
        }
      },
      inertia: true
    });

    // resizable
    interact(node).resizable({
      edges: { left: true, right: true, bottom: true, top: true },
      listeners: {
        move(event) {
          const { width, height } = event.rect;
          const deltaX = event.deltaRect.left;
          const deltaY = event.deltaRect.top;
          onUpdate(element.id, {
            x: (element.x || 0) + deltaX,
            y: (element.y || 0) + deltaY,
            width: Math.max(8, width),
            height: Math.max(8, height)
          });
        }
      },
      modifiers: [
        interact.modifiers.restrictSize({ min: { width: 8, height: 8 } })
      ],
      inertia: true
    });

    // gesturable (rotation)
    interact(node).gesturable({
      listeners: {
        move(event) {
          // event.da is delta rotation (degrees)
          const rotation = (element.rotation || 0) + event.da;
          onUpdate(element.id, { rotation });
        }
      }
    });

    return () => {
      try { interact(node).unset(); } catch (e) { /* ignore */ }
    };
  }, [element, onUpdate]);

  const commonOnClick = (e) => {
    e.stopPropagation();
    if (onSelect) onSelect(element.id);
  };

  // render per-type; all drawn in a <g> with transform for position & rotation
  const transform = `translate(${element.x || 0}, ${element.y || 0}) rotate(${element.rotation || 0})`;

  const baseStyle = {
    cursor: 'move'
  };

  const rectProps = {
    width: element.width || 40,
    height: element.height || 40,
    fill: element.fill || 'transparent',
    stroke: element.stroke || '#111',
    strokeWidth: isSelected ? 2 : 1
  };

  switch (element.type) {
    case 'chair':
      return (
        <g ref={nodeRef} transform={transform} onClick={commonOnClick} style={baseStyle}>
          <rect x={0} y={0} {...rectProps} rx="3" />
          {/* orientation indicator */}
          <path d={`M ${rectProps.width/2} ${rectProps.height*0.15} L ${rectProps.width*0.75} ${rectProps.height*0.5} L ${rectProps.width*0.25} ${rectProps.height*0.5} Z`} fill="#333" opacity="0.6" />
        </g>
      );

    case 'seatRow':
      // meta.seatsCount and spacing
      {
        const seatsCount = element.meta?.seatsCount || 4;
        const seatW = (element.width || 40) / seatsCount;
        return (
          <g ref={nodeRef} transform={transform} onClick={commonOnClick} style={baseStyle}>
            <rect x={0} y={0} {...rectProps} opacity="0.05" />
            {Array.from({ length: seatsCount }).map((_, i) => (
              <rect
                key={i}
                x={i * seatW + 2}
                y={4}
                width={Math.max(6, seatW - 4)}
                height={(element.height || 40) - 8}
                rx="3"
                stroke={rectProps.stroke}
                fill={element.fill || '#fff'}
              />
            ))}
          </g>
        );
      }

    case 'stage':
      return (
        <g ref={nodeRef} transform={transform} onClick={commonOnClick} style={baseStyle}>
          <rect x={0} y={0} width={element.width || 300} height={element.height || 120} fill="#f3f4f6" stroke="#111827" strokeWidth={2} rx="6" />
          <text x="12" y="20" fontSize="14" fill="#111827">Escenario</text>
        </g>
      );

    case 'door':
      return (
        <g ref={nodeRef} transform={transform} onClick={commonOnClick} style={baseStyle}>
          <rect x={0} y={0} {...rectProps} fill={element.fill || 'transparent'} />
          <path d={`M ${element.width || 40} ${element.height || 40} Q ${(element.width || 40)/2} ${- (element.height || 40)} 0 ${element.height || 40}`} fill="none" stroke={rectProps.stroke} strokeWidth="1.5" />
        </g>
      );

    case 'exit':
      return (
        <g ref={nodeRef} transform={transform} onClick={commonOnClick} style={baseStyle}>
          <circle cx={(element.width||32)/2} cy={(element.height||32)/2} r={Math.min(element.width||32, element.height||32)/2} fill="#fff" stroke="#ef4444" strokeWidth="2" />
          <text x={(element.width||32)/4} y={(element.height||32)/2 + 4} fontSize="10" fill="#ef4444">EXIT</text>
        </g>
      );

    case 'curvedWall':
      {
        const pts = element.meta?.curvePoints || [{ x: 0, y: 0 }, { x: (element.width || 100), y: (element.height || 20) }];
        const d = `M ${pts.map(p => `${p.x} ${p.y}`).join(' L ')}`;
        return (
          <g ref={nodeRef} transform={transform} onClick={commonOnClick} style={baseStyle}>
            <path d={d} stroke={element.stroke || '#000'} strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
        );
      }

    case 'zone':
      return (
        <g ref={nodeRef} transform={transform} onClick={commonOnClick} style={baseStyle}>
          <rect x={0} y={0} width={element.width || 200} height={element.height || 150}
            fill={element.meta?.fill || 'rgba(34,197,94,0.06)'} stroke={element.meta?.stroke || '#22c55e'} strokeDasharray="6 4" />
          <text x={8} y={16} fontSize="12" fill="#065f46">{element.meta?.label || 'Zona'}</text>
        </g>
      );

    case 'wall':
      return (
        <g ref={nodeRef} transform={transform} onClick={commonOnClick} style={{ cursor: 'default' }}>
          <rect x={0} y={0} width={element.width || 200} height={element.height || 8} fill={element.stroke || '#000'} />
        </g>
      );

    default:
      return (
        <g ref={nodeRef} transform={transform} onClick={commonOnClick} style={baseStyle}>
          <rect x={0} y={0} {...rectProps} />
        </g>
      );
  }
};

export default CanvasElement;
