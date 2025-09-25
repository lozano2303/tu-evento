import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Star, Send, X, ShoppingCart, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import DrawingCanvas from '../DrawingCanvas.jsx';
import { getEventById } from '../../services/EventService.js';
import { getEventLayoutByEventId } from '../../services/EventLayoutService.js';
import { getTicketsByEvent, createTicketWithSeats } from '../../services/TicketService.js';
import { getSeatsBySection, updateSeatStatus, createSeat, releaseExpiredReservations } from '../../services/SeatService.js';
import { getAllSections, createSection } from '../../services/SectionService.js';

const ReservaEvento = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const eventId = searchParams.get('id');
  const [event, setEvent] = useState(null);
  const [rating, setRating] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [layoutElements, setLayoutElements] = useState([]);
  const [layoutId, setLayoutId] = useState(null);
  const [loadingLayout, setLoadingLayout] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedSeatPositions, setSelectedSeatPositions] = useState(new Set());
  const [reservingSeats, setReservingSeats] = useState(false);
  const [sections, setSections] = useState([]);
  const [seats, setSeats] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [modalError, setModalError] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Maximum seats per purchase
  const MAX_SEATS_PER_PURCHASE = 10;

  // Memoized calculations - moved after all state declarations
  const selectedSeatDetails = useMemo(() => {
    const sectionPrice = selectedSection?.price || 30000;
    const fromSeats = selectedSeats.map(seatId => {
      const seat = seats.find(s => s.id === seatId);
      return seat ? {
        key: seatId,
        row: seat.row,
        seatNumber: seat.seatNumber,
        price: sectionPrice
      } : null;
    }).filter(Boolean);

    const fromPositions = Array.from(selectedSeatPositions).map(key => {
      const [rowId, index] = key.split('-');
      const element = layoutElements.find(el => el.id === rowId);
      if (element && element.seatPositions && element.seatPositions[index]) {
        const pos = element.seatPositions[index];
        const seat = seats.find(s => s.row === pos.row && s.seatNumber === pos.seatNumber);
        if (seat) {
          return {
            key,
            row: pos.row,
            seatNumber: pos.seatNumber,
            price: sectionPrice,
            seatId: seat.id
          };
        }
      }
      return null;
    }).filter(Boolean);

    return [...fromSeats, ...fromPositions];
  }, [selectedSeats, seats, selectedSeatPositions, layoutElements, selectedSection]);

  const selectedSeatCount = useMemo(() => selectedSeatDetails.length, [selectedSeatDetails]);
  const totalPrice = useMemo(() => {
    return selectedSeatDetails.reduce((sum, seat) => sum + seat.price, 0);
  }, [selectedSeatDetails]);

  // Session expiration check
  const checkSession = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      navigate('/login');
      return false;
    }
    return true;
  }, [navigate]);

  // Clear selections after 5 minutes of inactivity
  useEffect(() => {
    if (selectedSeatCount === 0) return;

    const timeout = setTimeout(() => {
      setSelectedSeats([]);
      setSelectedSeatPositions(new Set());
      alert('Tu selección de asientos ha expirado por inactividad. Por favor, selecciona nuevamente.');
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearTimeout(timeout);
  }, [selectedSeatCount]);

  // Clear selections when modal closes
  useEffect(() => {
    if (!showMapModal) {
      setSelectedSeats([]);
      setSelectedSeatPositions(new Set());
    }
  }, [showMapModal]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!showMapModal) return;

      switch (e.key) {
        case 'Escape':
          setShowMapModal(false);
          break;
        case 'Enter':
          if (selectedSeatCount > 0 && !reservingSeats && selectedSeatCount <= MAX_SEATS_PER_PURCHASE) {
            setShowPurchaseModal(true);
          }
          break;
        case 'r':
        case 'R':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleShowMap();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showMapModal, selectedSeatCount, reservingSeats]);

  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) {
        setError('ID de evento no proporcionado');
        setLoading(false);
        return;
      }

      if (!checkSession()) return;

      try {
        setLoading(true);
        const result = await getEventById(eventId);
        if (result.success) {
          setEvent(result.data);
        } else {
          if (result.message?.includes('token') || result.message?.includes('sesión')) {
            checkSession();
          } else {
            setError(result.message || 'Error al cargar el evento');
          }
        }
      } catch (err) {
        if (err.message?.includes('401') || err.message?.includes('token')) {
          checkSession();
        } else {
          setError('Error de conexión al cargar el evento');
          console.error('Error loading event:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId, checkSession]);

  // Load tickets and sections when event is loaded
  useEffect(() => {
    if (event) {
      loadEventTickets();
      loadSections();
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
        console.log("Layout elements cargados:", elements);
        setLayoutElements(elements);
        setLayoutId(result.data.id);
      } else {
        setLayoutElements([]);
        setLayoutId(null);
      }
    } catch (error) {
      console.error('Error loading event layout:', error);
      setLayoutElements([]);
      setLayoutId(null);
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

  const loadSections = async () => {
    if (!eventId) return;

    try {
      const sectionsResult = await getAllSections();
      if (sectionsResult.success) {
        let eventSections = sectionsResult.data.filter(section => section.eventId === parseInt(eventId));

        // If no sections exist, create a default section
        if (eventSections.length === 0) {
          const defaultSection = {
            eventId: parseInt(eventId),
            sectionName: 'General',
            price: 30000
          };
          const createResult = await createSection(defaultSection);
          if (createResult.success && createResult.data) {
            eventSections = [createResult.data];
          } else {
            console.error('Failed to create default section');
            return;
          }
        }

        setSections(eventSections);
        if (eventSections.length > 0 && !selectedSection) {
          setSelectedSection(eventSections[0]);
        }
      }
    } catch (error) {
      console.error('Error loading sections:', error);
    }
  };

  const handleShowMap = async () => {
    setShowMapModal(true);
    setModalLoading(true);
    setModalError(null);
    setLoadingLayout(true);
    try {
      // Release any expired reservations first
      await releaseExpiredReservations();

      const loadedSeats = await loadSectionsAndSeats();
      await loadEventLayout();
      // Generate seats from layout if layout exists
      if (selectedSection && layoutElements.some(el => el.type === 'seatRow')) {
        await generateSeatsFromLayout(layoutElements);
        // Reload seats after generation
        await loadSeatsForSection(selectedSection.id);
      }

      // Load previously selected seat positions from layout
      loadSelectedSeatPositionsFromLayout();
    } catch (error) {
      console.error('Error loading map:', error);
      setModalError('Error al cargar el mapa del evento. Inténtalo de nuevo.');
      setLayoutElements([]);
      setLayoutId(null);
    } finally {
      setLoadingLayout(false);
      setModalLoading(false);
    }
  };

  const loadSelectedSeatPositionsFromLayout = () => {
    const selectedPositions = new Set();
    layoutElements.forEach(element => {
      if (element.type === 'seatRow' && element.seatPositions) {
        element.seatPositions.forEach((pos, index) => {
          if (pos.status === 'RESERVED') {
            selectedPositions.add(`${element.id}-${index}`);
          }
        });
      }
    });
    setSelectedSeatPositions(selectedPositions);
  };

  const loadSectionsAndSeats = async () => {
    if (!eventId) return [];

    try {
      // Load sections for this event
      const sectionsResult = await getAllSections();
      if (sectionsResult.success) {
        let eventSections = sectionsResult.data.filter(section => section.eventId === parseInt(eventId));

        // If no sections exist, create a default section
        if (eventSections.length === 0) {
          const defaultSection = {
            eventId: parseInt(eventId),
            sectionName: 'General',
            price: 30000
          };
          const createResult = await createSection(defaultSection);
          if (createResult.success && createResult.data) {
            eventSections = [createResult.data];
          } else {
            console.error('Failed to create default section');
            return [];
          }
        }

        setSections(eventSections);
        if (eventSections.length > 0) {
          setSelectedSection(eventSections[0]);
          // Load seats for the first section
          const loadedSeats = await loadSeatsForSection(eventSections[0].id);
          return loadedSeats;
        }
      }
    } catch (error) {
      console.error('Error loading sections:', error);
    }
    return [];
  };

  const generateSeatsFromLayout = async (layoutElements) => {
    if (!selectedSection || !layoutElements) return;

    try {
      // Buscar elementos seatRow en el layout y ordenarlos por y descendente (última fila primero)
      const seatRows = layoutElements
        .filter(el => el.type === 'seatRow')
        .sort((a, b) => b.y - a.y); // Orden descendente por y
      console.log("Generando seats para seatRows ordenados:", seatRows.length);

      // Obtener seats existentes para actualizar
      const existingSeats = await getSeatsBySection(selectedSection.id);
      const existingSeatsData = existingSeats.success ? existingSeats.data : [];

      for (let i = 0; i < seatRows.length; i++) {
        const seatRow = seatRows[i];
        const rowLetter = String.fromCharCode(65 + i); // A, B, C, ...
        if (seatRow.seatPositions) {
          console.log("Procesando seats para row:", rowLetter, "con", seatRow.seatPositions.length, "posiciones");
          // Procesar asientos para cada posición
          for (let j = 0; j < seatRow.seatPositions.length; j++) {
            const seatPos = seatRow.seatPositions[j];
            const x = Math.round(seatPos.x);
            const y = Math.round(seatPos.y);
            const seatNumber = (j + 1).toString(); // 1, 2, 3, ...

            // Buscar si el asiento ya existe por coordenadas
            const existingSeat = existingSeatsData.find(seat => Math.round(seat.x) === x && Math.round(seat.y) === y);

            if (existingSeat) {
              // Actualizar asiento existente
              const updateData = {
                seatNumber: seatNumber,
                row: rowLetter,
                status: existingSeat.status ? "OCCUPIED" : "AVAILABLE", // Convertir boolean a string
                sectionID: selectedSection.id,
                eventLayoutID: layoutId,
                x: x,
                y: y
              };
              try {
                await updateSeat(existingSeat.seatID, updateData);
                console.log("Seat actualizado:", updateData);
              } catch (error) {
                console.log('Error actualizando seat:', error);
              }
            } else {
              // Crear nuevo asiento
              const seatData = {
                seatNumber: seatNumber,
                row: rowLetter,
                status: "AVAILABLE",
                sectionID: selectedSection.id,
                eventLayoutID: layoutId,
                x: x,
                y: y
              };
              try {
                await createSeat(seatData);
                console.log("Seat creado:", seatData);
              } catch (error) {
                console.log('Seat might already exist:', error);
              }
            }
          }
        }
      }

      // Recargar asientos después de procesarlos
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
        console.log("Seats cargados:", seatsResult.data);
        setSeats(seatsResult.data);
        setLastUpdate(Date.now());
        return seatsResult.data;
      }
    } catch (error) {
      console.error('Error loading seats:', error);
    }
    return [];
  };

  const handleSeatSelect = (seatId) => {
    console.log("Asiento clickeado:", seatId);
    const seat = seats.find(s => s.id === seatId);
    if (!seat || !['A', 'B'].includes(seat.row)) {
      console.log("Asiento no permitido para selección:", seat?.row);
      return;
    }
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
    console.log("Asientos seleccionados:", selectedSeats);
  };

  const handleSeatPositionSelect = (seatRowId, seatIndex) => {
    const key = `${seatRowId}-${seatIndex}`;
    setSelectedSeatPositions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
        // Update layout element status to AVAILABLE
        setLayoutElements(prevElements =>
          prevElements.map(element =>
            element.id === seatRowId && element.type === 'seatRow'
              ? {
                  ...element,
                  seatPositions: element.seatPositions.map((pos, idx) =>
                    idx === seatIndex ? { ...pos, status: 'AVAILABLE' } : pos
                  )
                }
              : element
          )
        );
      } else {
        newSet.add(key);
        // Update layout element status to RESERVED
        setLayoutElements(prevElements =>
          prevElements.map(element =>
            element.id === seatRowId && element.type === 'seatRow'
              ? {
                  ...element,
                  seatPositions: element.seatPositions.map((pos, idx) =>
                    idx === seatIndex ? { ...pos, status: 'RESERVED' } : pos
                  )
                }
              : element
          )
        );
      }
      setLastUpdate(Date.now());
      return newSet;
    });
  };

  // Function to verify seat availability before purchase
  const verifySeatAvailability = async (seatIds) => {
    try {
      const currentSeats = await getSeatsBySection(selectedSection.id);
      if (!currentSeats.success) {
        throw new Error('No se pudo verificar la disponibilidad de asientos');
      }
      const availableSeats = currentSeats.data.filter(seat => seat.status === 'AVAILABLE').map(seat => seat.id);
      const unavailableSeats = seatIds.filter(id => !availableSeats.includes(id));
      return { available: unavailableSeats.length === 0, unavailableSeats };
    } catch (error) {
      console.error('Error verifying seat availability:', error);
      throw error;
    }
  };


  const handlePurchaseSeats = async () => {
    // Pre-purchase validations
    if (!checkSession()) return;

    const allSeatIds = selectedSeatDetails.map(s => s.seatId).filter(id => id);

    if (allSeatIds.length === 0) {
      alert('Por favor, selecciona al menos un asiento.');
      return;
    }

    if (allSeatIds.length > MAX_SEATS_PER_PURCHASE) {
      alert(`No puedes seleccionar más de ${MAX_SEATS_PER_PURCHASE} asientos por reserva.`);
      return;
    }

    // Check for duplicates (shouldn't happen, but safety check)
    if (new Set(allSeatIds).size !== allSeatIds.length) {
      alert('Hay asientos duplicados en la selección. Por favor, verifica.');
      return;
    }

    // Verify event is still active
    if (event && new Date(event.endDate) < new Date()) {
      alert('Este evento ya ha finalizado.');
      return;
    }

    // Verify real-time availability with timeout
    const availabilityPromise = verifySeatAvailability(allSeatIds);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 10000)
    );

    try {
      const availabilityCheck = await Promise.race([availabilityPromise, timeoutPromise]);
      if (!availabilityCheck.available) {
        alert(`Los siguientes asientos ya no están disponibles: ${availabilityCheck.unavailableSeats.join(', ')}. La selección se actualizará.`);
        // Remove unavailable seats from selection
        const availableSeatIds = allSeatIds.filter(id => !availabilityCheck.unavailableSeats.includes(id));
        setSelectedSeats(prev => prev.filter(id => availableSeatIds.includes(id)));
        setSelectedSeatPositions(prev => {
          const newSet = new Set();
          prev.forEach(key => {
            const [rowId, index] = key.split('-');
            const element = layoutElements.find(el => el.id === rowId);
            if (element && element.seatPositions && element.seatPositions[index]) {
              const pos = element.seatPositions[index];
              const seat = seats.find(s => s.row === pos.row && s.seatNumber === pos.seatNumber);
              if (seat && availableSeatIds.includes(seat.id)) {
                newSet.add(key);
              }
            }
          });
          return newSet;
        });
        // Reload seats
        if (selectedSection) {
          await loadSeatsForSection(selectedSection.id);
        }
        return;
      }
    } catch (error) {
      if (error.message === 'Timeout') {
        alert('La verificación de disponibilidad tardó demasiado. Inténtalo de nuevo.');
      } else {
        alert('Error al verificar disponibilidad. Inténtalo de nuevo.');
      }
      return;
    }

    setReservingSeats(true);
    const reservedSeats = [];
    let ticketCreated = false;

    try {
      // Reserve seats in parallel for better performance
      const reservePromises = allSeatIds.map(seatId =>
        updateSeatStatus(seatId, 'RESERVED').then(result => {
          if (result.success) {
            reservedSeats.push(seatId);
            return { seatId, success: true };
          } else {
            return { seatId, success: false, error: result.message };
          }
        }).catch(error => ({ seatId, success: false, error: error.message }))
      );

      const reserveResults = await Promise.allSettled(reservePromises);
      const failedReserves = reserveResults.filter(result =>
        result.status === 'rejected' || !result.value.success
      );

      if (failedReserves.length > 0) {
        const failedSeatIds = failedReserves.map(result =>
          result.status === 'fulfilled' ? result.value.seatId : 'desconocido'
        );
        throw new Error(`No se pudieron reservar los siguientes asientos: ${failedSeatIds.join(', ')}`);
      }

      // Create ticket with selected seats
      const ticketData = {
        event: { id: parseInt(eventId) },
        seats: allSeatIds.map(seatId => ({ id: seatId })),
        quantity: allSeatIds.length
      };

      const result = await createTicketWithSeats(ticketData);
      if (result.success) {
        ticketCreated = true;
        alert('¡Reserva realizada exitosamente! Revisa tu correo electrónico para el ticket con QR.');
        setSelectedSeats([]);
        setSelectedSeatPositions(new Set());
        setShowPurchaseModal(false);
        // Reload seats to reflect changes
        if (selectedSection) {
          await loadSeatsForSection(selectedSection.id);
        }
      } else {
        throw new Error(result.message || 'Error desconocido en la creación del ticket');
      }
    } catch (error) {
      console.error('Error purchasing seats:', error);
      alert(`Error en la compra: ${error.message}. Se revertirán los cambios.`);

      // Rollback: revert reserved seats only if ticket was not created
      if (!ticketCreated && reservedSeats.length > 0) {
        try {
          const rollbackPromises = reservedSeats.map(seatId =>
            updateSeatStatus(seatId, 'AVAILABLE').catch(err =>
              console.error(`Error reverting seat ${seatId}:`, err)
            )
          );
          await Promise.allSettled(rollbackPromises);
          console.log('Rollback completed for reserved seats');
        } catch (rollbackError) {
          console.error('Error during rollback:', rollbackError);
          alert('Error adicional durante la reversión. Contacta soporte.');
        }
      }

      // Reload seats to reflect any changes
      if (selectedSection) {
        await loadSeatsForSection(selectedSection.id);
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

            {/* Breadcrumbs */}
            <div className="text-white text-sm mb-4 text-center">
              <Link to="/" className="hover:underline">Inicio</Link> {'>'}
              <Link to="/events" className="hover:underline ml-1">Eventos</Link> {'>'}
              <span className="ml-1">{event.eventName || 'Evento'}</span>
            </div>

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
                <p className="text-gray-600 mb-2">Vas a reservar:</p>
                <ul className="text-sm text-gray-800 space-y-1">
                  <li>• {selectedSeatCount} asiento(s)</li>
                  <li>• Total: ${totalPrice.toLocaleString()}</li>
                </ul>
                {selectedSeatDetails.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Detalle de asientos:</p>
                    <div className="max-h-20 overflow-y-auto">
                      {selectedSeatDetails.map(seat => (
                        <div key={seat.key} className="text-xs text-gray-500">
                          • Fila {seat.row} Asiento {seat.seatNumber}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    📧 Recibirás el ticket con QR y los datos de la reserva en tu correo electrónico.
                  </p>
                </div>
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
                    'Confirmar Reserva'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para el mapa del evento */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Reservar Asientos - {event?.eventName}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    if (selectedSection) {
                      await loadSeatsForSection(selectedSection.id);
                      setLastUpdate(Date.now());
                    }
                  }}
                  disabled={modalLoading}
                  className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  title="Actualizar estado de asientos"
                >
                  <RefreshCw className={`w-6 h-6 ${modalLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setShowMapModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Cerrar (ESC)"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>
            </div>

            <div className="flex">
              {/* Panel lateral de controles */}
              <div className="w-80 bg-gray-50 p-6 border-r">
                <h3 className="text-lg font-semibold mb-4">Seleccionar Asientos</h3>

                {/* Selector de sección */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar Sección
                  </label>
                  <select
                    value={selectedSection?.id || ''}
                    onChange={(e) => {
                      const secId = parseInt(e.target.value);
                      const sec = sections.find(s => s.id === secId);
                      setSelectedSection(sec);
                      setSelectedSeats([]);
                      setSelectedSeatPositions(new Set());
                      loadSeatsForSection(sec.id);
                    }}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {sections.map(sec => (
                      <option key={sec.id} value={sec.id}>
                        {sec.sectionName} - ${sec.price}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Precio de sección */}
                <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600">Precio por asiento:</div>
                  <div className="font-bold text-purple-600">${selectedSection?.price || 30000}</div>
                </div>

                {/* Asientos seleccionados */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Asientos Seleccionados ({selectedSeatCount})
                    {selectedSeatCount > MAX_SEATS_PER_PURCHASE && (
                      <span className="text-red-500 text-xs ml-2">
                        (Máximo {MAX_SEATS_PER_PURCHASE})
                      </span>
                    )}
                  </h4>
                  <div className="max-h-32 overflow-y-auto">
                    {selectedSeatDetails.map(seat => (
                      <div key={seat.key} className="flex justify-between items-center bg-purple-100 p-2 rounded mb-1">
                        <span className="text-sm">
                          Fila {seat.row} - Asiento {seat.seatNumber}
                        </span>
                        <button
                          onClick={() => {
                            const newSelected = new Set(selectedSeatPositions);
                            newSelected.delete(seat.key);
                            setSelectedSeatPositions(newSelected);
                          }}
                          className="text-red-500 hover:text-red-700"
                          disabled={reservingSeats}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                {selectedSeatCount > 0 && (
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold text-purple-600">
                        ${totalPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      ${selectedSection?.price || 30000} × {selectedSeatCount} asiento(s)
                    </div>
                  </div>
                )}

                {/* Botón de reserva */}
                {(() => {
                  const canReserve = selectedSeatCount > 0 && !reservingSeats && selectedSeatCount <= MAX_SEATS_PER_PURCHASE;
                  let buttonText = "Reservar Asientos";
                  let buttonColor = "bg-purple-600 hover:bg-purple-700";

                  if (reservingSeats) {
                    buttonText = "Procesando...";
                  } else if (selectedSeatCount === 0) {
                    buttonText = "Selecciona asientos";
                    buttonColor = "bg-gray-400";
                  } else if (selectedSeatCount > MAX_SEATS_PER_PURCHASE) {
                    buttonText = `Máximo ${MAX_SEATS_PER_PURCHASE} asientos`;
                    buttonColor = "bg-red-500 hover:bg-red-600";
                  } else {
                    buttonText = `Reservar Asientos (${selectedSeatCount})`;
                  }

                  return (
                    <button
                      onClick={() => canReserve && setShowPurchaseModal(true)}
                      disabled={!canReserve}
                      className={`w-full ${buttonColor} disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors`}
                    >
                      {reservingSeats ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5" />
                          {buttonText}
                        </>
                      )}
                    </button>
                  );
                })()}

                {/* Información adicional */}
                <div className="mt-4 text-xs text-gray-600">
                  <p>• Presiona ESC para cerrar el modal</p>
                  <p>• Presiona ENTER para confirmar reserva</p>
                  <p>• Ctrl+R para recargar el mapa</p>
                  {selectedSeatCount > 0 && selectedSeatCount <= MAX_SEATS_PER_PURCHASE && (
                    <p className="mt-1 text-green-600">
                      • Listo para reservar
                    </p>
                  )}
                  {selectedSeatCount > MAX_SEATS_PER_PURCHASE && (
                    <p className="mt-1 text-red-500">
                      • Máximo {MAX_SEATS_PER_PURCHASE} asientos por reserva
                    </p>
                  )}
                </div>

                {/* Última actualización */}
                <div className="mt-2 text-xs text-gray-500">
                  Última actualización: {new Date(lastUpdate).toLocaleTimeString()}
                </div>

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
                {modalLoading || loadingLayout ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando mapa del evento...</p>
                  </div>
                ) : modalError ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl text-red-500">⚠️</span>
                    </div>
                    <p className="text-red-600 font-medium">Error al cargar el mapa</p>
                    <p className="text-sm text-gray-500 mt-2">{modalError}</p>
                    <button
                      onClick={handleShowMap}
                      className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Reintentar
                    </button>
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
                    onSeatPositionSelect={handleSeatPositionSelect}
                    isSeatSelectionMode={true}
                    zoom={zoom}
                    setZoom={setZoom}
                    offset={offset}
                    setOffset={setOffset}
                    selectedSection={selectedSection}
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

    </div>
  );
};

export default ReservaEvento;