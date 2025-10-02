import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MousePointer,
  Square,
  Undo,
  Redo,
  Download,
  Upload,
  Trash2,
  Home,
  Calendar,
  DoorOpen,
  LogOut,
  Ruler,
  Theater,
  Sofa,
  Grid3x3
} from 'lucide-react';
import { nanoid } from 'nanoid';

import useHistory from './Hooks/useHistory';
import useDragAndDrop from './Hooks/useDragAndDrop';
import DrawingCanvas from '../DrawingCanvas';
import { MapProvider, useMapState, useMapDispatch } from '../context/MapContext';
import { saveEventLayout, getEventLayoutByEventId, hasEventLayout, updateEventLayout } from '../../services/EventLayoutService.js';
import { createSection, getAllSections } from '../../services/SectionService.js';
import { createSeat, getSeatsBySection, updateSeatStatus } from '../../services/SeatService.js';
import { createTicketWithSeats } from '../../services/TicketService.js';
import eventLayoutExample from './LayoutStructureExample.js';

const TopNavbar = ({ onExport, onImport, onUploadEvent, onLoadLayout, onGoHome, onGoToEvents }) => {
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

        <button title="Ver Eventos" onClick={onGoToEvents} className="flex items-center px-3 py-2 rounded hover:bg-purple-800">
          <Calendar size={16} className="mr-2" /> Eventos
        </button>

        <button title="Exportar" onClick={onExport} className="flex items-center px-3 py-2 rounded hover:bg-purple-800">
          <Download size={16} className="mr-2" /> Exportar
        </button>

        <label className="flex items-center px-3 py-2 rounded hover:bg-purple-800 cursor-pointer">
          <Upload size={16} className="mr-2" />
          <input type="file" accept=".json" onChange={(e)=>onImport && onImport(e.target.files[0])} className="hidden" />
          Importar
        </label>


        <button title="Guardar Layout" onClick={onUploadEvent} className="flex items-center px-3 py-2 rounded hover:bg-gray-700">
          <Upload size={16} className="mr-2" /> Guardar Layout
        </button>
      </div>
    </div>
  );
};

const ToolPanel = ({ activeTool, setActiveTool, onUndo, onRedo, canUndo, canRedo, onAddSample }) => {
const tools = [
  { id: 'select', icon: MousePointer, label: 'Seleccionar' },
  { id: 'wall', icon: Ruler, label: 'Pared' },
  { id: 'zone', icon: Square, label: 'Zona' },
  { id: 'stage', icon: Theater, label: 'Escenario' },
  { id: 'chair', icon: Sofa, label: 'Silla' },
  { id: 'seatRow', icon: Grid3x3, label: 'Fila de sillas' },
  { id: 'door', icon: DoorOpen, label: 'Puerta' },
  { id: 'exit', icon: LogOut, label: 'Salida' }
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
              activeTool === tool.id 
                ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                : 'hover:bg-gray-50 text-gray-700'
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
          <button 
            onClick={onUndo} 
            disabled={!canUndo} 
            className="w-full flex items-center p-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <Undo size={16} className="mr-2" /> Deshacer
          </button>
          <button 
            onClick={onRedo} 
            disabled={!canRedo} 
            className="w-full flex items-center p-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <Redo size={16} className="mr-2" /> Rehacer
          </button>
          <button
            onClick={onAddSample}
            className="w-full flex items-center p-2 rounded text-sm hover:bg-gray-50"
          >
            <Square size={16} className="mr-2" /> Cargar Layout Completo
          </button>
        </div>
      </div>
    </div>
  );
};

