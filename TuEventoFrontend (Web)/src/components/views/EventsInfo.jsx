import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star, Send, X, ShoppingCart, CheckCircle } from 'lucide-react';
import DrawingCanvas from '../DrawingCanvas.jsx';
import { getEventById } from '../../services/EventService.js';
import { getEventLayoutByEventId } from '../../services/EventLayoutService.js';
import { getTicketsByEvent, createTicketWithSeats } from '../../services/TicketService.js';
import { getSeatsBySection, updateSeatStatus } from '../../services/SeatService.js';
import { getAllSections } from '../../services/SectionService.js';

const ReservaEvento = () => {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('id');
  const [event, setEvent] = useState(null);
  const [rating, setRating] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [layoutElements, setLayoutElements] = useState([]);
  const [loadingLayout, setLoadingLayout] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [reservingSeats, setReservingSeats] = useState(false);
  const [sections, setSections] = useState([]);
  const [seats, setSeats] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) {
        setError('ID de evento no proporcionado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await getEventById(eventId);
        if (result.success) {
          setEvent(result.data);
        } else {
          setError(result.message || 'Error al cargar el evento');
        }
      } catch (err) {
        setError('Error de conexión al cargar el evento');
        console.error('Error loading event:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  // Load tickets when event is loaded
  useEffect(() => {
    if (event) {
      loadEventTickets();
    }
  }, [event]);

  // Load seats when section is selected
  useEffect(() => {
    if (selectedSection) {
      loadSeatsForSection(selectedSection.id);
    }
  }, [selectedSection]);

  const handleStarClick = (starNumber) => {
    setRating(starNumber);
  };

  const loadEventLayout = async () => {
    if (!eventId) return;

    try {
      setLoadingLayout(true);
      const result = await getEventLayoutByEventId(eventId);
      if (result.success && result.data && result.data.layoutData && result.data.layoutData.elements) {
        const elements = result.data.layoutData.elements;
        setLayoutElements(elements);
      } else {
        setLayoutElements([]);
      }
    } catch (error) {
      console.error('Error loading event layout:', error);
      setLayoutElements([]);
    } finally {
      setLoadingLayout(false);
    }
  };

  const loadEventTickets = async () => {
    if (!eventId) return;

    try {
      setLoadingTickets(true);
      const result = await getTicketsByEvent(eventId);
      if (result.success) {
        setTickets(result.data || []);
      } else {
        setTickets([]);
      }
    } catch (error) {
      // Silently handle ticket loading errors
      setTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleShowMap = async () => {
    setShowMapModal(true);
    setLoadingLayout(true);
    try {
      await loadSectionsAndSeats();
      await loadEventLayout();
    } catch (error) {
      console.error('Error loading map:', error);
      setLayoutElements([]);
    } finally {
      setLoadingLayout(false);
    }
  };

  const loadSectionsAndSeats = async () => {
    if (!eventId) return;

    try {
      // Load sections for this event
      const sectionsResult = await getAllSections();
      if (sectionsResult.success) {
        const eventSections = sectionsResult.data.filter(section => section.eventId === parseInt(eventId));
        setSections(eventSections);
        if (eventSections.length > 0) {
          setSelectedSection(eventSections[0]);
        }
      }
    } catch (error) {
      console.error('Error loading sections:', error);
    }
  };

  const generateSeatsFromLayout = async (layoutElements) => {
    if (!selectedSection || !layoutElements) return;

    try {
      // Buscar elementos seatRow en el layout
      const seatRows = layoutElements.filter(el => el.type === 'seatRow');

      for (const seatRow of seatRows) {
        if (seatRow.seatPositions) {
          // Crear asientos reales para cada posición
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
            } catch (error) {
              // Si el asiento ya existe, continuar
              console.log('Seat might already exist:', error);
            }
          }
        }
      }

      // Recargar asientos después de crearlos
      if (selectedSection) {
        loadSeatsForSection(selectedSection.id);
      }
    } catch (error) {
      console.error('Error generating seats from layout:', error);
    }
  };

  const loadSeatsForSection = async (sectionId) => {
    try {
      const seatsResult = await getSeatsBySection(sectionId);
      if (seatsResult.success) {
        setSeats(seatsResult.data);
      }
    } catch (error) {
      console.error('Error loading seats:', error);
    }
  };

  const handleSeatSelect = (seatId) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  };

  const handlePurchaseSeats = async () => {
    if (selectedSeats.length === 0 || !selectedTicket) return;

    setReservingSeats(true);
    try {
      // First, block the seats by updating their status
      for (const seatId of selectedSeats) {
        await updateSeatStatus(seatId, 'RESERVED');
      }

      // Create ticket with selected seats
      const ticketData = {
        event: { id: parseInt(eventId) },
        ticketType: selectedTicket,
        seats: selectedSeats.map(seatId => ({ id: seatId })),
        quantity: selectedSeats.length
      };

      const result = await createTicketWithSeats(ticketData);
      if (result.success) {
        alert('¡Compra realizada exitosamente!');
        setSelectedSeats([]);
        setShowPurchaseModal(false);
        // Reload seats to reflect changes
        if (selectedSection) {
          loadSeatsForSection(selectedSection.id);
        }
      } else {
        alert('Error en la compra: ' + result.message);
        // Revert seat status if purchase failed
        for (const seatId of selectedSeats) {
          await updateSeatStatus(seatId, 'AVAILABLE');
        }
      }
    } catch (error) {
      console.error('Error purchasing seats:', error);
      alert('Error en la compra. Inténtalo de nuevo.');
      // Revert seat status if purchase failed
      for (const seatId of selectedSeats) {
        await updateSeatStatus(seatId, 'AVAILABLE');
      }
    } finally {
      setReservingSeats(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
        <p>Cargando evento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
        <p>Evento no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#1a1a1a' }}>

      {/* Hero Section con las imágenes del tour */}
      <section className="relative">
        <div className="px-4 py-8">
          <div className="max-w-7xl mx-auto">

            {/* Título principal */}
            <h1 className="text-white text-3xl font-bold mb-8 text-center">
              {event.eventName || 'Evento'}
            </h1>

            {/* Imágenes del evento */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="relative">
                <img
                  src={event.image || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop"}
                  alt={event.name}
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
              <div className="relative">
                <img
                  src={event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop"}
                  alt={event.name}
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
              <div className="relative">
                <img
                  src={event.image || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop"}
                  alt={event.name}
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
              <div className="relative">
                <img
                  src={event.image || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=200&fit=crop"}
                  alt={event.name}
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
            </div>

            {/* Grid de imágenes */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop" 
                  alt="Shakira 1" 
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop" 
                  alt="Concierto" 
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop" 
                  alt="Shakira 2" 
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=200&fit=crop" 
                  alt="Shakira 3" 
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <div className="px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Grid principal: Información del evento + Horarios */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            
            {/* Información del evento */}
            <div 
              className="p-6 rounded-lg"
              style={{ backgroundColor: '#8b5cf6' }}
            >
              <h2 className="text-white text-xl font-bold mb-4">
                ¡Prepárate para {event.eventName}!
              </h2>
              <p className="text-white text-sm leading-relaxed mb-4">
                {event.description || 'Descripción del evento no disponible.'}
              </p>
              <p className="text-white text-sm leading-relaxed mb-4">
                Fecha: {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'Fecha no disponible'}
              </p>
              <p className="text-white text-sm leading-relaxed mb-6">
                Ubicación: {event.locationID?.name || 'Ubicación no disponible'}
              </p>
              <button className="bg-purple-800 hover:bg-purple-900 text-white px-6 py-2 rounded-lg transition-colors">
                Ver más
              </button>
            </div>

            {/* Horarios y precios disponibles */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Horarios y Precios</h3>
              <div className="space-y-3">
                {loadingTickets ? (
                  <div className="text-center py-4">
                    <p className="text-gray-400">Cargando precios...</p>
                  </div>
                ) : tickets.length > 0 ? (
                  tickets.map((ticket, index) => (
                    <div key={ticket.id || index} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-white">${ticket.price || 'N/A'}</span>
                      </div>
                      <span className="text-white">{ticket.time || `Horario ${index + 1}`}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-white">$30,000</span>
                      </div>
                      <span className="text-white">2:00 PM</span>
                    </div>

                    <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-white">$30,000</span>
                      </div>
                      <span className="text-white">5:00 PM</span>
                    </div>

                    <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-white">$30,000</span>
                      </div>
                      <span className="text-white">6:00 PM</span>
                    </div>

                    <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-white">$30,000</span>
                      </div>
                      <span className="text-white">7:00 PM</span>
                    </div>
                  </>
                )}

                {/* Botón para ver mapa del evento */}
                <div className="mt-6 text-center">
                  <button
                    onClick={handleShowMap}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Ver mapa de evento
                  </button>
                </div>

              </div>
            </div>

          </div>

          {/* Sección de comentarios */}
          <div className="mb-12">
            
            {/* Formulario para escribir comentario */}
            <div className="mb-8">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">U</span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm mb-2">Título del mensaje:</p>
                  <p className="text-white text-sm mb-3">Puntuación:</p>
                  
                  {/* Sistema de estrellas */}
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 cursor-pointer transition-colors ${
                          star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
                        }`}
                        onClick={() => handleStarClick(star)}
                      />
                    ))}
                  </div>
                  
                  <p className="text-white text-sm mb-3">Escribe tu mensaje:</p>
                  
                  {/* Área de texto */}
                  <textarea
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none"
                    rows="4"
                    placeholder="Escribe tu comentario aquí..."
                  />
                  
                  {/* Botón de enviar */}
                  <div className="flex justify-center mt-4">
                    <button 
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      Enviar
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comentarios existentes */}
            <div className="space-y-6">
              
              {/* Comentario 1 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">A</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold mb-1">Anónimo</p>
                  <p className="text-white text-sm mb-2 leading-relaxed">
                    Bien y sin la mesa de los licores hubiese sido excelente
                  </p>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Muy buena organización del evento, solo en el tema de licores me habré un embargo, parece que nadie se 
                    dio cuenta en la revisión, ya que las mesas tenían botellas vacías por todas partes algo extraño, La 
                    mesa de los licores especial que busqué parte de las personas que estábamos sentados en la parte 
                    de abajo no podían llamar a la atención que vendan los aperitivos. De los demás me encantó todo
                  </p>
                </div>
              </div>

              {/* Comentario 2 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">A</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold mb-1">Anónimo</p>
                  <p className="text-white text-sm mb-2 leading-relaxed">
                    PÉSIMA DISTRIBUCIÓN ESCENARIO.
                  </p>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Totalmente hacia el momento, no hay entretenimiento en cuanto a escenario, pague primera fila como 
                    se puede ver en foto de mi entrada, pero al llegar el artista a escenario estaba de espalda completamente 
                    hasta finalizar show. Los boletos estaban por el valor que la función debía de cumplir expectativas 
                    para con esa cantidad. Una frustración. En definitiva no voy más, el show fue muy bueno pero esta 
                    idea de colocar a las personas en la cara del artista pero metía ultra, cuando el momento era en la mesa del 
                    centro total desaprovechamiento.
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Footer de la página */}
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">DESCUBRIR MAS</p>
            <p className="text-gray-500 text-xs mt-2">Tu Evento</p>
          </div>

        </div>
      </div>

      {/* Modal para el mapa del evento */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Seleccionar Asientos - {event?.eventName}</h2>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="flex">
              {/* Panel lateral de controles */}
              <div className="w-80 bg-gray-50 p-6 border-r">
                <h3 className="text-lg font-semibold mb-4">Seleccionar Asientos</h3>

                {/* Selector de sección */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sección
                  </label>
                  <select
                    value={selectedSection?.id || ''}
                    onChange={(e) => {
                      const section = sections.find(s => s.id === parseInt(e.target.value));
                      setSelectedSection(section);
                    }}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {(sections || []).map(section => (
                      <option key={section.id} value={section.id}>
                        {section.sectionName || section.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selector de ticket */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Ticket
                  </label>
                  <select
                    value={selectedTicket || ''}
                    onChange={(e) => setSelectedTicket(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Seleccionar ticket</option>
                    {(tickets || []).length > 0 ? (
                      (tickets || []).map((ticket, index) => (
                        <option key={ticket.id || index} value={ticket.id || index}>
                          ${ticket.price || 'N/A'} - {ticket.time || `Horario ${index + 1}`}
                        </option>
                      ))
                    ) : (
                      <option value="default" disabled>No hay tickets disponibles</option>
                    )}
                  </select>
                </div>

                {/* Asientos seleccionados */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Asientos Seleccionados ({selectedSeats.length})
                  </h4>
                  <div className="max-h-32 overflow-y-auto">
                    {(selectedSeats || []).map(seatId => {
                      const seat = (seats || []).find(s => s.id === seatId);
                      return (
                        <div key={seatId} className="flex justify-between items-center bg-purple-100 p-2 rounded mb-1">
                          <span className="text-sm">
                            {seat ? `Fila ${seat.row} - Asiento ${seat.seatNumber}` : `Asiento ${seatId}`}
                          </span>
                          <button
                            onClick={() => handleSeatSelect(seatId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Total */}
                {selectedSeats.length > 0 && selectedTicket && (
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold text-purple-600">
                        ${((tickets.find(t => t.id === selectedTicket)?.price || 0) * selectedSeats.length).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Botón de compra */}
                <button
                  onClick={() => setShowPurchaseModal(true)}
                  disabled={selectedSeats.length === 0 || !selectedTicket || reservingSeats}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  {reservingSeats ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Comprar Asientos ({selectedSeats.length})
                    </>
                  )}
                </button>

                {/* Leyenda */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Leyenda</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm text-gray-600">Disponible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-sm text-gray-600">Seleccionado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-sm text-gray-600">Ocupado</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Área del mapa */}
              <div className="flex-1 p-6 flex justify-center items-center min-h-[600px]">
                {loadingLayout ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando mapa del evento...</p>
                  </div>
                ) : (layoutElements && layoutElements.length > 0) || (seats && seats.length > 0) ? (
                  <DrawingCanvas
                    elements={layoutElements || []}
                    selectedElementId={null}
                    onSelect={() => {}}
                    onCreate={() => {}}
                    onUpdate={() => {}}
                    onDelete={() => {}}
                    activeTool="select"
                    setActiveTool={() => {}}
                    units="cm"
                    showMeasurements={true}
                    seats={seats || []}
                    selectedSeats={selectedSeats}
                    onSeatSelect={handleSeatSelect}
                    isSeatSelectionMode={true}
                    zoom={zoom}
                    setZoom={setZoom}
                    offset={offset}
                    setOffset={setOffset}
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🗺️</span>
                    </div>
                    <p className="text-gray-600 font-medium">Mapa no disponible</p>
                    <p className="text-sm text-gray-500 mt-2">El organizador aún no ha creado la distribución de asientos para este evento.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de compra */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <h2 className="text-xl font-bold text-gray-800">Confirmar Compra</h2>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-2">Vas a comprar:</p>
                <ul className="text-sm text-gray-800 space-y-1">
                  <li>• {selectedSeats.length} asiento(s)</li>
                  <li>• Tipo: {tickets.find(t => t.id === selectedTicket)?.time || 'N/A'}</li>
                  <li>• Total: ${((tickets.find(t => t.id === selectedTicket)?.price || 0) * selectedSeats.length).toLocaleString()}</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePurchaseSeats}
                  disabled={reservingSeats}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {reservingSeats ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Procesando...
                    </>
                  ) : (
                    'Confirmar Compra'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservaEvento;