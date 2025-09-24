import { API_BASE_URL } from './apiconstant.js';

export const saveEventLayout = async (layoutData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/eventLayout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(layoutData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error guardando layout:', error);
    throw error;
  }
};

export const updateEventLayout = async (layoutId, layoutData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/eventLayout/${layoutId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(layoutData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error actualizando layout:', error);
    throw error;
  }
};

export const getEventLayoutByEventId = async (eventId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/eventLayout/event/${eventId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo layout:', error);
    throw error;
  }
};

export const getEventLayoutById = async (layoutId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/eventLayout/${layoutId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo layout:', error);
    throw error;
  }
};

export const deleteEventLayout = async (layoutId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/eventLayout/${layoutId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error eliminando layout:', error);
    throw error;
  }
};

export const hasEventLayout = async (eventId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/eventLayout/exists/event/${eventId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verificando layout:', error);
    throw error;
  }
};