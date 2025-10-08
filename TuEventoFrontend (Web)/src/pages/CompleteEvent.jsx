import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Circle, ArrowRight, ArrowLeft } from 'lucide-react';
import { getEventById, completeEvent } from '../services/EventService.js';
import { getEventImages } from '../services/EventImgService.js';
import { getCategoriesByEvent } from '../services/CategoryService.js';

const CompleteEvent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('id');

  const [event, setEvent] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasImages, setHasImages] = useState(false);
  const [hasCategories, setHasCategories] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const steps = [
    { name: 'Imágenes', description: 'Agregar imágenes del evento' },
    { name: 'Categorías', description: 'Asignar categorías al evento' },
    { name: 'Completar', description: 'Finalizar y publicar el evento' }
  ];

  useEffect(() => {
    if (eventId) {
      loadEventData();
    }
  }, [eventId]);

  const loadEventData = async () => {
    try {
      setLoading(true);

      // Load event details
      const eventResult = await getEventById(eventId);
      if (eventResult.success) {
        setEvent(eventResult.data);
      }

      // Check images
      const imagesResult = await getEventImages(eventId);
      setHasImages(imagesResult.success && imagesResult.data && imagesResult.data.length > 0);

      // Check categories
      const categoriesResult = await getCategoriesByEvent(eventId);
      setHasCategories(categoriesResult.success && categoriesResult.data && categoriesResult.data.length > 0);

      // Set initial step based on what's missing
      if (!hasImages) {
        setCurrentStep(0);
      } else if (!hasCategories) {
        setCurrentStep(1);
      } else {
        setCurrentStep(2);
      }

    } catch (error) {
      console.error('Error loading event data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setCompleting(true);
      const result = await completeEvent(eventId);
      if (result.success) {
        alert('¡Evento completado exitosamente!');
        navigate('/events');
      } else {
        alert('Error al completar el evento: ' + result.message);
      }
    } catch (error) {
      console.error('Error completing event:', error);
      alert('Error al completar el evento');
    } finally {
      setCompleting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Images
        return (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Agregar Imágenes</h3>
            <p className="text-gray-300 mb-6">
              {hasImages
                ? '¡Ya tienes imágenes para tu evento! ✅'
                : 'Necesitas agregar al menos una imagen para tu evento.'
              }
            </p>
            <button
              onClick={() => navigate(`/event-form?edit=${eventId}&step=images`)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {hasImages ? 'Gestionar Imágenes' : 'Agregar Imágenes'}
            </button>
          </div>
        );

      case 1: // Categories
        return (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Asignar Categorías</h3>
            <p className="text-gray-300 mb-6">
              {hasCategories
                ? '¡Ya tienes categorías asignadas! ✅'
                : 'Necesitas asignar al menos una categoría a tu evento.'
              }
            </p>
            <button
              onClick={() => navigate(`/event-form?edit=${eventId}&step=categories`)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {hasCategories ? 'Gestionar Categorías' : 'Asignar Categorías'}
            </button>
          </div>
        );

      case 2: // Next to Event Management
        return (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">¡Todo Listo!</h3>
            <p className="text-gray-300 mb-6">
              Tu evento tiene todas las imágenes y categorías necesarias.
              Haz clic en "Siguiente" para continuar con la publicación.
            </p>
            <button
              onClick={() => navigate('/event-management')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Siguiente
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Evento no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Completar Evento</h1>
          <h2 className="text-xl text-purple-400">{event.eventName}</h2>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    index < currentStep ? 'bg-green-600' :
                    index === currentStep ? 'bg-purple-600' :
                    'bg-gray-600'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <Circle className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <span className={`mt-2 text-sm ${
                    index <= currentStep ? 'text-white' : 'text-gray-400'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className={`w-6 h-6 ${
                    index < currentStep ? 'text-green-400' : 'text-gray-600'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Anterior
          </button>

          <button
            onClick={currentStep === steps.length - 1 ? () => navigate('/event-management') : handleNext}
            disabled={(currentStep === 0 && !hasImages) || (currentStep === 1 && !hasCategories)}
            className="flex items-center bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {currentStep === steps.length - 1 ? 'Siguiente' : 'Siguiente'}
            {currentStep < steps.length - 1 && <ArrowRight className="w-5 h-5 ml-2" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompleteEvent;