import { API_BASE_URL } from './apiconstant.js';

export const getAllLocations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/locations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo ubicaciones:', error);
    throw error;
  }
};

export const createLocation = async (locationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(locationData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creando ubicación:', error);
    throw error;
  }
};