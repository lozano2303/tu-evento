import React from 'react';
import { User, Check } from 'lucide-react';

const ReactivateUserModal = ({
  showReactivateModal,
  userToReactivate,
  setShowReactivateModal,
  setUserToReactivate,
  confirmReactivateUser
}) => {
  if (!showReactivateModal || !userToReactivate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header con gradiente morado */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-3">
              <Check className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">¿Estás seguro de que quieres reactivar esta cuenta de usuario?</h3>
          <p className="text-purple-100 text-sm">El usuario podrá iniciar sesión nuevamente</p>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="mb-6">
            <div className="bg-purple-50 rounded-lg p-4 mb-4">
              <User className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-purple-700 text-sm font-medium mb-1">Usuario a reactivar</p>
              <p className="text-purple-600 text-xs">{userToReactivate.fullName}</p>
              <p className="text-purple-600 text-xs">{userToReactivate.email}</p>
            </div>

            <div className="text-gray-600 text-sm">
              <p className="mb-2">🔓 <span className="font-medium">Reactivación de cuenta</span></p>
              <p className="text-xs text-gray-500">El usuario podrá acceder nuevamente a todas las funcionalidades de la plataforma.</p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowReactivateModal(false);
                setUserToReactivate(null);
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={confirmReactivateUser}
              className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-sm"
            >
              Confirmar Reactivación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReactivateUserModal;