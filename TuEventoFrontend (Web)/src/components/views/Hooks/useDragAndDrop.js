// src/hooks/useDragAndDrop.js
import { useState, useCallback } from 'react';

const useDragAndDrop = () => {
  const [dragState, setDragState] = useState({
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    selectedElement: null
  });

  const startDrag = useCallback((element, startPos) => {
    setDragState({
      isDragging: true,
      dragOffset: {
        x: startPos.x - element.x,
        y: startPos.y - element.y
      },
      selectedElement: element.id
    });
  }, []);

  const stopDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
      selectedElement: null
    });
  }, []);

  return { dragState, startDrag, stopDrag };
};

export default useDragAndDrop;
