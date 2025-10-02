import React, { useState, useEffect } from 'react';
import { User, FileText, Eye, Check, X, LogOut, Trash2, Download, Home, Users, Shield, Calendar, Tag, Ticket, BarChart } from 'lucide-react';
import { getAllPetitions, updatePetitionStatus, downloadPetitionDocument } from '../../services/AdminPetitionService.js';
import { getUserById } from '../../services/Login.js';
import { getAllUsers } from '../../services/UserService.js';
import { getAllEvents, cancelEvent } from '../../services/EventService.js';
import { getAllCategories } from '../../services/CategoryService.js';
import { getTicketsByEvent } from '../../services/TicketService.js';

const AdminDashboard = () => {
  const [paginaActiva, setPaginaActiva] = useState('vigilancia'); // 'vigilancia', 'bandeja', 'perfil', 'usuarios', 'eventos'
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  // Estados para el perfil del admin
  const [adminData, setAdminData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Estados para gestión de usuarios
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [mostrarDetalleUsuario, setMostrarDetalleUsuario] = useState(false);

  // Estados para gestión de eventos
  const [eventos, setEventos] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [mostrarDetalleEvento, setMostrarDetalleEvento] = useState(false);

  // Estados para gestión de categorías
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);

  // Estados para gestión de tickets y ventas
  const [ticketsData, setTicketsData] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Estados para reportes
  const [reportesData, setReportesData] = useState(null);
  const [loadingReportes, setLoadingReportes] = useState(false);

  useEffect(() => {
    loadPetitions();
    loadAdminProfile();
  }, []);

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

  const loadAdminProfile = async () => {
    try {
      setLoadingProfile(true);
      const adminUserID = localStorage.getItem('userID');
      if (adminUserID) {
        const result = await getUserById(adminUserID);
        if (result.success) {
          setAdminData(result.data);
        } else {
          console.error('Error loading admin profile:', result.message);
        }
      }
    } catch (err) {
      console.error('Error loading admin profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoadingUsuarios(true);
      const result = await getAllUsers();
      if (result.success) {
        setUsuarios(result.data);
      } else {
        console.error('Error loading users:', result.message);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const loadEvents = async () => {
    try {
      setLoadingEventos(true);
      const result = await getAllEvents();
      if (result.success) {
        setEventos(result.data);
      } else {
        console.error('Error loading events:', result.message);
      }
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoadingEventos(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoadingCategorias(true);
      const result = await getAllCategories();
      if (result.success) {
        setCategorias(result.data);
      } else {
        console.error('Error loading categories:', result.message);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoadingCategorias(false);
    }
  };

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

  const handleCancelEvent = async (eventId) => {
    if (!confirm('¿Estás seguro de que quieres cancelar este evento?')) return;
    try {
      const result = await cancelEvent(eventId);
      if (result.success) {
        setEventos(prev => prev.map(e => e.id === eventId ? { ...e, status: 2 } : e));
      } else {
        setError(result.message || 'Error cancelando evento');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error canceling event:', err);
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

  const solicitudesActivas = solicitudesPendientes.filter(s => s.status === 'pendiente');

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

  // Componente de Vigilancia
  const VigilanciaAdmin = () => {
    const [stats, setStats] = useState({
      totalUsers: 0,
      totalEvents: 0,
      activeEvents: 0,
      cancelledEvents: 0,
      pendingPetitions: 0,
      loading: true
    });

    useEffect(() => {
      loadStats();
    }, []);

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

        // Peticiones pendientes (ya tenemos solicitudesPendientes)
        const pendingPetitions = solicitudesActivas.length;

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

    if (stats.loading) {
      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-gray-400">Cargando estadísticas...</div>
        </div>
      );
    }

    return (
      <div>
        <h1 className="text-white text-2xl font-bold mb-8">Panel de Vigilancia</h1>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Usuarios</p>
                <p className="text-white text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Eventos</p>
                <p className="text-white text-2xl font-bold">{stats.totalEvents}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Eventos Activos</p>
                <p className="text-white text-2xl font-bold">{stats.activeEvents}</p>
              </div>
              <Check className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Peticiones Pendientes</p>
                <p className="text-white text-2xl font-bold">{stats.pendingPetitions}</p>
              </div>
              <FileText className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Gráfico de eventos */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h3 className="text-white text-lg font-semibold mb-4">Estado de Eventos</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-300">Activos</span>
              </div>
              <span className="text-white font-semibold">{stats.activeEvents}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-gray-300">Cancelados</span>
              </div>
              <span className="text-white font-semibold">{stats.cancelledEvents}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-500 rounded"></div>
                <span className="text-gray-300">Borradores</span>
              </div>
              <span className="text-white font-semibold">{stats.totalEvents - stats.activeEvents - stats.cancelledEvents}</span>
            </div>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-white text-lg font-semibold mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
              <User className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <p className="text-white text-sm">Sistema iniciado</p>
                <p className="text-gray-400 text-xs">{new Date().toLocaleString()}</p>
              </div>
            </div>
            {stats.pendingPetitions > 0 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-900 border border-yellow-600 rounded-lg">
                <FileText className="w-5 h-5 text-yellow-400" />
                <div className="flex-1">
                  <p className="text-white text-sm">{stats.pendingPetitions} petición(es) pendiente(s)</p>
                  <p className="text-gray-400 text-xs">Requiere atención</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Componente de Gestión de Categorías
  const GestionCategorias = () => {
    if (loadingCategorias) {
      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-gray-400">Cargando categorías...</div>
        </div>
      );
    }

    return (
      <div>
        <h1 className="text-white text-2xl font-bold mb-8">Gestión de Categorías</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categorias.map((categoria) => (
            <div key={categoria.categoryID} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <Tag className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{categoria.name || categoria.categoryName || 'Sin nombre'}</h3>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-300">
                <p className="mb-2">
                  <span className="text-gray-400">Tipo:</span>
                  <span className="ml-2">{categoria.parentID ? 'Subcategoría' : 'Categoría principal'}</span>
                </p>
                <p>
                  <span className="text-gray-400">Descripción:</span>
                  <span className="ml-2">{categoria.description || 'Sin descripción'}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {categorias.length === 0 && (
          <div className="text-center py-12">
            <Tag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <div className="text-gray-400 text-lg mb-2">No hay categorías registradas</div>
            <div className="text-gray-500 text-sm">Las categorías aparecerán aquí</div>
          </div>
        )}
      </div>
    );
  };

  // Componente de Tickets y Ventas
  const TicketsVentas = () => {
    if (loadingTickets) {
      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-gray-400">Cargando datos de tickets...</div>
        </div>
      );
    }

    const totalTickets = ticketsData.reduce((sum, event) => sum + event.totalTickets, 0);
    const totalSold = ticketsData.reduce((sum, event) => sum + event.soldTickets, 0);
    const totalRevenue = ticketsData.reduce((sum, event) => {
      // Asumiendo un precio fijo por ticket, puedes ajustar esto
      return sum + (event.soldTickets * 50); // $50 por ticket como ejemplo
    }, 0);

    return (
      <div>
        <h1 className="text-white text-2xl font-bold mb-8">Tickets y Ventas</h1>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Tickets</p>
                <p className="text-white text-2xl font-bold">{totalTickets}</p>
              </div>
              <Ticket className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tickets Vendidos</p>
                <p className="text-white text-2xl font-bold">{totalSold}</p>
              </div>
              <Check className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ingresos Totales</p>
                <p className="text-white text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
              </div>
              <Download className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Detalles por evento */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-white text-lg font-semibold">Ventas por Evento</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {ticketsData.map((eventData) => (
                <div key={eventData.eventId} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{eventData.eventName}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-gray-400">
                        Vendidos: <span className="text-green-400">{eventData.soldTickets}</span>
                      </span>
                      <span className="text-gray-400">
                        Total: <span className="text-blue-400">{eventData.totalTickets}</span>
                      </span>
                      <span className="text-gray-400">
                        Disponibles: <span className="text-yellow-400">{eventData.totalTickets - eventData.soldTickets}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">${(eventData.soldTickets * 50).toLocaleString()}</p>
                    <p className="text-gray-400 text-sm">Ingresos</p>
                  </div>
                </div>
              ))}
            </div>

            {ticketsData.length === 0 && (
              <div className="text-center py-8">
                <Ticket className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <div className="text-gray-400">No hay datos de tickets disponibles</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };


  // Componente de Reportes
  const Reportes = () => {
    if (loadingReportes) {
      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-gray-400">Generando reportes...</div>
        </div>
      );
    }

    return (
      <div>
        <h1 className="text-white text-2xl font-bold mb-8">Reportes del Sistema</h1>

        {!reportesData ? (
          <div className="text-center py-12">
            <button
              onClick={generateReportes}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Generar Reporte
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Resumen Ejecutivo */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart className="w-5 h-5" />
                Resumen Ejecutivo
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{reportesData.totalUsers}</p>
                  <p className="text-gray-400 text-sm">Usuarios Totales</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{reportesData.totalEvents}</p>
                  <p className="text-gray-400 text-sm">Eventos Totales</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{reportesData.totalTicketsSold}</p>
                  <p className="text-gray-400 text-sm">Tickets Vendidos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">${reportesData.totalRevenue.toLocaleString()}</p>
                  <p className="text-gray-400 text-sm">Ingresos Totales</p>
                </div>
              </div>
            </div>

            {/* Detalles por Categoría */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h4 className="text-white font-semibold mb-4">Estado de Eventos</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Activos</span>
                    <span className="text-green-400 font-semibold">{reportesData.activeEvents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Cancelados</span>
                    <span className="text-red-400 font-semibold">{reportesData.cancelledEvents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Borradores</span>
                    <span className="text-gray-400 font-semibold">{reportesData.totalEvents - reportesData.activeEvents - reportesData.cancelledEvents}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h4 className="text-white font-semibold mb-4">Estadísticas Generales</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Categorías</span>
                    <span className="text-blue-400 font-semibold">{reportesData.totalCategories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Peticiones Pendientes</span>
                    <span className="text-yellow-400 font-semibold">{reportesData.pendingPetitions}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del Reporte */}
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-300 text-sm text-center">
                Reporte generado el {new Date(reportesData.generatedAt).toLocaleString('es-ES')}
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Imprimir Reporte
                </button>
                <button
                  onClick={() => setReportesData(null)}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Nuevo Reporte
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Componente de Perfil
  const PerfilAdmin = () => {
    if (loadingProfile) {
      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-gray-400">Cargando perfil...</div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 max-w-md w-full text-center">
          {/* Información del perfil */}
          <div className="mb-8">
            <h2 className="text-white text-xl font-semibold mb-2">
              {adminData?.fullName || "Administrador"}
            </h2>
            <p className="text-gray-400 text-sm">
              {adminData?.email || "admin@tuevento.com"}
            </p>
            <div className="mt-2">
              <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full font-medium">
                Administrador
              </span>
            </div>
          </div>

          {/* Información adicional */}
          <div className="text-left bg-gray-700 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3">Información de Perfil</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Teléfono:</span>
                <span className="text-white">{adminData?.telephone || 'No especificado'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Estado:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  adminData?.activated ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'
                }`}>
                  {adminData?.activated ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Nombre:</span>
                <span className="text-white">{adminData?.fullName || 'No disponible'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a1a1a' }}>
      {/* Header */}
      <div className="border-b border-gray-700" style={{ backgroundColor: '#2d2d2d' }}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">TE</span>
            </div>
            <span className="text-white font-semibold">Tu Evento</span>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Landing Page</span>
          </button>
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="w-64" style={{ backgroundColor: '#2d2d2d' }}>
          <div className="p-4">
            <nav className="space-y-2">
              <div
                onClick={() => setPaginaActiva('vigilancia')}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  paginaActiva === 'vigilancia'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span className="text-sm">Vigilancia</span>
              </div>
              <div
                onClick={() => setPaginaActiva('bandeja')}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  paginaActiva === 'bandeja'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="text-sm">Bandeja de entrada</span>
              </div>
              <div
                onClick={() => setPaginaActiva('perfil')}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  paginaActiva === 'perfil'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="text-sm">Perfil</span>
              </div>
              <div
                onClick={() => {
                  setPaginaActiva('usuarios');
                  loadUsers();
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  paginaActiva === 'usuarios'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="text-sm">Usuarios</span>
              </div>
              <div
                onClick={() => {
                  setPaginaActiva('eventos');
                  loadEvents();
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  paginaActiva === 'eventos'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span className="text-sm">Eventos</span>
              </div>
              <div
                onClick={() => {
                  setPaginaActiva('categorias');
                  loadCategories();
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  paginaActiva === 'categorias'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Tag className="w-5 h-5" />
                <span className="text-sm">Categorías</span>
              </div>
              <div
                onClick={() => {
                  setPaginaActiva('tickets');
                  loadTicketsData();
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  paginaActiva === 'tickets'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Ticket className="w-5 h-5" />
                <span className="text-sm">Tickets y Ventas</span>
              </div>
              <div
                onClick={() => {
                  setPaginaActiva('reportes');
                  generateReportes();
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  paginaActiva === 'reportes'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <BarChart className="w-5 h-5" />
                <span className="text-sm">Reportes</span>
              </div>
            </nav>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 p-8">
          {paginaActiva === 'vigilancia' ? (
            <VigilanciaAdmin />
          ) : paginaActiva === 'categorias' ? (
            <GestionCategorias />
          ) : paginaActiva === 'tickets' ? (
            <TicketsVentas />
          ) : paginaActiva === 'reportes' ? (
            <Reportes />
          ) : paginaActiva === 'perfil' ? (
            <>
              <h1 className="text-white text-2xl font-bold mb-8">Perfil</h1>
              <PerfilAdmin />
            </>
          ) : paginaActiva === 'usuarios' ? (
            <>
              <h1 className="text-white text-2xl font-bold mb-8">Gestión de Usuarios</h1>

              {loadingUsuarios ? (
                <div className="text-center py-12">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-gray-400">Cargando usuarios...</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {usuarios.map((usuario) => (
                    <div key={usuario.userID} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-lg">{usuario.fullName}</h3>
                            <p className="text-gray-400 text-sm">{usuario.email}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                usuario.role === 'ADMIN' ? 'bg-red-600 text-white' :
                                usuario.organizer ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
                              }`}>
                                {usuario.role === 'ADMIN' ? 'Administrador' :
                                 usuario.organizer ? 'Organizador' : 'Usuario'}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                usuario.activated ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'
                              }`}>
                                {usuario.activated ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setUsuarioSeleccionado(usuario);
                              setMostrarDetalleUsuario(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {usuarios.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <div className="text-gray-400 text-lg mb-2">No hay usuarios registrados</div>
                      <div className="text-gray-500 text-sm">Los usuarios aparecerán aquí</div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : paginaActiva === 'eventos' ? (
            <>
              <h1 className="text-white text-2xl font-bold mb-8">Eventos del Sistema</h1>

              {loadingEventos ? (
                <div className="text-center py-12">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-gray-400">Cargando eventos...</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {eventos.map((evento) => (
                    <div key={evento.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-lg">{evento.eventName}</h3>
                            <p className="text-gray-400 text-sm">{evento.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                evento.status === 1 ? 'bg-green-600 text-white' :
                                evento.status === 2 ? 'bg-red-600 text-white' : 'bg-gray-600 text-white'
                              }`}>
                                {evento.status === 1 ? 'Activo' :
                                 evento.status === 2 ? 'Cancelado' : 'Borrador'}
                              </span>
                              <span className="text-gray-400 text-sm">
                                {evento.startDate ? new Date(evento.startDate).toLocaleDateString() : 'Fecha no disponible'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEventoSeleccionado(evento);
                              setMostrarDetalleEvento(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            Ver Detalles
                          </button>
                          {evento.status === 1 && (
                            <button
                              onClick={() => handleCancelEvent(evento.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                            >
                              <X className="w-4 h-4" />
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {eventos.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <div className="text-gray-400 text-lg mb-2">No hay eventos registrados</div>
                      <div className="text-gray-500 text-sm">Los eventos aparecerán aquí</div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {error && (
                <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
                  {error}
                  <button
                    onClick={() => setError(null)}
                    className="float-right ml-4"
                  >
                    ×
                  </button>
                </div>
              )}

              {!mostrarDetalle ? (
                <>
                  <h1 className="text-white text-2xl font-bold mb-8">Panel de Administración</h1>

                  <div className="mb-6">
                    <h2 className="text-white text-lg font-semibold mb-4">Solicitudes Pendientes</h2>

                    {loading ? (
                      <p className="text-gray-400">Cargando solicitudes...</p>
                    ) : (
                      <>
                        <div className="space-y-4">
                          {solicitudesActivas.map((solicitud) => (
                            <div key={solicitud.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                              <div className="mb-4">
                                <h3 className="text-white font-semibold text-lg mb-2">Empresa: {solicitud.empresa}</h3>
                                <div className="text-gray-300 text-sm space-y-1">
                                  <p><span className="text-gray-400">Remitente:</span> {solicitud.remitente}</p>
                                  <p><span className="text-gray-400">ID Fiscal:</span> {solicitud.idFiscal}</p>
                                  <p><span className="text-gray-400">Tipo de Evento:</span> {solicitud.tipoEvento}</p>
                                </div>
                              </div>

                              {/* Archivos adjuntos */}
                              <div className="mb-4">
                                <h4 className="text-gray-400 text-sm mb-2">Archivos adjuntos:</h4>
                                <div className="flex gap-2">
                                  {solicitud.archivos?.map((archivo, index) => (
                                    <div key={index} className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-full text-xs">
                                      <FileText className="w-3 h-3 text-blue-400" />
                                      <span className="text-gray-300">{archivo.tipo}</span>
                                      <button
                                        onClick={() => handleDownloadDocument(solicitud.petitionId)}
                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                      >
                                        <Download className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleVerSolicitud(solicitud)}
                                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors text-sm"
                                >
                                  <Eye className="w-4 h-4" />
                                  Ver Solicitud
                                </button>

                                <button
                                  onClick={() => handleRechazar(solicitud.id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                                >
                                  <X className="w-4 h-4" />
                                  Rechazar
                                </button>

                                <button
                                  onClick={() => handleAprobar(solicitud.id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                                >
                                  <Check className="w-4 h-4" />
                                  Aprobar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {solicitudesActivas.length === 0 && (
                          <div className="text-center py-12">
                            <div className="text-gray-400 text-lg mb-2">No hay solicitudes pendientes</div>
                            <div className="text-gray-500 text-sm">Todas las solicitudes han sido procesadas</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              ) : (
                /* Vista de Detalle de Solicitud */
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      onClick={() => setMostrarDetalle(false)}
                      className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                    >
                      ← Volver a solicitudes
                    </button>
                    <h1 className="text-white text-2xl font-bold">Detalle de Solicitud</h1>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-6">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-white text-lg font-semibold mb-4">Información de la Empresa</h3>
                        <div className="space-y-3 text-gray-300">
                          <div>
                            <span className="text-gray-400 text-sm">Empresa:</span>
                            <p className="text-white font-medium">{solicitudSeleccionada?.empresa}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-sm">Remitente:</span>
                            <p className="text-white">{solicitudSeleccionada?.remitente}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-sm">ID Fiscal:</span>
                            <p className="text-white">{solicitudSeleccionada?.idFiscal}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-white text-lg font-semibold mb-4">Información del Evento</h3>
                        <div className="space-y-3 text-gray-300">
                          <div>
                            <span className="text-gray-400 text-sm">Tipo de Evento:</span>
                            <p className="text-white">{solicitudSeleccionada?.tipoEvento}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-sm">Fecha de Solicitud:</span>
                            <p className="text-white">{solicitudSeleccionada?.fechaSolicitud}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-sm">Estado:</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              solicitudSeleccionada?.status === 'pendiente'
                                ? 'bg-yellow-600 text-yellow-100'
                                : solicitudSeleccionada?.status === 'aprobado'
                                ? 'bg-green-600 text-green-100'
                                : 'bg-red-600 text-red-100'
                            }`}>
                              {solicitudSeleccionada?.status === 'pendiente' ? 'Pendiente' :
                               solicitudSeleccionada?.status === 'aprobado' ? 'Aprobado' : 'Rechazado'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-white text-lg font-semibold mb-3">Descripción del Evento</h3>
                      <p className="text-gray-300 leading-relaxed">
                        {solicitudSeleccionada?.descripcion}
                      </p>
                    </div>

                    {/* Sección de archivos en el detalle */}
                    <div className="mt-6">
                      <h3 className="text-white text-lg font-semibold mb-3">Documentos de la Empresa</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {solicitudSeleccionada?.archivos?.map((archivo, index) => (
                          <div key={index} className="bg-gray-700 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-blue-400" />
                                <div>
                                  <p className="text-white font-medium text-sm">{archivo.tipo}</p>
                                  <p className="text-gray-400 text-xs">{archivo.nombre}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDownloadDocument(solicitudSeleccionada.petitionId)}
                                className="text-blue-400 hover:text-blue-300 transition-colors p-2"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {solicitudSeleccionada?.status === 'pendiente' && (
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleRechazar(solicitudSeleccionada.id)}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                        Rechazar Solicitud
                      </button>

                      <button
                        onClick={() => handleAprobar(solicitudSeleccionada.id)}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <Check className="w-5 h-5" />
                        Aprobar Solicitud
                      </button>
                    </div>
                  )}

                  {solicitudSeleccionada?.status !== 'pendiente' && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-300 text-center">
                        Esta solicitud ya ha sido{' '}
                        <span className={solicitudSeleccionada?.status === 'aprobado' ? 'text-green-400' : 'text-red-400'}>
                          {solicitudSeleccionada?.status === 'aprobado' ? 'aprobada' : 'rechazada'}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal para ver detalles del usuario */}
      {mostrarDetalleUsuario && usuarioSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-gray-700 p-6 border-b border-gray-600">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Información Completa del Usuario</h3>
                <button
                  onClick={() => {
                    setUsuarioSeleccionado(null);
                    setMostrarDetalleUsuario(false);
                  }}
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="space-y-8">
                {/* Información básica */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nombre Completo</label>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <p className="text-white">{usuarioSeleccionado.fullName}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Correo Electrónico</label>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <p className="text-white">{usuarioSeleccionado.email}</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <p className="text-white">{usuarioSeleccionado.telephone || 'No especificado'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rol</label>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        usuarioSeleccionado.role === 'ADMIN' ? 'bg-red-600 text-white' :
                        usuarioSeleccionado.organizer ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
                      }`}>
                        {usuarioSeleccionado.role === 'ADMIN' ? 'Administrador' :
                         usuarioSeleccionado.organizer ? 'Organizador' : 'Usuario'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        usuarioSeleccionado.activated ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'
                      }`}>
                        {usuarioSeleccionado.activated ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de Nacimiento</label>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <p className="text-white">
                        {usuarioSeleccionado.birthDate ?
                          new Date(usuarioSeleccionado.birthDate).toLocaleDateString() :
                          'No especificada'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Dirección</label>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <p className="text-white">
                        {usuarioSeleccionado.address ? `${usuarioSeleccionado.address.street}, ${usuarioSeleccionado.address.city}` : 'No especificada'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información del sistema */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Información del Sistema
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">ID de Usuario:</span>
                      <p className="text-white font-mono">{usuarioSeleccionado.userID}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Es Organizador:</span>
                      <p className="text-white">{usuarioSeleccionado.organizer ? 'Sí' : 'No'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Estado de Cuenta:</span>
                      <p className="text-white">{usuarioSeleccionado.activated ? 'Activada' : 'Desactivada'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Rol del Sistema:</span>
                      <p className="text-white">{usuarioSeleccionado.role}</p>
                    </div>
                  </div>
                </div>

                {/* Nota importante */}
                <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <h4 className="text-yellow-400 font-semibold text-sm">Nota Importante</h4>
                      <p className="text-yellow-200 text-sm mt-1">
                        Como administrador, puedes ver toda la información de los usuarios.
                        Esta información es confidencial y debe manejarse con responsabilidad.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-600">
                <button
                  onClick={() => {
                    setUsuarioSeleccionado(null);
                    setMostrarDetalleUsuario(false);
                  }}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                >
                  Cerrar Detalles
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver detalles del evento */}
      {mostrarDetalleEvento && eventoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-gray-700 p-6 border-b border-gray-600">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Detalles del Evento</h3>
                <button
                  onClick={() => {
                    setEventoSeleccionado(null);
                    setMostrarDetalleEvento(false);
                  }}
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="space-y-8">
                {/* Información básica del evento */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Evento</label>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <p className="text-white">{eventoSeleccionado.eventName}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        eventoSeleccionado.status === 1 ? 'bg-green-600 text-white' :
                        eventoSeleccionado.status === 2 ? 'bg-red-600 text-white' : 'bg-gray-600 text-white'
                      }`}>
                        {eventoSeleccionado.status === 1 ? 'Activo' :
                         eventoSeleccionado.status === 2 ? 'Cancelado' : 'Borrador'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de Inicio</label>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <p className="text-white">
                        {eventoSeleccionado.startDate ?
                          new Date(eventoSeleccionado.startDate).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Fecha no disponible'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de Fin</label>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <p className="text-white">
                        {eventoSeleccionado.finishDate ?
                          new Date(eventoSeleccionado.finishDate).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Fecha no disponible'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">ID del Evento</label>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <p className="text-white font-mono">{eventoSeleccionado.id}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Ubicación</label>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <p className="text-white">
                        {eventoSeleccionado.locationID?.name || 'Ubicación no disponible'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-white leading-relaxed">
                      {eventoSeleccionado.description || 'Sin descripción disponible'}
                    </p>
                  </div>
                </div>

                {/* Información adicional del evento */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Información del Organizador
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Nombre del Organizador:</span>
                      <p className="text-white">
                        {eventoSeleccionado.userID?.fullName || 'No disponible'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Email del Organizador:</span>
                      <p className="text-white">
                        {eventoSeleccionado.userID?.email || 'No disponible'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Ubicación:</span>
                      <p className="text-white">
                        {eventoSeleccionado.locationID?.name || 'No especificada'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Dirección:</span>
                      <p className="text-white">
                        {eventoSeleccionado.locationID?.address ? `${eventoSeleccionado.locationID.address.street}, ${eventoSeleccionado.locationID.address.city}` : 'No disponible'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información de tickets si está disponible */}
                {eventoSeleccionado.ticketCount !== undefined && (
                  <div className="bg-blue-900 border border-blue-600 rounded-lg p-4">
                    <h4 className="text-blue-400 font-semibold mb-2">Estadísticas de Tickets</h4>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-300">Total de Tickets:</span>
                        <p className="text-white font-semibold">{eventoSeleccionado.ticketCount || 0}</p>
                      </div>
                      <div>
                        <span className="text-blue-300">Tickets Vendidos:</span>
                        <p className="text-white font-semibold">{eventoSeleccionado.soldTickets || 0}</p>
                      </div>
                      <div>
                        <span className="text-blue-300">Tickets Disponibles:</span>
                        <p className="text-white font-semibold">
                          {(eventoSeleccionado.ticketCount || 0) - (eventoSeleccionado.soldTickets || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nota importante */}
                <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <h4 className="text-yellow-400 font-semibold text-sm">Información Administrativa</h4>
                      <p className="text-yellow-200 text-sm mt-1">
                        Esta es la información completa del evento. Como administrador,
                        puedes monitorear el estado y gestionar los eventos del sistema.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-600">
                <button
                  onClick={() => {
                    setEventoSeleccionado(null);
                    setMostrarDetalleEvento(false);
                  }}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                >
                  Cerrar Detalles
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;