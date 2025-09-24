import { API_BASE_URL } from './apiconstant.js';

export const saveEventLayout = async (layoutData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/event-layouts/insert`, {
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

export const updateEventLayout = async (name, layoutData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/event-layouts/update/${name}`, {
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

export const getEventLayout = async (name) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/event-layouts/get/${name}`, {
      method: 'POST',
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

export const deleteEventLayout = async (layoutData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/event-layouts/delete`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(layoutData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error eliminando layout:', error);
    throw error;
  }
};