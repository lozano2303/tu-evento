import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const EventHero = ({
  event,
  eventImages,
  loadingImages,
  currentImageIndex,
  nextImage,
  prevImage,
  goToImage,
  autoplay
}) => {
  return (
    <section className="relative">
      <div className="px-4 py-8">
        <div className="max-w-7xl mx-auto">

          {/* Breadcrumbs */}
          <div className="text-white text-sm mb-4 text-center">
            <a href="/" className="hover:underline">Inicio</a> {'>'}
            <a href="/events" className="hover:underline ml-1">Eventos</a> {'>'}
            <span className="ml-1">{event?.eventName || 'Evento'}</span>
          </div>

          {/* Título principal */}
          <h1 className="text-white text-3xl font-bold mb-8 text-center">
            {event?.eventName || 'Evento'}
          </h1>

          {/* Carrusel de imágenes del evento */}
          {loadingImages ? (
            <div className="flex justify-center items-center h-64 mb-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : eventImages.length > 0 ? (
            <div className="relative mb-8">
              {/* Imagen principal del carrusel */}
              <div className="relative w-full h-80 md:h-96 overflow-hidden rounded-lg flex items-center justify-center">
                <img
                  src={eventImages[currentImageIndex]?.url}
                  alt={`${event?.eventName} - Imagen ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain transition-opacity duration-500"
                />

                {/* Botones de navegación */}
                {eventImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-purple-600 bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-purple-600 bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Indicadores */}
              {eventImages.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {eventImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentImageIndex
                          ? 'bg-purple-600'
                          : 'bg-gray-400 hover:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : null}

        </div>
      </div>
    </section>
  );
};

export default EventHero;