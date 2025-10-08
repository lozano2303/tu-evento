import React from 'react';
import { Users, Calendar, Check, FileText } from 'lucide-react';

const VigilanciaAdmin = ({ vigilancia }) => {
  if (vigilancia.stats.loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-gray-400">Cargando estadísticas...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-white text-2xl font-bold mb-8">Panel de Vigilancia</h1>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Usuarios</p>
              <p className="text-white text-2xl font-bold">{vigilancia.stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Eventos</p>
              <p className="text-white text-2xl font-bold">{vigilancia.stats.totalEvents}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Eventos Activos</p>
              <p className="text-white text-2xl font-bold">{vigilancia.stats.activeEvents}</p>
            </div>
            <Check className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Peticiones Pendientes</p>
              <p className="text-white text-2xl font-bold">{vigilancia.stats.pendingPetitions}</p>
            </div>
            <FileText className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Gráfico de eventos */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
        <h3 className="text-white text-lg font-semibold mb-4">Estado de Eventos</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-300">Activos</span>
            </div>
            <span className="text-white font-semibold">{vigilancia.stats.activeEvents}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-300">Cancelados</span>
            </div>
            <span className="text-white font-semibold">{vigilancia.stats.cancelledEvents}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
              <span className="text-gray-300">Borradores</span>
            </div>
            <span className="text-white font-semibold">{vigilancia.stats.totalEvents - vigilancia.stats.activeEvents - vigilancia.stats.cancelledEvents}</span>
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-white text-lg font-semibold mb-4">Actividad Reciente</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
            <Users className="w-5 h-5 text-blue-400" />
            <div className="flex-1">
              <p className="text-white text-sm">Sistema iniciado</p>
              <p className="text-gray-400 text-xs">{new Date().toLocaleString()}</p>
            </div>
          </div>
          {vigilancia.stats.pendingPetitions > 0 && (
            <div className="flex items-center gap-3 p-3 bg-yellow-900 border border-yellow-600 rounded-lg">
              <FileText className="w-5 h-5 text-yellow-400" />
              <div className="flex-1">
                <p className="text-white text-sm">{vigilancia.stats.pendingPetitions} petición(es) pendiente(s)</p>
                <p className="text-gray-400 text-xs">Requiere atención</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VigilanciaAdmin;