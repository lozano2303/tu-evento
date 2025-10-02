import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, ChevronDown } from 'lucide-react';
import { getAllEvents, cancelEvent } from '../../services/EventService.js';
import { getEventImages } from '../../services/EventImgService.js';
import { getCategoriesByEvent } from '../../services/CategoryService.js';
import { searchEvents } from '../../services/searchEvents.js';

const TuEvento = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Ciudad');
  const [selectedCity, setSelectedCity] = useState('Bogotá');
  const [selectedDay, setSelectedDay] = useState('Lunes');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState('Mayor a menor');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showDayDropdown, setShowDayDropdown] = useState(false);
  const [showOrderDropdown, setShowOrderDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroImage, setHeroImage] = useState("https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1400&h=400&fit=crop");
  const [eventImagesMap, setEventImagesMap] = useState({});
  const [eventCategoriesMap, setEventCategoriesMap] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);

  // Refs para los dropdowns
  const cityRef = useRef(null);
  const dayRef = useRef(null);
  const orderRef = useRef(null);
  const categoryRef = useRef(null);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityRef.current && !cityRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
      if (dayRef.current && !dayRef.current.contains(event.target)) {
        setShowDayDropdown(false);
      }
      if (orderRef.current && !orderRef.current.contains(event.target)) {
        setShowOrderDropdown(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  

  // Set current user ID
  useEffect(() => {
    const userId = localStorage.getItem('userID');
    setCurrentUserId(userId ? parseInt(userId) : null);
  }, []);

  // Cargar eventos del backend
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const result = await getAllEvents();
        if (result.success) {
          // Set all events first
          setEvents(result.data);

          // Load hero image from events
          await loadHeroImage(result.data);
          // Load event images and categories for cards
          await loadEventImages(result.data);
          await loadEventCategories(result.data);
        } else {
          setError(result.message || 'Error al cargar eventos');
        }
      } catch (err) {
        setError('Error de conexión al cargar eventos');
        console.error('Error loading events:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents(); // Load events for all users, including anonymous
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter events when maps are loaded
  useEffect(() => {
    if (events.length > 0) {
      const filtered = events.filter(event => {
        return event.status === 1 && eventImagesMap[event.id] && eventCategoriesMap[event.id];
      });
      setFilteredEvents(filtered);
    }
  }, [events, eventImagesMap, eventCategoriesMap]);

  const loadHeroImage = async (eventsList) => {
    try {
      // Try to find the first available image from any event
      for (const event of eventsList) {
        try {
          const imagesResult = await getEventImages(event.id);
          if (imagesResult.success && imagesResult.data && imagesResult.data.length > 0) {
            // Use the first image from this event
            setHeroImage(imagesResult.data[0].url);
            return; // Stop after finding the first image
          }
        } catch (error) {
          console.log(`No images for event ${event.id}`);
        }
      }

      // If no images found, keep default
    } catch (error) {
      console.error('Error loading hero image:', error);
    }
  };

  const loadEventImages = async (eventsList) => {
    const newImagesMap = { ...eventImagesMap };
    for (const event of eventsList) {
      if (!newImagesMap[event.id]) {
        try {
          const imagesResult = await getEventImages(event.id);
          if (imagesResult.success && imagesResult.data && imagesResult.data.length > 0) {
            newImagesMap[event.id] = imagesResult.data[0].url;
          }
        } catch (error) {
          console.log(`No images for event ${event.id}`);
        }
      }
    }
    setEventImagesMap(newImagesMap);
  };
  const handleServerFilter = async () => {
    try {
      setLoading(true);
      console.log('EventsList', selectedDate);
      const result = await searchEvents(
        searchTerm || null,      
        selectedDate || null,   // 👈 pasa la fecha seleccionada
        true,                    
        selectedCity !== "Bogotá" ? selectedCity : null
      );

      if (result.success) {
        const eventsList = result.data;

        // 🔹 Primero guarda los eventos
        setEvents(eventsList);
        setFilteredEvents(eventsList);
        // 🔹 Luego carga imágenes y categorías
        await loadEventImages(eventsList);
        await loadEventCategories(eventsList);
      } else {
        setError(result.message || 'Error en la búsqueda');
      }
    } catch (err) {
      console.error("Error en searchEvents:", err);
      setError("No se pudieron cargar los eventos filtrados");
    } finally {
      setLoading(false);
    }
  };

  const loadEventCategories = async (eventsList) => {
    const newCategoriesMap = { ...eventCategoriesMap };
    for (const event of eventsList) {
      if (!newCategoriesMap[event.id]) {
        try {
          const categoriesResult = await getCategoriesByEvent(event.id);
          if (categoriesResult.success && categoriesResult.data && categoriesResult.data.length > 0) {
            newCategoriesMap[event.id] = categoriesResult.data.length;
          }
        } catch (error) {
          console.log(`No categories for event ${event.id}`);
        }
      }
    }
    setEventCategoriesMap(newCategoriesMap);
  };

  const handleFilter = () => {
    let filtered = events.filter(event => {
      // Adaptar filtros según la estructura del evento del backend
      // Asumiendo que event tiene propiedades como name, location, etc.
      if (selectedCity !== 'Bogotá' && event.location?.city !== selectedCity) return false;
      if (selectedCategory !== 'Todas' && event.category?.name !== selectedCategory) return false;
      if (searchTerm && !event.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
    setFilteredEvents(filtered);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      try {
        const result = await cancelEvent(eventId);
        if (result.success) {
          // Remove from events list
          const updatedEvents = events.filter(event => event.id !== eventId);
          setEvents(updatedEvents);
          setFilteredEvents(updatedEvents);
          alert('Evento eliminado exitosamente');
        } else {
          alert('Error al eliminar el evento: ' + result.message);
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error al eliminar el evento');
      }
    }
  };

  const filters = ['Ciudad', 'Día', 'Orden', 'Categorías', 'Próximos'];

  // Ciudades de Colombia inventadas
  const colombianCities = [
    'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena',
    'Santa Marta', 'Pereira', 'Manizales', 'Villavicencio', 'Cúcuta'
  ];


  const categories = [
    { name: "Música", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=140&fit=crop" },
    { name: "Deportes", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&h=140&fit=crop" },
    { name: "Actividades", image: "https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=200&h=140&fit=crop" }
  ];
return (
  <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, rgba(15, 10, 26, 1) 0%, rgba(26, 26, 26, 1) 100%)' }}>

    {/* Hero Section */}
    <section className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url("${heroImage}")`
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.7) 0%, rgba(168, 85, 247, 0.6) 25%, rgba(217, 70, 239, 0.5) 50%, rgba(236, 72, 153, 0.4) 75%, rgba(219, 39, 119, 0.3) 100%)'
        }}
      />

      {/* SISTEMA DE FILTROS - Dentro del hero */}
      <div className="relative z-10" style={{ background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.7) 0%, rgba(168, 85, 247, 0.6) 25%, rgba(217, 70, 239, 0.5) 50%, rgba(236, 72, 153, 0.4) 75%, rgba(219, 39, 119, 0.3) 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center justify-center gap-4">

            {/* Buscar */}
            <div className="relative">
              <div className="flex items-center bg-purple-800/50 rounded-full px-4 py-2 border border-purple-600 hover:border-purple-400 transition-colors">
                <Search className="w-4 h-4 text-purple-200 mr-2" />
                <input
                  type="text"
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange= {(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleServerFilter();
                      }
                    }}
                  className="bg-transparent text-white placeholder-purple-200 outline-none w-48"
                />
              </div>
            </div>


            {/* Fecha */}
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  // opcional: ejecutar búsqueda automática al elegir fecha
                  handleServerFilter();
                }}
                className="bg-purple-800/50 rounded-full px-4 py-2 border border-purple-600
                          hover:border-purple-400 transition-colors text-white outline-none"
              />
            </div>



            {/* Filtrar */}
            <button
              onClick={handleServerFilter}
              className="flex items-center bg-purple-800/50 rounded-full px-4 py-2 border border-purple-600 hover:border-purple-400 transition-colors text-white"
            >
              <span className="mr-2">🔍</span>
              <span>Filtrar</span>
            </button>

          </div>
        </div>
      </div>

      {/* Contenido principal - Dentro del hero */}
      <div className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto">

          {/* POPULARES */}
          <div className="mb-16">
            <h2 className="text-white text-3xl font-bold mb-12 text-center">EVENTOS</h2>

            {loading && <p className="text-white">Cargando eventos...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && (
              <>
                {filteredEvents.length > 0 ? (
                  <div className="grid md:grid-cols-3 gap-6">
                    {filteredEvents.map((event, index) => (
                      <div
                        key={`event-${event.id}-${index}`}
                        className="relative rounded-lg overflow-hidden"
                      >
                        <div className="relative">
                          {eventImagesMap[event.id] ? (
                            <img
                              src={eventImagesMap[event.id]}
                              alt={event.name}
                              className="w-full h-48 object-contain bg-gray-800"
                            />
                          ) : (
                            <div className="w-full h-48 bg-purple-600 flex items-center justify-center">
                              <span className="text-white text-lg font-bold">Sin Imagen</span>
                            </div>
                          )}

                          {/* Status badge para eventos del creador */}
                          {currentUserId === event.userID?.userID && event.status === 0 && (
                            <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 text-xs font-bold rounded">
                              {!eventImagesMap[event.id]
                                ? "FALTA IMÁGENES"
                                : !eventCategoriesMap[event.id]
                                ? "FALTA CATEGORÍAS"
                                : "EN PROCESO"}
                            </div>
                          )}

                        </div>
                        <button
                          className="absolute top-1 right-1 text-white px-3 py-1 text-sm rounded font-medium bg-purple-600 hover:bg-purple-700 transition-colors shadow-lg z-10"
                          onClick={() => navigate(`/event-info?id=${event.id}`)}
                        >
                          Ver detalles
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                    <div className="flex justify-center mt-10">
                      <div className="bg-purple-800/30 border border-purple-600 rounded-xl p-6 shadow-lg max-w-md text-center">
                        <p className="text-purple-200 text-lg font-medium flex items-center justify-center gap-2">
                          No se encontraron eventos con los filtros aplicados.
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                          Intenta cambiar la búsqueda o ajustar los filtros.
                        </p>
                      </div>
                    </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </section>
  </div>
);
};

export default TuEvento;