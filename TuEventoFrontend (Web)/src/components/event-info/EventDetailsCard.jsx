import React, { useState } from 'react';

const EventDetailsCard = ({
  event,
  eventCategories,
  tickets,
  loadingTickets,
  checkSession,
  handleShowMap
}) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  return (
    <div className="grid md:grid-cols-2 gap-8 mb-12">

      {/* Información del evento */}
      <div
        className="p-6 rounded-lg"
        style={{ backgroundColor: '#8b5cf6' }}
      >
        <h2 className="text-white text-xl font-bold mb-4">
          ¡Prepárate para {event?.eventName}!
        </h2>
        <div className="text-white text-sm leading-relaxed mb-4 space-y-2">
          <div><strong>Nombre del Evento:</strong> {event?.eventName}</div>
          <div><strong>Descripción:</strong>
            {event?.description && event.description.length > 100 ? (
              <>
                {isDescriptionExpanded ? event.description : `${event.description.substring(0, 100)}...`}
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-purple-200 hover:text-purple-100 ml-2 underline"
                >
                  {isDescriptionExpanded ? 'Ver menos' : 'Ver más'}
                </button>
              </>
            ) : (
              event.description
            )}
          </div>
          <div><strong>Fecha de Inicio:</strong> {event?.startDate ? new Date(event.startDate).toLocaleDateString() : 'No definida'}</div>
          <div><strong>Fecha de Fin:</strong> {event?.finishDate ? new Date(event.finishDate).toLocaleDateString() : 'No definida'}</div>
          <div><strong>Ubicación:</strong> {event?.locationID?.name || 'No definida'}</div>
          <div><strong>Ciudad:</strong> {event?.locationID?.address?.city?.name || 'No definida'}</div>
          <div><strong>Departamento:</strong> {event?.locationID?.address?.city?.department?.name || 'No definido'}</div>
          {eventCategories.length > 0 && (
            <div><strong>Categoría:</strong> {(() => {
              const cat = eventCategories[0]; // Mostrar solo la primera categoría
              if (cat.parentName) {
                return `${cat.parentName} - ${cat.name}`;
              } else {
                return cat.name;
              }
            })()}</div>
          )}
        </div>
      </div>

      {/* Horarios y precios disponibles */}
      <div>
        <div className="space-y-3">
          {loadingTickets ? (
            <div className="text-center py-4">
              <p className="text-gray-400">Cargando precios...</p>
            </div>
          ) : tickets.length > 0 ? (
            tickets.map((ticket, index) => (
              <div key={ticket.id || index} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-white">{ticket.price ? `$${ticket.price}` : ''}</span>
                </div>
                <span className="text-white">{ticket.time || `Horario ${index + 1}`}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400">No hay tickets disponibles en este momento.</p>
              <p className="text-gray-500 text-sm mt-2">Los precios se mostrarán cuando estén disponibles.</p>
            </div>
          )}

          {/* Botón para ver mapa del evento */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                if (checkSession()) {
                  handleShowMap();
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Ver mapa de evento
            </button>
            {!localStorage.getItem('token') && (
              <p className="text-gray-400 text-xs mt-2">
                Inicia sesión para reservar asientos
              </p>
            )}
          </div>

          {/* Footer de la página */}
          <div className="text-center py-8">
          </div>

        </div>
      </div>

    </div>
  );
};

export default EventDetailsCard;