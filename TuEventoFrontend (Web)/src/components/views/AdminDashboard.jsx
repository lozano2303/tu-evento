import React, { useState, useEffect } from 'react';
import { User, FileText, Eye, Check, X, LogOut, Trash2, Download } from 'lucide-react';
import { getAllPetitions, updatePetitionStatus, downloadPetitionDocument } from '../../services/AdminPetitionService.js';
import { getUserById } from '../../services/Login.js';

const AdminDashboard = () => {
  const [paginaActiva, setPaginaActiva] = useState('bandeja'); // 'bandeja' o 'perfil'
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  useEffect(() => {
    loadPetitions();
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
                    { nombre: 'documento.pdf', tipo: 'Documento de Identidad' }
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

  const solicitudesActivas = solicitudesPendientes.filter(s => s.status === 'pendiente');

  // Componente de Perfil
  const PerfilAdmin = () => (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 max-w-md w-full text-center">
        {/* Foto de perfil */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto rounded-lg overflow-hidden bg-gray-600">
            <img 
              src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face" 
              alt="Sophia Rodriguez" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Información del perfil */}
        <div className="mb-8">
          <h2 className="text-white text-xl font-semibold mb-2">Sophia Rodriguez</h2>
          <p className="text-gray-400 text-sm">sophia.rodriguez@gmail.com</p>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
          
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
            <span>Eliminar Cuenta</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a1a1a' }}>
      {/* Header */}
      <div className="border-b border-gray-700" style={{ backgroundColor: '#2d2d2d' }}>
        <div className="flex items-center px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">TE</span>
            </div>
            <span className="text-white font-semibold">Tu Evento</span>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="w-64" style={{ backgroundColor: '#2d2d2d' }}>
          <div className="p-4">
            <nav className="space-y-2">
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
            </nav>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 p-8">
          {paginaActiva === 'perfil' ? (
            <>
              <h1 className="text-white text-2xl font-bold mb-8">Perfil</h1>
              <PerfilAdmin />
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
                                      <button className="text-blue-400 hover:text-blue-300 transition-colors">
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
                              <button className="text-blue-400 hover:text-blue-300 transition-colors p-2">
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
    </div>
  );
};

export default AdminDashboard;