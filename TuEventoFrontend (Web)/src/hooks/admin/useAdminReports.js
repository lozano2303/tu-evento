import { useState } from 'react';

export const useAdminReports = (usuarios, eventos, categorias, solicitudesActivas, ticketsData) => {
  const [reportesData, setReportesData] = useState(null);
  const [loadingReportes, setLoadingReportes] = useState(false);

  const generateReportes = async () => {
    try {
      setLoadingReportes(true);

      // Usar los datos ya cargados para generar reportes
      const reportData = {
        totalUsers: usuarios.length,
        totalEvents: eventos.length,
        activeEvents: eventos.filter(e => e.status === 1).length,
        cancelledEvents: eventos.filter(e => e.status === 3).length,
        totalCategories: categorias.length,
        pendingPetitions: solicitudesActivas.length,
        totalTicketsSold: ticketsData.reduce((sum, event) => sum + event.soldTickets, 0),
        totalRevenue: ticketsData.reduce((sum, event) => sum + (event.soldTickets * 50), 0),
        generatedAt: new Date().toISOString()
      };

      setReportesData(reportData);
    } catch (err) {
      console.error('Error generating reports:', err);
    } finally {
      setLoadingReportes(false);
    }
  };

  return {
    reportesData,
    loadingReportes,
    generateReportes,
    setReportesData
  };
};