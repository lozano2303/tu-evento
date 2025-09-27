import { API_BASE_URL } from './apiconstant.js';

export const getAllEvents = async () => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/v1/event/getAll`, {
      method: 'GET',
      headers,
    });
    const data = await response.json();
    return data.data || []; // Return the data array or empty array
  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    throw error;
  }
};

export const getEventById = async (eventId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/event/${eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo evento:', error);
    throw error;
  }
};

export const createEvent = async (eventData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/event/insert`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creando evento:', error);
    throw error;
  }
};

export const updateEvent = async (eventData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/events/update`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error actualizando evento:', error);
    throw error;
  }
};

export const cancelEvent = async (eventId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/events/cancel`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: eventId }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error cancelando evento:', error);
    throw error;
  }
};