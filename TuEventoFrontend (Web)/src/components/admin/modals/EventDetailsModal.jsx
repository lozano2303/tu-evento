import React from 'react';
import { Calendar, Shield, X } from 'lucide-react';

const EventDetailsModal = ({
  mostrarDetalleEvento,
  eventoSeleccionado,
  setEventoSeleccionado,
  setMostrarDetalleEvento
}) => {
  if (!mostrarDetalleEvento || !eventoSeleccionado) return null;

  return (
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
  );
};

export default EventDetailsModal;