import React from 'react';
import { X, RefreshCw, ShoppingCart } from 'lucide-react';
import DrawingCanvas from '../../DrawingCanvas.jsx';

const MapModal = ({
  showMapModal,
  setShowMapModal,
  event,
  modalLoading,
  setModalLoading,
  modalError,
  sections,
  selectedSection,
  setSelectedSection,
  selectedSeats,
  selectedSeatCount,
  MAX_SEATS_PER_PURCHASE,
  totalPrice,
  selectedSeatDetails,
  seats,
  layoutElements,
  zoom,
  setZoom,
  offset,
  setOffset,
  handleSeatSelect,
  handleSeatPositionSelect,
  lastUpdate,
  setLastUpdate,
  loadSeatsForSection,
  setShowPurchaseModal,
  DEFAULT_SEAT_PRICE
}) => {
  if (!showMapModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-lg md:text-2xl font-bold text-gray-800">Reservar Asientos - {event?.eventName}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                if (selectedSection) {
                  await loadSeatsForSection(selectedSection.sectionID);
                  setLastUpdate(Date.now());
                }
              }}
              disabled={modalLoading}
              className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
              title="Actualizar estado de asientos"
            >
              <RefreshCw className={`w-6 h-6 ${modalLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowMapModal(false)}
              className="text-gray-500 hover:text-gray-700"
              title="Cerrar (ESC)"
            >
              <X className="w-8 h-8" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Panel lateral de controles */}
          <div className="w-full lg:w-80 bg-gray-50 p-6 border-r lg:border-r border-b lg:border-b-0">
            <h3 className="text-lg font-semibold mb-4">Seleccionar Asientos</h3>

            {/* Selector de sección */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Sección
              </label>
              <select
                value={selectedSection?.sectionID || ''}
                onChange={(e) => {
                  const secId = parseInt(e.target.value);
                  const sec = sections.find(s => s.sectionID === secId);
                  setSelectedSection(sec);
                  loadSeatsForSection(sec.sectionID);
                }}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {sections.map(sec => (
                  <option key={sec.sectionID} value={sec.sectionID}>
                    {sec.displayName || sec.sectionName || 'Sección'} - ${sec.price || DEFAULT_SEAT_PRICE}
                  </option>
                ))}
              </select>
            </div>

            {/* Precio de sección */}
            <div className="mb-4 p-3 bg-purple-50 rounded-lg">
              <div className="text-sm text-gray-600">Precio por asiento:</div>
              <div className="font-bold text-purple-600">${selectedSection?.price || DEFAULT_SEAT_PRICE}</div>
            </div>

            {/* Asientos seleccionados */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Asientos Seleccionados ({selectedSeatCount})
                {selectedSeatCount > MAX_SEATS_PER_PURCHASE && (
                  <span className="text-red-500 text-xs ml-2">
                    (Máximo {MAX_SEATS_PER_PURCHASE})
                  </span>
                )}
              </h4>
              <div className="max-h-32 overflow-y-auto">
                {selectedSeatDetails.map(seat => (
                  <div key={seat.key} className="bg-purple-100 p-2 rounded mb-1">
                    <span className="text-sm">
                      Fila {seat.row} - Asiento {seat.seatNumber}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            {selectedSeatCount > 0 && (
              <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-purple-600">
                    ${totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  ${selectedSection?.price || DEFAULT_SEAT_PRICE} × {selectedSeatCount} asiento(s)
                </div>
              </div>
            )}

            {/* Botón de reserva */}
            {(() => {
              const canReserve = selectedSeatCount > 0 && selectedSeatCount <= MAX_SEATS_PER_PURCHASE;
              let buttonText = "Reservar Asientos";
              let buttonColor = "bg-purple-600 hover:bg-purple-700";

              if (selectedSeatCount === 0) {
                buttonText = "Selecciona asientos";
                buttonColor = "bg-gray-400";
              } else if (selectedSeatCount > MAX_SEATS_PER_PURCHASE) {
                buttonText = `Máximo ${MAX_SEATS_PER_PURCHASE} asientos`;
                buttonColor = "bg-red-500 hover:bg-red-600";
              } else {
                buttonText = `Reservar Asientos (${selectedSeatCount})`;
              }

              return (
                <button
                  onClick={() => canReserve && setShowPurchaseModal(true)}
                  disabled={!canReserve}
                  className={`w-full ${buttonColor} disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {buttonText}
                </button>
              );
            })()}

            {/* Información adicional */}
            <div className="mt-4 text-xs text-gray-600">
              <p>• Presiona ESC para cerrar el modal</p>
              <p>• Presiona ENTER para confirmar reserva</p>
              <p>• Ctrl+R para recargar el mapa</p>
              {selectedSeatCount > 0 && selectedSeatCount <= MAX_SEATS_PER_PURCHASE && (
                <p className="mt-1 text-green-600">
                  • Listo para reservar
                </p>
              )}
              {selectedSeatCount > MAX_SEATS_PER_PURCHASE && (
                <p className="mt-1 text-red-500">
                  • Máximo {MAX_SEATS_PER_PURCHASE} asientos por reserva
                </p>
              )}
            </div>

            {/* Última actualización */}
            <div className="mt-2 text-xs text-gray-500">
              Última actualización: {new Date(lastUpdate).toLocaleTimeString()}
            </div>

            {/* Leyenda */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Leyenda</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-600">Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm text-gray-600">Seleccionado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm text-gray-600">Ocupado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Área del mapa y lista de asientos */}
          <div className="flex-1 p-6 flex flex-col">
            {/* Mapa del evento con asientos */}
            <div className="flex-1 flex justify-center items-center border rounded-lg bg-gray-50 overflow-hidden">
              {modalLoading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando mapa del evento...</p>
                </div>
              ) : modalError ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-red-500">⚠️</span>
                  </div>
                  <p className="text-red-600 font-medium">Error al cargar el mapa</p>
                  <p className="text-sm text-gray-500 mt-2">{modalError}</p>
                </div>
              ) : (layoutElements && layoutElements.length > 0) || (seats && seats.length > 0) ? (
                (() => {
                  const filteredSeats = seats.filter(seat => seat.sectionID === selectedSection?.sectionID) || [];
                  const filteredElements = layoutElements.map(element => {
                    if (element.type === 'seatRow' && element.seatPositions) {
                      const updatedPositions = element.seatPositions.map(pos => {
                        const matchingSeat = filteredSeats.find(seat => seat.row === pos.row && seat.seatNumber.toString() === pos.seatNumber);
                        if (matchingSeat) {
                          return { ...pos, status: matchingSeat.status };
                        }
                        return pos;
                      });
                      return { ...element, seatPositions: updatedPositions };
                    }
                    return element;
                  });
                  return (
                    <DrawingCanvas
                      elements={filteredElements || []}
                      selectedElementId={null}
                      onSelect={() => {}}
                      onCreate={() => {}}
                      onUpdate={() => {}}
                      onDelete={() => {}}
                      activeTool="select"
                      setActiveTool={() => {}}
                      units="cm"
                      showMeasurements={false}
                      seats={filteredSeats}
                      selectedSeats={selectedSeats}
                      onSeatSelect={handleSeatSelect}
                      onSeatPositionSelect={handleSeatPositionSelect}
                      isSeatSelectionMode={true}
                      allowMultipleSeats={true}
                      zoom={zoom}
                      setZoom={setZoom}
                      offset={offset}
                      setOffset={setOffset}
                      selectedSection={selectedSection}
                    />
                  );
                })()
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🗺️</span>
                  </div>
                  <p className="text-gray-600 font-medium">Mapa no disponible</p>
                  <p className="text-sm text-gray-500 mt-2">El organizador aún no ha creado la distribución de asientos para este evento.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapModal;