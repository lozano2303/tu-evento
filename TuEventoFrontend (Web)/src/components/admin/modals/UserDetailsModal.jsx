import React from 'react';
import { User, Shield, X } from 'lucide-react';

const UserDetailsModal = ({
  mostrarDetalleUsuario,
  usuarioSeleccionado,
  setUsuarioSeleccionado,
  setMostrarDetalleUsuario
}) => {
  if (!mostrarDetalleUsuario || !usuarioSeleccionado) return null;

  return (
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
                    usuarioSeleccionado.status ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'
                  }`}>
                    {usuarioSeleccionado.status ? 'Activo' : 'Desactivado'}
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
                  <p className="text-white">{usuarioSeleccionado.status ? 'Activada' : 'Desactivada'}</p>
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
  );
};

export default UserDetailsModal;