import React from 'react';
import { Ticket, Check } from 'lucide-react';

const TicketsVentas = ({ tickets }) => {
  if (tickets.loadingTickets) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-gray-400">Cargando datos de tickets...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-white text-2xl font-bold mb-8">Tickets y Ventas</h1>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Tickets</p>
              <p className="text-white text-2xl font-bold">{tickets.totalTickets}</p>
            </div>
            <Ticket className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tickets Vendidos</p>
              <p className="text-white text-2xl font-bold">{tickets.totalSold}</p>
            </div>
            <Check className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ingresos Totales</p>
              <p className="text-white text-2xl font-bold">${tickets.totalRevenue.toLocaleString()}</p>
            </div>
            <Ticket className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Detalles por evento */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-white text-lg font-semibold">Ventas por Evento</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {tickets.ticketsData.map((eventData, index) => (
              <div key={`ticket-${eventData.eventId}-${index}`} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-white font-medium">{eventData.eventName}</h4>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-gray-400">
                      Vendidos: <span className="text-green-400">{eventData.soldTickets}</span>
                    </span>
                    <span className="text-gray-400">
                      Total: <span className="text-blue-400">{eventData.totalTickets}</span>
                    </span>
                    <span className="text-gray-400">
                      Disponibles: <span className="text-yellow-400">{eventData.totalTickets - eventData.soldTickets}</span>
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">${(eventData.soldTickets * 50).toLocaleString()}</p>
                  <p className="text-gray-400 text-sm">Ingresos</p>
                </div>
              </div>
            ))}
          </div>

          {tickets.ticketsData.length === 0 && (
            <div className="text-center py-8">
              <Ticket className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <div className="text-gray-400">No hay datos de tickets disponibles</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketsVentas;