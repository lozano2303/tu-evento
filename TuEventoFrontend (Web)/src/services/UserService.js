import { API_BASE_URL } from './apiconstant.js';

export const getUserById = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    throw error;
  }
};