import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, MapPin, Upload, X, ChevronRight, ChevronLeft, Minus } from 'lucide-react';
import { createEvent } from '../../services/EventService.js';
import { getAllLocations } from '../../services/LocationService.js';
import { getAllCities } from '../../services/CityService.js';
import { getDepartmentById } from '../../services/DepartmentService.js';
import { uploadEventImage } from '../../services/EventImgService.js';

const EventForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    startDate: '',
    finishDate: '',
    cityID: '',
    locationID: '',
  });
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState({}); // Estado de carga por imagen
  const [cities, setCities] = useState([]);
  const [locations, setLocations] = useState([]);
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [createdEvent, setCreatedEvent] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    loadCities();
    loadLocations();
  }, []);

  const loadCities = async () => {
    try {
      const result = await getAllCities();
      if (result.success) {
        setCities(result.data);
      } else {
        setError(result.message || 'Error al cargar ciudades');
      }
    } catch (err) {
      setError('Error de conexión al cargar ciudades');
      console.error('Error loading cities:', err);
    }
  };

  const loadLocations = async () => {
    try {
      const result = await getAllLocations();
      if (result.success) {
        setLocations(result.data);
      } else {
        setError(result.message || 'Error al cargar ubicaciones');
      }
    } catch (err) {
      setError('Error de conexión al cargar ubicaciones');
      console.error('Error loading locations:', err);
    }
  };

  const validateEventName = (name) => {
    if (!name || name.trim() === "") {
      return "El nombre del evento es obligatorio";
    }
    const trimmed = name.trim();
    if (trimmed.length < 3) {
      return "El nombre del evento debe tener al menos 3 caracteres";
    }
    if (trimmed.length > 100) {
      return "El nombre del evento no puede tener más de 100 caracteres";
    }
    const pattern = /^[a-zA-ZÀ-ÿ0-9\s\-_.&()]+$/;
    if (!pattern.test(trimmed)) {
      return "El nombre del evento contiene caracteres no permitidos";
    }
    return "";
  };

  const validateDescription = (desc) => {
    if (!desc || desc.trim() === "") {
      return "La descripción del evento es obligatoria";
    }
    const trimmed = desc.trim();
    if (trimmed.length < 10) {
      return "La descripción del evento debe tener al menos 10 caracteres";
    }
    if (trimmed.length > 500) {
      return "La descripción del evento no puede tener más de 500 caracteres";
    }
    return "";
  };

  const validateDates = (start, finish) => {
    if (!start) return "La fecha de inicio es obligatoria";
    if (!finish) return "La fecha de fin es obligatoria";

    const startDate = new Date(start);
    const finishDate = new Date(finish);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      return "La fecha de inicio no puede ser anterior a hoy";
    }

    if (finishDate <= startDate) {
      return "La fecha de fin debe ser posterior a la fecha de inicio";
    }

    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 2);
    if (startDate > maxDate) {
      return "La fecha de inicio no puede ser más de 2 años en el futuro";
    }

    return "";
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }

    if (name === 'cityID' && value) {
      try {
        const selectedCity = cities.find(city => city.departmentID === parseInt(value));
        if (selectedCity && selectedCity.departmentID) {
          const deptResult = await getDepartmentById(selectedCity.departmentID);
          if (deptResult.success) {
            setDepartment(deptResult.data.name);
          }
        }
      } catch (err) {
        console.error('Error loading department:', err);
      }
    }
  };

  const handleImageUpload = async (index, file) => {
    if (!createdEvent) return;

    setUploadingImages(prev => ({ ...prev, [index]: true }));

    const imageNumber = index + 1;
    const result = await uploadEventImage(createdEvent.eventID || createdEvent.id, file, imageNumber);

    setUploadingImages(prev => ({ ...prev, [index]: false }));

    if (result.success) {
      const newImages = [...images];
      newImages[index] = result.data.url;
      setImages(newImages);
    } else {
      setFieldErrors(prev => ({
        ...prev,
        [`image${index}`]: result.message
      }));
    }

    // Clear image error when user uploads
    if (fieldErrors[`image${index}`]) {
      setFieldErrors(prev => ({
        ...prev,
        [`image${index}`]: ""
      }));
    }
  };

  const removeImage = (index) => {
    // Don't allow removing the first 3 mandatory images
    if (index < 3) return;

    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const addImageField = () => {
    if (images.length < 5) {
      setImages([...images, '']);
    }
  };

  const validateImages = () => {
    const errors = {};
    // Validar que las primeras 3 imágenes sean obligatorias
    for (let i = 0; i < 3; i++) {
      if (!images[i] || images[i] === '') {
        errors[`image${i}`] = `La imagen ${i + 1} es obligatoria`;
      }
    }
    // Las imágenes adicionales (índice 3+) son opcionales
    return errors;
  };

  const nextStep = async () => {
    // Validate step 1 before proceeding
    const errors = {};

    const nameError = validateEventName(formData.eventName);
    if (nameError) errors.eventName = nameError;

    const descError = validateDescription(formData.description);
    if (descError) errors.description = descError;

    const dateError = validateDates(formData.startDate, formData.finishDate);
    if (dateError) {
      errors.startDate = dateError;
      errors.finishDate = dateError;
    }

    if (!formData.cityID) errors.cityID = "La ciudad es obligatoria";
    if (!formData.locationID) errors.locationID = "La ubicación es obligatoria";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // Create the event when moving to step 2
    setLoading(true);
    try {
      const userID = localStorage.getItem('userID');
      if (!userID) {
        setError('Usuario no autenticado. Por favor inicia sesión.');
        setLoading(false);
        return;
      }

      const eventData = {
        userID: { userID: parseInt(userID) },
        eventName: formData.eventName.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        finishDate: formData.finishDate,
        locationID: { locationID: parseInt(formData.locationID) },
        status: 1, // Assuming 1 is active status
      };

      const result = await createEvent(eventData);
      if (result.success) {
        setCreatedEvent(result.data);
        console.log('Evento creado con ID:', result.data.id);

        // Initialize with 3 empty image fields when going to step 2
        if (images.length === 0) {
          setImages(['', '', '']);
        }
        setCurrentStep(2);
      } else {
        setError(result.message || 'Error al crear el evento');
      }
    } catch (err) {
      setError('Error de conexión al crear el evento');
      console.error('Error creating event:', err);
    } finally {
      setLoading(false);
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (currentStep === 1) {
      nextStep();
      return;
    }

    // Step 2: Validate images
    const imageErrors = validateImages();
    if (Object.keys(imageErrors).length > 0) {
      setFieldErrors(imageErrors);
      return;
    }

    setSuccess(true);
  };

  const handleFloorPlanDesigner = () => {
    if (createdEvent) {
      navigate(`/FloorPlanDesigner?eventId=${createdEvent.id}`);
    }
  };

  if (success && createdEvent) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 max-w-md w-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-400 mb-4">¡Evento Completado!</h2>
            <p className="text-gray-300 mb-6">
              El evento "{createdEvent.eventName}" ha sido creado exitosamente con todas sus imágenes.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/event-management')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Ver Eventos
              </button>
              <button
                onClick={handleFloorPlanDesigner}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Maquetar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-400'
        }`}>
          1
        </div>
        <div className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-600'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-400'
        }`}>
          2
        </div>
      </div>
    </div>
  );

  const renderImageUploadSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-3">Subir Imágenes del Evento</h3>
          <p className="text-gray-400 mb-4">Las primeras 3 imágenes son obligatorias. Puedes agregar hasta 2 imágenes adicionales opcionales.</p>
        </div>
        <div className="flex flex-col gap-3 ml-6">
          {images.length < 5 && (
            <button
              type="button"
              onClick={addImageField}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-medium"
            >
              <Upload className="w-5 h-5" />
              Agregar imagen
            </button>
          )}
          {images.length > 3 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                removeImage(images.length - 1);
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-medium"
            >
              <Minus className="w-5 h-5" />
              Quitar imagen
            </button>
          )}
        </div>
      </div>

      <div className="mb-6"></div>

      {fieldErrors.general && (
        <div className="bg-red-600 text-white p-3 rounded-lg">
          {fieldErrors.general}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <div key={index} className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Imagen {index + 1} {index < 3 ? '*' : '(Opcional)'}
            </label>
            <div className="relative">
              {uploadingImages[index] ? (
                <div className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  <span className="text-sm text-gray-400 mt-2">Subiendo...</span>
                </div>
              ) : image && image !== '' ? (
                <div className="relative">
                  <img
                    src={image}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-32 object-contain rounded-lg border border-gray-600"
                  />
                  {index >= 3 && (
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-400">Haz clic para subir</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleImageUpload(index, file);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>
            {fieldErrors[`image${index}`] && (
              <p className="text-red-500 text-xs">{fieldErrors[`image${index}`]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/event-management')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </button>
            <h1 className="text-2xl font-bold">Crear Evento</h1>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          {renderStepIndicator()}

          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            {error && (
              <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            {currentStep === 1 ? (
              <div className="space-y-6">
                <div>
                  <label htmlFor="eventName" className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre del Evento *
                  </label>
                  <input
                    type="text"
                    id="eventName"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ingresa el nombre del evento"
                  />
                  {fieldErrors.eventName && <p className="text-red-500 text-xs mt-1">{fieldErrors.eventName}</p>}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Describe el evento"
                  />
                  {fieldErrors.description && <p className="text-red-500 text-xs mt-1">{fieldErrors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-2">
                      Fecha de Inicio *
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {fieldErrors.startDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.startDate}</p>}
                  </div>

                  <div>
                    <label htmlFor="finishDate" className="block text-sm font-medium text-gray-300 mb-2">
                      Fecha de Fin *
                    </label>
                    <input
                      type="date"
                      id="finishDate"
                      name="finishDate"
                      value={formData.finishDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {fieldErrors.finishDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.finishDate}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="cityID" className="block text-sm font-medium text-gray-300 mb-2">
                      Ciudad *
                    </label>
                    <select
                      id="cityID"
                      name="cityID"
                      value={formData.cityID}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Selecciona una ciudad</option>
                      {cities.map(city => (
                        <option key={city.departmentID} value={city.departmentID}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.cityID && <p className="text-red-500 text-xs mt-1">{fieldErrors.cityID}</p>}
                  </div>

                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-300 mb-2">
                      Departamento
                    </label>
                    <input
                      type="text"
                      id="department"
                      value={department}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-gray-300 cursor-not-allowed"
                      placeholder="Se carga automáticamente"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="locationID" className="block text-sm font-medium text-gray-300 mb-2">
                    Ubicación *
                  </label>
                  <select
                    id="locationID"
                    name="locationID"
                    value={formData.locationID}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Selecciona una ubicación</option>
                    {locations.map(location => (
                      <option key={location.addressID} value={location.addressID}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.locationID && <p className="text-red-500 text-xs mt-1">{fieldErrors.locationID}</p>}
                </div>
              </div>
            ) : (
              renderImageUploadSection()
            )}

            <div className="mt-8 flex justify-between">
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
              )}
              <div className={currentStep === 1 ? 'ml-auto' : ''}>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  {loading ? 'Creando...' : currentStep === 1 ? (
                    <>
                      Siguiente
                      <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Crear Evento
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventForm;