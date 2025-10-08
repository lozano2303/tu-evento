import React from 'react';
import { Calendar, Eye, X } from 'lucide-react';

const EventsPanel = ({ events }) => {
  return (
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
  );
};

export default EventsPanel;