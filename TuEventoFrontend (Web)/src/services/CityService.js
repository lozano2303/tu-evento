import { API_BASE_URL } from './apiconstant.js';

export const getAllCities = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/cities`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo ciudades:', error);
    throw error;
  }
};