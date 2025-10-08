import React from 'react';
import { Star, Send, Trash2 } from 'lucide-react';

const CommentsSection = ({
  rating,
  mensaje,
  setMensaje,
  handleSubmitRating,
  submittingRating,
  handleStarClick,
  eventRatings,
  loadingRatings,
  userInfo,
  handleEditRating,
  handleDeleteRating,
  deletingRating,
  visibleCommentsCount,
  handleShowMoreComments,
  handleShowLessComments,
  navigate
}) => {
  return (
    <div className="mb-12">

      {/* Formulario para escribir comentario */}
      {localStorage.getItem('token') ? (
        <div className="mb-8">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">U</span>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm mb-2">Título del mensaje:</p>
              <p className="text-white text-sm mb-3">Puntuación:</p>

              {/* Sistema de estrellas */}
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 cursor-pointer transition-colors ${
                      star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
                    }`}
                    onClick={() => handleStarClick(star)}
                  />
                ))}
              </div>

              <p className="text-white text-sm mb-3">Escribe tu mensaje:</p>

              {/* Área de texto */}
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none"
                rows="4"
                placeholder="Escribe tu comentario aquí..."
              />

              {/* Botón de enviar */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleSubmitRating}
                  disabled={submittingRating}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  {submittingRating ? 'Enviando...' : 'Enviar'}
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 text-center">
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-300 mb-4">Para dejar comentarios y calificaciones, necesitas iniciar sesión.</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      )}

      {/* Comentarios existentes */}
      <div className="space-y-6">
        {loadingRatings ? (
          <div className="text-center py-4">
            <p className="text-gray-400">Cargando comentarios...</p>
          </div>
        ) : eventRatings.length > 0 ? (
          <>
            {eventRatings.slice(0, visibleCommentsCount).map((rating, index) => {
              const user = userInfo[rating.userId];
              const displayName = user?.fullName || `Usuario ${rating.userId}`;
              const avatarLetter = user?.fullName?.charAt(0).toUpperCase() || rating.userId?.toString().charAt(0).toUpperCase() || 'U';

              // Check if current user can delete this rating
              const currentUserId = localStorage.getItem('userID');
              const canDelete = currentUserId && parseInt(currentUserId) === rating.userId;

              return (
                <div key={rating.ratingID || index} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">
                      {avatarLetter}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold">{displayName}</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= rating.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {canDelete && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditRating(rating)}
                            className="text-blue-500 hover:text-blue-700 p-1"
                            title="Editar comentario"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteRating(rating.ratingID, rating.userId)}
                            disabled={deletingRating === rating.ratingID}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1"
                            title="Eliminar comentario"
                          >
                            {deletingRating === rating.ratingID ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      {rating.comment}
                    </p>
                    {rating.createdAt && (
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Botones de paginación */}
            <div className="text-center mt-6 space-y-3">
              {eventRatings.length > visibleCommentsCount && (
                <button
                  onClick={handleShowMoreComments}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Ver más comentarios ({eventRatings.length - visibleCommentsCount} restantes)
                </button>
              )}
              {visibleCommentsCount > 5 && (
                <div>
                  <button
                    onClick={handleShowLessComments}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Ver menos comentarios
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">Aún no hay comentarios para este evento.</p>
            <p className="text-gray-500 text-sm mt-2">¡Sé el primero en dejar tu opinión!</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default CommentsSection;