import { API_BASE_URL } from './apiconstant.js';

export const insertEventRating = async (userId, eventId, ratingData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/eventRating/insert/${userId}/${eventId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ratingData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error insertando rating:', error);
    throw error;
  }
};

export const updateEventRating = async (ratingData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/eventRating/update`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ratingData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error actualizando rating:', error);
    throw error;
  }
};

export const getEventRatingByEvent = async (eventId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/eventRating/getByEvent/${eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo ratings del evento:', error);
    throw error;
  }
};

export const getEventRatingByUser = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/eventRating/getByUser/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo ratings del usuario:', error);
    throw error;
  }
};

export const deleteEventRating = async (ratingId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/eventRating/delete?id=${ratingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error eliminando rating:', error);
    throw error;
  }
};