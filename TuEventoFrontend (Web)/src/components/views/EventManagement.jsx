import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, MapPin, Users, Settings, ArrowLeft, Upload, Tag, CheckCircle } from 'lucide-react';
import { getEventsByUser, completeEvent, publishEvent, cancelEvent } from '../../services/EventService.js';
import { getEventImages } from '../../services/EventImgService.js';
import { getCategoriesByEvent } from '../../services/CategoryService.js';
import { API_BASE_URL } from '../../services/apiconstant.js';

const EventManagement = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventImagesMap, setEventImagesMap] = useState({});
  const [eventCategoriesMap, setEventCategoriesMap] = useState({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Usuario no autenticado. Redirigiendo al login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        setLoading(false);
        return;
      }

      // Use getEventsByUser to get all events for the authenticated user
      const result = await getEventsByUser();

      if (result.success) {
        // Filter events by status 0 (in progress/draft) and 1 (published)
        const userEvents = result.data.filter(event => event.status === 0 || event.status === 1);
        setEvents(userEvents);

        // Load images and categories for each event
        await loadEventImages(userEvents);
        await loadEventCategories(userEvents);
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

  const loadEventImages = async (eventsList) => {
    const newImagesMap = { ...eventImagesMap };
    // Initialize all events as false first
    for (const event of eventsList) {
      newImagesMap[event.id] = false;
    }
    // Then try to load actual data
    for (const event of eventsList) {
      try {
        const imagesResult = await getEventImages(event.id);
        newImagesMap[event.id] = imagesResult.success && imagesResult.data && imagesResult.data.length > 0;
      } catch (error) {
        // Keep as false
        console.log(`Error loading images for event ${event.id}:`, error);
      }
    }
    setEventImagesMap(newImagesMap);
  };

  const loadEventCategories = async (eventsList) => {
    const newCategoriesMap = { ...eventCategoriesMap };
    // Initialize all events as false first
    for (const event of eventsList) {
      newCategoriesMap[event.id] = false;
    }
    // Then try to load actual data
    for (const event of eventsList) {
      try {
        const categoriesResult = await getCategoriesByEvent(event.id);
        newCategoriesMap[event.id] = categoriesResult.success && categoriesResult.data && categoriesResult.data.length > 0;
      } catch (error) {
        // Keep as false
        console.log(`Error loading categories for event ${event.id}:`, error);
      }
    }
    setEventCategoriesMap(newCategoriesMap);
  };

  const handleCreateEvent = () => {
    navigate('/create-event');
  };

  const handleFloorPlanDesigner = (eventId) => {
    navigate(`/FloorPlanDesigner?eventId=${eventId}`);
  };

  const handlePublishEvent = async (eventId) => {
    try {
      const result = await publishEvent(eventId);
      if (result.success) {
        setSuccessMessage('¡Evento publicado exitosamente!');
        setShowSuccessModal(true);
        // Reload events to update the list
        loadEvents();
      } else {
        setErrorMessage('Error al publicar el evento: ' + result.message);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error publishing event:', error);
      setErrorMessage('Error al publicar el evento');
      setShowErrorModal(true);
    }
  };

  const handleCompleteEvent = (eventId) => {
    navigate(`/complete-event?id=${eventId}`);
  };

  const handleDeleteEvent = (eventId) => {
    setDeleteEventId(eventId);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteEvent = async () => {
    if (!deleteEventId) return;

    setShowDeleteConfirmModal(false);
    try {
      const result = await cancelEvent(deleteEventId);
      if (result.success) {
        setSuccessMessage('Evento eliminado exitosamente');
        setShowSuccessModal(true);
        // Reload events to update the list
        loadEvents();
      } else {
        setErrorMessage('Error al eliminar el evento: ' + result.message);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setErrorMessage('Error al eliminar el evento');
      setShowErrorModal(true);
    } finally {
      setDeleteEventId(null);
    }
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
              <p className="text-sm text-gray-400 mt-1">Gestiona tus eventos: completa y publica los que están en proceso</p>
            </div>

            {events.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No tienes eventos en proceso</h3>
                <p className="text-gray-400 mb-4">
                  Todos tus eventos están publicados o crea uno nuevo para comenzar.
                </p>
                <button
                  onClick={handleCreateEvent}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Crear Nuevo Evento
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {events.map(event => {
                  const hasImages = eventImagesMap[event.id];
                  const hasCategories = eventCategoriesMap[event.id];
                  const isComplete = hasImages && hasCategories;
                  const isPublished = event.status === 1 && isComplete;

                  return (
                    <div key={event.id} className="p-6 hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{event.eventName}</h3>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              isPublished
                                ? 'bg-blue-600 text-white'
                                : isComplete
                                ? 'bg-green-600 text-white'
                                : 'bg-yellow-600 text-black'
                            }`}>
                              {isPublished ? 'Publicado' : isComplete ? 'Listo para publicar' : 'En proceso'}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'Fecha no definida'}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.locationID?.address?.city?.name || event.locationID?.name || 'Ubicación no definida'}
                            </span>
                          </div>
                          <p className="text-gray-300 mb-3">{event.description}</p>

                          {/* Status indicators */}
                          <div className="flex items-center gap-4 text-sm">
                            <div className={`flex items-center gap-2 ${hasImages ? 'text-green-400' : 'text-red-400'}`}>
                              <Upload className="w-4 h-4" />
                              <span>{hasImages ? 'Imágenes completadas' : 'Faltan imágenes'}</span>
                            </div>
                            <div className={`flex items-center gap-2 ${hasCategories ? 'text-green-400' : 'text-red-400'}`}>
                              <Tag className="w-4 h-4" />
                              <span>{hasCategories ? 'Categorías completadas' : 'Faltan categorías'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {!isPublished && !isComplete && (
                            <button
                              onClick={() => handleCompleteEvent(event.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                              Completar
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/event-info?id=${event.id}`)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Ver Detalles
                          </button>
                          {!isPublished && isComplete && (
                            <button
                              onClick={() => handlePublishEvent(event.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Publicar Evento
                            </button>
                          )}
                          <button
                            onClick={() => handleFloorPlanDesigner(event.id)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            Maquetación
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación de evento */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white rounded-full p-3">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Eliminar Evento</h3>
              <p className="text-red-100 text-sm">¿Estás seguro de que deseas eliminar este evento?</p>
            </div>

            {/* Contenido */}
            <div className="p-6 text-center">
              <div className="mb-6">
                <div className="bg-red-50 rounded-lg p-4 mb-4">
                  <span className="text-red-800 text-sm font-medium">Esta acción no se puede deshacer.</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirmModal(false);
                    setDeleteEventId(null);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteEvent}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white rounded-full p-3">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Error</h3>
              <p className="text-red-100 text-sm">Ha ocurrido un problema</p>
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
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-sm flex items-center justify-center space-x-2"
              >
                <span>Aceptar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;