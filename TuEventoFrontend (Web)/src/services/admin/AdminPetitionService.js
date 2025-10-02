import { API_BASE_URL } from './apiconstant.js';

export const getAllPetitions = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/organizer-petitions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo peticiones:', error);
    throw error;
  }
};

export const updatePetitionStatus = async (petitionId, status) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/organizer-petitions/${petitionId}/status?status=${status}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error actualizando estado de petición:', error);
    throw error;
  }
};

export const downloadPetitionDocument = async (petitionId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/organizer-petitions/${petitionId}/document`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error descargando documento');
    }

    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error descargando documento:', error);
    throw error;
  }
};