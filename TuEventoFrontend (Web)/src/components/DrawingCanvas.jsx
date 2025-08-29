import React, { useRef, useState, useEffect } from 'react';
import CanvasElement from './CanvasElement';

const DrawingCanvas = ({
  elements = [],
  selectedElementId = null,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
  activeTool
}) => {
  const svgRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState(null);

  // viewBox / zoom/pan
  const viewWidth = 2000;
  const viewHeight = 1200;
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panOrigin = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.style.touchAction = 'none';
  }, []);

  const toViewCoords = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = (clientX - rect.left) * (viewWidth / rect.width) + offset.x;
    const y = (clientY - rect.top) * (viewHeight / rect.height) + offset.y;
    return { x, y };
  };

  const handleMouseDown = (e) => {
    if (e.button === 2) {
      setIsPanning(true);
      panOrigin.current = { x: e.clientX, y: e.clientY, offset: { ...offset } };
      return;
    }

    const pos = toViewCoords(e.clientX, e.clientY);

    // 👉 Herramientas con arrastre
    if (activeTool === 'zone') {
      setIsDrawing(true);
      const newEl = {
        id: Date.now(),
        type: 'zone',
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        fill: 'none',
        stroke: '#16a34a',
        meta: { label: 'Zona' }
      };
      setCurrentElement(newEl);

    } else if (activeTool === 'seatRow') {
      setIsDrawing(true);
      const newEl = {
        id: Date.now(),
        type: 'seatRow',
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 40,
        fill: 'none',
        stroke: '#1d4ed8',
        meta: { label: 'Fila de sillas' }
      };
      setCurrentElement(newEl);

    } else if (activeTool === 'curvedWall') {
      setIsDrawing(true);
      const newEl = {
        id: Date.now(),
        type: 'curvedWall',
        x: pos.x,
        y: pos.y,
        points: [{ x: pos.x, y: pos.y }], // guarda puntos para curva
        stroke: '#7f1d1d',
      };
      setCurrentElement(newEl);

    // 👉 Herramientas con click directo
    } else if (activeTool === 'stage') {
      const newEl = {
        id: Date.now(),
        type: 'stage',
        x: pos.x,
        y: pos.y,
        width: 200,
        height: 100,
        fill: 'gray',
        stroke: '#000'
      };
      onCreate && onCreate(newEl);

    } else if (activeTool === 'door') {
      const newEl = {
        id: Date.now(),
        type: 'door',
        x: pos.x,
        y: pos.y,
        width: 40,
        height: 10,
        fill: 'brown'
      };
      onCreate && onCreate(newEl);

    } else if (activeTool === 'exit') {
      const newEl = {
        id: Date.now(),
        type: 'exit',
        x: pos.x,
        y: pos.y,
        width: 40,
        height: 10,
        fill: 'green'
      };
      onCreate && onCreate(newEl);

    } else if (activeTool === 'chair') {
      const newEl = {
        id: Date.now(),
        type: 'chair',
        x: pos.x,
        y: pos.y,
        width: 20,
        height: 20,
        fill: 'blue'
      };
      onCreate && onCreate(newEl);

    } else {
      onSelect && onSelect(null);
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      const dx = (panOrigin.current.x - e.clientX) * (viewWidth / svgRef.current.getBoundingClientRect().width);
      const dy = (panOrigin.current.y - e.clientY) * (viewHeight / svgRef.current.getBoundingClientRect().height);
      setOffset({
        x: panOrigin.current.offset.x + dx,
        y: panOrigin.current.offset.y + dy
      });
    }

    if (isDrawing && currentElement) {
      const pos = toViewCoords(e.clientX, e.clientY);

      // 👉 dibujar curvas
      if (currentElement.type === 'curvedWall') {
        setCurrentElement(prev => ({
          ...prev,
          points: [...prev.points, { x: pos.x, y: pos.y }]
        }));
      } else {
        // rectángulos o filas
        const width = Math.abs(pos.x - currentElement.x);
        const height = Math.abs(pos.y - currentElement.y);
        const newX = Math.min(currentElement.x, pos.x);
        const newY = Math.min(currentElement.y, pos.y);
        setCurrentElement(prev => ({ ...prev, x: newX, y: newY, width, height }));
      }
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    if (isDrawing && currentElement) {
      if (currentElement.type === 'curvedWall' || (currentElement.width > 6 && currentElement.height > 6)) {
        onCreate && onCreate(currentElement);
      }
      setCurrentElement(null);
      setIsDrawing(false);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const coef = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.2, Math.min(3, prev * coef)));
  };

  const GridPattern = () => (
    <defs>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e6e6e6" strokeWidth="0.5" />
      </pattern>
    </defs>
  );

  const viewBox = `${offset.x} ${offset.y} ${viewWidth / zoom} ${viewHeight / zoom}`;

  return (
    <div className="flex-1 bg-white">
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <h2 className="text-xl font-bold text-gray-800">Plano Biblioteca</h2>
        <p className="text-gray-600">
          Usa la barra de herramientas para seleccionar el tipo de elemento.  
          Click derecho = pan | Rueda = zoom
        </p>
      </div>

      <div className="relative overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={viewBox}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="bg-white cursor-crosshair"
        >
          <GridPattern />
          <rect width={viewWidth} height={viewHeight} fill="url(#grid)" />

          {elements.map(el => (
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
            <>
              {(currentElement.type === 'zone' || currentElement.type === 'seatRow') && (
                <rect
                  x={currentElement.x}
                  y={currentElement.y}
                  width={currentElement.width}
                  height={currentElement.height}
                  fill="rgba(34,197,94,0.06)"
                  stroke="#22c55e"
                  strokeDasharray="4 3"
                />
              )}
              {currentElement.type === 'curvedWall' && (
                <polyline
                  points={currentElement.points.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="#7f1d1d"
                  strokeWidth="2"
                />
              )}
            </>
          )}
        </svg>

        <div className="absolute bottom-4 left-4 bg-white border border-gray-300 px-3 py-1 text-sm">
          Escala: {Math.round(zoom * 100)}%
        </div>
      </div>
    </div>
  );
};

export default DrawingCanvas;
