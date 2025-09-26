import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Star, Send, X, ShoppingCart, CheckCircle, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import DrawingCanvas from '../DrawingCanvas.jsx';
import { getEventById } from '../../services/EventService.js';
import { getEventLayoutByEventId } from '../../services/EventLayoutService.js';
import { getTicketsByEvent, createTicketWithSeats } from '../../services/TicketService.js';
import { getSeatsBySection, updateSeatStatus, createSeat, releaseExpiredReservations } from '../../services/SeatService.js';
import { getAllSections, createSection } from '../../services/SectionService.js';
import { insertEventRating, getEventRatingByEvent, deleteEventRating } from '../../services/EventRatingService.js';
import { getUserById } from '../../services/UserService.js';

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
  const [eventRatings, setEventRatings] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(5);
  const [userInfo, setUserInfo] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [deletingRating, setDeletingRating] = useState(null);
  const [updateKey, setUpdateKey] = useState(0);

  const MAX_SEATS_PER_PURCHASE = 10;
  const selectedSeatDetails = useMemo(() => {
    const sectionPrice = selectedSection?.price || 30000;
    return selectedSeats.map(seatId => {
      const seat = seats.find(s => s.id === seatId);
      return seat ? {
        key: seatId,
        row: seat.row,
        seatNumber: seat.seatNumber,
        price: sectionPrice,
        seatId: seat.id
      } : null;
    }).filter(Boolean);
  }, [selectedSeats, seats, selectedSection]);

  const selectedSeatCount = useMemo(() => selectedSeatDetails.length, [selectedSeatDetails]);
  const totalPrice = useMemo(() => {
    return selectedSeatDetails.reduce((sum, seat) => sum + seat.price, 0);
  }, [selectedSeatDetails]);

  const checkSession = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      navigate('/login');
      return false;
    }
    return true;
  }, [navigate]);

<<<<<<< HEAD
  // Handle rating submission
  const handleSubmitRating = async () => {
    if (!rating || !mensaje.trim()) {
      alert('Por favor, selecciona una calificación y escribe un comentario.');
      return;
    }
    if (!checkSession()) return;

    setSubmittingRating(true);
    try {
      const result = await insertEventRating({
        eventId: parseInt(eventId),
        rating: rating,
        comment: mensaje.trim()
      });
      if (result.success) {
        setMensaje('');
        setRating(0);
        loadEventRatings(); // Reload ratings
        alert('Comentario enviado exitosamente.');
      } else {
        alert(result.message || 'Error al enviar el comentario.');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Error al enviar el comentario.');
    } finally {
      setSubmittingRating(false);
    }
  };

  // Handle rating deletion
  const handleDeleteRating = async (ratingId, userId) => {
    if (!checkSession()) return;
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) return;

    setDeletingRating(ratingId);
    try {
      const result = await deleteEventRating(ratingId);
      if (result.success) {
        loadEventRatings(); // Reload ratings
        alert('Comentario eliminado exitosamente.');
      } else {
        alert(result.message || 'Error al eliminar el comentario.');
      }
    } catch (error) {
      console.error('Error deleting rating:', error);
      alert('Error al eliminar el comentario.');
    } finally {
      setDeletingRating(null);
    }
  };

  // Handle showing more comments
  const handleShowMoreComments = () => {
    setVisibleCommentsCount(prev => Math.min(prev + 5, eventRatings.length));
  };

  // Handle showing less comments
  const handleShowLessComments = () => {
    setVisibleCommentsCount(5);
  };

  // Clear selections after 5 minutes of inactivity
=======
>>>>>>> b8cd2ab99b5bb612f7402a08e88a6b78be94cffc
  useEffect(() => {
    if (selectedSeatCount === 0) return;

    const timeout = setTimeout(() => {
      setSelectedSeats([]);
      alert('Tu selección de asientos ha expirado por inactividad. Por favor, selecciona nuevamente.');
    }, 5 * 60 * 1000);

    return () => clearTimeout(timeout);
  }, [selectedSeatCount]);

  useEffect(() => {
    if (!showMapModal) {
      setSelectedSeats([]);
    }
  }, [showMapModal]);

<<<<<<< HEAD
  // Real-time seat status updates
  useEffect(() => {
    if (!showMapModal || !selectedSection) return;

    const interval = setInterval(async () => {
      await loadSeatsForSection(selectedSection.sectionID);
      await loadEventLayout();
      setUpdateKey(prev => prev + 1);
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [showMapModal, selectedSection]);




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
        await loadSeatsForSection(selectedSection.sectionID);
      }

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

  // Keyboard shortcuts
=======
>>>>>>> b8cd2ab99b5bb612f7402a08e88a6b78be94cffc
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
  }, [showMapModal, selectedSeatCount, reservingSeats, handleShowMap]);

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

  useEffect(() => {
    if (event) {
      loadEventTickets();
      loadSections();
      loadEventRatings();
    }
  }, [event]);

  useEffect(() => {
    if (selectedSection) {
      loadSeatsForSection(selectedSection.sectionID);
    }
  }, [selectedSection]);

  useEffect(() => {
    setLayoutElements(prev => prev.map(element => {
      if (element.type === 'seatRow' && element.seatPositions) {
        const updatedPositions = element.seatPositions.map(pos => {
          const isSelected = selectedSeats.includes(pos.id);
          return { ...pos, status: isSelected ? 'SELECTED' : (pos.status === 'SELECTED' ? 'AVAILABLE' : pos.status) };
        });
        return { ...element, seatPositions: updatedPositions };
      }
      return element;
    }));
  }, [selectedSeats]);

  const handleStarClick = (starNumber) => {
    setRating(starNumber);
  };

