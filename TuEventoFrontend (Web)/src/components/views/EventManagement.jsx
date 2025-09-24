import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, MapPin, Users, Settings, ArrowLeft } from 'lucide-react';
import { getAllEvents } from '../../services/EventService.js';

const EventManagement = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const result = await getAllEvents();
      if (result.success) {
        setEvents(result.data);
      } else {
        setError(result.message || 'Error al cargar eventos');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    navigate('/create-event');
  };

  const handleFloorPlanDesigner = (eventId) => {
    navigate(`/FloorPlanDesigner?eventId=${eventId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Cargando eventos...</p>
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
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </button>
            <h1 className="text-2xl font-bold">Gestión de Eventos</h1>
          </div>
          <button
            onClick={handleCreateEvent}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear Evento
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold">{events.length}</p>
                  <p className="text-gray-400 text-sm">Eventos Totales</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold">
                    {events.filter(e => new Date(e.startDate) > new Date()).length}
                  </p>
                  <p className="text-gray-400 text-sm">Próximos</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-3">
                <MapPin className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold">
                    {new Set(events.map(e => e.locationID?.address?.city?.name)).size}
                  </p>
                  <p className="text-gray-400 text-sm">Ciudades</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-3">
                <Settings className="w-8 h-8 text-orange-400" />
                <div>
                  <p className="text-2xl font-bold">
                    {events.filter(e => e.eventLayout || e.locationID).length}
                  </p>
                  <p className="text-gray-400 text-sm">Con Maquetación</p>
                </div>
              </div>
            </div>
          </div>

          {/* Events List */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Mis Eventos</h2>
            </div>

            {events.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No tienes eventos aún</h3>
                <p className="text-gray-400 mb-4">
                  Crea tu primer evento para comenzar a gestionar tus actividades.
                </p>
                <button
                  onClick={handleCreateEvent}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Crear Primer Evento
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {events.map(event => (
                  <div key={event.id} className="p-6 hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{event.eventName}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'Fecha no definida'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.locationID?.address?.city?.name || event.locationID?.name || 'Ubicación no definida'}
                          </span>
                        </div>
                        <p className="text-gray-300 mt-2">{event.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleFloorPlanDesigner(event.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Maquetación
                        </button>
                        <button
                          onClick={() => navigate(`/event-info?id=${event.id}`)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventManagement;