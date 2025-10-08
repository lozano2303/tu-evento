import React from 'react';
import { CheckCircle, ShoppingCart } from 'lucide-react';

const PurchaseModal = ({
  showPurchaseModal,
  setShowPurchaseModal,
  selectedSeatCount,
  totalPrice,
  selectedSeatDetails,
  handlePurchaseSeats,
  reservingSeats
}) => {
  if (!showPurchaseModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <h2 className="text-xl font-bold text-gray-800">Confirmar Compra</h2>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-2">Vas a reservar:</p>
            <ul className="text-sm text-gray-800 space-y-1">
              <li>• {selectedSeatCount} asiento(s)</li>
              <li>• Total: ${totalPrice.toLocaleString()}</li>
            </ul>
            {selectedSeatDetails.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Detalle de asientos:</p>
                <div className="max-h-20 overflow-y-auto">
                  {selectedSeatDetails.map(seat => (
                    <div key={seat.key} className="text-xs text-gray-500">
                      • Fila {seat.row} Asiento {seat.seatNumber}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                📧 Recibirás el ticket con QR y los datos de la reserva en tu correo electrónico.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowPurchaseModal(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handlePurchaseSeats}
              disabled={reservingSeats}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {reservingSeats ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Procesando...
                </>
              ) : (
                'Confirmar Reserva'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;