import React from 'react';

const DeleteConfirmModal = ({
  showDeleteConfirmModal,
  setShowDeleteConfirmModal,
  setDeleteRatingId,
  confirmDeleteRating
}) => {
  if (!showDeleteConfirmModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-3">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Eliminar comentario</h3>
          <p className="text-purple-100 text-sm">¿Estás seguro de que quieres eliminar este comentario?</p>
        </div>

        {/* Contenido */}
        <div className="p-6 text-center">
          <div className="mb-6">
            <div className="bg-red-50 rounded-lg p-4 mb-4">
              <span className="text-red-600 text-sm font-medium">Esta acción no se puede deshacer.</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowDeleteConfirmModal(false);
                setDeleteRatingId(null);
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDeleteRating}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Sí, eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;