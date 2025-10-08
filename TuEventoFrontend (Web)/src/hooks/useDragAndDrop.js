// src/hooks/useDragAndDrop.js
import { useState, useCallback, useRef } from 'react';

const useDragAndDrop = () => {
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedElementId: null,
    initialMousePos: { x: 0, y: 0 },
    initialElementPos: null,
    dragOffset: { x: 0, y: 0 }
  });

  const dragStartRef = useRef(null);

  const startDrag = useCallback((element, mousePos) => {
    let initialPos = null;
    
    // Determinar la posición inicial según el tipo de elemento
    if (element.type === 'wall') {
      initialPos = { 
        x1: element.x1, 
        y1: element.y1, 
        x2: element.x2, 
        y2: element.y2 
      };
    } else if (element.type === 'curvedWall') {
      initialPos = { 
        points: element.points?.map(p => ({ x: p.x, y: p.y })) || [] 
      };
    } else {
      // Elementos rectangulares (zone, seatRow, chair, door, exit, stage)
      initialPos = { 
        x: element.x, 
        y: element.y 
      };
    }

    const newDragState = {
      isDragging: true,
      draggedElementId: element.id,
      initialMousePos: { x: mousePos.x, y: mousePos.y },
      initialElementPos: initialPos,
      dragOffset: { x: 0, y: 0 }
    };

    setDragState(newDragState);
    dragStartRef.current = newDragState;
  }, []);

  const updateDrag = useCallback((mousePos) => {
    if (!dragState.isDragging || !dragStartRef.current) return null;

    const dx = mousePos.x - dragStartRef.current.initialMousePos.x;
    const dy = mousePos.y - dragStartRef.current.initialMousePos.y;

    const updatedOffset = { x: dx, y: dy };
    
    setDragState(prev => ({
      ...prev,
      dragOffset: updatedOffset
    }));

    return updatedOffset;
  }, [dragState.isDragging]);

  const endDrag = useCallback(() => {
    const finalState = dragStartRef.current;
    setDragState({
      isDragging: false,
      draggedElementId: null,
      initialMousePos: { x: 0, y: 0 },
      initialElementPos: null,
      dragOffset: { x: 0, y: 0 }
    });
    dragStartRef.current = null;
    return finalState;
  }, []);

  const snapToGrid = (value, gridSize = 20) => {
    return Math.round(value / gridSize) * gridSize;
  };

  const calculateNewPosition = useCallback((element, offset) => {
    if (!offset) return element;

    const updatedElement = { ...element };
    const gridSize = 20; // Tamaño de la cuadrícula

    if (element.type === 'wall') {
      updatedElement.x1 = snapToGrid(dragStartRef.current.initialElementPos.x1 + offset.x, gridSize);
      updatedElement.y1 = snapToGrid(dragStartRef.current.initialElementPos.y1 + offset.y, gridSize);
      updatedElement.x2 = snapToGrid(dragStartRef.current.initialElementPos.x2 + offset.x, gridSize);
      updatedElement.y2 = snapToGrid(dragStartRef.current.initialElementPos.y2 + offset.y, gridSize);
    } else if (element.type === 'curvedWall') {
      updatedElement.points = dragStartRef.current.initialElementPos.points.map(p => ({
        x: snapToGrid(p.x + offset.x, gridSize),
        y: snapToGrid(p.y + offset.y, gridSize)
      }));
    } else if (element.type === 'circle') {
      updatedElement.x = snapToGrid(dragStartRef.current.initialElementPos.x + offset.x, gridSize);
      updatedElement.y = snapToGrid(dragStartRef.current.initialElementPos.y + offset.y, gridSize);
    } else {
      updatedElement.x = snapToGrid(dragStartRef.current.initialElementPos.x + offset.x, gridSize);
      updatedElement.y = snapToGrid(dragStartRef.current.initialElementPos.y + offset.y, gridSize);
    }

    return updatedElement;
  }, []);

  return {
    dragState,
    startDrag,
    updateDrag,
    endDrag,
    calculateNewPosition,
    isDragging: dragState.isDragging,
    draggedElementId: dragState.draggedElementId
  };
};

export default useDragAndDrop;