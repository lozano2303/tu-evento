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
  Grid3x3,
  Save,
  CheckCircle,
  X
} from 'lucide-react';
import { nanoid } from 'nanoid';

import useHistory from './Hooks/useHistory';
import useDragAndDrop from './Hooks/useDragAndDrop';
import DrawingCanvas from '../DrawingCanvas';
import { MapProvider, useMapState, useMapDispatch } from '../context/MapContext';
import { saveEventLayout, getEventLayoutByEventId, hasEventLayout, updateEventLayout } from '../../services/EventLayoutService.js';
import { createSection, updateSection, deleteSection, getAllSections } from '../../services/SectionService.js';
import { createSectionName, getAllSectionNames } from '../../services/SectionNameService.js';
import { createSeat, getSeatsBySection, updateSeatStatus, updateSeat } from '../../services/SeatService.js';
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
          <Upload size={16} className="mr-2" /> Exportar
        </button>

        <label className="flex items-center px-3 py-2 rounded hover:bg-purple-800 cursor-pointer">
          <Download size={16} className="mr-2" />
          <input type="file" accept=".json" onChange={(e)=>onImport && onImport(e.target.files[0])} className="hidden" />
          Importar
        </label>


        <button title="Guardar Layout" onClick={onUploadEvent} className="flex items-center px-3 py-2 rounded hover:bg-gray-700">
          <Save size={16} className="mr-2" /> Guardar Layout
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
const PropertiesPanel = ({ selectedElement, selectedIds, elements, onUpdate, onDelete, units, setUnits, availableSectionNames, onSectionNameChange }) => {
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
              <select
                value={selectedElement.meta?.sectionNameId || ''}
                onChange={(e) => {
                  const oldLabel = selectedElement.meta?.label;
                  const selected = availableSectionNames.find(sn => sn.sectionNameID === parseInt(e.target.value));
                  const newLabel = selected?.name || '';
                  onUpdate(selectedElement.id, { meta: { ...selectedElement.meta, sectionNameId: parseInt(e.target.value), label: newLabel, isModified: true } });
                  if (oldLabel !== newLabel) {
                    onSectionNameChange(selectedElement.id, oldLabel, newLabel);
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              >
                <option value="">Selecciona un nombre</option>
                {availableSectionNames.map(sectionName => (
                  <option key={sectionName.sectionNameID} value={sectionName.sectionNameID}>
                    {sectionName.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={selectedElement.meta?.price || ''}
                onChange={(e) => onUpdate(selectedElement.id, { meta: { ...selectedElement.meta, price: parseFloat(e.target.value) || 0, isModified: true } })}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="Ej: 50.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={selectedElement.meta?.category || 'General'}
                onChange={(e) => onUpdate(selectedElement.id, { meta: { ...selectedElement.meta, category: e.target.value, isModified: true } })}
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
                      status: true
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
  const [newSectionData, setNewSectionData] = useState({ sectionNameId: '', price: 0 });
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [showSectionsPanel, setShowSectionsPanel] = useState(false);
  const [availableSectionNames, setAvailableSectionNames] = useState([]);
  const [existingSections, setExistingSections] = useState([]); // Secciones existentes del evento
  const [chairsWithSections, setChairsWithSections] = useState(new Map()); // Mapa de chairId -> sectionName (incluye pendientes)
  const [existingChairsWithSections, setExistingChairsWithSections] = useState(new Map()); // Mapa solo de sillas en secciones existentes (BD)
  const [editingSection, setEditingSection] = useState(null); // Sección que se está editando
  const [existingSectionsLoaded, setExistingSectionsLoaded] = useState(false); // Para saber si ya se cargaron las secciones existentes
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


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

  // Load available section names when modal opens
  useEffect(() => {
    if (showSectionCreationModal) {
      loadAvailableSectionNames();
    }
  }, [showSectionCreationModal]);

  // Load available section names when section creation mode is activated
  // Load existing sections only once per session to avoid overriding
  // the state of chairs assigned to new sections that haven't been saved yet
  useEffect(() => {
    if (isSectionCreationMode) {
      loadAvailableSectionNames();
      // Load existing sections only if not loaded before
      if (!existingSectionsLoaded) {
        loadExistingSections().then(() => {
          setExistingSectionsLoaded(true);
        });
      }
    }
  }, [isSectionCreationMode, eventId, existingSectionsLoaded]);

  const snapToGridValue = (value, gridSize = 20) => {
    return Math.round(value / gridSize) * gridSize;
  };

  // Función para detectar si dos rectángulos se solapan
  const rectanglesOverlap = (rect1, rect2) => {
    return !(rect1.x + rect1.width / 2 < rect2.x - rect2.width / 2 ||
             rect1.x - rect1.width / 2 > rect2.x + rect2.width / 2 ||
             rect1.y + rect1.height / 2 < rect2.y - rect2.height / 2 ||
             rect1.y - rect1.height / 2 > rect2.y + rect2.height / 2);
  };

  // Función para verificar si una nueva sección se solapa con secciones existentes
  const checkSectionOverlap = (newSectionRect) => {
    // Solo verificar solapamiento con secciones ya guardadas en BD, no con secciones pendientes
    const existingSections = elements.filter(el => el.type === 'section' && el.meta?.isExistingSection);
    return existingSections.some(existingSection => {
      const existingRect = {
        x: existingSection.x,
        y: existingSection.y,
        width: existingSection.width || 0,
        height: existingSection.height || 0
      };
      return rectanglesOverlap(newSectionRect, existingRect);
    });
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
          status: true,
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
        try { e.preventDefault(); } catch {}
        setActiveTool(toolShortcuts[e.key.toLowerCase()])
        return
      }

      if (!selectedId) return

      const step = e.shiftKey ? 10 : 1
      let updates = {}

      if (e.ctrlKey && e.key === 'z') {
        try { e.preventDefault(); } catch {}
        undo()
        return
      }
      if (e.ctrlKey && e.key === 'y') {
        try { e.preventDefault(); } catch {}
        redo()
        return
      }
      if (e.key === '+') {
        try { e.preventDefault(); } catch {}
        setZoom(prev => Math.min(4, prev + 0.2))
        return
      }
      if (e.key === '-') {
        try { e.preventDefault(); } catch {}
        setZoom(prev => Math.max(0.2, prev - 0.2))
        return
      }
      if (e.ctrlKey && e.key === 'c' && selectedId) {
        try { e.preventDefault(); } catch {}
        const element = elements.find(el => el.id === selectedId)
        if (element) {
          setClipboard({ ...element, id: nanoid() })
        }
        return
      }
      if (e.ctrlKey && e.key === 'v' && clipboard) {
        try { e.preventDefault(); } catch {}
        const newEl = { ...clipboard, x: clipboard.x + 20, y: clipboard.y + 20 }
        pushSnapshot([...elements, newEl])
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        try { e.preventDefault(); } catch {}
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
    // Contar elementos por tipo
    const elementCounts = elements.reduce((acc, el) => {
      acc[el.type] = (acc[el.type] || 0) + 1;
      return acc;
    }, {});

    // Información sobre secciones
    const sections = elements.filter(el => el.type === 'section').map(section => ({
      id: section.id,
      name: section.meta?.label || 'Sin nombre',
      price: section.meta?.price || 0,
      isExisting: section.meta?.isExistingSection || false,
      selectedChairs: section.meta?.selectedChairs?.length || 0,
      selectedSeatPositions: section.meta?.selectedSeatPositions?.length || 0
    }));

    const data = {
      exportedAt: new Date().toISOString(),
      eventId: eventId,
      summary: {
        totalElements: elements.length,
        elementCounts,
        sectionsCount: sections.length,
        sections: sections
      },
      elements: elements
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `layout-event-${eventId}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('Layout exportado:', data);
  }, [elements, eventId]);

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
      // Check if layout exists first
      const hasLayoutResult = await hasEventLayout(eventId);
      let eventLayoutID;

      if (hasLayoutResult.success && hasLayoutResult.data) {
        // Layout exists, get its ID
        const existingLayoutResult = await getEventLayoutByEventId(eventId);
        if (existingLayoutResult.success) {
          eventLayoutID = existingLayoutResult.data.eventLayoutID;
        } else {
          throw new Error('Error getting existing layout: ' + (existingLayoutResult.message || 'Unknown error'));
        }
      } else {
        // Create new layout first to get eventLayoutID
        const layoutData = {
          eventId: parseInt(eventId),
          layoutData: {
            elements: [], // Empty initially, will be updated after processing sections
            exportedAt: new Date().toISOString(),
            name: `event_${eventId}`
          }
        };

        const layoutResult = await saveEventLayout(layoutData);
        if (!layoutResult.success) {
          console.error('Error al crear el layout: ' + (layoutResult.message || 'Error desconocido'));
          return;
        }

        eventLayoutID = layoutResult.data.eventLayoutID;
      }

      console.log('Saving layout with elements:', elements.map(el => ({ type: el.type, id: el.id })));

      // Process sections from elements
      const sectionElements = elements.filter(el => el.type === 'section');
      const createdSections = [];

      // Process sections marked for deletion in the JSON
      const sectionsMarkedForDeletion = elements.filter(el => el.type === 'section' && el.meta?.markedForDeletion);

      // Delete sections that are marked for deletion
      let deletedSectionsCount = 0;
      for (const sectionElement of sectionsMarkedForDeletion) {
        try {
          const sectionId = sectionElement.meta?.sectionId || sectionElement.meta?.sectionID;
          if (sectionId) {
            console.log('Attempting to delete section with ID:', sectionId, sectionElement);
            const deleteResult = await deleteSection(sectionId);
            if (!deleteResult.success) {
              console.error('Error deleting section:', sectionElement, deleteResult.message);
              alert(`Error eliminando sección "${sectionElement.meta?.label}": ${deleteResult.message}`);
            } else {
              console.log('Successfully deleted section:', sectionElement);
              deletedSectionsCount++;
            }
          } else {
            console.warn('Section marked for deletion but no sectionId found:', sectionElement);
            alert(`No se puede eliminar la sección "${sectionElement.meta?.label}" porque no tiene ID válido.`);
          }
        } catch (error) {
          console.error('Error deleting section:', sectionElement, error);
          alert(`Error eliminando sección "${sectionElement.meta?.label}": ${error.message}`);
        }
      }

      // Remove deleted sections from elements array (they are no longer needed in the JSON)
      const elementsAfterDeletion = elements.filter(el =>
        !(el.type === 'section' && el.meta?.markedForDeletion)
      );

      console.log('Sections marked for deletion:', sectionsMarkedForDeletion.length);
      console.log('Elements before deletion:', elements.length);
      console.log('Elements after deletion:', elementsAfterDeletion.length);

      // Reload seats after deletions to sync with backend
      await loadSeatsForEvent();

      console.log('Processing sections for save:', sectionElements.length);
      for (const sectionElement of sectionElements) {
        console.log('Processing section:', sectionElement.id, sectionElement.meta);
        const sectionNameId = sectionElement.meta?.sectionNameId;
        const price = sectionElement.meta?.price || 0;
        const isModified = sectionElement.meta?.isModified;
        const sectionId = sectionElement.meta?.sectionId;

        if (!sectionNameId) {
          console.warn('Sección sin sectionNameId, saltando:', sectionElement);
          continue;
        }

        let sectionResult;
        if (isModified && sectionId) {
          // Actualizar sección existente
          const sectionData = {
            sectionID: sectionId,
            eventId: parseInt(eventId),
            sectionNameID: sectionNameId,
            price: price
          };
          sectionResult = await updateSection(sectionData);
        } else {
          // Crear nueva sección
          const sectionData = {
            eventId: parseInt(eventId),
            sectionNameID: sectionNameId,
            price: price
          };
          sectionResult = await createSection(sectionData);
        }

        if (sectionResult.success && sectionResult.data) {
          console.log('Section created/updated successfully:', sectionResult.data);
          createdSections.push({
            ...sectionResult.data,
            elementId: sectionElement.id, // Keep reference to canvas element
            selectedChairs: sectionElement.meta?.selectedChairs || [],
            selectedSeatPositions: sectionElement.meta?.selectedSeatPositions || [],
            isModified: isModified
          });
        } else {
          console.error('Error creando/actualizando sección:', sectionResult.message);
        }
      }

      // Create seats for each section
      const createdSeats = [];
      const updatedSeats = [];

      // Create seats for individual chairs not in sections
      const individualChairs = elementsAfterDeletion.filter(el => el.type === 'chair' && !el.backendId);
      for (const chair of individualChairs) {
        const seatData = {
          sectionID: null,
          eventLayoutID: eventLayoutID,
          seatNumber: chair.seatNumber || 1,
          row: chair.row || 'A',
          x: Math.round(chair.x),
          y: Math.round(chair.y),
          status: (chair.status === 'AVAILABLE' || chair.status === true) ? "AVAILABLE" : "OCCUPIED"
        };

        const seatResult = await createSeat(seatData);
        if (seatResult.success && seatResult.data) {
          createdSeats.push({
            ...chair,
            backendId: seatResult.data.id,
            sectionId: null
          });
        }
      }

      for (const section of createdSections) {
        let seatCounter = 1;

        // Process selected chairs for this section
        for (const chairId of section.selectedChairs) {
          const chairElement = elements.find(el => el.id === chairId && el.type === 'chair');
          if (chairElement) {
            // Check if this chair already exists in the backend (was moved from another section)
            const existingSeat = seats.find(seat =>
              Math.abs(seat.x - chairElement.x) < 5 &&
              Math.abs(seat.y - chairElement.y) < 5
            );

            if (existingSeat) {
              // Update existing seat to new section
              const updateData = {
                id: existingSeat.id,
                sectionID: section.sectionID || section.id,
                seatNumber: seatCounter++,
                row: chairElement.row || 'A',
                x: Math.round(chairElement.x),
                y: Math.round(chairElement.y),
                status: (chairElement.status === 'AVAILABLE' || chairElement.status === true) ? "AVAILABLE" : "OCCUPIED"
              };

              const updateResult = await updateSeat(existingSeat.id, updateData);
              if (updateResult.success) {
                updatedSeats.push({
                  ...chairElement,
                  backendId: existingSeat.id,
                  sectionId: section.sectionID || section.id
                });
              }
            } else {
              // Create new seat
              const seatData = {
                sectionID: section.sectionID || section.id,
                eventLayoutID: eventLayoutID,
                seatNumber: seatCounter++,
                row: chairElement.row || 'A',
                x: Math.round(chairElement.x),
                y: Math.round(chairElement.y),
                status: (chairElement.status === 'AVAILABLE' || chairElement.status === true) ? "AVAILABLE" : "OCCUPIED"
              };

              const seatResult = await createSeat(seatData);
              if (seatResult.success && seatResult.data) {
                createdSeats.push({
                  ...chairElement,
                  backendId: seatResult.data.id,
                  sectionId: section.sectionID || section.id
                });
              }
            }
          }
        }

        // Process selected seat positions for this section
        for (const positionKey of section.selectedSeatPositions) {
          const [seatRowId, seatIndex] = positionKey.split('-');
          const seatRow = elements.find(el => el.id === seatRowId && el.type === 'seatRow');
          if (seatRow && seatRow.seatPositions && seatRow.seatPositions[seatIndex]) {
            const seatPos = seatRow.seatPositions[seatIndex];

            // Check if this seat position already exists in the backend
            const existingSeat = seats.find(seat =>
              Math.abs(seat.x - seatPos.x) < 5 &&
              Math.abs(seat.y - seatPos.y) < 5
            );

            if (existingSeat) {
              // Update existing seat to new section
              const updateData = {
                id: existingSeat.id,
                sectionID: section.sectionID || section.id,
                seatNumber: seatCounter++,
                row: seatPos.row || 'A',
                x: Math.round(seatPos.x),
                y: Math.round(seatPos.y),
                status: seatPos.status === 'AVAILABLE' || seatPos.status === true
              };

              const updateResult = await updateSeat(existingSeat.id, updateData);
              if (updateResult.success) {
                updatedSeats.push({
                  ...seatPos,
                  backendId: existingSeat.id,
                  sectionId: section.sectionID || section.id,
                  positionKey: positionKey
                });
              }
            } else {
              // Create new seat
              const seatData = {
                sectionID: section.sectionID || section.id,
                eventLayoutID: eventLayoutID,
                seatNumber: seatCounter++,
                row: seatPos.row || 'A',
                x: Math.round(seatPos.x),
                y: Math.round(seatPos.y),
                status: (seatPos.status === 'AVAILABLE' || seatPos.status === true) ? "AVAILABLE" : "OCCUPIED"
              };

              const seatResult = await createSeat(seatData);
              if (seatResult.success && seatResult.data) {
                createdSeats.push({
                  ...seatPos,
                  backendId: seatResult.data.id,
                  sectionId: section.sectionID || section.id,
                  positionKey: positionKey
                });
              }
            }
          }
        }
      }

      // Update elements with backend IDs and clean up section metadata
      const updatedElements = elements.map(element => {
        if (element.type === 'chair') {
          const createdSeat = createdSeats.find(seat =>
            Math.abs(seat.x - element.x) < 5 &&
            Math.abs(seat.y - element.y) < 5
          );
          if (createdSeat) {
            return {
              ...element,
              backendId: createdSeat.backendId,
              sectionId: createdSeat.sectionId
            };
          }
        } else if (element.type === 'section') {
          // Remove temporary metadata used for creation, keep only visual properties
          const { selectedChairs, selectedSeatPositions, sectionNameId, ...cleanMeta } = element.meta;
          return {
            ...element,
            meta: cleanMeta
          };
        } else if (element.type === 'seatRow' && element.seatPositions) {
          // Update seat positions with backend IDs
          const updatedPositions = element.seatPositions.map((pos, index) => {
            const positionKey = `${element.id}-${index}`;
            const createdSeat = createdSeats.find(seat => seat.positionKey === positionKey);
            if (createdSeat) {
              return {
                ...pos,
                backendId: createdSeat.backendId,
                sectionId: createdSeat.sectionId
              };
            }
            return pos;
          });
          return {
            ...element,
            seatPositions: updatedPositions
          };
        }
        return element;
      });

      // Update elements with backend IDs and clean up section metadata
      let updatedElementsWithExisting = elementsAfterDeletion.map(element => {
        if (element.type === 'chair') {
          const createdSeat = createdSeats.find(seat =>
            Math.abs(seat.x - element.x) < 5 &&
            Math.abs(seat.y - element.y) < 5
          );
          if (createdSeat) {
            return {
              ...element,
              backendId: createdSeat.backendId,
              sectionId: createdSeat.sectionId
            };
          }
        } else if (element.type === 'section') {
          // Remove temporary metadata used for creation, keep only visual properties
          const { selectedChairs, selectedSeatPositions, sectionNameId, ...cleanMeta } = element.meta;
          return {
            ...element,
            meta: cleanMeta
          };
        } else if (element.type === 'seatRow' && element.seatPositions) {
          // Update seat positions with backend IDs
          const updatedPositions = element.seatPositions.map((pos, index) => {
            const positionKey = `${element.id}-${index}`;
            const createdSeat = createdSeats.find(seat => seat.positionKey === positionKey);
            if (createdSeat) {
              return {
                ...pos,
                backendId: createdSeat.backendId,
                sectionId: createdSeat.sectionId
              };
            }
            return pos;
          });
          return {
            ...element,
            seatPositions: updatedPositions
          };
        }
        return element;
      });

      // Marcar secciones creadas como existentes para mostrar en verde
      if (createdSections.length > 0) {
        updatedElementsWithExisting = updatedElementsWithExisting.map(el => {
          if (el.type === 'section') {
            const createdSection = createdSections.find(cs => cs.elementId === el.id);
            if (createdSection) {
              return {
                ...el,
                meta: {
                  ...el.meta,
                  isExistingSection: true,
                  sectionId: createdSection.sectionID
                }
              };
            }
          }
          return el;
        });
      }

      // Remove chair elements that have backendId to avoid duplication with BD seats
      const finalElements = updatedElementsWithExisting.filter(element => {
        if (element.type === 'chair' && element.backendId) {
          return false;
        }
        if (element.type === 'seatRow' && element.seatPositions) {
          // Remove positions that have backendId
          element.seatPositions = element.seatPositions.filter(pos => !pos.backendId);
          // If no positions left, remove the seatRow
          if (element.seatPositions.length === 0) {
            return false;
          }
        }
        return true;
      });

      // Update the layout with processed elements (excluding deleted sections and with updated IDs)
      const updateData = {
        layoutData: {
          elements: finalElements,
          exportedAt: new Date().toISOString(),
          name: `event_${eventId}`,
          sectionsCreated: createdSections.length,
          sectionsDeleted: sectionsMarkedForDeletion.length,
          seatsCreated: createdSeats.length
        }
      };

      const updateResult = await updateEventLayout(eventLayoutID, updateData);
      if (updateResult.success) {
        const successMessage = `Layout guardado exitosamente!\nSecciones creadas: ${createdSections.length}\nSecciones eliminadas: ${deletedSectionsCount}\nAsientos creados: ${createdSeats.length}\nAsientos actualizados: ${updatedSeats.length}`;
        setSuccessMessage(successMessage);
        setShowSuccessModal(true);

        // Update local state with backend IDs (excluding deleted sections)
        pushSnapshot(updatedElementsWithExisting);

        // Asegurar que availableSectionNames esté cargado antes de recargar secciones
        await loadAvailableSectionNames();

        // Recargar secciones existentes para actualizar los mapas de sillas bloqueadas
        // Esto es importante para sincronizar el estado después de guardar
        await loadExistingSections();
      } else {
        console.error('Error updating layout with processed data: ' + (updateResult.message || 'Error desconocido'));
        alert('Error al actualizar el layout con los datos procesados');
      }

    } catch (error) {
      console.error('Error saving layout to backend:', error);
      alert('Error al guardar el layout: ' + error.message);
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

        // Load available section names first (needed for section name resolution)
        await loadAvailableSectionNames();

        // Load existing sections first to get synchronization data
        await loadExistingSections();
        await loadSeatsForEvent();

        // Synchronize section elements with backend data
        elements = elements.map(element => {
          if (element.type === 'section') {
            // Find matching section in existing sections
            const matchingSection = existingSections.find(section =>
              section.id === element.meta?.sectionId ||
              section.sectionID === element.meta?.sectionId ||
              (section.sectionNameID === element.meta?.sectionNameId &&
               Math.abs(section.price - (element.meta?.price || 0)) < 0.01)
            );

            if (matchingSection) {
              // Mark as existing section and update with backend data
              return {
                ...element,
                meta: {
                  ...element.meta,
                  isExistingSection: true,
                  sectionId: matchingSection.id || matchingSection.sectionID,
                  label: availableSectionNames.find(sn => sn.sectionNameID === matchingSection.sectionNameID)?.name || element.meta?.label || 'Sección'
                }
              };
            }
          }
          return element;
        });

        // Load seats from BD and add as chair elements if not already in elements
        const seatsFromBD = await loadSeatsForEvent();
        for (const seat of seatsFromBD) {
          // Check if this seat is already in elements as a chair
          const existingChair = elements.find(el => el.type === 'chair' && Math.abs(el.x - seat.x) < 5 && Math.abs(el.y - seat.y) < 5);
          if (!existingChair) {
            // Add as chair element
            const chairElement = {
              id: `chair-${seat.id}`,
              type: 'chair',
              x: seat.x,
              y: seat.y,
              width: 50,
              height: 50,
              fill: 'transparent',
              stroke: '#6b7280',
              row: seat.row,
              seatNumber: seat.seatNumber,
              status: seat.status,
              backendId: seat.id,
              sectionId: seat.sectionID
            };
            elements.push(chairElement);
          }
        }

        // Match loaded seats with elements to identify seats by backend ID
        elements = matchSeatsWithLayout(elements, seatsFromBD);

        dispatch({ type: 'SET_ELEMENTS', payload: elements });
        historyWrapper.pushState(elements);
        console.log('Layout cargado exitosamente desde el backend para evento:', eventIdParam);
      } else {
        console.log('No se encontró layout existente para el evento:', eventIdParam, '- Esto es normal para eventos nuevos');
        // For new events, still load existing sections if any (shouldn't happen but safety check)
        await loadExistingSections();
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

  const loadAvailableSectionNames = async () => {
    try {
      const result = await getAllSectionNames();
      if (result.success) {
        setAvailableSectionNames(result.data);
      } else {
        console.error('Error cargando nombres de sección:', result.message);
        setAvailableSectionNames([]);
      }
    } catch (error) {
      console.error('Error cargando nombres de sección:', error);
      setAvailableSectionNames([]);
    }
  };

  const loadExistingSections = async () => {
    if (!eventId) return;

    try {
      const result = await getAllSections();
      if (result.success) {
        const eventSections = result.data.filter(s => s.eventId === parseInt(eventId));
        const validSections = eventSections.filter(section => section.id || section.sectionID);
        setExistingSections(validSections);

        // Limpiar completamente los mapas antes de recargar
        const chairsMap = new Map();

        // Para cada sección existente con ID válido, cargar sus asientos
        for (const section of validSections) {
          const seatsResult = await getSeatsBySection(section.id || section.sectionID);
          if (seatsResult.success) {
            // Encontrar el nombre de la sección
            const sectionName = availableSectionNames.find(sn => sn.sectionNameID === section.sectionNameID)?.name || 'Sección';

            // Mapear asientos a elementos del canvas
            for (const seat of seatsResult.data) {
              // Buscar el elemento chair correspondiente por coordenadas
              const chairElement = elements.find(el =>
                el.type === 'chair' &&
                Math.abs(el.x - seat.x) < 5 &&
                Math.abs(el.y - seat.y) < 5
              );

              if (chairElement) {
                chairsMap.set(chairElement.id, sectionName);
              }

              // También buscar en seatRows
              const seatRowElement = elements.find(el =>
                el.type === 'seatRow' &&
                el.seatPositions &&
                el.seatPositions.some(pos =>
                  Math.abs(pos.x - seat.x) < 5 &&
                  Math.abs(pos.y - seat.y) < 5
                )
              );

              if (seatRowElement) {
                const positionIndex = seatRowElement.seatPositions.findIndex(pos =>
                  Math.abs(pos.x - seat.x) < 5 &&
                  Math.abs(pos.y - seat.y) < 5
                );
                if (positionIndex >= 0) {
                  const positionKey = `${seatRowElement.id}-${positionIndex}`;
                  chairsMap.set(positionKey, sectionName);
                }
              }
            }
          }
        }

        // Crear mapa solo para sillas de secciones existentes (ya guardadas en BD)
        const existingChairsMap = new Map();
        for (const section of eventSections) {
          const sectionName = availableSectionNames.find(sn => sn.sectionNameID === section.sectionNameID)?.name || 'Sección';
          const seatsResult = await getSeatsBySection(section.id || section.sectionID);
          if (seatsResult.success) {
            for (const seat of seatsResult.data) {
              // Buscar el elemento chair correspondiente por coordenadas
              const chairElement = elements.find(el =>
                el.type === 'chair' &&
                Math.abs(el.x - seat.x) < 5 &&
                Math.abs(el.y - seat.y) < 5
              );

              if (chairElement) {
                existingChairsMap.set(chairElement.id, sectionName);
              }

              // También buscar en seatRows
              const seatRowElement = elements.find(el =>
                el.type === 'seatRow' &&
                el.seatPositions &&
                el.seatPositions.some(pos =>
                  Math.abs(pos.x - seat.x) < 5 &&
                  Math.abs(pos.y - seat.y) < 5
                )
              );

              if (seatRowElement) {
                const positionIndex = seatRowElement.seatPositions.findIndex(pos =>
                  Math.abs(pos.x - seat.x) < 5 &&
                  Math.abs(pos.y - seat.y) < 5
                );
                if (positionIndex >= 0) {
                  const positionKey = `${seatRowElement.id}-${positionIndex}`;
                  existingChairsMap.set(positionKey, sectionName);
                }
              }
            }
          }
        }

        // Actualizar ambos mapas: mantener secciones pendientes y agregar secciones existentes
        // existingChairsWithSections solo incluye sillas de secciones ya guardadas en BD
        const updatedChairsMap = new Map(chairsWithSections);
        // Agregar sillas de secciones existentes (no sobrescribir secciones pendientes)
        for (const [key, value] of chairsMap) {
          updatedChairsMap.set(key, value);
        }
        setChairsWithSections(updatedChairsMap);
        setExistingChairsWithSections(existingChairsMap);

        // Crear elementos visuales para secciones existentes que no estén ya en el canvas
        const existingSectionElements = elements.filter(el => el.type === 'section');
        const existingSectionIds = new Set(existingSectionElements.map(el => el.meta?.sectionId || el.meta?.sectionID));
        const sectionsToCreateVisuals = validSections.filter(section => !existingSectionIds.has(section.id || section.sectionID));

        if (sectionsToCreateVisuals.length > 0) {
          // Crear elementos visuales para secciones existentes faltantes (solo para visualización)
          const sectionVisualElements = [];
          for (const section of sectionsToCreateVisuals) {
            const sectionName = availableSectionNames.find(sn => sn.sectionNameID === section.sectionNameID)?.name || 'Sección';
            const seatsResult = await getSeatsBySection(section.id || section.sectionID);

            if (seatsResult.success && seatsResult.data.length > 0) {
              // Calcular bounding box de los asientos de esta sección
              const sectionSeats = seatsResult.data;
              const minX = Math.min(...sectionSeats.map(s => s.x));
              const minY = Math.min(...sectionSeats.map(s => s.y));
              const maxX = Math.max(...sectionSeats.map(s => s.x));
              const maxY = Math.max(...sectionSeats.map(s => s.y));

              const sectionElement = {
                id: `existing-section-${section.sectionID}`,
                type: 'section',
                x: minX - 50,
                y: minY - 50,
                width: (maxX - minX) + 100,
                height: (maxY - minY) + 100,
                meta: {
                  label: sectionName,
                  price: section.price || 0,
                  category: 'General',
                  sectionId: section.id || section.sectionID,
                  sectionNameId: section.sectionNameID,
                  isExistingSection: true // Marcar como sección existente
                }
              };
              sectionVisualElements.push(sectionElement);
            }
          }

          if (sectionVisualElements.length > 0) {
            const updatedElements = [...elements, ...sectionVisualElements];
            dispatch({ type: 'SET_ELEMENTS', payload: updatedElements });
            historyWrapper.pushState(updatedElements);
          }
        }
      } else {
        console.error('Error cargando secciones existentes:', result.message);
        setExistingSections([]);
        setChairsWithSections(new Map());
      }
    } catch (error) {
      console.error('Error cargando secciones existentes:', error);
      setExistingSections([]);
      setChairsWithSections(new Map());
    }
  };

  const loadSeatsForEvent = async () => {
    if (!eventId) return;
    try {
      // Cargar secciones primero
      const sectionsResult = await getAllSections();
      if (sectionsResult.success) {
        const eventSections = sectionsResult.data.filter(s => s.eventId === parseInt(eventId));
        // Para cada sección con ID válido, cargar asientos
        const allSeats = [];
        const validSections = eventSections.filter(section => section.id || section.sectionID);
        for (const section of validSections) {
          const sectionId = section.id || section.sectionID;
          const seatsResult = await getSeatsBySection(sectionId);
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

  const matchSeatsWithLayout = (elements, seatsToMatch) => {
    const updatedElements = elements.map(element => {
      if (element.type === 'seatRow' && element.seatPositions) {
        const updatedPositions = element.seatPositions.map(position => {
          // Find matching seat by position (x, y) and seatNumber (ignore row as it may be outdated)
          const matchingSeat = seatsToMatch.find(seat =>
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
  
  const handleSectionNameChange = (sectionId, oldName, newName) => {
    const updatedChairsMap = new Map(chairsWithSections);
    const updatedExistingChairsMap = new Map(existingChairsWithSections);
    chairsWithSections.forEach((sectName, chairId) => {
      if (sectName === oldName) {
        updatedChairsMap.set(chairId, newName);
      }
    });
    existingChairsWithSections.forEach((sectName, chairId) => {
      if (sectName === oldName) {
        updatedExistingChairsMap.set(chairId, newName);
      }
    });
    setChairsWithSections(updatedChairsMap);
    setExistingChairsWithSections(updatedExistingChairsMap);
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
  // Removed polling to avoid excessive requests

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
                const newMode = !isSectionCreationMode;
                setIsSectionCreationMode(newMode);
                if (!newMode) {
                  // Al desactivar el modo, limpiar selecciones pero mantener las sillas de secciones existentes
                  setSelectedChairsForSection(new Set());
                  setSelectedSeatPositionsForSection(new Set());
                  // NO recargar las secciones existentes automáticamente para evitar sobrescribir
                  // las asignaciones de sillas a secciones nuevas que aún no están guardadas
                } else {
                  // Al activar el modo, limpiar selecciones previas
                  setSelectedChairsForSection(new Set());
                  setSelectedSeatPositionsForSection(new Set());
                }
              }}
              className={`px-3 py-1 text-sm rounded border ${isSectionCreationMode ? 'bg-purple-500 text-white border-purple-500' : 'bg-white text-gray-700 border-gray-300'}`}
            >
              🎯 Seleccionar Sillas
            </button>
            <button
              onClick={() => setShowSectionsPanel(!showSectionsPanel)}
              className={`px-3 py-1 text-sm rounded border ${showSectionsPanel ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'}`}
            >
              📋 Secciones ({elements.filter(el => el.type === 'section' && !el.meta?.markedForDeletion).length}{elements.filter(el => el.type === 'section' && el.meta?.markedForDeletion).length > 0 ? ` + ${elements.filter(el => el.type === 'section' && el.meta?.markedForDeletion).length} eliminadas` : ''})
            </button>
            {isSectionCreationMode && (selectedChairsForSection.size > 0 || selectedSeatPositionsForSection.size > 0) && (
              (() => {
                // Determinar qué botones mostrar basado en las sillas seleccionadas
                const selectedFromSection = new Set();
                const selectedNotFromSection = new Set();

                selectedChairsForSection.forEach(chairId => {
                  if (chairsWithSections.get(chairId) === editingSection?.meta?.label) {
                    selectedFromSection.add(chairId);
                  } else {
                    selectedNotFromSection.add(chairId);
                  }
                });

                selectedSeatPositionsForSection.forEach(posKey => {
                  if (chairsWithSections.get(posKey) === editingSection?.meta?.label) {
                    selectedFromSection.add(posKey);
                  } else {
                    selectedNotFromSection.add(posKey);
                  }
                });

                const showAddButton = selectedNotFromSection.size > 0;
                const showRemoveButton = selectedFromSection.size > 0;

                return editingSection ? (
                  // Modo edición: botones dinámicos
                  <div className="flex gap-2">
                    {showAddButton && (
                      <button
                        onClick={() => {
                          // Agregar sillas seleccionadas a la sección existente
                          if (selectedChairsForSection.size + selectedSeatPositionsForSection.size === 0) {
                            alert('No hay sillas seleccionadas para agregar');
                            return;
                          }

                          // Verificar que no se estén intentando agregar sillas que ya pertenecen a otras secciones
                          const conflictingChairs = [];
                          selectedChairsForSection.forEach(chairId => {
                            const sectionName = chairsWithSections.get(chairId);
                            if (sectionName && sectionName !== editingSection.meta?.label) {
                              conflictingChairs.push(`${sectionName} (silla)`);
                            }
                          });
                          selectedSeatPositionsForSection.forEach(posKey => {
                            const sectionName = chairsWithSections.get(posKey);
                            if (sectionName && sectionName !== editingSection.meta?.label) {
                              conflictingChairs.push(`${sectionName} (posición)`);
                            }
                          });

                          if (conflictingChairs.length > 0) {
                            alert(`No se pueden agregar sillas que pertenecen a otras secciones: ${conflictingChairs.join(', ')}`);
                            return;
                          }

                          // Calcular nuevo bounding box con todas las sillas (existentes + nuevas)
                          const allChairElements = [];
                          const sectionName = editingSection.meta?.label;

                          // Agregar sillas existentes de la sección
                          const currentChairs = editingSection.meta?.selectedChairs || [];
                          const currentPositions = editingSection.meta?.selectedSeatPositions || [];

                          currentChairs.forEach(chairId => {
                            const chairEl = elements.find(el => el.id === chairId);
                            if (chairEl) allChairElements.push(chairEl);
                          });

                          currentPositions.forEach(posKey => {
                            const [seatRowId, seatIndex] = posKey.split('-');
                            const seatRow = elements.find(el => el.id === seatRowId);
                            if (seatRow && seatRow.seatPositions && seatRow.seatPositions[seatIndex]) {
                              allChairElements.push({
                                x: seatRow.seatPositions[seatIndex].x,
                                y: seatRow.seatPositions[seatIndex].y
                              });
                            }
                          });

                          // Agregar sillas nuevas seleccionadas
                          selectedChairsForSection.forEach(chairId => {
                            const chairEl = elements.find(el => el.id === chairId);
                            if (chairEl) allChairElements.push(chairEl);
                          });

                          selectedSeatPositionsForSection.forEach(posKey => {
                            const [seatRowId, seatIndex] = posKey.split('-');
                            const seatRow = elements.find(el => el.id === seatRowId);
                            if (seatRow && seatRow.seatPositions && seatRow.seatPositions[seatIndex]) {
                              allChairElements.push({
                                x: seatRow.seatPositions[seatIndex].x,
                                y: seatRow.seatPositions[seatIndex].y
                              });
                            }
                          });

                          // Calcular nuevo bounding box
                          const newBoundingBox = {
                            x: (Math.min(...allChairElements.map(c => c.x)) + Math.max(...allChairElements.map(c => c.x))) / 2,
                            y: (Math.min(...allChairElements.map(c => c.y)) + Math.max(...allChairElements.map(c => c.y))) / 2,
                            width: Math.max(...allChairElements.map(c => c.x)) - Math.min(...allChairElements.map(c => c.x)) + 100,
                            height: Math.max(...allChairElements.map(c => c.y)) - Math.min(...allChairElements.map(c => c.y)) + 100
                          };

                          // Agregar las sillas a la sección y actualizar bounding box
                          const updatedElements = elements.map(el => {
                            if (el.id === editingSection.id) {
                              const newChairs = Array.from(selectedChairsForSection);
                              const newPositions = Array.from(selectedSeatPositionsForSection);

                              return {
                                ...el,
                                x: newBoundingBox.x,
                                y: newBoundingBox.y,
                                width: newBoundingBox.width,
                                height: newBoundingBox.height,
                                meta: {
                                  ...el.meta,
                                  selectedChairs: [...new Set([...currentChairs, ...newChairs])],
                                  selectedSeatPositions: [...new Set([...currentPositions, ...newPositions])],
                                  isModified: true
                                }
                              };
                            }
                            return el;
                          });

                          pushSnapshot(updatedElements);

                          // Actualizar mapas de sillas
                          const updatedChairsMap = new Map(chairsWithSections);
                          selectedChairsForSection.forEach(chairId => {
                            updatedChairsMap.set(chairId, sectionName);
                          });
                          selectedSeatPositionsForSection.forEach(posKey => {
                            updatedChairsMap.set(posKey, sectionName);
                          });
                          setChairsWithSections(updatedChairsMap);

                          // Limpiar selecciones y salir del modo edición
                          setSelectedChairsForSection(new Set());
                          setSelectedSeatPositionsForSection(new Set());
                          setEditingSection(null);
                          setIsSectionCreationMode(false);

                          alert(`✅ Agregadas ${selectedChairsForSection.size + selectedSeatPositionsForSection.size} sillas a la sección "${sectionName}"`);
                        }}
                        className="px-4 py-2 text-sm rounded border bg-green-500 text-white border-green-500 hover:bg-green-600"
                        title="Agregar sillas seleccionadas a la sección"
                      >
                        ➕ Agregar ({selectedNotFromSection.size})
                      </button>
                    )}

                    {showRemoveButton && (
                      <button
                        onClick={() => {
                          // Quitar sillas seleccionadas de la sección existente
                          const sectionName = editingSection.meta?.label;

                          if (selectedChairsForSection.size + selectedSeatPositionsForSection.size === 0) {
                            alert('No hay sillas seleccionadas para quitar. Selecciona las sillas que quieres quitar de la sección.');
                            return;
                          }

                          // Verificar que las sillas seleccionadas pertenezcan a esta sección
                          const validChairsToRemove = [];
                          const validPositionsToRemove = [];

                          selectedChairsForSection.forEach(chairId => {
                            if (chairsWithSections.get(chairId) === sectionName) {
                              validChairsToRemove.push(chairId);
                            }
                          });
                          selectedSeatPositionsForSection.forEach(posKey => {
                            if (chairsWithSections.get(posKey) === sectionName) {
                              validPositionsToRemove.push(posKey);
                            }
                          });

                          if (validChairsToRemove.length + validPositionsToRemove.length === 0) {
                            alert('Las sillas seleccionadas no pertenecen a esta sección. Solo puedes quitar sillas que ya están en la sección que estás editando.');
                            return;
                          }

                          // Verificar que queden al menos algunas sillas en la sección
                          const currentChairs = editingSection.meta?.selectedChairs || [];
                          const currentPositions = editingSection.meta?.selectedSeatPositions || [];
                          const remainingChairs = currentChairs.filter(id => !validChairsToRemove.includes(id));
                          const remainingPositions = currentPositions.filter(key => !validPositionsToRemove.includes(key));

                          if (remainingChairs.length + remainingPositions.length === 0) {
                            alert('No puedes quitar todas las sillas de la sección. Debe quedar al menos una silla.');
                            return;
                          }

                          // Calcular nuevo bounding box con las sillas restantes
                          const remainingChairElements = [];

                          // Agregar sillas restantes
                          remainingChairs.forEach(chairId => {
                            const chairEl = elements.find(el => el.id === chairId);
                            if (chairEl) remainingChairElements.push(chairEl);
                          });

                          remainingPositions.forEach(posKey => {
                            const [seatRowId, seatIndex] = posKey.split('-');
                            const seatRow = elements.find(el => el.id === seatRowId);
                            if (seatRow && seatRow.seatPositions && seatRow.seatPositions[seatIndex]) {
                              remainingChairElements.push({
                                x: seatRow.seatPositions[seatIndex].x,
                                y: seatRow.seatPositions[seatIndex].y
                              });
                            }
                          });

                          // Calcular nuevo bounding box
                          let newBoundingBox = null;
                          if (remainingChairElements.length > 0) {
                            newBoundingBox = {
                              x: (Math.min(...remainingChairElements.map(c => c.x)) + Math.max(...remainingChairElements.map(c => c.x))) / 2,
                              y: (Math.min(...remainingChairElements.map(c => c.y)) + Math.max(...remainingChairElements.map(c => c.y))) / 2,
                              width: Math.max(...remainingChairElements.map(c => c.x)) - Math.min(...remainingChairElements.map(c => c.x)) + 100,
                              height: Math.max(...remainingChairElements.map(c => c.y)) - Math.min(...remainingChairElements.map(c => c.y)) + 100
                            };
                          }

                          // Quitar las sillas de la sección y actualizar bounding box
                          const updatedElements = elements.map(el => {
                            if (el.id === editingSection.id) {
                              const updateData = {
                                meta: {
                                  ...el.meta,
                                  selectedChairs: remainingChairs,
                                  selectedSeatPositions: remainingPositions,
                                  isModified: true
                                }
                              };

                              // Actualizar bounding box si hay sillas restantes
                              if (newBoundingBox) {
                                updateData.x = newBoundingBox.x;
                                updateData.y = newBoundingBox.y;
                                updateData.width = newBoundingBox.width;
                                updateData.height = newBoundingBox.height;
                              }

                              return { ...el, ...updateData };
                            }
                            return el;
                          });

                          pushSnapshot(updatedElements);

                          // Actualizar mapas de sillas (liberar las sillas quitadas)
                          const updatedChairsMap = new Map(chairsWithSections);
                          validChairsToRemove.forEach(chairId => {
                            updatedChairsMap.delete(chairId);
                          });
                          validPositionsToRemove.forEach(posKey => {
                            updatedChairsMap.delete(posKey);
                          });
                          setChairsWithSections(updatedChairsMap);

                          // Limpiar selecciones y salir del modo edición
                          setSelectedChairsForSection(new Set());
                          setSelectedSeatPositionsForSection(new Set());
                          setEditingSection(null);
                          setIsSectionCreationMode(false);

                          alert(`✅ Quitadas ${validChairsToRemove.length + validPositionsToRemove.length} sillas de la sección "${sectionName}"`);
                        }}
                        className="px-4 py-2 text-sm rounded border bg-red-500 text-white border-red-500 hover:bg-red-600"
                        title="Quitar sillas seleccionadas de la sección"
                      >
                        ➖ Quitar ({selectedFromSection.size})
                      </button>
                    )}
                  </div>
                ) : (
                  // Modo creación: botón normal
                  <button
                    onClick={() => setShowSectionCreationModal(true)}
                    className="px-4 py-2 text-sm rounded border bg-green-500 text-white border-green-500 hover:bg-green-600"
                  >
                    ✅ Crear Sección ({selectedChairsForSection.size + selectedSeatPositionsForSection.size} sillas)
                  </button>
                );
              })()
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
          <span>Elementos: {(elements?.filter(el => !(el.type === 'section' && el.meta?.markedForDeletion)) || []).length}</span>
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
            <h3 className="text-lg font-semibold mb-4">
              {editingSection ? `Editar Sección "${editingSection.meta?.label || 'Sin nombre'}"` : 'Crear Nueva Sección'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Sección</label>
                <select
                  value={newSectionData.sectionNameId}
                  onChange={(e) => setNewSectionData(prev => ({ ...prev, sectionNameId: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded"
                  autoFocus
                >
                  <option value="">Selecciona un nombre de sección</option>
                  {availableSectionNames.map(sectionName => (
                    <option key={sectionName.sectionNameID} value={sectionName.sectionNameID}>
                      {sectionName.name}
                    </option>
                  ))}
                </select>
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
                {editingSection ? (
                  <>
                    Sillas actuales: {selectedChairsForSection.size + selectedSeatPositionsForSection.size}
                    <br />
                    <span className="text-blue-600">Selecciona sillas adicionales para agregar a la sección</span>
                  </>
                ) : (
                  `Sillas seleccionadas: ${selectedChairsForSection.size + selectedSeatPositionsForSection.size}`
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  if (editingSection) {
                    // Modo edición: actualizar la sección existente con las nuevas sillas
                    if (selectedChairsForSection.size + selectedSeatPositionsForSection.size === 0) {
                      alert('La sección debe tener al menos una silla');
                      return;
                    }

                    // Actualizar el elemento de sección existente
                    const updatedElements = elements.map(el => {
                      if (el.id === editingSection.id) {
                        return {
                          ...el,
                          meta: {
                            ...el.meta,
                            selectedChairs: Array.from(selectedChairsForSection),
                            selectedSeatPositions: Array.from(selectedSeatPositionsForSection),
                            // Marcar como modificada para usar PUT al guardar
                            isModified: true
                          }
                        };
                      }
                      return el;
                    });

                    pushSnapshot(updatedElements);

                    // Actualizar el mapa de sillas
                    const updatedChairsMap = new Map(chairsWithSections);
                    const updatedExistingChairsMap = new Map(existingChairsWithSections);
                    const sectionName = editingSection.meta?.label || 'Sección';

                    // Agregar sillas nuevas (esto incluye sillas "robadas" de otras secciones)
                    selectedChairsForSection.forEach(chairId => {
                      updatedChairsMap.set(chairId, sectionName);
                      // Si era una silla existente de otra sección, marcar que necesita ser actualizada
                      if (existingChairsWithSections.has(chairId) && existingChairsWithSections.get(chairId) !== sectionName) {
                        updatedExistingChairsMap.set(chairId, sectionName);
                      }
                    });
                    selectedSeatPositionsForSection.forEach(positionKey => {
                      updatedChairsMap.set(positionKey, sectionName);
                      // Si era una silla existente de otra sección, marcar que necesita ser actualizada
                      if (existingChairsWithSections.has(positionKey) && existingChairsWithSections.get(positionKey) !== sectionName) {
                        updatedExistingChairsMap.set(positionKey, sectionName);
                      }
                    });

                    setChairsWithSections(updatedChairsMap);
                    setExistingChairsWithSections(updatedExistingChairsMap);

                    // Limpiar estado
                    setShowSectionCreationModal(false);
                    setEditingSection(null);
                    setSelectedChairsForSection(new Set());
                    setSelectedSeatPositionsForSection(new Set());

                    alert(`✅ Sección "${sectionName}" actualizada con ${selectedChairsForSection.size + selectedSeatPositionsForSection.size} asientos.\n\nLos cambios se guardarán cuando guardes el layout.`);

                    // Resetear modo
                    setIsSectionCreationMode(false);

                  } else {
                    // Modo creación: crear nueva sección
                    if (!newSectionData.sectionNameId) {
                      alert('Por favor selecciona un nombre para la sección');
                      return;
                    }

                    if (!newSectionData.price || newSectionData.price <= 0) {
                      alert('El precio de la sección debe ser mayor a 0');
                      return;
                    }

                    // Obtener el nombre del SectionName seleccionado
                    const selectedSectionName = availableSectionNames.find(sn => sn.sectionNameID === parseInt(newSectionData.sectionNameId));
                    const sectionNameLabel = selectedSectionName ? selectedSectionName.name : 'Sección';

                    // Verificar si ya existe una sección con este nombre en el diseño actual
                    const existingSectionWithSameName = elements
                      .filter(el => el.type === 'section' && !el.meta?.markedForDeletion)
                      .find(section => section.meta?.label === sectionNameLabel);

                    if (existingSectionWithSameName) {
                      alert(`Ya existe una sección con el nombre "${sectionNameLabel}" en el diseño actual.\n\nPor favor selecciona un nombre diferente o elimina la sección existente primero.`);
                      return;
                    }

                    // Calcular bounding box de todas las sillas seleccionadas
                    const allSelectedElements = [];

                    // Agregar sillas individuales
                    const selectedChairElements = elements.filter(el => selectedChairsForSection.has(el.id));
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

                    if (allSelectedElements.length === 0) {
                      setErrorMessage('Por favor selecciona al menos una silla para la sección');
                      setShowErrorModal(true);
                      return;
                    }

                    // Calcular el rectángulo de la nueva sección
                    const newSectionRect = {
                      x: (Math.min(...allSelectedElements.map(c => c.x)) + Math.max(...allSelectedElements.map(c => c.x))) / 2,
                      y: (Math.min(...allSelectedElements.map(c => c.y)) + Math.max(...allSelectedElements.map(c => c.y))) / 2,
                      width: Math.max(...allSelectedElements.map(c => c.x)) - Math.min(...allSelectedElements.map(c => c.x)) + 100,
                      height: Math.max(...allSelectedElements.map(c => c.y)) - Math.min(...allSelectedElements.map(c => c.y)) + 100
                    };

                    // Verificar solapamiento con secciones existentes
                    if (checkSectionOverlap(newSectionRect)) {
                      alert('❌ No se puede crear la sección aquí porque se solapa con una sección existente.\n\nPor favor, selecciona sillas en un área sin secciones o elimina la sección existente primero.');
                      return;
                    }

                    // Crear elemento visual de sección con información completa para guardar después
                    const sectionElement = {
                      id: nanoid(),
                      type: 'section',
                      x: newSectionRect.x,
                      y: newSectionRect.y,
                      width: newSectionRect.width,
                      height: newSectionRect.height,
                      meta: {
                        label: sectionNameLabel,
                        price: newSectionData.price,
                        sectionNameId: parseInt(newSectionData.sectionNameId),
                        category: 'General',
                        // Guardar referencias a las sillas seleccionadas para crear en backend después
                        selectedChairs: Array.from(selectedChairsForSection),
                        selectedSeatPositions: Array.from(selectedSeatPositionsForSection)
                      }
                    };

                    pushSnapshot([...elements, sectionElement]);

                    // Actualizar el mapa de sillas asociadas con la nueva sección
                    // Esto incluye "robar" sillas de otras secciones si es necesario
                    const updatedChairsMap = new Map(chairsWithSections);
                    const updatedExistingChairsMap = new Map(existingChairsWithSections);

                    selectedChairElements.forEach(chair => {
                      updatedChairsMap.set(chair.id, sectionNameLabel);
                      // Si era una silla existente, marcar que necesita ser actualizada
                      if (existingChairsWithSections.has(chair.id)) {
                        updatedExistingChairsMap.set(chair.id, sectionNameLabel);
                      }
                    });
                    selectedSeatPositionsForSection.forEach(positionKey => {
                      updatedChairsMap.set(positionKey, sectionNameLabel);
                      // Si era una silla existente, marcar que necesita ser actualizada
                      if (existingChairsWithSections.has(positionKey)) {
                        updatedExistingChairsMap.set(positionKey, sectionNameLabel);
                      }
                    });

                    setChairsWithSections(updatedChairsMap);
                    setExistingChairsWithSections(updatedExistingChairsMap);

                    // Limpiar estado
                    setShowSectionCreationModal(false);
                    setNewSectionData({ sectionNameId: '', price: 0 });
                    setSelectedChairsForSection(new Set());
                    setSelectedSeatPositionsForSection(new Set());

                    // Mostrar notificación de éxito
                    const successMessage = `✅ Sección "${sectionNameLabel}" agregada al diseño con ${allSelectedElements.length} asientos.\n\nIMPORTANTE: Las secciones y asientos se crearán en el sistema solo cuando guardes el layout.`;
                    setSuccessMessage(successMessage);
                    setShowSuccessModal(true);

                    // Resetear automáticamente el modo de selección
                    setIsSectionCreationMode(false);
                  }
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {editingSection ? 'Actualizar Sección' : 'Agregar al Diseño'}
              </button>
              <button
                onClick={() => {
                  setShowSectionCreationModal(false);
                  setNewSectionData({ sectionNameId: '', price: 0 });
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
            elements={(elements || []).filter(el => !(el.type === 'section' && el.meta?.markedForDeletion))}
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
            chairsWithSections={chairsWithSections}
            existingChairsWithSections={existingChairsWithSections}
            onChairSelectForSection={(chairId) => {
              // Verificar si la silla ya pertenece a alguna sección
              if (chairsWithSections.has(chairId)) {
                const sectionName = chairsWithSections.get(chairId);
                const isExisting = existingChairsWithSections.has(chairId);

                // Si la silla pertenece a otra sección (no la que estamos editando), permitir "robarla" pero con confirmación
                if (!editingSection || sectionName !== editingSection.meta?.label) {
                  const message = isExisting
                    ? `(ya guardada en el sistema)`
                    : `(pendiente de guardar)`;

                  const confirmMessage = `Esta silla ya pertenece a la sección "${sectionName}" ${message}.\n\n¿Quieres mover esta silla a la nueva sección? La silla será removida de "${sectionName}" y agregada a la sección actual.`;

                  if (!window.confirm(confirmMessage)) {
                    return;
                  }

                  // Si confirma, proceder con la selección (la silla será movida)
                }
              }

              const newSelected = new Set(selectedChairsForSection);
              if (newSelected.has(chairId)) {
                newSelected.delete(chairId);
              } else {
                newSelected.add(chairId);
              }
              setSelectedChairsForSection(newSelected);
            }}
            onSeatPositionSelectForSection={(positionKey) => {
              // Verificar si la posición ya pertenece a alguna sección
              if (chairsWithSections.has(positionKey)) {
                const sectionName = chairsWithSections.get(positionKey);
                const isExisting = existingChairsWithSections.has(positionKey);

                // Si la silla pertenece a otra sección (no la que estamos editando), permitir "robarla" pero con confirmación
                if (!editingSection || sectionName !== editingSection.meta?.label) {
                  const message = isExisting
                    ? `(ya guardada en el sistema)`
                    : `(pendiente de guardar)`;

                  const confirmMessage = `Esta silla ya pertenece a la sección "${sectionName}" ${message}.\n\n¿Quieres mover esta silla a la nueva sección? La silla será removida de "${sectionName}" y agregada a la sección actual.`;

                  if (!window.confirm(confirmMessage)) {
                    return;
                  }

                  // Si confirma, proceder con la selección (la silla será movida)
                }
              }

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
          availableSectionNames={availableSectionNames}
          onSectionNameChange={handleSectionNameChange}
        />

        {/* Panel de Secciones */}
        {showSectionsPanel && (
          <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Secciones del Diseño</h3>
              <button
                onClick={() => setShowSectionsPanel(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              {(() => {
                const allSections = elements.filter(el => el.type === 'section');
                const visibleSections = allSections.filter(el => !el.meta?.markedForDeletion);
                const markedForDeletionSections = allSections.filter(el => el.meta?.markedForDeletion);

                if (allSections.length === 0) {
                  return (
                    <p className="text-gray-500 text-sm text-center py-8">
                      No hay secciones en el diseño actual
                    </p>
                  );
                }

                return (
                  <>
                    {/* Secciones visibles */}
                    {visibleSections.map(section => {
                      const isExistingSection = section.meta?.isExistingSection;
                      const sectionName = section.meta?.label || 'Sin nombre';
                      const price = section.meta?.price || 0;
                      const selectedChairs = section.meta?.selectedChairs?.length || 0;
                      const selectedPositions = section.meta?.selectedSeatPositions?.length || 0;
                      const totalSeats = selectedChairs + selectedPositions;

                      return (
                        <div
                          key={section.id}
                          className={`border rounded-lg p-3 ${
                            isExistingSection
                              ? 'border-green-300 bg-green-50'
                              : 'border-purple-300 bg-purple-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-800">{sectionName}</h4>
                            <span className={`px-2 py-1 text-xs rounded ${
                              isExistingSection
                                ? 'bg-green-600 text-white'
                                : 'bg-purple-600 text-white'
                            }`}>
                              {isExistingSection ? 'Guardada' : 'Pendiente'}
                            </span>
                          </div>

                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Precio: ${price}</div>
                            <div>Asientos: {totalSeats}</div>
                            <div>Categoría: {section.meta?.category || 'General'}</div>
                          </div>

                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => {
                                // Centrar la vista en la sección Y entrar en modo edición
                                const centerX = section.x;
                                const centerY = section.y;
                                // Usar dimensiones aproximadas del canvas (ajustar según necesidad)
                                const canvasWidth = 800; // Ancho aproximado del canvas
                                const canvasHeight = 600; // Alto aproximado del canvas
                                setOffset({
                                  x: centerX - (canvasWidth / zoom) / 2,
                                  y: centerY - (canvasHeight / zoom) / 2
                                });
                                dispatch({ type: 'SET_SELECTED', payload: section.id });

                                // Entrar en modo edición para esta sección
                                setEditingSection(section);
                                setIsSectionCreationMode(true);

                                // NO preseleccionar sillas automáticamente - el usuario seleccionará cuáles quitar
                                // Las sillas de la sección estarán visibles pero no seleccionadas
                                setSelectedChairsForSection(new Set());
                                setSelectedSeatPositionsForSection(new Set());
                              }}
                              className="flex-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Ver/Editar
                            </button>

                            {isExistingSection ? (
                              <>
                                <button
                                  onClick={() => {
                                    // Entrar en modo edición para agregar más sillas
                                    setEditingSection(section);
                                    setIsSectionCreationMode(true);
                                    // Pre-seleccionar las sillas existentes de esta sección
                                    const existingChairs = new Set();
                                    const existingPositions = new Set();

                                    // Buscar sillas que pertenecen a esta sección
                                    const targetSectionName = section.meta?.label;
                                    chairsWithSections.forEach((sectName, chairId) => {
                                      if (sectName === targetSectionName) {
                                        if (chairId.includes('-')) {
                                          existingPositions.add(chairId);
                                        } else {
                                          existingChairs.add(chairId);
                                        }
                                      }
                                    });

                                    setSelectedChairsForSection(existingChairs);
                                    setSelectedSeatPositionsForSection(existingPositions);
                                  }}
                                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                                  title="Agregar más sillas a esta sección"
                                >
                                  ➕
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`¿Estás seguro de que quieres eliminar la sección "${sectionName}" del diseño?\n\nLas sillas de esta sección quedarán disponibles inmediatamente. La eliminación se completará cuando guardes el layout.`)) {
                                      console.log('Marking section for deletion:', section);

                                      // Marcar la sección como eliminada en el JSON del layout
                                      const updatedElements = elements.map(el => {
                                        if (el.id === section.id) {
                                          console.log('Section meta before marking:', el.meta);
                                          return {
                                            ...el,
                                            meta: {
                                              ...el.meta,
                                              markedForDeletion: true
                                            }
                                          };
                                        }
                                        return el;
                                      });

                                      // Liberar inmediatamente las sillas de esta sección
                                      const updatedChairsMap = new Map(chairsWithSections);
                                      const updatedExistingChairsMap = new Map(existingChairsWithSections);

                                      // Buscar y liberar todas las sillas que pertenecían a esta sección
                                      chairsWithSections.forEach((sectName, chairId) => {
                                        if (sectName === sectionName) {
                                          updatedChairsMap.delete(chairId);
                                          updatedExistingChairsMap.delete(chairId);
                                        }
                                      });

                                      // También liberar sillas que podrían estar en existingChairsWithSections
                                      // con el mismo nombre de sección (por si hay inconsistencias)
                                      existingChairsWithSections.forEach((sectName, chairId) => {
                                        if (sectName === sectionName) {
                                          updatedChairsMap.delete(chairId);
                                          updatedExistingChairsMap.delete(chairId);
                                        }
                                      });

                                      setChairsWithSections(updatedChairsMap);
                                      setExistingChairsWithSections(updatedExistingChairsMap);

                                      pushSnapshot(updatedElements);
                                      dispatch({ type: 'SET_SELECTED', payload: null });

                                      alert(`✅ Sección "${sectionName}" marcada para eliminar.\n\nLas sillas están ahora disponibles. Recuerda guardar el layout para completar la eliminación.`);
                                    }
                                  }}
                                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                  title="Marcar sección para eliminar (se completará al guardar)"
                                >
                                  🗑️
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  if (window.confirm(`¿Estás seguro de que quieres eliminar la sección "${sectionName}" del diseño?\n\nEsta acción no se puede deshacer.`)) {
                                    // Eliminar la sección del diseño inmediatamente (sección pendiente)
                                    const updatedElements = elements.filter(el => el.id !== section.id);

                                    // Limpiar las referencias de sillas asociadas a esta sección
                                    const updatedChairsMap = new Map(chairsWithSections);
                                    if (section.meta?.selectedChairs) {
                                      section.meta.selectedChairs.forEach(chairId => {
                                        updatedChairsMap.delete(chairId);
                                      });
                                    }
                                    if (section.meta?.selectedSeatPositions) {
                                      section.meta.selectedSeatPositions.forEach(positionKey => {
                                        updatedChairsMap.delete(positionKey);
                                      });
                                    }
                                    setChairsWithSections(updatedChairsMap);

                                    pushSnapshot(updatedElements);
                                    dispatch({ type: 'SET_SELECTED', payload: null });
                                  }
                                }}
                                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Secciones marcadas para eliminación */}
                    {markedForDeletionSections.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                          Secciones marcadas para eliminar
                        </h4>
                        {markedForDeletionSections.map(section => {
                          const sectionName = section.meta?.label || 'Sin nombre';
                          const price = section.meta?.price || 0;

                          return (
                            <div
                              key={section.id}
                              className="border border-red-300 bg-red-50 rounded-lg p-3 mb-2"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-800">{sectionName}</h4>
                                <span className="px-2 py-1 text-xs rounded bg-red-600 text-white">
                                  Para eliminar
                                </span>
                              </div>

                              <div className="text-sm text-gray-600 space-y-1">
                                <div>Precio: ${price}</div>
                                <div className="text-red-600 font-medium">
                                  Se eliminará al guardar el layout
                                </div>
                              </div>

                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => {
                                    // Restaurar la sección (quitar marca de eliminación)
                                    const updatedElements = elements.map(el => {
                                      if (el.id === section.id) {
                                        const { markedForDeletion, ...cleanMeta } = el.meta;
                                        return {
                                          ...el,
                                          meta: cleanMeta
                                        };
                                      }
                                      return el;
                                    });

                                    // Restaurar las referencias de sillas
                                    const updatedChairsMap = new Map(chairsWithSections);
                                    const updatedExistingChairsMap = new Map(existingChairsWithSections);

                                    // Buscar y restaurar todas las sillas que pertenecían a esta sección
                                    // (esto requiere que guardemos las referencias antes de marcar para eliminación)
                                    // Por simplicidad, recargamos las secciones existentes
                                    loadExistingSections();

                                    pushSnapshot(updatedElements);
                                    dispatch({ type: 'SET_SELECTED', payload: null });

                                    alert(`✅ Sección "${sectionName}" restaurada.\n\nLas sillas volverán a estar asociadas a esta sección.`);
                                  }}
                                  className="flex-1 px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                  title="Restaurar sección"
                                >
                                  ↶ Restaurar
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Total secciones:</span>
                  <span className="font-medium">{elements.filter(el => el.type === 'section').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Visibles:</span>
                  <span className="font-medium text-blue-600">
                    {elements.filter(el => el.type === 'section' && !el.meta?.markedForDeletion).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Guardadas:</span>
                  <span className="font-medium text-green-600">
                    {elements.filter(el => el.type === 'section' && el.meta?.isExistingSection && !el.meta?.markedForDeletion).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pendientes:</span>
                  <span className="font-medium text-purple-600">
                    {elements.filter(el => el.type === 'section' && !el.meta?.isExistingSection && !el.meta?.markedForDeletion).length}
                  </span>
                </div>
                {elements.filter(el => el.type === 'section' && el.meta?.markedForDeletion).length > 0 && (
                  <div className="flex justify-between">
                    <span>Para eliminar:</span>
                    <span className="font-medium text-red-600">
                      {elements.filter(el => el.type === 'section' && el.meta?.markedForDeletion).length}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de éxito */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white rounded-full p-3">
                  <CheckCircle className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">¡Éxito!</h3>
              <p className="text-purple-100 text-sm">Operación completada</p>
            </div>

            {/* Contenido */}
            <div className="p-6 text-center">
              <div className="mb-6">
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <span className="text-green-800 text-sm">{successMessage}</span>
                </div>
              </div>

              {/* Botón para continuar */}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-sm flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Continuar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de error */}
      {showErrorModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header con gradiente morado */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white rounded-full p-3">
                  <X className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Error</h3>
              <p className="text-purple-100 text-sm">No se puede completar la acción</p>
            </div>

            {/* Contenido */}
            <div className="p-6 text-center">
              <div className="mb-6">
                <div className="bg-red-50 rounded-lg p-4 mb-4">
                  <span className="text-red-800 text-sm">{errorMessage}</span>
                </div>
              </div>

              {/* Botón para continuar */}
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-sm flex items-center justify-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Entendido</span>
              </button>
            </div>
          </div>
        </div>
      )}

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