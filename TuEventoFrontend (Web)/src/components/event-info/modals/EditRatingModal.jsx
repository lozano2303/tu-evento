import React from 'react';
import { Star } from 'lucide-react';

const EditRatingModal = ({
  showEditModal,
  setShowEditModal,
  editingRating,
  setEditingRating,
  editRatingValue,
  setEditRatingValue,
  editCommentValue,
  setEditCommentValue,
  handleSaveEditRating
}) => {
  if (!showEditModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-3">
              <span className="text-2xl">✏️</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Editar comentario</h3>
          <p className="text-purple-100 text-sm">Modifica tu calificación y comentario</p>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Sistema de estrellas */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calificación
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 cursor-pointer transition-colors ${
                    star <= editRatingValue ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
                  }`}
                  onClick={() => setEditRatingValue(star)}
                />
              ))}
            </div>
          </div>

          {/* Área de comentario */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentario
            </label>
            <textarea
              value={editCommentValue}
              onChange={(e) => setEditCommentValue(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-900 placeholder-gray-400 resize-none"
              rows="4"
              placeholder="Escribe tu comentario..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingRating(null);
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveEditRating}
              className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRatingModal;