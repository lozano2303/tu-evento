import { useState } from 'react';
import { getAllEvents, cancelEvent } from '../../services/EventService.js';

export const useAdminEvents = () => {
  const [eventos, setEventos] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [mostrarDetalleEvento, setMostrarDetalleEvento] = useState(false);

  // Estados para modal de cancelar evento
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [eventToCancel, setEventToCancel] = useState(null);

  const loadEvents = async () => {
    try {
      setLoadingEventos(true);
      const result = await getAllEvents();
      if (result.success) {
        setEventos(result.data);
      } else {
        console.error('Error loading events:', result.message);
      }
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoadingEventos(false);
    }
  };

  const handleCancelEvent = (eventId) => {
    const event = eventos.find(e => e.id === eventId);
    setEventToCancel(event);
    setShowCancelModal(true);
  };

  const confirmCancelEvent = async () => {
    if (!eventToCancel) return;

    try {
      const result = await cancelEvent(eventToCancel.id);
      if (result.success) {
        setEventos(prev => prev.map(e => e.id === eventToCancel.id ? { ...e, status: 2 } : e));
        setShowCancelModal(false);
        setEventToCancel(null);
      } else {
        throw new Error(result.message || 'Error cancelando evento');
      }
    } catch (err) {
      console.error('Error canceling event:', err);
      throw err;
    }
  };

  return {
    // State
    eventos,
    loadingEventos,
    eventoSeleccionado,
    mostrarDetalleEvento,
    showCancelModal,
    eventToCancel,

    // Setters
    setEventoSeleccionado,
    setMostrarDetalleEvento,
    setShowCancelModal,
    setEventToCancel,

    // Methods
    loadEvents,
    handleCancelEvent,
    confirmCancelEvent
  };
};