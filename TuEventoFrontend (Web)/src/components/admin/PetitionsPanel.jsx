import React from 'react';
import { FileText, Eye, Download, X, Check } from 'lucide-react';

const PetitionsPanel = ({
  petitions,
  mostrarDetalle,
  setMostrarDetalle,
  solicitudSeleccionada,
  setMostrarDetalle: setMostrarDetallePetitions
}) => {
  if (!mostrarDetalle) {
    return (
      <>
        <h1 className="text-white text-2xl font-bold mb-8">Panel de Administración</h1>

        <div className="mb-6">
          <h2 className="text-white text-lg font-semibold mb-4">Solicitudes Pendientes</h2>

          {petitions.loading ? (
            <p className="text-gray-400">Cargando solicitudes...</p>
          ) : (
            <>
              <div className="space-y-4">
                {petitions.solicitudesActivas.map((solicitud, index) => (
                  <div key={`solicitud-${solicitud.id}-${index}`} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="mb-4">
                      <h3 className="text-white font-semibold text-lg mb-2">Empresa: {solicitud.empresa}</h3>
                      <div className="text-gray-300 text-sm space-y-1">
                        <p><span className="text-gray-400">Remitente:</span> {solicitud.remitente}</p>
                        <p><span className="text-gray-400">ID Fiscal:</span> {solicitud.idFiscal}</p>
                        <p><span className="text-gray-400">Tipo de Evento:</span> {solicitud.tipoEvento}</p>
                      </div>
                    </div>

                    {/* Archivos adjuntos */}
                    <div className="mb-4">
                      <h4 className="text-gray-400 text-sm mb-2">Archivos adjuntos:</h4>
                      <div className="flex gap-2">
                        {solicitud.archivos?.map((archivo, archivoIndex) => (
                          <div key={`archivo-${solicitud.id}-${archivoIndex}`} className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-full text-xs">
                            <FileText className="w-3 h-3 text-blue-400" />
                            <span className="text-gray-300">{archivo.tipo}</span>
                            <button
                              onClick={() => petitions.handleDownloadDocument(solicitud.petitionId)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Petition Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => petitions.handleVerSolicitud(solicitud)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Solicitud
                      </button>

                      <button
                        onClick={() => petitions.handleRechazar(solicitud.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                      >
                        <X className="w-4 h-4" />
                        Rechazar
                      </button>

                      <button
                        onClick={() => petitions.handleAprobar(solicitud.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                      >
                        <Check className="w-4 h-4" />
                        Aprobar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {petitions.solicitudesActivas.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">No hay solicitudes pendientes</div>
                  <div className="text-gray-500 text-sm">Todas las solicitudes han sido procesadas</div>
                </div>
              )}
            </>
          )}
        </div>
      </>
    );
  }

  // Vista de Detalle de Solicitud
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setMostrarDetallePetitions(false)}
          className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
        >
          ← Volver a solicitudes
        </button>
        <h1 className="text-white text-2xl font-bold">Detalle de Solicitud</h1>
      </div>

      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Información de la Empresa</h3>
            <div className="space-y-3 text-gray-300">
              <div>
                <span className="text-gray-400 text-sm">Empresa:</span>
                <p className="text-white font-medium">{solicitudSeleccionada?.empresa}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Remitente:</span>
                <p className="text-white">{solicitudSeleccionada?.remitente}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">ID Fiscal:</span>
                <p className="text-white">{solicitudSeleccionada?.idFiscal}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Información del Evento</h3>
            <div className="space-y-3 text-gray-300">
              <div>
                <span className="text-gray-400 text-sm">Tipo de Evento:</span>
                <p className="text-white">{solicitudSeleccionada?.tipoEvento}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Fecha de Solicitud:</span>
                <p className="text-white">{solicitudSeleccionada?.fechaSolicitud}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Estado:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  solicitudSeleccionada?.status === 'pendiente'
                    ? 'bg-yellow-600 text-yellow-100'
                    : solicitudSeleccionada?.status === 'aprobado'
                    ? 'bg-green-600 text-green-100'
                    : 'bg-red-600 text-red-100'
                }`}>
                  {solicitudSeleccionada?.status === 'pendiente' ? 'Pendiente' :
                   solicitudSeleccionada?.status === 'aprobado' ? 'Aprobado' : 'Rechazado'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-white text-lg font-semibold mb-3">Descripción del Evento</h3>
          <p className="text-gray-300 leading-relaxed">
            {solicitudSeleccionada?.descripcion}
          </p>
        </div>

        {/* Sección de archivos en el detalle */}
        <div className="mt-6">
          <h3 className="text-white text-lg font-semibold mb-3">Documentos de la Empresa</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {solicitudSeleccionada?.archivos?.map((archivo, archivoIndex) => (
              <div key={`archivo-detalle-${solicitudSeleccionada.id}-${archivoIndex}`} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium text-sm">{archivo.tipo}</p>
                      <p className="text-gray-400 text-xs">{archivo.nombre}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => petitions.handleDownloadDocument(solicitudSeleccionada.petitionId)}
                    className="text-blue-400 hover:text-blue-300 transition-colors p-2"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Approval Actions */}
      {solicitudSeleccionada?.status === 'pendiente' ? (
        <div className="flex gap-4">
          <button
            onClick={() => petitions.handleRechazar(solicitudSeleccionada.id)}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
            Rechazar Solicitud
          </button>

          <button
            onClick={() => petitions.handleAprobar(solicitudSeleccionada.id)}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Check className="w-5 h-5" />
            Aprobar Solicitud
          </button>
        </div>
      ) : (
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-300 text-center">
            Esta solicitud ya ha sido{' '}
            <span className={solicitudSeleccionada?.status === 'aprobado' ? 'text-green-400' : 'text-red-400'}>
              {solicitudSeleccionada?.status === 'aprobado' ? 'aprobada' : 'rechazada'}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default PetitionsPanel;