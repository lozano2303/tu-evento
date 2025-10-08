import React from 'react';
import { Shield } from 'lucide-react';

const PerfilAdmin = ({ profile }) => {
  if (profile.loadingProfile) {
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
            {profile.adminData?.fullName || "Administrador"}
          </h2>
          <p className="text-gray-400 text-sm">
            {profile.adminData?.email || "admin@tuevento.com"}
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
              <span className="text-white">{profile.adminData?.telephone || 'No especificado'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Estado:</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                profile.adminData?.status ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'
              }`}>
                {profile.adminData?.status ? 'Activo' : 'Desactivado'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Nombre:</span>
              <span className="text-white">{profile.adminData?.fullName || 'No disponible'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilAdmin;