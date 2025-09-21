import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Search, ChevronDown } from 'lucide-react';

const popularEvents = [
  {
    id: 1,
    title: "Concierto de ópera",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=250&fit=crop",
    city: "Bogotá",
    day: "Viernes",
    category: "Música"
  },
  {
    id: 2,
    title: "Concierto de música",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop",
    city: "Medellín",
    day: "Sábado",
    category: "Música"
  },
  {
    id: 3,
    title: "Linkin Park",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=250&fit=crop",
    city: "Cali",
    day: "Domingo",
    category: "Música"
  }
];

const TuEvento = () => {
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
  const [filteredEvents, setFilteredEvents] = useState(popularEvents);

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

  const handleFilter = () => {
    let filtered = popularEvents.filter(event => {
      if (selectedCity !== 'Bogotá' && event.city !== selectedCity) return false;
      if (selectedDay !== 'Lunes' && event.day !== selectedDay) return false;
      if (selectedCategory !== 'Todas' && event.category !== selectedCategory) return false;
      if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
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
      
      {/* Hero Section con Sistema de Filtros */}
      <section className="relative h-140">
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
        
        {/* SISTEMA DE FILTROS - Barra horizontal en la PARTE SUPERIOR */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-purple-800/90 backdrop-blur-md rounded-full border border-purple-600/50 shadow-xl">
            <div className="px-6 py-3">
              <div className="flex items-center justify-center gap-3">

                {/* Buscar */}
                <div className="relative">
                  <div className="flex items-center bg-purple-700/40 rounded-full px-3 py-1.5 border border-purple-600/30 hover:border-purple-500/50 transition-colors">
                    <Search className="w-3 h-3 text-gray-300 mr-2" />
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-transparent text-white placeholder-gray-400 outline-none w-24 text-sm"
                    />
                  </div>
                </div>

                {/* Ciudad */}
                <div className="relative" ref={cityRef}>
                  <button
                    onClick={() => setShowCityDropdown(!showCityDropdown)}
                    className="flex items-center bg-purple-700/40 rounded-full px-3 py-1.5 border border-purple-600/30 hover:border-purple-500/50 transition-colors text-white text-sm"
                  >
                    <span className="mr-1">🏙️</span>
                    <span>{selectedCity}</span>
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </button>
                  {showCityDropdown && (
                    <div className="absolute top-full mt-2 bg-purple-800/95 backdrop-blur-md border border-purple-600 rounded-xl shadow-xl z-50 w-36 max-h-32 overflow-y-auto">
                      {colombianCities.map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            setSelectedCity(city);
                            setShowCityDropdown(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-white hover:bg-purple-600 transition-colors text-sm first:rounded-t-xl last:rounded-b-xl"
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
                    className="flex items-center bg-purple-700/40 rounded-full px-3 py-1.5 border border-purple-600/30 hover:border-purple-500/50 transition-colors text-white text-sm"
                  >
                    <span className="mr-1">📅</span>
                    <span>{selectedDay}</span>
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </button>
                  {showDayDropdown && (
                    <div className="absolute top-full mt-2 bg-purple-800/95 backdrop-blur-md border border-purple-600 rounded-xl shadow-xl z-50 w-32">
                      {daysOfWeek.map((day) => (
                        <button
                          key={day}
                          onClick={() => {
                            setSelectedDay(day);
                            setShowDayDropdown(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-white hover:bg-purple-600 transition-colors text-sm first:rounded-t-xl last:rounded-b-xl"
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
                    className="flex items-center bg-purple-700/40 rounded-full px-3 py-1.5 border border-purple-600/30 hover:border-purple-500/50 transition-colors text-white text-sm"
                  >
                    <span className="mr-1">🔄</span>
                    <span className="truncate max-w-20">{selectedOrder}</span>
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </button>
                  {showOrderDropdown && (
                    <div className="absolute top-full mt-2 bg-purple-800/95 backdrop-blur-md border border-purple-600 rounded-xl shadow-xl z-50 w-36">
                      {orderOptions.map((order) => (
                        <button
                          key={order}
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDropdown(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-white hover:bg-purple-600 transition-colors text-sm first:rounded-t-xl last:rounded-b-xl"
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
                    className="flex items-center bg-purple-700/40 rounded-full px-3 py-1.5 border border-purple-600/30 hover:border-purple-500/50 transition-colors text-white text-sm"
                  >
                    <span className="mr-1">🏷️</span>
                    <span>{selectedCategory}</span>
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </button>
                  {showCategoryDropdown && (
                    <div className="absolute top-full mt-2 bg-purple-800/95 backdrop-blur-md border border-purple-600 rounded-xl shadow-xl z-50 w-32">
                      {eventCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowCategoryDropdown(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-white hover:bg-purple-600 transition-colors text-sm first:rounded-t-xl last:rounded-b-xl"
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
                  className={`flex items-center rounded-full px-3 py-1.5 border transition-colors text-white text-sm ${
                    activeFilter === 'Próximos'
                      ? 'border-purple-400 bg-purple-500/30'
                      : 'bg-purple-700/40 border-purple-600/30 hover:border-purple-500/50'
                  }`}
                >
                  <span className="mr-1">⏰</span>
                  <span>Próximos</span>
                </button>

                {/* Filtrar */}
                <button
                  onClick={handleFilter}
                  className="flex items-center bg-purple-700/40 rounded-full px-3 py-1.5 border border-purple-600/30 hover:border-purple-500/50 transition-colors text-white text-sm"
                >
                  <span className="mr-1">🔍</span>
                  <span>Filtrar</span>
                </button>

              </div>
            </div>
          </div>
        </div>
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
            <h2 className="text-white text-lg font-medium mb-8">POPULARES</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {popularEvents.map(event => (
                <div key={event.id} className="relative rounded-lg overflow-hidden">
                  <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60">
                    <h3 className="text-white text-sm mb-2">{event.title}</h3>
                    <button
                      className="text-white px-4 py-1 text-sm rounded font-medium"
                      style={{ backgroundColor: '#8b5cf6' }}
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              ))}
            </div>
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