import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, ChevronDown } from 'lucide-react';
import { getAllEvents } from '../../services/EventService.js';

const TuEvento = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Ciudad');
  const [selectedCity, setSelectedCity] = useState('Bogotá');
  const [selectedDay, setSelectedDay] = useState('Lunes');
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

  // Cargar eventos del backend
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const result = await getAllEvents();
        if (result.success) {
          setEvents(result.data);
          setFilteredEvents(result.data);
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

    loadEvents();
  }, []);

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

  const filters = ['Ciudad', 'Día', 'Orden', 'Categorías', 'Próximos'];

  // Ciudades de Colombia inventadas
  const colombianCities = [
    'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena',
    'Santa Marta', 'Pereira', 'Manizales', 'Villavicencio', 'Cúcuta'
  ];

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const orderOptions = ['Mayor a menor', 'Menor a mayor', 'Más recientes', 'Más antiguos'];

  const eventCategories = ['Todas', 'Música', 'Deportes', 'Teatro', 'Conferencias', 'Fiestas', 'Deportes', 'Culturales'];

  const categories = [
    { name: "Música", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=140&fit=crop" },
    { name: "Deportes", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&h=140&fit=crop" },
    { name: "Actividades", image: "https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=200&h=140&fit=crop" }
  ];

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#1a1a1a' }}>

      {/* SISTEMA DE FILTROS - Barra morada arriba debajo de la nav */}
      <div className="bg-purple-900/95 backdrop-blur-sm border-b border-purple-700">
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent text-white placeholder-purple-200 outline-none w-48"
                />
              </div>
            </div>

            {/* Ciudad */}
            <div className="relative" ref={cityRef}>
              <button
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                className="flex items-center bg-purple-800/50 rounded-full px-4 py-2 border border-purple-600 hover:border-purple-400 transition-colors text-white"
              >
                <span className="mr-2">🏙️</span>
                <span>{selectedCity}</span>
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
              {showCityDropdown && (
                <div className="absolute top-full mt-2 bg-purple-900 border border-purple-600 rounded-lg shadow-xl z-50 w-48 max-h-48 overflow-y-auto">
                  {colombianCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setShowCityDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-white hover:bg-purple-700 transition-colors"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Día */}
            <div className="relative" ref={dayRef}>
              <button
                onClick={() => setShowDayDropdown(!showDayDropdown)}
                className="flex items-center bg-purple-800/50 rounded-full px-4 py-2 border border-purple-600 hover:border-purple-400 transition-colors text-white"
              >
                <span className="mr-2">📅</span>
                <span>{selectedDay}</span>
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
              {showDayDropdown && (
                <div className="absolute top-full mt-2 bg-purple-900 border border-purple-600 rounded-lg shadow-xl z-50 w-40">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day}
                      onClick={() => {
                        setSelectedDay(day);
                        setShowDayDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-white hover:bg-purple-700 transition-colors"
                    >
                      {day}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Orden */}
            <div className="relative" ref={orderRef}>
              <button
                onClick={() => setShowOrderDropdown(!showOrderDropdown)}
                className="flex items-center bg-purple-800/50 rounded-full px-4 py-2 border border-purple-600 hover:border-purple-400 transition-colors text-white"
              >
                <span className="mr-2">🔄</span>
                <span>{selectedOrder}</span>
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
              {showOrderDropdown && (
                <div className="absolute top-full mt-2 bg-purple-900 border border-purple-600 rounded-lg shadow-xl z-50 w-44">
                  {orderOptions.map((order) => (
                    <button
                      key={order}
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-white hover:bg-purple-700 transition-colors"
                    >
                      {order}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Categorías */}
            <div className="relative" ref={categoryRef}>
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex items-center bg-purple-800/50 rounded-full px-4 py-2 border border-purple-600 hover:border-purple-400 transition-colors text-white"
              >
                <span className="mr-2">🏷️</span>
                <span>{selectedCategory}</span>
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
              {showCategoryDropdown && (
                <div className="absolute top-full mt-2 bg-purple-900 border border-purple-600 rounded-lg shadow-xl z-50 w-44">
                  {eventCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowCategoryDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-white hover:bg-purple-700 transition-colors"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Próximos */}
            <button
              onClick={() => setActiveFilter('Próximos')}
              className={`flex items-center bg-purple-800/50 rounded-full px-4 py-2 border transition-colors text-white ${
                activeFilter === 'Próximos'
                  ? 'border-purple-400 bg-purple-500/30'
                  : 'border-purple-600 hover:border-purple-400'
              }`}
            >
              <span className="mr-2">⏰</span>
              <span>Próximos</span>
            </button>

            {/* Filtrar */}
            <button
              onClick={handleFilter}
              className="flex items-center bg-purple-800/50 rounded-full px-4 py-2 border border-purple-600 hover:border-purple-400 transition-colors text-white"
            >
              <span className="mr-2">🔍</span>
              <span>Filtrar</span>
            </button>

          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-96">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1400&h=400&fit=crop")'
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.7) 0%, rgba(168, 85, 247, 0.6) 25%, rgba(217, 70, 239, 0.5) 50%, rgba(236, 72, 153, 0.4) 75%, rgba(219, 39, 119, 0.3) 100%)'
          }}
        />
      </section>

      {/* Contenido principal */}
      <div style={{ backgroundColor: 'rgba(16, 1, 30, 0.92)' }} className="px-">
        <div className="max-w-7xl mx-auto py-12">

          {/* Clasificación + Usuario */}
          <div className="grid md:grid-cols-2 gap-16 mb-16">
            <div>
              <h2 className="text-white text-lg font-medium mb-4">Clasificación de edades</h2>
              <ul className="text-sm text-gray-200 space-y-2">
                <li>Mayores de edad</li>
                <li>Para todas las familias</li>
              </ul>
            </div>
            <div>
              <h2 className="text-white text-lg font-medium mb-4">Información del usuario</h2>
              <ul className="text-sm text-gray-200 space-y-2">
                <li>Historial de eventos asistidos</li>
                <li>Favoritos</li>
                <li>Eventos pagos</li>
              </ul>
            </div>
          </div>

         
          {/* POPULARES */}
          <div className="mb-16">
            <h2 className="text-white text-lg font-medium mb-8">EVENTOS</h2>
            {loading && <p className="text-white">Cargando eventos...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && (
              <div className="grid md:grid-cols-3 gap-6">
                {filteredEvents.map(event => (
                  <div key={event.id} className="relative rounded-lg overflow-hidden">
                    <img
                      src={event.image || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop"}
                      alt={event.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60">
                      <h3 className="text-white text-sm mb-2">{event.name}</h3>
                      <p className="text-gray-300 text-xs mb-2">{event.location?.city}</p>
                      <button
                        className="text-white px-4 py-1 text-sm rounded font-medium"
                        style={{ backgroundColor: '#8b5cf6' }}
                        onClick={() => navigate(`/event-info?id=${event.id}`)}
                      >
                        Ver detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* COMENTARIOS DE LA COMUNIDAD */}
          <div className="mb-16">
            <h2 className="text-white text-lg font-medium mb-10 text-center">COMENTARIOS DE LA COMUNIDAD</h2>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="relative">
                <button
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white p-2 rounded z-20 hover:opacity-80"
                  style={{ backgroundColor: '#8b5cf6' }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white p-2 rounded z-20 hover:opacity-80"
                  style={{ backgroundColor: '#8b5cf6' }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <img
                  src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=450&h=300&fit=crop"
                  alt="Banda"
                  className="w-full h-72 object-cover rounded-lg"
                />
              </div>
              <div className="p-8 rounded-lg" style={{ backgroundColor: '#8b5cf6' }}>
                <h3 className="text-white font-bold text-xl mb-5">The queen</h3>
                <p className="text-white text-sm leading-relaxed mb-5">
                  "Anteriormente se hizo un evento y pues me gustó. Hubo mucha gente, todo muy bonito aunque..."
                </p>
                <button className="text-white underline text-sm">Ver eventos</button>
              </div>
            </div>
          </div>

          {/* EXPLORA CATEGORÍAS */}
          <div className="mb-16">
            <h2 className="text-white text-lg font-medium mb-10 text-center">EXPLORA CATEGORÍAS</h2>
            <div className="grid grid-cols-3 gap-4 px-12">
              {categories.map((category, index) => (
                <div key={index} className="relative group cursor-pointer">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div
                    className="absolute inset-0 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(168, 85, 247, 0.7) 50%, rgba(217, 70, 239, 0.6) 100%)'
                    }}
                  >
                    <h3 className="text-white font-bold text-base">{category.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TuEvento;