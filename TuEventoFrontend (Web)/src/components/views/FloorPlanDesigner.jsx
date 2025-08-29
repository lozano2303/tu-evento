import React, { useCallback, useState } from 'react';
import { 
  Calendar, BarChart3, Printer, Users, MessageSquare, 
  BookOpen, Archive, Trash2, RotateCw, MousePointer, 
  Square, Undo, Redo, Download, Upload 
} from 'lucide-react';
import { nanoid } from 'nanoid';

import useHistory from './Hooks/useHistory';
import useDragAndDrop from './Hooks/useDragAndDrop';   
import DrawingCanvas from '../DrawingCanvas'; 
import { MapProvider, useMapState, useMapDispatch } from '../context/MapContext';


// Top navbar
const TopNavbar = ({ onExport, onImport }) => {
  const navItems = [
    { icon: Calendar, label: 'Calendario' },
    { icon: BarChart3, label: 'Reportes' },
    { icon: Printer, label: 'Imprimir' },
    { icon: Users, label: 'Equipos' },
    { icon: MessageSquare, label: 'Mensajes' },
    { icon: BookOpen, label: 'Biblioteca' },
    { icon: Archive, label: 'Archivo' },
    { icon: Trash2, label: 'Papelera' },
    { icon: RotateCw, label: 'Actualizar' }
  ];

  return (
    <div className="bg-gray-800 text-white h-16 flex items-center px-4 justify-between">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-teal-400 mr-3 flex items-center justify-center">
          <div className="text-white font-bold text-sm">TU</div>
        </div>
        <span className="text-white font-medium">Tu Evento</span>
      </div>

      <div className="flex items-center space-x-3">
        {navItems.map((item, idx) => (
          <button key={idx} className="w-10 h-10 flex items-center justify-center hover:bg-gray-700 rounded" title={item.label}>
            <item.icon size={18} className="text-gray-300" />
          </button>
        ))}

        <button title="Exportar" onClick={onExport} className="flex items-center px-3 py-2 rounded hover:bg-gray-700">
          <Download size={16} className="mr-2" /> Exportar
        </button>

        <label className="flex items-center px-3 py-2 rounded hover:bg-gray-700 cursor-pointer">
          <Upload size={16} className="mr-2" /> 
          <input type="file" accept=".json" onChange={(e)=>onImport && onImport(e.target.files[0])} className="hidden" />
          Importar
        </label>
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
            className={`w-full flex items-center p-3 rounded text-left transition-colors ${activeTool === tool.id ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'hover:bg-gray-50 text-gray-700'}`}
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
const PropertiesPanel = ({ selectedElement, onUpdate, onDelete }) => {
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

  return (
    <div className="w-64 bg-white border-l border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Propiedades</h3>
        <button onClick={() => onDelete(selectedElement.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {['x','y','width','height','rotation'].map((prop, idx) => (
          <div key={idx}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {prop === 'x' ? 'Posición X' :
               prop === 'y' ? 'Posición Y' :
               prop === 'width' ? 'Ancho' :
               prop === 'height' ? 'Alto' : 'Rotación'}
            </label>
            <input
              type="number"
              value={Math.round(selectedElement[prop] || 0)}
              onChange={(e) => handleChange(prop, parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Main app
const FloorPlanDesignerInner = () => {
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

  const handleCreate = useCallback((el) => {
    const newEl = { ...el, id: nanoid(), rotation: el.rotation || 0 };
    pushSnapshot([...(elements || []), newEl]);
    dispatch({ type: 'SET_SELECTED', payload: newEl.id });
  }, [elements]);

  const handleUpdate = useCallback((id, updates) => {
    pushSnapshot((elements || []).map(e => e.id === id ? { ...e, ...updates } : e));
  }, [elements]);

  const handleDelete = useCallback((id) => {
    pushSnapshot((elements || []).filter(e => e.id !== id));
  }, [elements]);

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
      { id: nanoid(), type: 'stage', x: 300, y: 80, width: 700, height: 140 },
      { id: nanoid(), type: 'zone', x: 300, y: 260, width: 700, height: 420 },
      { id: nanoid(), type: 'seatRow', x: 340, y: 300, width: 640, height: 40 },
    ];
    pushSnapshot([...(elements || []), ...sample]);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <TopNavbar onExport={exportMap} onImport={importMap} />
      <div className="flex-1 flex">
        <ToolPanel activeTool={activeTool} setActiveTool={setActiveTool} onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} onAddSample={addSample} />
          <DrawingCanvas
          elements={elements || []}
          selectedElementId={selectedId}
          onSelect={(id) => dispatch({ type: 'SET_SELECTED', payload: id })}
          onCreate={(el) => handleCreate({ ...el, type: activeTool })}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          activeTool={activeTool}   // ✅ ahora sí le pasamos la herramienta seleccionada
        />

        <PropertiesPanel selectedElement={(elements || []).find(e => e.id === selectedId)} onUpdate={handleUpdate} onDelete={handleDelete} />
      </div>
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
