import { useState, useEffect } from 'react';
import { getAllUsers } from '../../services/UserService.js';
import { getAllEvents } from '../../services/EventService.js';

export const useAdminVigilancia = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    activeEvents: 0,
    cancelledEvents: 0,
    pendingPetitions: 0,
    loading: true
  });

  const loadStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));

      // Cargar usuarios
      const usersResult = await getAllUsers();
      const totalUsers = usersResult.success ? usersResult.data.length : 0;

      // Cargar eventos
      const eventsResult = await getAllEvents();
      const events = eventsResult.success ? eventsResult.data : [];
      const totalEvents = events.length;
      const activeEvents = events.filter(e => e.status === 1).length;
      const cancelledEvents = events.filter(e => e.status === 3).length;

      // Peticiones pendientes (se recibe como prop)
      const pendingPetitions = 0; // Se actualizará desde el componente padre

      setStats({
        totalUsers,
        totalEvents,
        activeEvents,
        cancelledEvents,
        pendingPetitions,
        loading: false
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const updatePendingPetitions = (count) => {
    setStats(prev => ({ ...prev, pendingPetitions: count }));
  };

  useEffect(() => {
    loadStats();
  }, []);

  return {
    stats,
    loadStats,
    updatePendingPetitions
  };
};