<<<<<<< HEAD
  // Function to match seats with layout elements
  const matchSeatsWithLayout = (layoutElements, seats) => {
    return layoutElements.map(element => {
      if (element.type === 'seatRow' && element.seatPositions) {
        const updatedPositions = element.seatPositions.map(pos => {
          const matchingSeat = seats.find(seat =>
            seat.row === pos.row && seat.seatNumber === pos.seatNumber.toString()
          );
          if (matchingSeat) {
            return {
              ...pos,
              status: matchingSeat.status,
              id: matchingSeat.id
            };
          }
          return pos;
        });
        return { ...element, seatPositions: updatedPositions };
      }
      return element;
    });
=======
  const handleSubmitRating = async () => {
    if (!checkSession()) return;

    if (!rating || rating < 1 || rating > 5) {
      alert('Por favor, selecciona una calificación entre 1 y 5 estrellas.');
      return;
    }

    if (!mensaje || mensaje.trim().length === 0) {
      alert('Por favor, escribe un comentario.');
      return;
    }

    const currentUserId = localStorage.getItem('userID');
    if (!currentUserId) {
      alert('No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.');
      return;
    }

    try {
      setSubmittingRating(true);
      const ratingData = {
        rating: rating,
        comment: mensaje.trim()
      };

      const result = await insertEventRating(currentUserId, eventId, ratingData);

      if (result.success) {
        alert('¡Reseña enviada exitosamente!');
        setRating(0);
        setMensaje('');
        await loadEventRatings();
      } else {
        alert(result.message || 'Error al enviar la reseña. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleShowMoreComments = () => {
    setVisibleCommentsCount(prev => prev + 5);
  };

  const handleShowLessComments = () => {
    setVisibleCommentsCount(5);
  };

  const handleDeleteRating = async (ratingId, ratingUserId) => {
    if (!checkSession()) return;

    const currentUserId = localStorage.getItem('userID');
    if (!currentUserId || parseInt(currentUserId) !== ratingUserId) {
      alert('No tienes permiso para eliminar este comentario.');
      return;
    }

    if (!confirm('¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setDeletingRating(ratingId);
      const result = await deleteEventRating(ratingId);

      if (result.success) {
        alert('Comentario eliminado exitosamente.');
        await loadEventRatings();
      } else {
        alert(result.message || 'Error al eliminar el comentario. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error deleting rating:', error);
      alert('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setDeletingRating(null);
    }
>>>>>>> b8cd2ab99b5bb612f7402a08e88a6b78be94cffc
  };

  const loadEventLayout = async () => {
    if (!eventId) return;

    try {
      setLoadingLayout(true);
      const result = await getEventLayoutByEventId(eventId);
      if (result.success && result.data && result.data.layoutData && result.data.layoutData.elements) {
        let elements = result.data.layoutData.elements;
        console.log("Layout elements cargados:", elements);
        elements = matchSeatsWithLayout(elements, seats);
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

        setSections(eventSections);
        if (eventSections.length > 0 && !selectedSection) {
          setSelectedSection(eventSections[0]);
        }
      }
    } catch (error) {
      console.error('Error loading sections:', error);
    }
  };

  const loadUserInfo = async (userIds) => {
    if (!userIds || userIds.length === 0) return;

    try {
      setLoadingUsers(true);
      const userPromises = userIds.map(userId => getUserById(userId));
      const userResults = await Promise.allSettled(userPromises);

      const newUserInfo = {};
      userResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          const userId = userIds[index];
          newUserInfo[userId] = result.value.data;
        }
      });

      setUserInfo(prev => ({ ...prev, ...newUserInfo }));
    } catch (error) {
      console.error('Error loading user info:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadEventRatings = async () => {
    if (!eventId) return;

    try {
      setLoadingRatings(true);
      const result = await getEventRatingByEvent(eventId);
      if (result.success) {
        const ratings = result.data || [];
        setEventRatings(ratings);

        const userIds = [...new Set(ratings.map(rating => rating.userId))];
        await loadUserInfo(userIds);
      } else {
        setEventRatings([]);
      }
    } catch (error) {
      console.error('Error loading event ratings:', error);
      setEventRatings([]);
    } finally {
      setLoadingRatings(false);
    }
  };

<<<<<<< HEAD

=======
  const handleShowMap = async () => {
    setShowMapModal(true);
    setModalLoading(true);
    setModalError(null);
    setLoadingLayout(true);
    try {
      await releaseExpiredReservations();

      const loadedSeats = await loadSectionsAndSeats();
      await loadEventLayout();
      if (selectedSection && layoutElements.some(el => el.type === 'seatRow')) {
        await generateSeatsFromLayout(layoutElements);
        // Reload seats after generation
        await loadSeatsForSection(selectedSection.sectionID);
      }

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
>>>>>>> b8cd2ab99b5bb612f7402a08e88a6b78be94cffc

  const loadSectionsAndSeats = async () => {
    if (!eventId) return [];

    try {
      const sectionsResult = await getAllSections();
      if (sectionsResult.success) {
        let eventSections = sectionsResult.data.filter(section => section.eventId === parseInt(eventId));

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
          const loadedSeats = await loadSeatsForSection(eventSections[0].sectionID);
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
      const seatRows = layoutElements
        .filter(el => el.type === 'seatRow')
        .sort((a, b) => b.y - a.y);
      console.log("Generando seats para seatRows ordenados:", seatRows.length);

      const existingSeats = await getSeatsBySection(selectedSection.sectionID);
      const existingSeatsData = existingSeats.success ? existingSeats.data : [];

      for (let i = 0; i < seatRows.length; i++) {
        const seatRow = seatRows[i];
        const rowLetter = String.fromCharCode(65 + i);
        if (seatRow.seatPositions) {
          console.log("Procesando seats para row:", rowLetter, "con", seatRow.seatPositions.length, "posiciones");
          for (let j = 0; j < seatRow.seatPositions.length; j++) {
            const seatPos = seatRow.seatPositions[j];
            const x = Math.round(seatPos.x);
            const y = Math.round(seatPos.y);
            const seatNumber = (j + 1).toString();

            const existingSeat = existingSeatsData.find(seat => Math.round(seat.x) === x && Math.round(seat.y) === y);

            if (existingSeat) {
              const updateData = {
                seatNumber: seatNumber,
                row: rowLetter,
                status: existingSeat.status,
                sectionID: selectedSection.sectionID,
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
              const seatData = {
                seatNumber: seatNumber,
                row: rowLetter,
                status: "AVAILABLE",
                sectionID: selectedSection.sectionID,
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

      if (selectedSection) {
        loadSeatsForSection(selectedSection.sectionID);
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
    if (!seat) {
      console.log("Asiento no encontrado:", seatId);
      return;
    }
    if (seat.status !== "AVAILABLE") {
      console.log("Asiento no disponible:", seatId);
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
    const element = layoutElements.find(el => el.id === seatRowId);
    if (element && element.seatPositions && element.seatPositions[seatIndex]) {
      const pos = element.seatPositions[seatIndex];
      const seat = seats.find(s => s.row === pos.row && s.seatNumber === pos.seatNumber);
      if (seat && seat.status === "AVAILABLE") {
        setSelectedSeats(prev => {
          if (prev.includes(seat.id)) {
            return prev.filter(id => id !== seat.id);
          } else {
            return [...prev, seat.id];
          }
        });
      }
    }
  };

  const verifySeatAvailability = async (seatIds) => {
    try {
      const currentSeats = await getSeatsBySection(selectedSection.sectionID);
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
        setSelectedSeats(prev => prev.filter(id => !availabilityCheck.unavailableSeats.includes(id)));
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
        setShowPurchaseModal(false);
        // Reload seats to reflect changes
        if (selectedSection) {
          await loadSeatsForSection(selectedSection.sectionID);
          await loadEventLayout();
        }
      } else {
        throw new Error(result.message || 'Error desconocido en la creación del ticket');
      }
    } catch (error) {
      console.error('Error purchasing seats:', error);
      alert(`Error en la compra: ${error.message}. Se revertirán los cambios.`);

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
        await loadSeatsForSection(selectedSection.sectionID);
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
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
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

          <div className="mb-12">
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
                      onClick={handleSubmitRating}
                      disabled={submittingRating}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      {submittingRating ? 'Enviando...' : 'Enviar'}
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {loadingRatings ? (
                <div className="text-center py-4">
                  <p className="text-gray-400">Cargando comentarios...</p>
                </div>
              ) : eventRatings.length > 0 ? (
                <>
                  {eventRatings.slice(0, visibleCommentsCount).map((rating, index) => {
                    const user = userInfo[rating.userId];
                    const displayName = user?.fullName || `Usuario ${rating.userId}`;
                    const avatarLetter = user?.fullName?.charAt(0).toUpperCase() || rating.userId?.toString().charAt(0).toUpperCase() || 'U';

                    const currentUserId = localStorage.getItem('userID');
                    const canDelete = currentUserId && parseInt(currentUserId) === rating.userId;

                    return (
                      <div key={rating.ratingID || index} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">
                            {avatarLetter}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <p className="text-white font-semibold">{displayName}</p>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= rating.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteRating(rating.ratingID, rating.userId)}
                                disabled={deletingRating === rating.ratingID}
                                className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1"
                                title="Eliminar comentario"
                              >
                                {deletingRating === rating.ratingID ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                          <p className="text-gray-400 text-xs leading-relaxed">
                            {rating.comment}
                          </p>
                          {rating.createdAt && (
                            <p className="text-gray-500 text-xs mt-1">
                              {new Date(rating.createdAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <div className="text-center mt-6 space-y-3">
                    {eventRatings.length > visibleCommentsCount && (
                      <button
                        onClick={handleShowMoreComments}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        Ver más comentarios ({eventRatings.length - visibleCommentsCount} restantes)
                      </button>
                    )}
                    {visibleCommentsCount > 5 && (
                      <div>
                        <button
                          onClick={handleShowLessComments}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                          Ver menos comentarios
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">Aún no hay comentarios para este evento.</p>
                  <p className="text-gray-500 text-sm mt-2">¡Sé el primero en dejar tu opinión!</p>
                </div>
              )}
            </div>

          </div>

          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">DESCUBRIR MAS</p>
            <p className="text-gray-500 text-xs mt-2">Tu Evento</p>
          </div>

        </div>
      </div>

      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
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
              <div className="w-80 bg-gray-50 p-6 border-r">
                <h3 className="text-lg font-semibold mb-4">Seleccionar Asientos</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar Sección
                  </label>
                  <select
                    value={selectedSection?.sectionID || ''}
                    onChange={(e) => {
                      const secId = parseInt(e.target.value);
                      const sec = sections.find(s => s.sectionID === secId);
                      setSelectedSection(sec);
                      setSelectedSeats([]);
                      loadSeatsForSection(sec.sectionID);
                    }}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {sections.map(sec => (
                      <option key={sec.sectionID} value={sec.sectionID}>
                        {sec.sectionName} - ${sec.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600">Precio por asiento:</div>
                  <div className="font-bold text-purple-600">${selectedSection?.price || 30000}</div>
                </div>

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
                      <div key={seat.key} className="bg-purple-100 p-2 rounded mb-1">
                        <span className="text-sm">
                          Fila {seat.row} - Asiento {seat.seatNumber}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

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

                <div className="mt-2 text-xs text-gray-500">
                  Última actualización: {new Date(lastUpdate).toLocaleTimeString()}
                </div>

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

              <div className="flex-1 p-6 flex flex-col">
                <div className="flex-1 flex justify-center items-center border rounded-lg bg-gray-50 overflow-hidden">
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
                    (() => {
                      const filteredSeats = seats.filter(seat => seat.sectionID === selectedSection?.sectionID) || [];
                      const filteredElements = layoutElements.map(element => {
                        if (element.type === 'seatRow' && element.seatPositions) {
                          const updatedPositions = element.seatPositions.map(pos => {
                            const matchingSeat = filteredSeats.find(seat => seat.row === pos.row && seat.seatNumber.toString() === pos.seatNumber);
                            if (matchingSeat) {
                              return { ...pos, status: matchingSeat.status };
                            }
                            return pos;
                          });
                          return { ...element, seatPositions: updatedPositions };
                        }
                        return element;
                      });
                      return (
                        <DrawingCanvas
                          key={updateKey}
                          elements={filteredElements || []}
                          selectedElementId={null}
                          onSelect={() => {}}
                          onCreate={() => {}}
                          onUpdate={() => {}}
                          onDelete={() => {}}
                          activeTool="select"
                          setActiveTool={() => {}}
                          units="cm"
                          showMeasurements={false}
                          seats={filteredSeats}
                          selectedSeats={selectedSeats}
                          onSeatSelect={handleSeatSelect}
                          onSeatPositionSelect={handleSeatPositionSelect}
                          isSeatSelectionMode={true}
                          allowMultipleSeats={true}
                          zoom={zoom}
                          setZoom={setZoom}
                          offset={offset}
                          setOffset={setOffset}
                          selectedSection={selectedSection}
                        />
                      );
                    })()
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
        </div>
      )}

    </div>
  );
};

export default ReservaEvento;
