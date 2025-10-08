import { useState, useEffect } from 'react';
import { getEventById } from '../../services/EventService.js';
import { getEventImages } from '../../services/EventImgService.js';
import { getCategoriesByEvent } from '../../services/CategoryService.js';
import { getTicketsByEvent } from '../../services/TicketService.js';

export const useEventData = (eventId) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventImages, setEventImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [eventCategories, setEventCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

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

  const loadEventImages = async () => {
    if (!eventId) return;

    try {
      setLoadingImages(true);
      const result = await getEventImages(eventId);
      if (result.success) {
        const sortedImages = (result.data || []).sort((a, b) => (a.order || 0) - (b.order || 0));
        setEventImages(sortedImages);
      } else {
        setEventImages([]);
      }
    } catch (error) {
      console.error('Error loading event images:', error);
      setEventImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  const loadEventCategories = async () => {
    if (!eventId) return;

    try {
      setLoadingCategories(true);
      const result = await getCategoriesByEvent(eventId);
      if (result.success) {
        setEventCategories(result.data || []);
      } else {
        setEventCategories([]);
      }
    } catch (error) {
      console.error('Error loading event categories:', error);
      setEventCategories([]);
    } finally {
      setLoadingCategories(false);
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

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  useEffect(() => {
    if (event) {
      loadEventTickets();
      loadEventImages();
      loadEventCategories();
    }
  }, [event]);

  return {
    event,
    loading,
    error,
    eventImages,
    loadingImages,
    eventCategories,
    loadingCategories,
    tickets,
    loadingTickets,
    // Methods for external control if needed
    reloadEvent: loadEvent,
    reloadImages: loadEventImages,
    reloadCategories: loadEventCategories,
    reloadTickets: loadEventTickets
  };
};