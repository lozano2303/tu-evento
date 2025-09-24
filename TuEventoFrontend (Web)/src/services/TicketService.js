import { API_BASE_URL } from './apiconstant.js';

export const createTicketWithSeats = async (ticketData) => {
  try {
    const token = localStorage.getItem('token');
    // Transform the payload to match backend expectations
    const payload = {
      eventId: ticketData.event.id,
      seatIDs: ticketData.seats.map(seat => seat.id),
      userId: 1, // TODO: Get actual user ID from context or localStorage
      code: ticketData.code || 'TICKET-' + Date.now(),
    };
    const response = await fetch(`${API_BASE_URL}/v1/tickets/create-with-seats`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creando ticket:', error);
    throw error;
  }
};

export const cancelTicket = async (ticketId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/tickets/cancel/${ticketId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error cancelando ticket:', error);
    throw error;
  }
};

export const getTicketById = async (ticketId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/tickets/${ticketId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo ticket:', error);
    throw error;
  }
};

export const getTicketsByEvent = async (eventId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/tickets/by-event/${eventId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo tickets del evento:', error);
    throw error;
  }
};

export const getTicketsByUser = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/tickets/by-user/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo tickets del usuario:', error);
    throw error;
  }
};