import { useState, useEffect } from 'react';
import { getAllPetitions, updatePetitionStatus, downloadPetitionDocument } from '../../services/AdminPetitionService.js';
import { getUserById } from '../../services/Login.js';

export const useAdminPetitions = () => {
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  const loadPetitions = async () => {
    try {
      setLoading(true);
      const result = await getAllPetitions();
      if (result.success) {
        // Obtener información completa de cada usuario
        const petitionsWithUsers = await Promise.all(
          result.data.map(async (petition) => {
            try {
              const userResult = await getUserById(petition.userID);
              if (userResult.success) {
                return {
                  id: `petition-${petition.petitionID}`, // ID único usando petitionID
                  petitionId: petition.petitionID, // Usamos petitionID real
                  empresa: `Usuario ${petition.userID}`,
                  remitente: userResult.data.fullName || `Usuario ${petition.userID}`,
                  idFiscal: `ID: ${petition.userID}`,
                  tipoEvento: 'Solicitud de Organizador',
                  fechaSolicitud: new Date().toLocaleDateString(), // Fecha actual ya que no viene del backend
                  descripcion: 'Solicitud para convertirse en organizador de eventos',
                  archivos: [
                    { nombre: 'documento.pdf', tipo: 'Documento' }
                  ],
                  status: petition.status === 0 ? 'pendiente' : petition.status === 1 ? 'aprobado' : 'rechazado',
                  userData: userResult.data
                };
              }
            } catch (err) {
              console.error('Error obteniendo usuario:', err);
            }
            return null;
          })
        );

        setSolicitudesPendientes(petitionsWithUsers.filter(p => p !== null));
      } else {
        setError(result.message || 'Error cargando peticiones');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error loading petitions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerSolicitud = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setMostrarDetalle(true);
  };

  const handleAprobar = async (id) => {
    try {
      // El backend espera el userID, no el petitionID
      const solicitud = solicitudesPendientes.find(s => s.id === id);
      if (!solicitud) return;

      const result = await updatePetitionStatus(solicitud.petitionId, 1); // 1 = APPROVED
      if (result.success) {
        setSolicitudesPendientes(prev =>
          prev.map(solicitud =>
            solicitud.id === id
              ? { ...solicitud, status: 'aprobado' }
              : solicitud
          )
        );
        setMostrarDetalle(false);
      } else {
        setError(result.message || 'Error aprobando petición');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error approving petition:', err);
    }
  };

  const handleRechazar = async (id) => {
    try {
      // El backend espera el userID, no el petitionID
      const solicitud = solicitudesPendientes.find(s => s.id === id);
      if (!solicitud) return;

      const result = await updatePetitionStatus(solicitud.petitionId, 2); // 2 = REJECTED
      if (result.success) {
        setSolicitudesPendientes(prev =>
          prev.map(solicitud =>
            solicitud.id === id
              ? { ...solicitud, status: 'rechazado' }
              : solicitud
          )
        );
        setMostrarDetalle(false);
      } else {
        setError(result.message || 'Error rechazando petición');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error rejecting petition:', err);
    }
  };

  const handleDownloadDocument = async (petitionId) => {
    try {
      const blob = await downloadPetitionDocument(petitionId);

      // Crear un enlace temporal para descargar el archivo
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `documento-solicitud-${petitionId}.pdf`; // Nombre del archivo
      document.body.appendChild(link);
      link.click();

      // Limpiar el enlace temporal
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando documento:', error);
      setError('Error descargando el documento. Inténtalo de nuevo.');
    }
  };

  const solicitudesActivas = solicitudesPendientes.filter(s => s.status === 'pendiente');

  useEffect(() => {
    loadPetitions();
  }, []);

  return {
    // State
    solicitudesPendientes,
    loading,
    error,
    solicitudSeleccionada,
    mostrarDetalle,
    solicitudesActivas,

    // Setters
    setSolicitudSeleccionada,
    setMostrarDetalle,
    setError,

    // Methods
    loadPetitions,
    handleVerSolicitud,
    handleAprobar,
    handleRechazar,
    handleDownloadDocument
  };
};