// Servicio para manejar llamadas API relacionadas con imágenes de eventos
const API_BASE_URL = 'http://192.168.0.26:8080/api';

export const EventImgService = {
  // Obtener todos los eventos (sin token para acceso público)
  async getAllEvents() {
    try {
      const url = `${API_BASE_URL}/v1/event/getAll`;
      console.log('Making request to:', url);
      const response = await fetch(url);
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      if (!response.ok) {
        const text = await response.text();
        console.log('Error response text:', text);
        throw new Error(`Error al obtener eventos: ${response.status} - ${text}`);
      }
      const data = await response.json();
      console.log('Parsed JSON data:', data);
      return data.data || data; // Retornar el array de eventos
    } catch (error) {
      console.error('Error en getAllEvents:', error);
      throw error;
    }
  },

  // Obtener imágenes de un evento por ID
  async getEventImages(eventId: number) {
    try {
      const url = `${API_BASE_URL}/v1/event-img/${eventId}`;
      console.log('Making request to:', url);
      const response = await fetch(url);
      console.log('Response status:', response.status);
      if (!response.ok) {
        const text = await response.text();
        console.log('Error response text:', text);
        throw new Error(`Error al obtener imágenes: ${response.status} - ${text}`);
      }
      const data = await response.json();
      console.log('Parsed JSON data:', data);
      return data; // Array de {eventImgID, url, order}
    } catch (error) {
      console.error('Error en getEventImages:', error);
      throw error;
    }
  }
};
