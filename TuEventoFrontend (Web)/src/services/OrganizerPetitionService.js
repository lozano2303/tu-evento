import { API_BASE_URL } from './apiconstant.js';

export const getPetitionById = async (petitionId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/organizer-petitions/${petitionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo petición:', error);
    throw error;
  }
};

export const getPetitionsByUser = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/organizer-petitions/user/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo peticiones del usuario:', error);
    throw error;
  }
};

export const createPetition = async (petitionData) => {
  try {
    const token = localStorage.getItem('token');
    console.log('Sending petition with authentication');

    const response = await fetch(`${API_BASE_URL}/v1/organizer-petitions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // No especificar Content-Type para FormData - el navegador lo hace automáticamente
      },
      body: petitionData, // FormData for file uploads
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error('Error creando petición:', error);
    throw error;
  }
};
