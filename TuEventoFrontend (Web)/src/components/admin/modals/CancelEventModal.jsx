import React from 'react';
import { Calendar, X } from 'lucide-react';

const CancelEventModal = ({
  showCancelModal,
  eventToCancel,
  setShowCancelModal,
  setEventToCancel,
  confirmCancelEvent
}) => {
  if (!showCancelModal || !eventToCancel) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header con gradiente rojo */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-3">
              <X className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">¿Estás seguro de que quieres cancelar este evento?</h3>
          <p className="text-red-100 text-sm">Esta acción no se puede deshacer</p>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <Calendar className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-gray-700 text-sm font-medium mb-1">Evento a cancelar</p>
              <p className="text-gray-500 text-xs">{eventToCancel.eventName}</p>
            </div>

            <div className="text-gray-600 text-sm space-y-2">
              <p className="mb-2">📅 <span className="font-medium">{eventToCancel.eventName}</span></p>
              <p className="text-xs text-gray-500">Esta acción cancelará el evento permanentemente</p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowCancelModal(false);
                setEventToCancel(null);
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={confirmCancelEvent}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-sm"
            >
              Confirmar Cancelación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelEventModal;