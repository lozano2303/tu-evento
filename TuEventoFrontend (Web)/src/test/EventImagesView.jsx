import { useState, useEffect } from 'react';
import { EventImgService } from './EventImgService';
import { getAllEvents } from '../services/EventService';

const EventImagesView = () => {
  const [images, setImages] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventsData = await getAllEvents();
        setEvents(eventsData);
      } catch (err) {
        console.error('Error loading events:', err);
        setEvents([]);
      }
    };

    loadEvents();
  }, []);

  useEffect(() => {
    const loadImages = async () => {
      if (!selectedEventId) {
        setImages([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await EventImgService.getEventImages(selectedEventId);
        setImages(data);
      } catch (err) {
        setError(err.message);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [selectedEventId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Cargando imágenes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-lg">Error: {error}</div>
      </div>
    );
  }

  const openModal = (image) => {
    setSelectedImage(image);
    setModalOpen(true);
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    setPanX(prev => prev + deltaX);
    setPanY(prev => prev + deltaY);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(5, prev * zoomFactor)));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Vista test para ver las imágenes asociadas a un evento
      </h1>

      <div className="mb-6">
        <label htmlFor="event-select" className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Evento:
        </label>
        <select
          id="event-select"
          value={selectedEventId || ''}
          onChange={(e) => setSelectedEventId(e.target.value ? parseInt(e.target.value) : null)}
          className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
        >
          <option key="default" value="">Seleccionar evento</option>
          {Array.isArray(events) && events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.eventName || `Evento ${event.id}`}
            </option>
          ))}
        </select>
      </div>

      {selectedEventId ? (
        loading ? (
          <div className="flex justify-center items-center min-h-64">
            <div className="text-lg">Cargando imágenes...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center min-h-64">
            <div className="text-red-500 text-lg">Error: {error}</div>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center text-gray-500">
            No hay imágenes disponibles para este evento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images
              .sort((a, b) => a.order - b.order) // Ordenar por order
              .map((image) => (
                <div
                  key={image.eventImgID}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => openModal(image)}
                >
                  <img
                    src={image.url}
                    alt={`Imagen del evento`}
                    className="w-full h-64 object-cover"
                  />
                </div>
              ))}
          </div>
        )
      ) : (
        <div className="text-center text-gray-500 mt-8">
          Selecciona un evento del menú desplegable para ver sus imágenes.
        </div>
      )}

      {modalOpen && selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        >
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedImage.url}
              alt="Imagen ampliada"
              className="max-w-full max-h-full object-contain cursor-move select-none"
              style={{
                transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
                transformOrigin: 'center center',
              }}
              onMouseDown={handleMouseDown}
              draggable={false}
            />
            <div className="absolute bottom-4 left-4 bg-white bg-opacity-75 rounded px-3 py-1 text-sm">
              Zoom: {Math.round(zoom * 100)}% | Usa la rueda del mouse para zoom, arrastra para mover
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventImagesView;