import React, { useState } from 'react';
import { User, FileText, Eye, Check, X, LogOut, Trash2, Download, Home, Users, Shield, Calendar, Tag, Ticket, BarChart } from 'lucide-react';
import { useAdminVigilancia } from '../hooks/admin/useAdminVigilancia.js';
import { useAdminPetitions } from '../hooks/admin/useAdminPetitions.js';
import { useAdminUsers } from '../hooks/admin/useAdminUsers.js';
import { useAdminEvents } from '../hooks/admin/useAdminEvents.js';
import { useAdminCategories } from '../hooks/admin/useAdminCategories.js';
import { useAdminTickets } from '../hooks/admin/useAdminTickets.js';
import { useAdminReports } from '../hooks/admin/useAdminReports.js';
import { useAdminProfile } from '../hooks/admin/useAdminProfile.js';
import VigilanciaAdmin from '../components/admin/VigilanciaAdmin.jsx';
import GestionCategorias from '../components/admin/GestionCategorias.jsx';
import TicketsVentas from '../components/admin/TicketsVentas.jsx';
import Reportes from '../components/admin/Reportes.jsx';
import PerfilAdmin from '../components/admin/PerfilAdmin.jsx';
import PetitionsPanel from '../components/admin/PetitionsPanel.jsx';
import EventsPanel from '../components/admin/EventsPanel.jsx';
import DeactivatedUsersPanel from '../components/admin/DeactivatedUsersPanel.jsx';
import UserDetailsModal from '../components/admin/modals/UserDetailsModal.jsx';
import EventDetailsModal from '../components/admin/modals/EventDetailsModal.jsx';
import CancelEventModal from '../components/admin/modals/CancelEventModal.jsx';
import ReactivateUserModal from '../components/admin/modals/ReactivateUserModal.jsx';
import ReactivateSuccessModal from '../components/admin/modals/ReactivateSuccessModal.jsx';

const AdminDashboard = () => {
  const [paginaActiva, setPaginaActiva] = useState('vigilancia'); // 'vigilancia', 'bandeja', 'perfil', 'usuarios', 'usuarios-desactivados', 'eventos'

  // Custom hooks
  const vigilancia = useAdminVigilancia();
  const petitions = useAdminPetitions();
  const users = useAdminUsers();
  const events = useAdminEvents();
  const categories = useAdminCategories();
  const tickets = useAdminTickets(events.eventos);
  const reports = useAdminReports(users.usuarios, events.eventos, categories.categorias, petitions.solicitudesActivas, tickets.ticketsData);
  const profile = useAdminProfile();

  // Estados para errores generales
  const [error, setError] = useState(null);

  // Conectar estadísticas de vigilancia con peticiones pendientes
  React.useEffect(() => {
    vigilancia.updatePendingPetitions(petitions.solicitudesActivas.length);
  }, [petitions.solicitudesActivas.length]);



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
              {[
                { id: 'vigilancia', label: 'Vigilancia', icon: Shield, action: () => setPaginaActiva('vigilancia') },
                { id: 'bandeja', label: 'Bandeja de entrada', icon: FileText, action: () => setPaginaActiva('bandeja') },
                { id: 'perfil', label: 'Perfil', icon: User, action: () => setPaginaActiva('perfil') },
                { id: 'usuarios', label: 'Usuarios', icon: Users, action: () => { setPaginaActiva('usuarios'); users.loadUsers(); } },
                { id: 'usuarios-desactivados', label: 'Usuarios Desactivados', icon: User, action: () => { setPaginaActiva('usuarios-desactivados'); users.loadUsers(); } },
                { id: 'eventos', label: 'Eventos', icon: Calendar, action: () => { setPaginaActiva('eventos'); events.loadEvents(); } },
                { id: 'categorias', label: 'Categorías', icon: Tag, action: () => { setPaginaActiva('categorias'); categories.loadCategories(); } },
                { id: 'tickets', label: 'Tickets y Ventas', icon: Ticket, action: () => { setPaginaActiva('tickets'); tickets.loadTicketsData(); } },
                { id: 'reportes', label: 'Reportes', icon: BarChart, action: () => { setPaginaActiva('reportes'); reports.generateReportes(); } }
              ].map((item) => {
                const IconComponent = item.icon;
                const handleClick = () => {
                  setPaginaActiva(item.id);
                  // Load data based on the selected page
                  switch (item.id) {
                    case 'usuarios':
                    case 'usuarios-desactivados':
                      users.loadUsers();
                      break;
                    case 'eventos':
                      events.loadEvents();
                      break;
                    case 'categorias':
                      categories.loadCategories();
                      break;
                    case 'tickets':
                      tickets.loadTicketsData();
                      break;
                    case 'reportes':
                      reports.generateReportes();
                      break;
                  }
                };
                return (
                  <div
                    key={`nav-${item.id}`}
                    onClick={handleClick}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      paginaActiva === item.id
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 p-8">
          {paginaActiva === 'vigilancia' ? (
            <VigilanciaAdmin vigilancia={vigilancia} />
          ) : paginaActiva === 'categorias' ? (
            <GestionCategorias categories={categories} />
          ) : paginaActiva === 'tickets' ? (
            <TicketsVentas tickets={tickets} />
          ) : paginaActiva === 'reportes' ? (
            <Reportes reports={reports} />
          ) : paginaActiva === 'perfil' ? (
            <>
              <h1 className="text-white text-2xl font-bold mb-8">Perfil</h1>
              <PerfilAdmin profile={profile} />
            </>
          ) : paginaActiva === 'usuarios' ? (
            <>
              <h1 className="text-white text-2xl font-bold mb-8">Gestión de Usuarios</h1>

              {users.loadingUsuarios ? (
                <div className="text-center py-12">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-gray-400">Cargando usuarios...</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.usuarios.map((usuario, index) => (
                    <div key={`usuario-${usuario.userID}-${index}`} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
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
                                usuario.status ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'
                              }`}>
                                {usuario.status ? 'Activo' : 'Desactivado'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              users.setUsuarioSeleccionado(usuario);
                              users.setMostrarDetalleUsuario(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </button>
                          {!usuario.status && usuario.role !== 'ADMIN' && (
                            <button
                              onClick={() => {
                                console.log('Usuario a reactivar:', usuario);
                                console.log('UserID:', usuario.userID);
                                users.handleReactivateUser(usuario.userID);
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                            >
                              <Check className="w-4 h-4" />
                              Reactivar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {users.usuarios.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <div className="text-gray-400 text-lg mb-2">No hay usuarios registrados</div>
                      <div className="text-gray-500 text-sm">Los usuarios aparecerán aquí</div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : paginaActiva === 'usuarios-desactivados' ? (
            <>
              <h1 className="text-white text-2xl font-bold mb-8">Usuarios Desactivados</h1>

              {users.loadingUsuarios ? (
                <div className="text-center py-12">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-gray-400">Cargando usuarios...</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.usuarios.filter(u => !u.status && u.role !== 'ADMIN').map((usuario, index) => (
                    <div key={`usuario-desactivado-${usuario.userID}-${index}`} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-lg">{usuario.fullName}</h3>
                            <p className="text-gray-400 text-sm">{usuario.email}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
                                Desactivado
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              users.setUsuarioSeleccionado(usuario);
                              users.setMostrarDetalleUsuario(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </button>
                          <button
                            onClick={() => users.handleReactivateUser(usuario.userID)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                          >
                            <Check className="w-4 h-4" />
                            Reactivar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {users.usuarios.filter(u => !u.status && u.role !== 'ADMIN').length === 0 && (
                    <div className="text-center py-12">
                      <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <div className="text-gray-400 text-lg mb-2">No hay usuarios desactivados</div>
                      <div className="text-gray-500 text-sm">Todos los usuarios están activos</div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : paginaActiva === 'eventos' ? (
            <>
              <h1 className="text-white text-2xl font-bold mb-8">Eventos del Sistema</h1>

              {events.loadingEventos ? (
                <div className="text-center py-12">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-gray-400">Cargando eventos...</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.eventos.map((evento, index) => (
                    <div key={`evento-${evento.id}-${index}`} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
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
                              events.setEventoSeleccionado(evento);
                              events.setMostrarDetalleEvento(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            Ver Detalles
                          </button>
                          {evento.status === 1 && (
                            <button
                              onClick={() => events.handleCancelEvent(evento.id)}
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

                  {events.eventos.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <div className="text-gray-400 text-lg mb-2">No hay eventos registrados</div>
                      <div className="text-gray-500 text-sm">Los eventos aparecerán aquí</div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : paginaActiva === 'bandeja' ? (
            <PetitionsPanel
              petitions={petitions}
              mostrarDetalle={petitions.mostrarDetalle}
              setMostrarDetalle={petitions.setMostrarDetalle}
              solicitudSeleccionada={petitions.solicitudSeleccionada}
            />
          ) : paginaActiva === 'eventos' ? (
            <EventsPanel events={events} />
          ) : paginaActiva === 'usuarios-desactivados' ? (
            <DeactivatedUsersPanel users={users} />
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

              <PetitionsPanel
                petitions={petitions}
                mostrarDetalle={petitions.mostrarDetalle}
                setMostrarDetalle={petitions.setMostrarDetalle}
                solicitudSeleccionada={petitions.solicitudSeleccionada}
              />
            </>
          )}
        </div>
      </div>

      <UserDetailsModal
        mostrarDetalleUsuario={users.mostrarDetalleUsuario}
        usuarioSeleccionado={users.usuarioSeleccionado}
        setUsuarioSeleccionado={users.setUsuarioSeleccionado}
        setMostrarDetalleUsuario={users.setMostrarDetalleUsuario}
      />

      <EventDetailsModal
        mostrarDetalleEvento={events.mostrarDetalleEvento}
        eventoSeleccionado={events.eventoSeleccionado}
        setEventoSeleccionado={events.setEventoSeleccionado}
        setMostrarDetalleEvento={events.setMostrarDetalleEvento}
      />

      <CancelEventModal
        showCancelModal={events.showCancelModal}
        eventToCancel={events.eventToCancel}
        setShowCancelModal={events.setShowCancelModal}
        setEventToCancel={events.setEventToCancel}
        confirmCancelEvent={events.confirmCancelEvent}
      />

      <ReactivateUserModal
        showReactivateModal={users.showReactivateModal}
        userToReactivate={users.userToReactivate}
        setShowReactivateModal={users.setShowReactivateModal}
        setUserToReactivate={users.setUserToReactivate}
        confirmReactivateUser={users.confirmReactivateUser}
      />

      <ReactivateSuccessModal
        showReactivateSuccess={users.showReactivateSuccess}
        handleReactivateSuccess={users.handleReactivateSuccess}
      />
    </div>
  );
};

export default AdminDashboard;