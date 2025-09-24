import { API_BASE_URL } from './apiconstant.js';

export const getSeatsBySection = async (sectionId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/seats/section/${sectionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo asientos:', error);
    throw error;
  }
};

export const updateSeatStatus = async (seatId, status) => {
  try {
    const token = localStorage.getItem('token');
    const newStatus = status === 'RESERVED' ? 'true' : 'false';
    const response = await fetch(`${API_BASE_URL}/v1/seats/${seatId}/status?newStatus=${newStatus}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error actualizando asiento:', error);
    throw error;
  }
};

export const getAllSeats = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/seats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo todos los asientos:', error);
    throw error;
  }
};

export const createSeat = async (seatData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/seats`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(seatData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creando asiento:', error);
    throw error;
  }
};

export const updateSeat = async (seatId, seatData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/seats/${seatId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(seatData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error actualizando asiento:', error);
    throw error;
  }
};

export const deleteSeat = async (seatId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/seats/${seatId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error eliminando asiento:', error);
    throw error;
  }
};

export const releaseExpiredReservations = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/seats/release-expired`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error liberando reservaciones expiradas:', error);
    throw error;
  }
};