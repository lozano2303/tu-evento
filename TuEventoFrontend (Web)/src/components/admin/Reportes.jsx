import React from 'react';
import { BarChart } from 'lucide-react';

const Reportes = ({ reports }) => {
  if (reports.loadingReportes) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-gray-400">Generando reportes...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-white text-2xl font-bold mb-8">Reportes del Sistema</h1>

      {!reports.reportesData ? (
        <div className="text-center py-12">
          <button
            onClick={reports.generateReportes}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Generar Reporte
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Resumen Ejecutivo */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Resumen Ejecutivo
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{reports.reportesData.totalUsers}</p>
                <p className="text-gray-400 text-sm">Usuarios Totales</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{reports.reportesData.totalEvents}</p>
                <p className="text-gray-400 text-sm">Eventos Totales</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">{reports.reportesData.totalTicketsSold}</p>
                <p className="text-gray-400 text-sm">Tickets Vendidos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">${reports.reportesData.totalRevenue.toLocaleString()}</p>
                <p className="text-gray-400 text-sm">Ingresos Totales</p>
              </div>
            </div>
          </div>

          {/* Detalles por Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h4 className="text-white font-semibold mb-4">Estado de Eventos</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Activos</span>
                  <span className="text-green-400 font-semibold">{reports.reportesData.activeEvents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Cancelados</span>
                  <span className="text-red-400 font-semibold">{reports.reportesData.cancelledEvents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Borradores</span>
                  <span className="text-gray-400 font-semibold">{reports.reportesData.totalEvents - reports.reportesData.activeEvents - reports.reportesData.cancelledEvents}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h4 className="text-white font-semibold mb-4">Estadísticas Generales</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Categorías</span>
                  <span className="text-blue-400 font-semibold">{reports.reportesData.totalCategories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Peticiones Pendientes</span>
                  <span className="text-yellow-400 font-semibold">{reports.reportesData.pendingPetitions}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Información del Reporte */}
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-300 text-sm text-center">
              Reporte generado el {new Date(reports.reportesData.generatedAt).toLocaleString('es-ES')}
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Imprimir Reporte
              </button>
              <button
                onClick={() => reports.setReportesData(null)}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Nuevo Reporte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reportes;