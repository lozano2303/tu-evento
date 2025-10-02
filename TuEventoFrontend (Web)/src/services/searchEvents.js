import { API_BASE_URL } from './apiconstant.js';

export const searchEvents = async (name, date, onlyUpcoming, locationId) => {
  try {
    const token = localStorage.getItem('token');
    const query = new URLSearchParams({
      name: name || "",
      date: date || "",
      onlyUpcoming: onlyUpcoming || false,
      locationId: locationId || ""
    }).toString();

    const response = await fetch(`${API_BASE_URL}/v1/event/filter?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Error buscando eventos:', error);
    throw error;
  }
};