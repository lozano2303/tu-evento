import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MousePointer,
  Square, Undo, Redo, Download, Upload, Trash2, Home
} from 'lucide-react';
import { nanoid } from 'nanoid';

import useHistory from './Hooks/useHistory';
import useDragAndDrop from './Hooks/useDragAndDrop';   
import DrawingCanvas from '../DrawingCanvas'; 
import { MapProvider, useMapState, useMapDispatch } from '../context/MapContext';


// Top navbar
const TopNavbar = ({ onExport, onImport, onUploadEvent, onGoHome }) => {
  return (
    <div className="bg-gray-800 text-white h-16 flex items-center px-4 justify-between">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-teal-400 mr-3 flex items-center justify-center">
          <div className="text-white font-bold text-sm">TU</div>
        </div>
        <span className="text-white font-medium">Tu Evento</span>
      </div>

      <div className="flex items-center space-x-3">
        <button title="Volver al Inicio" onClick={onGoHome} className="flex items-center px-3 py-2 rounded hover:bg-gray-700">
          <Home size={16} className="mr-2" /> Inicio
        </button>

        <button title="Exportar" onClick={onExport} className="flex items-center px-3 py-2 rounded hover:bg-gray-700">
          <Download size={16} className="mr-2" /> Exportar
        </button>

        <label className="flex items-center px-3 py-2 rounded hover:bg-gray-700 cursor-pointer">
          <Upload size={16} className="mr-2" />
          <input type="file" accept=".json" onChange={(e)=>onImport && onImport(e.target.files[0])} className="hidden" />
          Importar
        </label>

        <button title="Subir Evento" onClick={onUploadEvent} className="flex items-center px-3 py-2 rounded hover:bg-gray-700">
          <Upload size={16} className="mr-2" /> Subir Evento
        </button>
      </div>
    </div>
  );
};

