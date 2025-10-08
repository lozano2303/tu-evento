
import { useState } from 'react';

export default function useHistory(initialState = []) {
  const [history, setHistory] = useState([initialState]);
  const [index, setIndex] = useState(0);

  const state = history[index];

  const pushState = (newState) => {
    const updatedHistory = history.slice(0, index + 1);
    updatedHistory.push(newState);
    setHistory(updatedHistory);
    setIndex(updatedHistory.length - 1);
  };

  const undo = () => { if (index > 0) setIndex(index - 1); };
  const redo = () => { if (index < history.length - 1) setIndex(index + 1); };

  const reset = (newState) => {
    setHistory([newState]);
    setIndex(0);
  };
  
  return { state, pushState, undo, redo, reset, canUndo: index > 0, canRedo: index < history.length - 1 };
}
   