import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Users, MapPin } from 'lucide-react';
import { getSeatsBySection, updateSeatStatus, createSeat, updateSeat, deleteSeat } from '../services/SeatService.js';
import { getAllSections } from '../services/SectionService.js';
import { getEventLayoutByEventId } from '../services/EventLayoutService.js';

const SeatManagement = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');

  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSeat, setEditingSeat] = useState(null);

  const [formData, setFormData] = useState({
    seatNumber: '',
    row: '',
    status: 'AVAILABLE'
  });

  useEffect(() => {
    loadSections();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      loadSeats();
    }
  }, [selectedSection]);

  const loadSections = async () => {
    try {
      setLoading(true);
      const result = await getAllSections();
      if (result.success) {
        // Filter sections by event if eventId is provided
        const filteredSections = eventId
          ? result.data.filter(section => section.event?.id === parseInt(eventId))
          : result.data;
        setSections(filteredSections);
        if (filteredSections.length > 0) {
          setSelectedSection(filteredSections[0]);
        }
      } else {
        setError(result.message || 'Error cargando secciones');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error loading sections:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSeats = async () => {
    if (!selectedSection) return;

    try {
      setLoading(true);
      const result = await getSeatsBySection(selectedSection.id);
      if (result.success) {
        setSeats(result.data);
      } else {
        setError(result.message || 'Error cargando asientos');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error loading seats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (seatId, newStatus) => {
    try {
      const result = await updateSeatStatus(seatId, newStatus);
      if (result.success) {
        loadSeats(); // Reload seats
      } else {
        setError(result.message || 'Error actualizando estado');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error updating seat status:', err);
    }
  };

  const handleCreateSeat = async (e) => {
    e.preventDefault();
    try {
      const seatData = {
        ...formData,
        section: { id: selectedSection.id }
      };

      const result = editingSeat
        ? await updateSeat(editingSeat.id, seatData)
        : await createSeat(seatData);

      if (result.success) {
        setShowCreateModal(false);
        setEditingSeat(null);
        setFormData({ seatNumber: '', row: '', status: 'AVAILABLE' });
        loadSeats();
      } else {
        setError(result.message || 'Error guardando asiento');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error saving seat:', err);
    }
  };

  const handleEditSeat = (seat) => {
    setEditingSeat(seat);
    setFormData({
      seatNumber: seat.seatNumber,
      row: seat.row,
      status: seat.status
    });
    setShowCreateModal(true);
  };

  const handleDeleteSeat = async (seatId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este asiento?')) {
      try {
        const result = await deleteSeat(seatId);
        if (result.success) {
          loadSeats();
        } else {
          setError(result.message || 'Error eliminando asiento');
        }
      } catch (err) {
        setError('Error de conexión');
        console.error('Error deleting seat:', err);
      }
    }
  };

  const generateSeatsFromLayout = async () => {
    if (!eventId || !selectedSection) return;

    try {
      setLoading(true);
      const layoutResult = await getEventLayoutByEventId(eventId);

      if (layoutResult.success && layoutResult.data?.layoutData?.elements) {
        const elements = layoutResult.data.layoutData.elements;
        const seatRows = elements.filter(el => el.type === 'seatRow');

        let seatsCreated = 0;

        for (const seatRow of seatRows) {
          if (seatRow.seatPositions) {
            for (const seatPos of seatRow.seatPositions) {
              const seatData = {
                seatNumber: seatPos.seatNumber.toString(),
                row: seatPos.row,
                status: 'AVAILABLE',
                section: { id: selectedSection.id },
                x: Math.round(seatPos.x),
                y: Math.round(seatPos.y)
              };

              try {
                await createSeat(seatData);
                seatsCreated++;
              } catch (error) {
                console.log('Seat might already exist:', error);
              }
            }
          }
        }

        if (seatsCreated > 0) {
          alert(`¡${seatsCreated} asientos generados exitosamente desde el layout!`);
          loadSeats();
        } else {
          alert('No se encontraron filas de asientos en el layout o ya existen todos los asientos.');
        }
      } else {
        setError('No se encontró layout para este evento');
      }
    } catch (err) {
      setError('Error generando asientos desde layout');
      console.error('Error generating seats from layout:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'OCCUPIED': return 'bg-red-100 text-red-800';
      case 'RESERVED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'Disponible';
      case 'OCCUPIED': return 'Ocupado';
      case 'RESERVED': return 'Reservado';
      default: return status;
    }
  };

  if (loading && sections.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Cargando gestión de asientos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </button>
            <h1 className="text-2xl font-bold">Gestión de Asientos</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={generateSeatsFromLayout}
              disabled={loading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 px-4 py-2 rounded-lg transition-colors"
              title="Generar asientos desde el layout del evento"
            >
              <MapPin className="w-4 h-4" />
              Generar desde Layout
            </button>
            <button
              onClick={() => {
                setEditingSeat(null);
                setFormData({ seatNumber: '', row: '', status: 'AVAILABLE' });
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo Asiento
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right ml-4"
            >
              ×
            </button>
          </div>
        )}

        {/* Section Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Seleccionar Sección
          </label>
          <select
            value={selectedSection?.id || ''}
            onChange={(e) => {
              const section = sections.find(s => s.id === parseInt(e.target.value));
              setSelectedSection(section);
            }}
            className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {sections.map(section => (
              <option key={section.id} value={section.id}>
                {section.sectionName?.name || section.name || 'Sección sin nombre'} - {section.event?.name || 'Evento sin nombre'}
              </option>
            ))}
          </select>
        </div>

        {/* Seats Grid */}
        {selectedSection && (
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold">
                  Asientos de {selectedSection.sectionName?.name || selectedSection.name || 'Sección sin nombre'}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Users className="w-4 h-4" />
                <span>{seats.length} asientos</span>
              </div>
            </div>

            {loading ? (
              <p className="text-center text-gray-400">Cargando asientos...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {seats.map(seat => (
                  <div key={seat.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">Asiento {seat.seatNumber}</h3>
                        <p className="text-sm text-gray-400">Fila {seat.row}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(seat.status)}`}>
                        {getStatusText(seat.status)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={seat.status}
                        onChange={(e) => handleStatusChange(seat.id, e.target.value)}
                        className="flex-1 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="AVAILABLE">Disponible</option>
                        <option value="RESERVED">Reservado</option>
                        <option value="OCCUPIED">Ocupado</option>
                      </select>

                      <button
                        onClick={() => handleEditSeat(seat)}
                        className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteSeat(seat.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {seats.length === 0 && !loading && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No hay asientos en esta sección</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Crear primer asiento
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingSeat ? 'Editar Asiento' : 'Crear Nuevo Asiento'}
            </h2>

            <form onSubmit={handleCreateSeat} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Número de Asiento
                </label>
                <input
                  type="text"
                  value={formData.seatNumber}
                  onChange={(e) => setFormData({...formData, seatNumber: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Fila
                </label>
                <input
                  type="text"
                  value={formData.row}
                  onChange={(e) => setFormData({...formData, row: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="AVAILABLE">Disponible</option>
                  <option value="RESERVED">Reservado</option>
                  <option value="OCCUPIED">Ocupado</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingSeat(null);
                    setFormData({ seatNumber: '', row: '', status: 'AVAILABLE' });
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {editingSeat ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatManagement;