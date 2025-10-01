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
    return { success: data.success, data: data.data || [], message: data.message }; // Return consistent format
  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    throw error;
  }
};

export const getEventById = async (eventId) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/v1/event/${eventId}`, {
      method: 'GET',
      headers,
    });
    const data = await response.json();
    return { success: data.success, data: data.data, message: data.message };
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
    const response = await fetch(`${API_BASE_URL}/v1/event/cancel/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error cancelando evento:', error);
    throw error;
  }
};

export const completeEvent = async (eventId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/event/complete/${eventId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error completando evento:', error);
    throw error;
  }
};