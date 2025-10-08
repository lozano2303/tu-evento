import React from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessModal = ({
  showSuccessModal,
  setShowSuccessModal,
  successMessage
}) => {
  if (!showSuccessModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-3">
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {successMessage.includes('eliminado') ? '¡Comentario eliminado!' : '¡Comentario enviado!'}
          </h3>
          <p className="text-purple-100 text-sm">
            {successMessage.includes('eliminado')
              ? 'Tu comentario ha sido eliminado exitosamente'
              : 'Tu comentario ha sido publicado exitosamente'
            }
          </p>
        </div>

        {/* Contenido */}
        <div className="p-6 text-center">
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-gray-700 text-sm">
                {successMessage.includes('eliminado') ? (
                  <>
                    <p className="mb-2">🗑️ Tu comentario ha sido eliminado</p>
                    <p className="text-xs text-gray-500">El comentario ya no aparecerá en la lista.</p>
                  </>
                ) : (
                  <>
                    <p className="mb-2">💬 Tu opinión ha sido compartida</p>
                    <p className="text-xs text-gray-500">¡Gracias por contribuir a la comunidad!</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Botón para continuar */}
          <button
            onClick={() => setShowSuccessModal(false)}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-sm flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Continuar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;