// Tool panel
const ToolPanel = ({ activeTool, setActiveTool, onUndo, onRedo, canUndo, canRedo, onAddSample }) => {
  const tools = [
    { id: 'select', icon: MousePointer, label: 'Seleccionar' },
    { id: 'wall', icon: Square, label: 'Pared' },
    { id: 'zone', icon: Square, label: 'Zona' },
    { id: 'stage', icon: Square, label: 'Escenario' },
    { id: 'circle', icon: Square, label: 'Círculo' },
    { id: 'chair', icon: Square, label: 'Silla' },
    { id: 'seatRow', icon: Square, label: 'Fila de sillas' },
    { id: 'door', icon: Square, label: 'Puerta' },
    { id: 'exit', icon: Square, label: 'Salida' },
    { id: 'curvedWall', icon: Square, label: 'Pared curva' }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Herramientas</h3>
      <div className="space-y-2 mb-6">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`w-full flex items-center p-3 rounded text-left transition-colors ${
              activeTool === tool.id ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <tool.icon size={18} className="mr-3" />
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">Acciones</h4>
        <div className="space-y-2">
          <button onClick={onUndo} disabled={!canUndo} className="w-full flex items-center p-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
            <Undo size={16} className="mr-2" /> Deshacer
          </button>
          <button onClick={onRedo} disabled={!canRedo} className="w-full flex items-center p-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
            <Redo size={16} className="mr-2" /> Rehacer
          </button>
          <button onClick={onAddSample} className="w-full flex items-center p-2 rounded text-sm hover:bg-gray-50">
            Añadir ejemplo
          </button>
        </div>
      </div>
    </div>
  );
};

// Properties panel
const PropertiesPanel = ({ selectedElement, onUpdate, onDelete, units, setUnits }) => {
  const [inputValues, setInputValues] = useState({});

  useEffect(() => {
    if (selectedElement) {
      const factor = units === 'cm' ? 1 : 100;

      // Handle different element types
      if (selectedElement.type === 'wall') {
        const dx = selectedElement.x2 - selectedElement.x1;
        const dy = selectedElement.y2 - selectedElement.y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        setInputValues({
          x: (Math.round((selectedElement.x1 + selectedElement.x2) / 2) / factor).toFixed(units === 'm' ? 2 : 0),
          y: (Math.round((selectedElement.y1 + selectedElement.y2) / 2) / factor).toFixed(units === 'm' ? 2 : 0),
          width: (Math.round(length) / factor).toFixed(units === 'm' ? 2 : 0),
          height: (Math.round(selectedElement.thickness || 15) / factor).toFixed(units === 'm' ? 2 : 0),
        });
      } else {
        setInputValues({
          x: (Math.round(selectedElement.x || 0) / factor).toFixed(units === 'm' ? 2 : 0),
          y: (Math.round(selectedElement.y || 0) / factor).toFixed(units === 'm' ? 2 : 0),
          width: (Math.round(selectedElement.width || 0) / factor).toFixed(units === 'm' ? 2 : 0),
          height: (Math.round(selectedElement.height || 0) / factor).toFixed(units === 'm' ? 2 : 0),
          radius: (Math.round(selectedElement.radius || 0) / factor).toFixed(units === 'm' ? 2 : 0),
        });
      }
    }
  }, [selectedElement, units]);

  if (!selectedElement) {
    return (
      <div className="w-64 bg-white border-l border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Propiedades</h3>
        <p className="text-gray-500 text-sm">Selecciona un elemento para ver sus propiedades</p>
      </div>
    );
  }

  const handleChange = (prop, value) => {
    onUpdate(selectedElement.id, { [prop]: value });
  };

  const handleInputChange = (prop, value) => {
    setInputValues(prev => ({ ...prev, [prop]: value }));
    const num = parseFloat(value);
    if (!isNaN(num)) {
      const actualValue = units === 'm' ? Math.round(num * 100) : Math.round(num);

      if (selectedElement.type === 'wall') {
        // Handle wall-specific updates
        const centerX = prop === 'x' ? actualValue : parseFloat(inputValues.x) * (units === 'm' ? 100 : 1);
        const centerY = prop === 'y' ? actualValue : parseFloat(inputValues.y) * (units === 'm' ? 100 : 1);
        const length = prop === 'width' ? actualValue : parseFloat(inputValues.width) * (units === 'm' ? 100 : 1);
        const thickness = prop === 'height' ? actualValue : parseFloat(inputValues.height) * (units === 'm' ? 100 : 1);

        // Calculate wall endpoints based on center, length, and current angle
        const dx = selectedElement.x2 - selectedElement.x1;
        const dy = selectedElement.y2 - selectedElement.y1;
        const currentLength = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        const halfLength = length / 2;
        const x1 = centerX - Math.cos(angle) * halfLength;
        const y1 = centerY - Math.sin(angle) * halfLength;
        const x2 = centerX + Math.cos(angle) * halfLength;
        const y2 = centerY + Math.sin(angle) * halfLength;

        onUpdate(selectedElement.id, { x1, y1, x2, y2, thickness });
      } else {
        handleChange(prop, actualValue);
      }
    }
  };

  return (
    <div className="w-64 bg-white border-l border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Propiedades</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setUnits(units === 'cm' ? 'm' : 'cm')} className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
            {units.toUpperCase()}
          </button>
          <button onClick={() => onDelete(selectedElement.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {selectedElement.type === 'wall' ? (
          <>
            {['x','y','width','height'].map((prop, idx) => (
              <div key={idx}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {prop === 'x' ? 'Centro X' :
                   prop === 'y' ? 'Centro Y' :
                   prop === 'width' ? 'Longitud' :
                   prop === 'height' ? 'Grosor' : ''}
                </label>
                <input
                  type="text"
                  value={inputValues[prop] || ''}
                  onChange={(e) => handleInputChange(prop, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                />
              </div>
            ))}
          </>
        ) : selectedElement.type === 'circle' ? (
          <>
            {['x','y','radius'].map((prop, idx) => (
              <div key={idx}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {prop === 'x' ? 'Posición X' :
                   prop === 'y' ? 'Posición Y' :
                   prop === 'radius' ? 'Radio' : ''}
                </label>
                <input
                  type="text"
                  value={inputValues[prop] || ''}
                  onChange={(e) => handleInputChange(prop, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                />
              </div>
            ))}
          </>
        ) : (
          <>
            {['x','y','width','height'].map((prop, idx) => (
              <div key={idx}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {prop === 'x' ? 'Posición X' :
                   prop === 'y' ? 'Posición Y' :
                   prop === 'width' ? 'Ancho' :
                   prop === 'height' ? 'Alto' : ''}
                </label>
                <input
                  type="text"
                  value={inputValues[prop] || ''}
                  onChange={(e) => handleInputChange(prop, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                />
              </div>
            ))}
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rotación</label>
          <div className="flex gap-2">
            {[0, 90, 180, 270].map((angle) => (
              <button
                key={angle}
                onClick={() => handleChange('rotation', angle)}
                className={`px-3 py-2 text-sm rounded border ${
                  (selectedElement.rotation || 0) === angle
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {angle}°
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main app
const FloorPlanDesignerInner = () => {
  const navigate = useNavigate();
  const { elements, selectedId } = useMapState();
  const dispatch = useMapDispatch();

  const historyWrapper = useHistory(elements || []);

  const pushSnapshot = (newElements) => {
    historyWrapper.pushState(newElements);
    dispatch({ type: 'SET_ELEMENTS', payload: newElements });
  };

  const undo = () => {
    historyWrapper.undo();
    dispatch({ type: 'SET_ELEMENTS', payload: historyWrapper.state });
  };

  const redo = () => {
    historyWrapper.redo();
    dispatch({ type: 'SET_ELEMENTS', payload: historyWrapper.state });
  };

  const canUndo = historyWrapper.canUndo;
  const canRedo = historyWrapper.canRedo;

  const [activeTool, setActiveTool] = useState('select');
  const [units, setUnits] = useState('cm');
  const [clipboard, setClipboard] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showMeasurements, setShowMeasurements] = useState(true);


  const generateSeatGrid = (centerX, startY, cols, rows, spacingX, spacingY, sectionName = '') => {
    const seats = [];
    const totalWidth = (cols - 1) * spacingX;
    const startX = centerX - totalWidth / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const seatX = snapToGridValue(startX + col * spacingX);
        const seatY = snapToGridValue(startY + row * spacingY);

        seats.push({
          id: nanoid(),
          type: 'chair',
          x: seatX,
          y: seatY,
          fill: 'transparent',
          stroke: '#6b7280',
          meta: {
            label: sectionName ?
              `${sectionName} F${row + 1} A${col + 1}` :
              `Fila ${row + 1}, Asiento ${col + 1}`
          }
        });
      }
    }
    return seats;
  };

  const copySelected = () => {
    const selected = elements.find(el => el.id === selectedId);
    if (selected) {
      setClipboard(selected);
    }
  };

  const pasteElement = () => {
    if (clipboard) {
      const newElement = {
        ...clipboard,
        id: nanoid(),
        x: clipboard.x + 50,
        y: clipboard.y + 50
      };
      pushSnapshot([...elements, newElement]);
    }
  };

  const duplicateSelected = () => {
    const selected = elements.find(el => el.id === selectedId);
    if (selected) {
      const duplicated = {
        ...selected,
        id: nanoid(),
        x: selected.x + 50,
        y: selected.y + 50
      };
      pushSnapshot([...elements, duplicated]);
    }
  };



  const handleCreate = useCallback((el) => {
    const newEl = {
      ...el,
      id: nanoid(),
      rotation: el.rotation || 0
    };

    const newElements = [];

    // Copiar todos los elementos excepto paredes que intersecten con puertas
    for (const element of elements || []) {
      if (newEl.type === 'door' || newEl.type === 'exit') {
        if (element.type === 'wall') {
          // Calcular si la pared intersecta con la puerta
          const doorSize = 100;
          const doorLeft = newEl.x - doorSize / 2;
          const doorRight = newEl.x + doorSize / 2;
          const doorTop = newEl.y - doorSize / 2;
          const doorBottom = newEl.y + doorSize / 2;

          const wallLeft = Math.min(element.x1, element.x2);
          const wallRight = Math.max(element.x1, element.x2);
          const wallTop = Math.min(element.y1, element.y2);
          const wallBottom = Math.max(element.y1, element.y2);

          // Si se solapan, no incluir la pared
          if (!(wallRight <= doorLeft || wallLeft >= doorRight || wallBottom <= doorTop || wallTop >= doorBottom)) {
            continue; // Saltar esta pared
          }
        }
      }
      newElements.push(element);
    }

    // Añadir el nuevo elemento
    newElements.push(newEl);
    pushSnapshot(newElements);
  }, [elements]);

  const handleUpdate = useCallback((id, updates) => {
    const roundedUpdates = {};
    for (const key in updates) {
      roundedUpdates[key] = Math.round(updates[key]);
    }
    pushSnapshot((elements || []).map(e => e.id === id ? { ...e, ...roundedUpdates } : e));
  }, [elements]);

  const handleDelete = useCallback((id) => {
    pushSnapshot((elements || []).filter(e => e.id !== id));
  }, [elements]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Tool shortcuts
      const toolShortcuts = {
        's': 'select',
        'w': 'wall',
        'z': 'zone',
        't': 'stage',
        'c': 'chair',
        'r': 'seatRow',
        'd': 'door',
        'e': 'exit',
        'u': 'curvedWall'
      }

      if (toolShortcuts[e.key.toLowerCase()]) {
        e.preventDefault()
        setActiveTool(toolShortcuts[e.key.toLowerCase()])
        return
      }

      if (!selectedId) return

      const step = e.shiftKey ? 10 : 1
      let updates = {}

      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        undo()
        return
      }
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault()
        redo()
        return
      }
      if (e.ctrlKey && e.key === 'c' && selectedId) {
        e.preventDefault()
        const element = elements.find(el => el.id === selectedId)
        if (element) {
          setClipboard({ ...element, id: nanoid() })
        }
        return
      }
      if (e.ctrlKey && e.key === 'v' && clipboard) {
        e.preventDefault()
        const newEl = { ...clipboard, x: clipboard.x + 20, y: clipboard.y + 20 }
        pushSnapshot([...elements, newEl])
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        handleDelete(selectedId)
        return
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          updates = { y: (elements.find(el => el.id === selectedId)?.y || 0) - step }
          break
        case 'ArrowDown':
          e.preventDefault()
          updates = { y: (elements.find(el => el.id === selectedId)?.y || 0) + step }
          break
        case 'ArrowLeft':
          e.preventDefault()
          updates = { x: (elements.find(el => el.id === selectedId)?.x || 0) - step }
          break
        case 'ArrowRight':
          e.preventDefault()
          updates = { x: (elements.find(el => el.id === selectedId)?.x || 0) + step }
          break
        default:
          return
      }

      handleUpdate(selectedId, updates)
    }

    window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [selectedId, elements, handleUpdate, handleDelete, setActiveTool, undo, redo])

