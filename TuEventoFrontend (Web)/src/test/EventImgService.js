// Servicio para manejar llamadas API relacionadas con imágenes de eventos
const API_BASE_URL = 'http://localhost:8080/api/v1';

export const EventImgService = {
  // Obtener imágenes de un evento por ID
  async getEventImages(eventId) {
    try {
      const response = await fetch(`${API_BASE_URL}/event-img/${eventId}`);
      if (!response.ok) {
        throw new Error(`Error al obtener imágenes: ${response.status}`);
      }
      const data = await response.json();
      return data; // Array de {eventImgID, url, order}
    } catch (error) {
      console.error('Error en getEventImages:', error);
      throw error;
    }
  }
};