// Properties panel
const PropertiesPanel = ({ selectedElement, selectedIds, elements, onUpdate, onDelete, units, setUnits }) => {
  const [inputValues, setInputValues] = useState({});

  // Calcular información de selección múltiple
  const multipleSelectionInfo = selectedIds.size > 0 ? {
    count: selectedIds.size,
    positions: Array.from(selectedIds).map(id => {
      const [seatRowId, seatIndex] = id.split('-');
      const seatRow = elements.find(el => el.id === seatRowId && el.type === 'seatRow');
      if (seatRow && seatRow.seatPositions && seatRow.seatPositions[parseInt(seatIndex)]) {
        const seatPos = seatRow.seatPositions[parseInt(seatIndex)];
        return `${seatPos.row}${seatPos.seatNumber}`;
      }
      return id;
    })
  } : null;

  useEffect(() => {
    if (selectedElement) {
      const factor = units === 'cm' ? 1 : 100;

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
        const centerX = prop === 'x' ? actualValue : parseFloat(inputValues.x) * (units === 'm' ? 100 : 1);
        const centerY = prop === 'y' ? actualValue : parseFloat(inputValues.y) * (units === 'm' ? 100 : 1);
        const length = prop === 'width' ? actualValue : parseFloat(inputValues.width) * (units === 'm' ? 100 : 1);
        const thickness = prop === 'height' ? actualValue : parseFloat(inputValues.height) * (units === 'm' ? 100 : 1);

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
         {selectedElement.type !== 'seatPosition' && (
           <button onClick={() => onDelete(selectedElement.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
             <Trash2 size={16} />
           </button>
         )}
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

        {selectedElement.type === 'section' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Sección</label>
              <input
                type="text"
                value={selectedElement.meta?.label || ''}
                onChange={(e) => onUpdate(selectedElement.id, { meta: { ...selectedElement.meta, label: e.target.value } })}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="Ej: VIP, General"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={selectedElement.meta?.price || ''}
                onChange={(e) => onUpdate(selectedElement.id, { meta: { ...selectedElement.meta, price: parseFloat(e.target.value) || 0 } })}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="Ej: 50.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={selectedElement.meta?.category || 'General'}
                onChange={(e) => onUpdate(selectedElement.id, { meta: { ...selectedElement.meta, category: e.target.value } })}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              >
                <option value="General">General</option>
                <option value="VIP">VIP</option>
                <option value="Premium">Premium</option>
                <option value="Estudiante">Estudiante</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </>
        )}


        {selectedElement.type === 'seatRow' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fila de Asientos</label>
              <div className="text-sm text-gray-600">
                Tipo: {selectedElement.type}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de Asientos</label>
              <input
                type="number"
                min="1"
                max={selectedElement.seatPositions?.length || 1}
                value={selectedElement.seatPositions?.length || 1}
                onChange={(e) => {
                  const newNumSeats = Math.max(1, parseInt(e.target.value) || 1);

                  // Recalcular las posiciones de asientos
                  const spacing = 60; // Espaciado entre sillas
                  const totalWidth = (newNumSeats - 1) * spacing;
                  const startX = selectedElement.x - totalWidth / 2;

                  const updatedPositions = [];
                  for (let i = 0; i < newNumSeats; i++) {
                    updatedPositions.push({
                      id: `${selectedElement.id}-seat-${i}`,
                      x: startX + i * spacing,
                      y: selectedElement.y,
                      seatNumber: i + 1,
                      row: selectedElement.seatPositions?.[0]?.row || 'A',
                      status: 'AVAILABLE'
                    });
                  }

                  // Actualizar el ancho del seatRow
                  const newWidth = Math.max(totalWidth + 100, 200); // Ancho mínimo
                  onUpdate(selectedElement.id, {
                    seatPositions: updatedPositions,
                    width: newWidth
                  });
                }}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
              <div className="text-xs text-gray-500 mt-1">
                Asientos actuales: {selectedElement.seatPositions?.length || 0}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fila</label>
              <input
                type="text"
                value={selectedElement.seatPositions?.[0]?.row || 'A'}
                onChange={(e) => {
                  const newRow = e.target.value.toUpperCase();
                  // Update all seat positions in this row
                  if (selectedElement.seatPositions) {
                    const updatedPositions = selectedElement.seatPositions.map(pos => ({
                      ...pos,
                      row: newRow
                    }));
                    onUpdate(selectedElement.id, { seatPositions: updatedPositions });
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                maxLength="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ancho de la Fila</label>
              <div className="text-sm text-gray-600">
                {Math.round(selectedElement.width || 0)}{units}
              </div>
            </div>
          </>
        )}

        {selectedElement.type === 'chair' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Silla Individual</label>
              <div className="text-sm text-gray-600">
                Tipo: {selectedElement.type}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fila</label>
              <input
                type="text"
                value={selectedElement.row || ''}
                onChange={(e) => onUpdate(selectedElement.id, { row: e.target.value.toUpperCase() })}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                maxLength="1"
                placeholder="Ej: A"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de Asiento</label>
              <input
                type="number"
                value={selectedElement.seatNumber || ''}
                onChange={(e) => onUpdate(selectedElement.id, { seatNumber: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                min="1"
                placeholder="Ej: 1"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          </>
        )}

        {selectedElement.type === 'seatPosition' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Posición de Asiento</label>
              <div className="text-sm text-gray-600">
                Fila {selectedElement.row} - Asiento {selectedElement.seatNumber}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <div className="text-sm text-gray-600">
                {selectedElement.status === 'AVAILABLE' ? 'Disponible' :
                 selectedElement.status === 'RESERVED' ? 'Reservado' :
                 selectedElement.status === 'OCCUPIED' ? 'Ocupado' : 'Desconocido'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coordenadas</label>
              <div className="text-sm text-gray-600">
                X: {selectedElement.x}, Y: {selectedElement.y}
              </div>
            </div>
          </>
        )}

        {multipleSelectionInfo && !selectedElement && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selección Múltiple</label>
              <div className="text-sm text-gray-600">
                {multipleSelectionInfo.count} elementos seleccionados
              </div>
              <div className="mt-2">
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Limpiar selección
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Elementos seleccionados</label>
              <div className="text-sm text-gray-600 max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                {multipleSelectionInfo.positions.map((pos, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span>{pos}</span>
                    <button
                      onClick={() => {
                        const newSet = new Set(selectedIds);
                        const keys = Array.from(selectedIds);
                        newSet.delete(keys[index]);
                        setSelectedIds(newSet);
                      }}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
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

  // Get eventId from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('eventId');

  // Validate eventId on component load
  useEffect(() => {
    if (!eventId) {
      navigate('/event-management');
      return;
    }

    const parsedId = parseInt(eventId);
    if (isNaN(parsedId) || parsedId <= 0) {
      navigate('/event-management');
      return;
    }

    console.log('FloorPlanDesigner loaded for eventId:', parsedId);
  }, [eventId, navigate]);

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

  const [activeTool, setActiveTool] = useState('wall');
  const [units, setUnits] = useState('cm');
  const [clipboard, setClipboard] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [isSeatSelectionMode, setIsSeatSelectionMode] = useState(false);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedSeatPositions, setSelectedSeatPositions] = useState(new Set());
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [editingLabelId, setEditingLabelId] = useState(null);
  const [labelInput, setLabelInput] = useState('');
  const [isSectionCreationMode, setIsSectionCreationMode] = useState(false);
  const [selectedChairsForSection, setSelectedChairsForSection] = useState(new Set());
  const [selectedSeatPositionsForSection, setSelectedSeatPositionsForSection] = useState(new Set());
  const [selectedIds, setSelectedIds] = useState(new Set()); // Para selección múltiple en modo normal
  const [showSectionCreationModal, setShowSectionCreationModal] = useState(false);
  const [newSectionData, setNewSectionData] = useState({ name: '', price: 0 });
  const [isCreatingSection, setIsCreatingSection] = useState(false);

  // Load existing layout for the event when component mounts
  useEffect(() => {
    if (eventId && !isNaN(parseInt(eventId))) {
      loadLayoutFromBackend(eventId);
    } else if (!eventId) {
      console.warn('FloorPlanDesigner: No eventId provided in URL parameters');
    } else {
      console.error('FloorPlanDesigner: Invalid eventId:', eventId);
    }
  }, [eventId]);

  const snapToGridValue = (value, gridSize = 20) => {
    return Math.round(value / gridSize) * gridSize;
  };

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
          row: String.fromCharCode(65 + row), // A, B, C, etc.
          seatNumber: col + 1,
          status: 'AVAILABLE',
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
    let elementsToAdd = [];

    if (el.type === 'seatRow' && el.seatPositions) {
      // Convert seatRow to individual chair elements
      elementsToAdd = el.seatPositions.map((seatPos, index) => ({
        id: nanoid(),
        type: 'chair',
        x: seatPos.x,
        y: seatPos.y,
        width: 50,
        height: 50,
        fill: 'transparent',
        stroke: '#6b7280',
        row: seatPos.row,
        seatNumber: seatPos.seatNumber,
        status: seatPos.status,
        meta: {
          label: `${seatPos.row}${seatPos.seatNumber}`,
          row: seatPos.row,
          seatNumber: seatPos.seatNumber
        }
      }));
    } else {
      // Normal element creation
      const newEl = {
        ...el,
        id: nanoid(),
        rotation: el.rotation || 0
      };
      elementsToAdd = [newEl];
    }

    const newElements = [];

    // Copiar todos los elementos excepto paredes que intersecten con puertas
    for (const element of elements || []) {
      let shouldSkip = false;
      for (const newEl of elementsToAdd) {
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

            if (!(wallRight <= doorLeft || wallLeft >= doorRight || wallBottom <= doorTop || wallTop >= doorBottom)) {
              shouldSkip = true;
              break;
            }
          }
        }
      }
      if (!shouldSkip) {
        newElements.push(element);
      }
    }

    // Añadir los nuevos elementos
    newElements.push(...elementsToAdd);
    pushSnapshot(newElements);
  }, [elements]);

  const handleUpdate = useCallback((id, updates) => {
    // Update chair label when row or seatNumber changes
    const element = elements.find(e => e.id === id);
    if (element && element.type === 'chair' && (updates.row !== undefined || updates.seatNumber !== undefined)) {
      const newRow = updates.row !== undefined ? updates.row : element.row;
      const newSeatNumber = updates.seatNumber !== undefined ? updates.seatNumber : element.seatNumber;
      updates.meta = { ...element.meta, label: `${newRow}${newSeatNumber}` };
    }

    // Si es una posición de asiento, actualizar el elemento padre
    if (id && id.includes('-')) {
      const [seatRowId, seatIndex] = id.split('-');
      const seatRowIndex = elements.findIndex(e => e.id === seatRowId);
      if (seatRowIndex >= 0) {
        const seatRow = elements[seatRowIndex];
        if (seatRow.seatPositions && seatRow.seatPositions[parseInt(seatIndex)]) {
          const updatedPositions = [...seatRow.seatPositions];
          updatedPositions[parseInt(seatIndex)] = { ...updatedPositions[parseInt(seatIndex)], ...updates };
          pushSnapshot(elements.map((e, idx) =>
            idx === seatRowIndex ? { ...e, seatPositions: updatedPositions } : e
          ));
          return;
        }
      }
    }

    // Si hay selección múltiple y se está moviendo un elemento, mover todos los seleccionados
    if (selectedIds.size > 1 && (updates.x !== undefined || updates.y !== undefined)) {
      const movedElement = elements.find(e => e.id === id);
      if (movedElement) {
        const dx = (updates.x || 0) - (movedElement.x || 0);
        const dy = (updates.y || 0) - (movedElement.y || 0);

        // Mover todos los elementos seleccionados
        const updatedElements = elements.map(element => {
          if (selectedIds.has(element.id)) {
            // Para elementos seatRow, también mover las posiciones de asiento
            if (element.type === 'seatRow' && element.seatPositions) {
              const updatedPositions = element.seatPositions.map(pos => ({
                ...pos,
                x: pos.x + dx,
                y: pos.y + dy
              }));
              return {
                ...element,
                x: (element.x || 0) + dx,
                y: (element.y || 0) + dy,
                seatPositions: updatedPositions
              };
            } else {
              return {
                ...element,
                x: (element.x || 0) + dx,
                y: (element.y || 0) + dy
              };
            }
          }
          return element;
        });

        pushSnapshot(updatedElements);
        return;
      }
    }

    // Si es un elemento seatRow y hay updates de posición, mover todas las posiciones manteniendo alineación perfecta
    if (id && updates && (updates.x !== undefined || updates.y !== undefined)) {
      const element = elements.find(e => e.id === id);
      if (element && element.type === 'seatRow' && element.seatPositions) {
        const newX = updates.x || element.x || 0;
        const newY = updates.y || element.y || 0;

        // Mantener todas las sillas en la misma fila horizontal (misma Y)
        // Recalcular posiciones basadas en el espaciado
        const spacing = 60; // Espaciado entre sillas
        const numSeats = element.seatPositions.length;
        const totalWidth = (numSeats - 1) * spacing;
        const startX = newX - totalWidth / 2;

        const updatedPositions = element.seatPositions.map((pos, index) => ({
          ...pos,
          x: startX + index * spacing,
          y: newY // Mantener todas en la misma línea horizontal
        }));

        pushSnapshot((elements || []).map(e =>
          e.id === id ? { ...e, x: newX, y: newY, seatPositions: updatedPositions } : e
        ));
        return;
      }
    }

    // Para elementos normales, incluyendo actualizaciones de displaySeats
    pushSnapshot((elements || []).map(e => e.id === id ? { ...e, ...updates } : e));
  }, [elements, selectedIds]);

  const handleDelete = useCallback((id) => {
    // Si es una posición de asiento, no se puede eliminar individualmente
    if (id && id.includes('-')) {
      console.log('No se pueden eliminar posiciones de asiento individuales');
      return;
    }
    pushSnapshot((elements || []).filter(e => e.id !== id));
  }, [elements]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (editingLabelId) return;

      const toolShortcuts = {
        's': 'select',
        'w': 'wall',
        'z': 'zone',
        'n': 'section',
        't': 'stage',
        'c': 'chair',
        'r': 'seatRow',
        'd': 'door',
        'e': 'exit'
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
      if (e.key === '+') {
        e.preventDefault()
        setZoom(prev => Math.min(4, prev + 0.2))
        return
      }
      if (e.key === '-') {
        e.preventDefault()
        setZoom(prev => Math.max(0.2, prev - 0.2))
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
  }, [selectedId, elements, handleUpdate, handleDelete, setActiveTool, undo, redo, clipboard])

  // Encontrar elemento seleccionado, incluyendo posiciones de asiento
  const selectedElement = elements.find(el => el.id === selectedId) || (() => {
    // Si no es un elemento directo, verificar si es una posición de asiento
    if (selectedId && selectedId.includes('-')) {
      const [seatRowId, seatIndex] = selectedId.split('-');
      const seatRow = elements.find(el => el.id === seatRowId && el.type === 'seatRow');
      if (seatRow && seatRow.seatPositions && seatRow.seatPositions[parseInt(seatIndex)]) {
        // Crear un objeto temporal que represente la posición de asiento
        const seatPos = seatRow.seatPositions[parseInt(seatIndex)];
        return {
          id: selectedId,
          type: 'seatPosition',
          x: seatPos.x,
          y: seatPos.y,
          row: seatPos.row,
          seatNumber: seatPos.seatNumber,
          status: seatPos.status,
          parentElement: seatRow
        };
      }
    }
    return null;
  })()


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
  }, [dispatch, historyWrapper]);

  const addSample = () => {
    // Usar la estructura completa del LayoutStructureExample.js
    const sampleElements = eventLayoutExample.layout.elements.map(element => ({
      ...element,
      id: nanoid() // Generar nuevos IDs únicos
    }));

    pushSnapshot([...(elements || []), ...sampleElements]);
  };


  const saveLayoutToBackend = async (layoutName) => {
    // Validate that we have a valid eventId
    if (!eventId || isNaN(parseInt(eventId))) {
      console.error('Error: ID de evento no válido. Debe acceder al diseñador desde la gestión de eventos.');
      return;
    }

    try {
      // Extract sections from elements
      const sections = elements.filter(el => el.type === 'section').map(section => ({
        eventId: parseInt(eventId),
        sectionName: section.meta?.label || 'Sección',
        price: section.meta?.price || 0
      }));

      // Validate section names are unique
      const sectionNames = sections.map(s => s.sectionName);
      const uniqueNames = new Set(sectionNames);
      if (uniqueNames.size !== sectionNames.length) {
        alert('Error: No se permiten secciones con nombres duplicados. Cada sección debe tener un nombre único.');
        return;
      }

      // Check for empty section names
      if (sectionNames.some(name => !name.trim())) {
        alert('Error: Todas las secciones deben tener un nombre válido.');
        return;
      }

      // Save sections
      const createdSections = [];
      for (const section of sections) {
        const result = await createSection(section);
        if (result.success && result.data) {
          createdSections.push(result.data); // Assume returns section with id
        }
      }

      // Check if layout exists
      const hasLayoutResult = await hasEventLayout(eventId);
      let eventLayoutID;

      if (hasLayoutResult.success && hasLayoutResult.data) {
        // Layout exists, get its ID and update
        const existingLayoutResult = await getEventLayoutByEventId(eventId);
        if (existingLayoutResult.success) {
          eventLayoutID = existingLayoutResult.data.eventLayoutID;
          // Update the layout
          const updateData = {
            layoutData: {
              elements: elements,
              exportedAt: new Date().toISOString(),
              name: `event_${eventId}`
            }
          };
          const updateResult = await updateEventLayout(eventLayoutID, updateData);
          if (!updateResult.success) {
            console.error('Error al actualizar el layout: ' + (updateResult.message || 'Error desconocido'));
            return;
          }
          alert('Layout actualizado con éxito');
        } else {
          throw new Error('Error getting existing layout: ' + (existingLayoutResult.message || 'Unknown error'));
        }
      } else {
        // Create new layout
        const layoutData = {
          eventId: parseInt(eventId), // Event ID as number
          layoutData: {
            elements: elements,
            exportedAt: new Date().toISOString(),
            name: `event_${eventId}`
          }
          // createdAt will be set by backend
        };

        const layoutResult = await saveEventLayout(layoutData);
        if (!layoutResult.success) {
          console.error('Error al guardar el layout: ' + (layoutResult.message || 'Error desconocido'));
          return;
        }

        eventLayoutID = layoutResult.data.eventLayoutID; // Use the correct field name
        alert('Layout creado con éxito');
      }

      // Extract seats from chair elements
      const chairElements = elements.filter(el => el.type === 'chair');
      const defaultSectionId = createdSections.length > 0 ? createdSections[0].id : 1; // Use first section or fallback to 1

      const createdSeats = [];
      for (const chair of chairElements) {
        const seatData = {
          sectionID: defaultSectionId, // Use actual section ID
          eventLayoutID: eventLayoutID,
          seatNumber: chair.seatNumber,
          row: chair.row, // Use row from chair element
          x: Math.round(chair.x),
          y: Math.round(chair.y),
          status: chair.status === 'AVAILABLE' ? false : true // Convert to boolean
        };
        const result = await createSeat(seatData);
        if (result.success && result.data) {
          createdSeats.push({
            ...chair,
            backendId: result.data.id, // Store the backend ID
            seatNumber: result.data.seatNumber,
            row: result.data.row, // Ensure row is set
            status: result.data.status
          });
        }
      }

      // Update chair elements with backend IDs
      const updatedElements = elements.map(element => {
        if (element.type === 'chair') {
          const createdSeat = createdSeats.find(seat =>
            Math.abs(seat.x - element.x) < 5 &&
            Math.abs(seat.y - element.y) < 5 &&
            seat.seatNumber === element.seatNumber
          );
          if (createdSeat) {
            return {
              ...element,
              backendId: createdSeat.backendId,
              seatNumber: createdSeat.seatNumber,
              row: createdSeat.row,
              status: createdSeat.status ? 'OCCUPIED' : 'AVAILABLE'
            };
          }
        }
        return element;
      });

      // Update the layout with the new elements containing backend IDs
      const updateData = {
        layoutData: {
          elements: updatedElements,
          exportedAt: new Date().toISOString(),
          name: `event_${eventId}`
        }
      };
      const updateResult = await updateEventLayout(eventLayoutID, updateData);
      if (!updateResult.success) {
        console.error('Error updating layout with backend IDs: ' + (updateResult.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error saving layout to backend:', error);
    }
  };

  const loadLayoutFromBackend = async (eventIdParam) => {
    if (!eventIdParam || isNaN(parseInt(eventIdParam))) {
      console.error('loadLayoutFromBackend: Invalid eventIdParam:', eventIdParam);
      return;
    }

    try {
      const result = await getEventLayoutByEventId(eventIdParam);
      if (result.success && result.data && result.data.layoutData && result.data.layoutData.elements) {
        let elements = result.data.layoutData.elements;
        dispatch({ type: 'SET_ELEMENTS', payload: elements });
        historyWrapper.pushState(elements);
        console.log('Layout cargado exitosamente desde el backend para evento:', eventIdParam);

        // Load seats associated with this layout
        await loadSeatsForEvent();

        // Match loaded seats with seatPositions in elements to identify seats by backend ID
        elements = matchSeatsWithLayout(elements);
        dispatch({ type: 'SET_ELEMENTS', payload: elements });
        historyWrapper.pushState(elements);
      } else {
        console.log('No se encontró layout existente para el evento:', eventIdParam, '- Esto es normal para eventos nuevos');
        // Don't show error for new events without layouts
      }
    } catch (error) {
      console.error('Error loading layout from backend:', error);
      // Don't show user-facing error for loading failures on component mount
    }
  };

  const onLoadLayout = () => {
    if (eventId) {
      loadLayoutFromBackend(eventId);
    } else {
      alert('Para cargar layouts, debe estar en el contexto de un evento específico.');
    }
  };

  const onUploadEvent = () => {
    if (eventId) {
      saveLayoutToBackend(`event_${eventId}`);
    } else {
      const layoutName = prompt('Ingrese el nombre del layout:');
      if (layoutName && layoutName.trim()) {
        saveLayoutToBackend(layoutName.trim());
      }
    }
  };

  const goHome = () => {
    navigate('/');
  };

  const goToEvents = () => {
    navigate('/events');
  };

  const handleLabelEdit = (elementId) => {
    const element = elements.find(el => el.id === elementId);
    if (element) {
      setEditingLabelId(elementId);
      setLabelInput(element.meta?.label || '');
    }
  };

  const saveLabel = () => {
    if (editingLabelId) {
      handleUpdate(editingLabelId, { meta: { ...elements.find(el => el.id === editingLabelId)?.meta, label: labelInput } });
      setEditingLabelId(null);
      setLabelInput('');
    }
  };

  const cancelLabelEdit = () => {
    setEditingLabelId(null);
    setLabelInput('');
  };

  const handleSeatPositionSelect = (seatRowId, seatIndex) => {
    const seatKey = `${seatRowId}-${seatIndex}`;
    const newSelected = new Set(selectedSeatPositions);

    if (newSelected.has(seatKey)) {
      newSelected.delete(seatKey);
    } else {
      newSelected.add(seatKey);
    }

    setSelectedSeatPositions(newSelected);

    // Update the seatRow element with selected positions
    const seatRow = elements.find(el => el.id === seatRowId);
    if (seatRow && seatRow.seatPositions) {
      const updatedPositions = seatRow.seatPositions.map((pos, idx) => ({
        ...pos,
        status: newSelected.has(`${seatRowId}-${idx}`) ? 'RESERVED' : 'AVAILABLE'
      }));

      handleUpdate(seatRowId, { seatPositions: updatedPositions });
    }
  };

  const handleSeatSelect = (seatId) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat) return;

    if (selectedSeats.includes(seatId)) {
      // Deseleccionar
      setSelectedSeats(prev => prev.filter(id => id !== seatId));
    } else {
      // Seleccionar (sin reservar en el backend, solo para visualización)
      setSelectedSeats(prev => [...prev, seatId]);
    }
  };

  const loadSeatsForEvent = async () => {
    if (!eventId) return;
    try {
      // Cargar secciones primero
      const sectionsResult = await getAllSections();
      if (sectionsResult.success) {
        const eventSections = sectionsResult.data.filter(s => s.eventId === parseInt(eventId));
        // Para cada sección, cargar asientos
        const allSeats = [];
        for (const section of eventSections) {
          const seatsResult = await getSeatsBySection(section.id);
          if (seatsResult.success) {
            allSeats.push(...seatsResult.data);
          }
        }
        setSeats(allSeats);
        return allSeats;
      }
    } catch (error) {
      console.error('Error cargando asientos:', error);
    }
    return [];
  };

  const matchSeatsWithLayout = (elements) => {
    const updatedElements = elements.map(element => {
      if (element.type === 'seatRow' && element.seatPositions) {
        const updatedPositions = element.seatPositions.map(position => {
          // Find matching seat by position (x, y) and seatNumber (ignore row as it may be outdated)
          const matchingSeat = seats.find(seat =>
            Math.abs(seat.x - position.x) < 5 && // Tolerance for position matching
            Math.abs(seat.y - position.y) < 5 &&
            seat.seatNumber === position.seatNumber
          );

          if (matchingSeat) {
            return {
              ...position,
              backendId: matchingSeat.id, // Add backend ID
              row: matchingSeat.row, // Update row from backend
              seatNumber: matchingSeat.seatNumber, // Ensure seat number matches
              status: matchingSeat.status // Sync status
            };
          }
          return position;
        });
        return { ...element, seatPositions: updatedPositions };
      }
      return element;
    });
    return updatedElements;
  };

  const handlePurchaseSeats = async () => {
    if (selectedSeats.length === 0) return;

    try {
      const ticketData = {
        eventId: parseInt(eventId),
        seatIds: selectedSeats
      };

      const result = await createTicketWithSeats(ticketData);
      if (result.success) {
        alert('Compra exitosa! Ticket creado.');
        // Cambiar estado de asientos a OCCUPIED
        for (const seatId of selectedSeats) {
          await updateSeatStatus(seatId, 'OCCUPIED');
        }
        // Actualizar estado local
        setSeats(prev => prev.map(s => selectedSeats.includes(s.id) ? { ...s, status: 'OCCUPIED' } : s));
        setSelectedSeats([]);
      } else {
        alert('Error en la compra: ' + (result.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error comprando asientos:', error);
      alert('Error de conexión al comprar asientos');
    }
  };

  // Cargar asientos cuando se activa el modo selección
  useEffect(() => {
    if (isSeatSelectionMode) {
      loadSeatsForEvent();
    }
  }, [isSeatSelectionMode, eventId]);

  // Polling para actualizaciones en tiempo real
  useEffect(() => {
    let interval;
    if (isSeatSelectionMode) {
      interval = setInterval(() => {
        loadSeatsForEvent();
      }, 5000); // Actualizar cada 5 segundos
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSeatSelectionMode, eventId]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <TopNavbar onExport={exportMap} onImport={importMap} onUploadEvent={onUploadEvent} onLoadLayout={onLoadLayout} onGoHome={goHome} onGoToEvents={goToEvents} />

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
            <button
              onClick={() => {
                setIsSectionCreationMode(!isSectionCreationMode);
                if (!isSectionCreationMode) {
                  setSelectedChairsForSection(new Set());
                  setSelectedSeatPositionsForSection(new Set());
                } else {
                  setSelectedChairsForSection(new Set());
                  setSelectedSeatPositionsForSection(new Set());
                }
              }}
              className={`px-3 py-1 text-sm rounded border ${isSectionCreationMode ? 'bg-purple-500 text-white border-purple-500' : 'bg-white text-gray-700 border-gray-300'}`}
            >
              🎯 Seleccionar Sillas
            </button>
            {isSectionCreationMode && (selectedChairsForSection.size > 0 || selectedSeatPositionsForSection.size > 0) && (
              <button
                onClick={() => setShowSectionCreationModal(true)}
                className="px-4 py-2 text-sm rounded border bg-green-500 text-white border-green-500 hover:bg-green-600"
              >
                ✅ Crear Sección ({selectedChairsForSection.size + selectedSeatPositionsForSection.size} sillas)
              </button>
            )}
            {isSectionCreationMode && (
              <button
                onClick={() => {
                  // Limpiar selección actual
                  setSelectedChairsForSection(new Set());
                  setSelectedSeatPositionsForSection(new Set());
                }}
                className="px-3 py-1 text-sm rounded border bg-red-500 text-white border-red-500 hover:bg-red-600"
              >
                ✕ Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Elementos: {elements?.length || 0}</span>
          <span>•</span>
          <span>Herramienta: {activeTool}</span>
          <span>•</span>
          <span>Unidades: {units}</span>
          {isSectionCreationMode && (
            <>
              <span>•</span>
              <span className={`font-bold px-2 py-1 rounded ${
                selectedChairsForSection.size + selectedSeatPositionsForSection.size > 0
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-300'
              }`}>
                🎯 Sillas seleccionadas: {selectedChairsForSection.size + selectedSeatPositionsForSection.size}
              </span>
            </>
          )}
          {!isSeatSelectionMode && !isSectionCreationMode && selectedIds.size > 0 && (
            <>
              <span>•</span>
              <span>Elementos seleccionados: {selectedIds.size}</span>
            </>
          )}
        </div>
      </div>

      {editingLabelId && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Editar Etiqueta</h3>
            <input
              type="text"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Ingrese la etiqueta"
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveLabel();
                if (e.key === 'Escape') cancelLabelEdit();
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={saveLabel} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Guardar</button>
              <button onClick={cancelLabelEdit} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showSectionCreationModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Crear Nueva Sección</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Sección</label>
                <input
                  type="text"
                  value={newSectionData.name}
                  onChange={(e) => setNewSectionData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Ej: VIP, General"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newSectionData.price}
                  onChange={(e) => setNewSectionData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Ej: 50.00"
                />
              </div>
              <div className="text-sm text-gray-600">
                Sillas seleccionadas: {selectedChairsForSection.size + selectedSeatPositionsForSection.size}
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                disabled={isCreatingSection}
                onClick={async () => {
                  if (!newSectionData.name.trim()) {
                    alert('Por favor ingrese un nombre para la sección');
                    return;
                  }

                  // Check for duplicate section names in current layout
                  const existingSectionNamesInLayout = elements
                    .filter(el => el.type === 'section')
                    .map(el => el.meta?.label || 'Sección');

                  if (existingSectionNamesInLayout.includes(newSectionData.name.trim())) {
                    alert('Ya existe una sección con este nombre en el diseño actual. Por favor elija un nombre diferente.');
                    return;
                  }

                  // Additional validation will be handled by backend

                  setIsCreatingSection(true);

                  try {
                    // Verificar token de autenticación
                    const token = localStorage.getItem('token');
                    console.log('Token disponible:', !!token);

                    // Crear la sección
                    const sectionData = {
                      eventId: parseInt(eventId),
                      sectionName: newSectionData.name.trim(),
                      price: newSectionData.price
                    };
                    console.log('Datos a enviar para crear sección:', sectionData);

                    const sectionResult = await createSection(sectionData);
                    console.log('Respuesta completa de createSection:', sectionResult);

                    // Check for validation errors from backend
                    if (!sectionResult || !sectionResult.success) {
                      const errorMessage = sectionResult?.message || 'Error desconocido al crear la sección';
                      alert('Error: ' + errorMessage);
                      return;
                    }

                    // Verificar diferentes estructuras de respuesta posibles
                    let newSection = null;
                    if (sectionResult.data) {
                      newSection = sectionResult.data;
                    } else if (typeof sectionResult === 'object' && sectionResult.sectionID) {
                      newSection = sectionResult;
                    }

                    console.log('Nueva sección extraída:', newSection);

                    if (!newSection) {
                      alert('Error: No se recibió datos de la sección creada. Respuesta: ' + JSON.stringify(sectionResult));
                      return;
                    }

                    // Obtener o crear eventLayoutID
                    let eventLayoutID = 1; // Valor por defecto
                    try {
                      const hasLayoutResult = await hasEventLayout(eventId);
                      if (hasLayoutResult.success && hasLayoutResult.data) {
                        const existingLayoutResult = await getEventLayoutByEventId(eventId);
                        if (existingLayoutResult.success && existingLayoutResult.data) {
                          eventLayoutID = existingLayoutResult.data.eventLayoutID;
                        }
                      }
                    } catch (error) {
                      console.warn('No se pudo obtener eventLayoutID, usando valor por defecto:', error);
                    }

                    // Crear asientos para la sección
                    let seatCounter = 1;

                    // Procesar sillas individuales
                    const selectedChairElements = elements.filter(el => selectedChairsForSection.has(el.id));
                    for (let i = 0; i < selectedChairElements.length; i++) {
                      const chair = selectedChairElements[i];
                      const seatData = {
                        sectionID: newSection.sectionID || newSection.id || newSection,
                        eventLayoutID: eventLayoutID,
                        seatNumber: seatCounter++,
                        row: 'A', // Por ahora fila fija
                        x: Math.round(chair.x),
                        y: Math.round(chair.y),
                        status: false
                      };

                      const seatResult = await createSeat(seatData);
                      if (!seatResult.success) {
                        console.error('Error creando asiento:', seatResult.message);
                      }
                    }

                    // Procesar posiciones de asiento en filas
                    for (const positionKey of selectedSeatPositionsForSection) {
                      const [seatRowId, seatIndex] = positionKey.split('-');
                      const seatRow = elements.find(el => el.id === seatRowId);
                      if (seatRow && seatRow.seatPositions && seatRow.seatPositions[seatIndex]) {
                        const seatPos = seatRow.seatPositions[seatIndex];
                        const seatData = {
                          sectionID: newSection.sectionID || newSection.id,
                          eventLayoutID: eventLayoutID,
                          seatNumber: seatCounter++,
                          row: seatPos.row || 'A',
                          x: Math.round(seatPos.x),
                          y: Math.round(seatPos.y),
                          status: false
                        };

                        const seatResult = await createSeat(seatData);
                        if (!seatResult.success) {
                          console.error('Error creando asiento:', seatResult.message);
                        }
                      }
                    }

                    // Calcular bounding box de todas las sillas seleccionadas
                    const allSelectedElements = [];

                    // Agregar sillas individuales
                    selectedChairElements.forEach(chair => allSelectedElements.push(chair));

                    // Agregar posiciones de asiento
                    for (const positionKey of selectedSeatPositionsForSection) {
                      const [seatRowId, seatIndex] = positionKey.split('-');
                      const seatRow = elements.find(el => el.id === seatRowId);
                      if (seatRow && seatRow.seatPositions && seatRow.seatPositions[seatIndex]) {
                        allSelectedElements.push({
                          x: seatRow.seatPositions[seatIndex].x,
                          y: seatRow.seatPositions[seatIndex].y
                        });
                      }
                    }

                    // Crear elemento visual de sección
                    const sectionElement = {
                      id: nanoid(),
                      type: 'section',
                      x: Math.min(...allSelectedElements.map(c => c.x)) - 50,
                      y: Math.min(...allSelectedElements.map(c => c.y)) - 50,
                      width: Math.max(...allSelectedElements.map(c => c.x)) - Math.min(...allSelectedElements.map(c => c.x)) + 100,
                      height: Math.max(...allSelectedElements.map(c => c.y)) - Math.min(...allSelectedElements.map(c => c.y)) + 100,
                      meta: {
                        label: newSectionData.name.trim(),
                        price: newSectionData.price,
                        category: 'General'
                      }
                    };

                    pushSnapshot([...elements, sectionElement]);

                    // Limpiar estado
                    setShowSectionCreationModal(false);
                    setNewSectionData({ name: '', price: 0 });
                    setSelectedChairsForSection(new Set());
                    setSelectedSeatPositionsForSection(new Set());
                    setIsSectionCreationMode(false);

                    // Mostrar notificación de éxito más prominente
                    const successMessage = `✅ Sección "${newSectionData.name}" creada exitosamente con ${selectedChairElements.length} asientos`;
                    alert(successMessage);

                    // Resetear automáticamente el modo de selección
                    setIsSectionCreationMode(false);
                  } catch (error) {
                    console.error('Error creando sección:', error);
                    alert('Error al crear la sección');
                  } finally {
                    setIsCreatingSection(false);
                  }
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {isCreatingSection ? '⏳ Creando...' : 'Crear Sección'}
              </button>
              <button
                onClick={() => {
                  setShowSectionCreationModal(false);
                  setNewSectionData({ name: '', price: 0 });
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        <ToolPanel activeTool={activeTool} setActiveTool={setActiveTool} onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} onAddSample={addSample} />
          <DrawingCanvas
            elements={elements || []}
            selectedElementId={selectedId}
            selectedIds={selectedIds}
            onSelect={(id) => {
              if (id && id.includes('-') && !isSeatSelectionMode && !isSectionCreationMode) {
                // Selección múltiple para posiciones de asiento en modo normal
                setSelectedIds(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(id)) {
                    newSet.delete(id);
                  } else {
                    newSet.add(id);
                  }
                  return newSet;
                });
              } else {
                // Selección normal para otros elementos
                dispatch({ type: 'SET_SELECTED', payload: id });
                // Limpiar selección múltiple cuando se selecciona un elemento normal
                setSelectedIds(new Set());
              }
            }}
            onMultiSelect={(selectedElements) => {
              // Actualizar selección múltiple
              setSelectedIds(new Set(selectedElements));
              // También seleccionar el primer elemento para compatibilidad
              if (selectedElements.length > 0) {
                dispatch({ type: 'SET_SELECTED', payload: selectedElements[0] });
              }
            }}
            onCreate={(el) => handleCreate({ ...el, type: activeTool })}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            units={units}
            showMeasurements={showMeasurements}
            seats={seats}
            selectedSeats={selectedSeats}
            onSeatSelect={handleSeatSelect}
            isSeatSelectionMode={isSeatSelectionMode}
            selectedSeatPositions={selectedSeatPositions}
            onSeatPositionSelect={handleSeatPositionSelect}
            isSectionCreationMode={isSectionCreationMode}
            selectedChairsForSection={selectedChairsForSection}
            selectedSeatPositionsForSection={selectedSeatPositionsForSection}
            onChairSelectForSection={(chairId) => {
              const newSelected = new Set(selectedChairsForSection);
              if (newSelected.has(chairId)) {
                newSelected.delete(chairId);
              } else {
                newSelected.add(chairId);
              }
              setSelectedChairsForSection(newSelected);
            }}
            onSeatPositionSelectForSection={(positionKey) => {
              const newSelected = new Set(selectedSeatPositionsForSection);
              if (newSelected.has(positionKey)) {
                newSelected.delete(positionKey);
              } else {
                newSelected.add(positionKey);
              }
              setSelectedSeatPositionsForSection(newSelected);
            }}
            zoom={zoom}
            setZoom={setZoom}
            offset={offset}
            setOffset={setOffset}
            onLabelEdit={handleLabelEdit}
          />

        <PropertiesPanel
          selectedElement={selectedElement}
          selectedIds={selectedIds}
          elements={elements || []}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          units={units}
          setUnits={setUnits}
        />
      </div>

      {showGuide && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
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