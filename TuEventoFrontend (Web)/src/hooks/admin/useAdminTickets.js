import { useState } from 'react';
import { getTicketsByEvent } from '../../services/TicketService.js';

export const useAdminTickets = (eventos) => {
  const [ticketsData, setTicketsData] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  const loadTicketsData = async () => {
    try {
      setLoadingTickets(true);
      // Cargar tickets de todos los eventos
      const ticketsPromises = eventos.map(async (evento) => {
        try {
          const result = await getTicketsByEvent(evento.id);
          return {
            eventId: evento.id,
            eventName: evento.eventName,
            tickets: result.success ? result.data : [],
            totalTickets: result.success ? result.data.length : 0,
            soldTickets: result.success ? result.data.filter(t => t.status === 1).length : 0
          };
        } catch (error) {
          console.error(`Error loading tickets for event ${evento.id}:`, error);
          return {
            eventId: evento.id,
            eventName: evento.eventName,
            tickets: [],
            totalTickets: 0,
            soldTickets: 0
          };
        }
      });

      const ticketsData = await Promise.all(ticketsPromises);
      setTicketsData(ticketsData);
    } catch (err) {
      console.error('Error loading tickets data:', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  // Calcular estadísticas generales
  const totalTickets = ticketsData.reduce((sum, event) => sum + event.totalTickets, 0);
  const totalSold = ticketsData.reduce((sum, event) => sum + event.soldTickets, 0);
  const totalRevenue = ticketsData.reduce((sum, event) => {
    // Asumiendo un precio fijo por ticket, puedes ajustar esto
    return sum + (event.soldTickets * 50); // $50 por ticket como ejemplo
  }, 0);

  return {
    ticketsData,
    loadingTickets,
    totalTickets,
    totalSold,
    totalRevenue,
    loadTicketsData
  };
};