const selectedElement = elements.find(el => el.id === selectedId)

  const exportMap = useCallback(() => {
    const data = {
      exportedAt: new Date().toISOString(),
      elements
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `map-export-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [elements]);

  const importMap = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.elements) {
          dispatch({ type: 'SET_ELEMENTS', payload: data.elements });
          historyWrapper.pushState(data.elements);
        }
      } catch (err) {
        console.error('Import error', err);
      }
    };
    reader.readAsText(file);
  }, []);

  const addSample = () => {
    const sample = [
      { id: nanoid(), type: 'zone', x: 300, y: 200, width: 400, height: 200 },
    ];
    pushSnapshot([...(elements || []), ...sample]);
  };

  const loadTemplate = (type) => {
    let template = [];
    if (type === 'concert') {
      // TEATRO MUNICIPAL PROFESIONAL - Diseño técnico con paleta limpia
      template = [
        // ESTRUCTURA GRIS - Paredes principales
        { id: nanoid(), type: 'wall', x1: 200, y1: 100, x2: 1400, y2: 100, stroke: '#6b7280', thickness: 12, meta: { label: 'Pared Frontal' } },
        { id: nanoid(), type: 'wall', x1: 200, y1: 100, x2: 200, y2: 700, stroke: '#6b7280', thickness: 12, meta: { label: 'Pared Izquierda' } },
        { id: nanoid(), type: 'wall', x1: 1400, y1: 100, x2: 1400, y2: 700, stroke: '#6b7280', thickness: 12, meta: { label: 'Pared Derecha' } },
        { id: nanoid(), type: 'wall', x1: 200, y1: 700, x2: 1400, y2: 700, stroke: '#6b7280', thickness: 12, meta: { label: 'Pared Trasera' } },

        // ESCENARIO ROJO - Área de actuación
        { id: nanoid(), type: 'stage', x: 800, y: 150, width: 500, height: 100, fill: '#dc2626', stroke: '#b91c1c', meta: { label: 'ESCENARIO' } },

        // ASIENTOS CON ETIQUETAS GRANDES - Sistema de butacas
        ...generateSeatGrid(800, 300, 16, 6, 42, 45, 'Platea'),

        // CAMERINOS ROJOS - Zonas de preparación
        { id: nanoid(), type: 'zone', x: 250, y: 180, width: 120, height: 80, fill: '#dc2626', stroke: '#b91c1c', meta: { label: 'CAMERINOS' } },

        // CONTROL TÉCNICO VERDE - Área técnica
        { id: nanoid(), type: 'zone', x: 1350, y: 180, width: 120, height: 80, fill: '#059669', stroke: '#047857', meta: { label: 'CONTROL TÉCNICO' } },

        // ENTRADAS AZUL CLARO - Puertas ancladas exactamente en los bordes de las paredes
        { id: nanoid(), type: 'door', x: 800, y: 700, fill: '#3b82f6', stroke: '#2563eb', meta: { label: 'ENTRADA PRINCIPAL' } },
        { id: nanoid(), type: 'door', x: 600, y: 700, fill: '#3b82f6', stroke: '#2563eb', meta: { label: 'ENTRADA LATERAL' } },
        { id: nanoid(), type: 'door', x: 1000, y: 700, fill: '#3b82f6', stroke: '#2563eb', meta: { label: 'ENTRADA LATERAL' } },

        // SALIDAS DE EMERGENCIA ROJAS - Ancladas en los bordes de las paredes
        { id: nanoid(), type: 'exit', x: 300, y: 700, width: 80, height: 40, fill: '#dc2626', stroke: '#b91c1c', meta: { label: 'SALIDA EMERGENCIA' } },
        { id: nanoid(), type: 'exit', x: 1300, y: 700, width: 80, height: 40, fill: '#dc2626', stroke: '#b91c1c', meta: { label: 'SALIDA EMERGENCIA' } },

        // ACCESO ESCENARIO AZUL - Anclado en la pared lateral derecha
        { id: nanoid(), type: 'door', x: 1400, y: 300, fill: '#3b82f6', stroke: '#2563eb', meta: { label: 'ACCESO ESCENARIO' } },

        // SERVICIOS GRIS - Áreas de servicio
        { id: nanoid(), type: 'zone', x: 400, y: 750, width: 100, height: 60, fill: '#6b7280', stroke: '#4b5563', meta: { label: 'TAQUILLA' } },
        { id: nanoid(), type: 'zone', x: 1200, y: 750, width: 100, height: 60, fill: '#6b7280', stroke: '#4b5563', meta: { label: 'BAÑOS' } },

        // VESTÍBULO GRIS CLARO - Área de recepción
        { id: nanoid(), type: 'zone', x: 800, y: 620, width: 250, height: 70, fill: '#9ca3af', stroke: '#6b7280', meta: { label: 'VESTÍBULO' } },

        // EXTINTORES - Símbolos de seguridad
        { id: nanoid(), type: 'zone', x: 220, y: 120, width: 15, height: 30, fill: '#dc2626', stroke: '#b91c1c', meta: { label: '🧯' } },
        { id: nanoid(), type: 'zone', x: 1380, y: 120, width: 15, height: 30, fill: '#dc2626', stroke: '#b91c1c', meta: { label: '🧯' } },
        { id: nanoid(), type: 'zone', x: 220, y: 650, width: 15, height: 30, fill: '#dc2626', stroke: '#b91c1c', meta: { label: '🧯' } },
        { id: nanoid(), type: 'zone', x: 1380, y: 650, width: 15, height: 30, fill: '#dc2626', stroke: '#b91c1c', meta: { label: '🧯' } },

        // SÍMBOLO DE ESCALA Y ORIENTACIÓN
        { id: nanoid(), type: 'zone', x: 200, y: 50, width: 100, height: 30, fill: 'transparent', stroke: '#6b7280', meta: { label: 'ESCALA 1:100' } },
        { id: nanoid(), type: 'zone', x: 1400, y: 50, width: 80, height: 30, fill: 'transparent', stroke: '#6b7280', meta: { label: 'NORTE ↑' } },
      ];
    }
    pushSnapshot(template);
  };

  const onUploadEvent = () => {
    // For now, export the map as uploading the event
    exportMap();
  };

  const goHome = () => {
    navigate('/');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <TopNavbar onExport={exportMap} onImport={importMap} onUploadEvent={onUploadEvent} onGoHome={goHome} />

      {/* Professional Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowMeasurements(!showMeasurements)}
              className={`px-3 py-1 text-sm rounded border ${showMeasurements ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-700 border-gray-300'}`}
            >
              📏 Medidas
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Elementos: {elements?.length || 0}</span>
          <span>•</span>
          <span>Herramienta: {activeTool}</span>
          <span>•</span>
          <span>Unidades: {units}</span>
        </div>
      </div>

      <div className="flex-1 flex">
        <ToolPanel activeTool={activeTool} setActiveTool={setActiveTool} onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} onAddSample={addSample} />
          <DrawingCanvas
            elements={elements || []}
            selectedElementId={selectedId}
            onSelect={(id) => dispatch({ type: 'SET_SELECTED', payload: id })}
            onCreate={(el) => handleCreate({ ...el, type: activeTool })}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            units={units}
            showMeasurements={showMeasurements}
          />

        <PropertiesPanel selectedElement={(elements || []).find(e => e.id === selectedId)} onUpdate={handleUpdate} onDelete={handleDelete} units={units} setUnits={setUnits} />
      </div>

      {showGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">📋 Guía de Diseño de Eventos Municipales</h2>
              <button onClick={() => setShowGuide(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-blue-600 mb-3">🎯 Principios de Diseño</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li><strong>Flujo de multitudes:</strong> Diseña entradas y salidas para evitar congestión</li>
                  <li><strong>Capacidad calculada:</strong> 1m² por persona en áreas de pie, 1.5m² sentados</li>
                  <li><strong>Accesibilidad:</strong> Rutas anchas para sillas de ruedas y emergencias</li>
                  <li><strong>Visibilidad:</strong> Asegura que todos puedan ver el escenario/actividad principal</li>
                  <li><strong>Zonas funcionales:</strong> Separa áreas de espectadores, servicios y emergencias</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-green-600 mb-3">🛠️ Herramientas y Uso</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800">Elementos Básicos:</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• <strong>Paredes:</strong> Define límites del espacio</li>
                      <li>• <strong>Puertas:</strong> Puntos de entrada accesibles</li>
                      <li>• <strong>Salidas:</strong> Múltiples rutas de evacuación</li>
                      <li>• <strong>Zonas:</strong> Áreas funcionales específicas</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Elementos de Público:</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• <strong>Sillas:</strong> Asientos individuales</li>
                      <li>• <strong>Filas:</strong> Agrupa sillas automáticamente</li>
                      <li>• <strong>Escenario:</strong> Área de presentación</li>
                      <li>• <strong>Círculos:</strong> Arenas o zonas circulares</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-purple-600 mb-3">📊 Capacidades por Tipo de Evento</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left">Tipo de Evento</th>
                        <th className="border border-gray-300 p-2 text-center">Capacidad</th>
                        <th className="border border-gray-300 p-2 text-left">Consideraciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-2">Concierto Teatro</td>
                        <td className="border border-gray-300 p-2 text-center">800-1000</td>
                        <td className="border border-gray-300 p-2">Múltiples salidas, buena acústica</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 p-2">Conferencia</td>
                        <td className="border border-gray-300 p-2 text-center">500-800</td>
                        <td className="border border-gray-300 p-2">Mesas, networking, tecnología</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2">Estadio Deportivo</td>
                        <td className="border border-gray-300 p-2 text-center">2000+</td>
                        <td className="border border-gray-300 p-2">Campo central, gradas, múltiples accesos</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-red-600 mb-3">🚨 Normativas de Seguridad</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li><strong>Salidas de emergencia:</strong> Una cada 100 personas, anchura mínima 1.2m</li>
                  <li><strong>Pasillos:</strong> 1.2m de ancho mínimo, sin obstáculos</li>
                  <li><strong>Señalización:</strong> Indicadores claros de salidas y zonas seguras</li>
                  <li><strong>Áreas de servicios:</strong> Baños, primeros auxilios, puntos de reunión</li>
                  <li><strong>Capacidad máxima:</strong> No exceder límites calculados por normativa local</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-orange-600 mb-3">🎨 Consejos de Diseño</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded">
                    <h4 className="font-semibold text-blue-800 mb-2">✅ Buenas Prácticas</h4>
                    <ul className="text-sm space-y-1 text-blue-700">
                      <li>• Usa plantillas como base</li>
                      <li>• Mantén simetría en diseños</li>
                      <li>• Calcula capacidades realistas</li>
                      <li>• Incluye zonas de servicios</li>
                      <li>• Prueba flujos de evacuación</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 p-4 rounded">
                    <h4 className="font-semibold text-red-800 mb-2">❌ Evita Estos Errores</h4>
                    <ul className="text-sm space-y-1 text-red-700">
                      <li>• Cuellos de botella en salidas</li>
                      <li>• Áreas sin acceso de emergencia</li>
                      <li>• Sobrecapacidad de espacios</li>
                      <li>• Falta de zonas de servicios</li>
                      <li>• Diseño sin considerar movilidad</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                💡 <strong>Recuerda:</strong> Esta herramienta está diseñada para planificación municipal.
                Siempre consulta normativas locales y realiza inspecciones de seguridad antes de eventos.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Wrap with provider
const FloorPlanDesigner = () => (
  <MapProvider>
    <FloorPlanDesignerInner />
  </MapProvider>
);

export default FloorPlanDesigner;
