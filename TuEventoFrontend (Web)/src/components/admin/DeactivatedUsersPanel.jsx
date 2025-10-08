import React from 'react';
import { User, Eye, Check } from 'lucide-react';

const DeactivatedUsersPanel = ({ users }) => {
  return (
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
  );
};

export default DeactivatedUsersPanel;