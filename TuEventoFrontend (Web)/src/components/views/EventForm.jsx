import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, MapPin, Upload, X, ChevronRight, ChevronLeft, Minus } from 'lucide-react';
import { createEvent, getEventById, updateEvent, completeEvent } from '../../services/EventService.js';
import { getAllLocations } from '../../services/LocationService.js';
import { getAllCities } from '../../services/CityService.js';
import { getDepartmentById } from '../../services/DepartmentService.js';
import { uploadEventImage, getEventImages } from '../../services/EventImgService.js';
import { getRootCategories, getSubCategories, assignCategoryToEvent, getCategoriesByEvent } from '../../services/CategoryService.js';

const EventForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editEventId = searchParams.get('edit');
  const stepParam = searchParams.get('step');
  const isEditMode = !!editEventId;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    startDate: '',
    finishDate: '',
    cityID: '',
    locationID: '',
  });
  const [categories, setCategories] = useState({
    parentCategory: undefined,
    subCategory: undefined,
  });
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableSubCategories, setAvailableSubCategories] = useState([]);
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
  const [loadingInitialData, setLoadingInitialData] = useState(isEditMode);

  useEffect(() => {
    loadCities();
    loadLocations();
    loadRootCategories();
  }, []);

  useEffect(() => {
    // Reset categories when availableCategories changes
    setCategories({ parentCategory: undefined, subCategory: undefined });
    setAvailableSubCategories([]);
  }, [availableCategories]);

  useEffect(() => {
    if (isEditMode) {
      loadEventForEdit();
    }
  }, [isEditMode, editEventId]);

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

  const loadRootCategories = async () => {
    try {
      console.log('Loading root categories...');
      const result = await getRootCategories();
      console.log('API result:', result);
      if (result.success) {
        console.log('Raw data:', result.data);
        // Filter out categories with invalid categoryID
        const validCategories = result.data.filter(cat => cat.categoryID != null || cat.id != null);
        console.log('Filtered categories:', validCategories);
        setAvailableCategories(validCategories);
      } else {
        console.error('Error loading root categories:', result.message);
      }
    } catch (err) {
      console.error('Error loading root categories:', err);
    }
  };

  const loadSubCategories = async (parentId) => {
    try {
      const result = await getSubCategories(parentId);
      if (result.success) {
        // Filter out subcategories with invalid categoryID
        const validSubCategories = result.data.filter(cat => cat.categoryID != null);
        setAvailableSubCategories(validSubCategories);
      } else {
        console.error('Error loading sub categories:', result.message);
      }
    } catch (err) {
      console.error('Error loading sub categories:', err);
    }
  };

  const loadEventForEdit = async () => {
    try {
      setLoadingInitialData(true);
      setError(null);

      // Load event data
      const eventResult = await getEventById(editEventId);
      if (!eventResult.success) {
        setError(eventResult.message || 'Error al cargar el evento');
        return;
      }

      const event = eventResult.data;
      setFormData({
        eventName: event.eventName || '',
        description: event.description || '',
        startDate: event.startDate ? event.startDate.split('T')[0] : '',
        finishDate: event.finishDate ? event.finishDate.split('T')[0] : '',
        cityID: event.locationID?.address?.city?.cityID?.toString() || '',
        locationID: event.locationID?.locationID?.toString() || '',
      });

      // Load department if city is set
      if (event.locationID?.address?.city?.department) {
        setDepartment(event.locationID.address.city.department.name);
      }

      // Load existing images
      const imagesResult = await getEventImages(editEventId);
      const hasImages = imagesResult.success && imagesResult.data.length >= 3;

      if (imagesResult.success) {
        const existingImages = imagesResult.data.map(img => img.url);
        // Ensure we have at least 3 slots, fill with existing images
        const imageSlots = Array(Math.max(3, existingImages.length)).fill('');
        existingImages.forEach((url, index) => {
          if (index < imageSlots.length) {
            imageSlots[index] = url;
          }
        });
        setImages(imageSlots);
      }

      // Load existing categories
      const categoriesResult = await getCategoriesByEvent(editEventId);
      const hasCategories = categoriesResult.success && categoriesResult.data.length > 0;

      if (categoriesResult.success && categoriesResult.data.length > 0) {
        // Load the first category (assuming one category per event for now)
        const category = categoriesResult.data[0];
        setCategories({
          parentCategory: category.category?.parentCategory?.categoryID?.toString() || '',
          subCategory: category.category?.categoryID?.toString() || '',
        });
        // Load subcategories for the parent category
        if (category.category?.parentCategory?.categoryID) {
          loadSubCategories(category.category.parentCategory.categoryID);
        }
      }

      // Determine which step to show based on completion status or URL parameter
      // Step 1: Basic info (always completed if event exists)
      // Step 2: Images (need at least 3)
      // Step 3: Categories (need at least 1)

      if (stepParam === 'images') {
        setCurrentStep(2); // Go to images step
      } else if (stepParam === 'categories') {
        setCurrentStep(3); // Go to categories step
      } else if (!hasImages) {
        setCurrentStep(2); // Go to images step
      } else if (!hasCategories) {
        setCurrentStep(3); // Go to categories step
      } else {
        // Event is complete, show success
        setSuccess(true);
      }

      // Set as created event for image uploads
      setCreatedEvent({ id: parseInt(editEventId), eventName: event.eventName });

    } catch (err) {
      setError('Error al cargar los datos del evento');
      console.error('Error loading event for edit:', err);
    } finally {
      setLoadingInitialData(false);
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

    if (name === 'parentCategory' && value) {
      console.log('Selected parentCategory value:', value, typeof value);
      const numValue = parseInt(value, 10);
      setCategories(prev => ({ ...prev, parentCategory: numValue, subCategory: undefined }));
      loadSubCategories(numValue);
    }

    if (name === 'subCategory') {
      const newSubCategory = value ? parseInt(value, 10) : undefined;
      const previousSubCategory = categories.subCategory;

      setCategories(prev => ({ ...prev, subCategory: newSubCategory }));

      // Only assign category if it's different from the previous one
      if (createdEvent && newSubCategory && newSubCategory !== previousSubCategory) {
        assignCategoryToEvent(newSubCategory, createdEvent.eventID || createdEvent.id)
          .then(result => {
            if (result.success) {
              console.log('Categoría asignada exitosamente al evento');
            } else {
              // If category is already assigned, just log it but don't show error
              if (result.message && result.message.includes('ya está asignada')) {
                console.log('Categoría ya estaba asignada al evento');
              } else {
                console.error('Error asignando categoría:', result.message);
                setFieldErrors(prev => ({
                  ...prev,
                  subCategory: result.message || 'Error asignando categoría'
                }));
              }
            }
          })
          .catch(error => {
            // Handle network errors gracefully
            if (error.response && error.response.status === 400 && error.response.data && error.response.data.message && error.response.data.message.includes('ya está asignada')) {
              console.log('Categoría ya estaba asignada al evento');
            } else {
              console.error('Error asignando categoría:', error);
              setFieldErrors(prev => ({
                ...prev,
                subCategory: 'Error de conexión al asignar categoría'
              }));
            }
          });
      }

      // Clear subCategory error when user selects
      if (fieldErrors.subCategory) {
        setFieldErrors(prev => ({
          ...prev,
          subCategory: ""
        }));
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
        status: 0, // 0 = draft, will be activated after completing all steps
      };

      let result;
      if (isEditMode) {
        // Update existing event
        const updateData = {
          id: parseInt(editEventId),
          eventName: formData.eventName.trim(),
          description: formData.description.trim(),
          startDate: formData.startDate,
          finishDate: formData.finishDate,
          locationID: { locationID: parseInt(formData.locationID) },
          status: 1, // Set to active when completing
        };
        result = await updateEvent({}, updateData);
      } else {
        // Create new event
        result = await createEvent(eventData);
      }

      if (result.success) {
        if (isEditMode) {
          // For edit mode, just mark as success since event is already created
          setSuccess(true);
        } else {
          // For new events, proceed to next step
          const eventData = result.data;
          setCreatedEvent(eventData);

          // Redirect to complete event flow
          navigate(`/complete-event?id=${eventData.id}`);
        }
      } else {
        setError(result.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} el evento`);
      }
    } catch (err) {
      setError('Error de conexión al crear el evento');
      console.error('Error creating event:', err);
    } finally {
      setLoading(false);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (currentStep === 1) {
      nextStep();
      return;
    }

    if (currentStep === 2) {
      // Step 2: Validate images
      const imageErrors = validateImages();
      if (Object.keys(imageErrors).length > 0) {
        setFieldErrors(imageErrors);
        return;
      }
      setCurrentStep(3);
      return;
    }

    // Step 3: Validate categories and create event if not exists
    if (!categories.parentCategory) {
      setFieldErrors({ parentCategory: 'Debe seleccionar una categoría principal' });
      return;
    }
    if (!categories.subCategory) {
      // Si no hay subcategorías disponibles, usar la categoría padre
      if (availableSubCategories.length === 0 && categories.parentCategory) {
        categories.subCategory = categories.parentCategory;
      } else {
        setFieldErrors({ subCategory: 'Debe seleccionar una subcategoría' });
        return;
      }
    }

    // Create event if not already created
    if (!createdEvent) {
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
          status: 0, // 0 = draft, will be activated after completing all steps
        };

        const result = await createEvent(eventData);

        if (result.success) {
          const newEventData = result.data;
          setCreatedEvent(newEventData);

          // Note: Category is already assigned during subcategory selection in handleInputChange
          // No need to assign again here to avoid duplicate assignment errors

          // Redirect to event management
          navigate('/event-management');
        } else {
          setError(result.message || 'Error al crear el evento');
        }
      } catch (err) {
        setError('Error de conexión al crear el evento');
        console.error('Error creating event:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // Event already exists - category should already be assigned from previous steps
      // No need to assign again to avoid duplicate assignment errors
      navigate('/event-management');
    }
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
              El evento "{createdEvent?.eventName || formData.eventName}" ha sido {isEditMode ? 'completado' : 'creado'} exitosamente{!isEditMode ? ' con todas sus imágenes' : ''}.
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
        <div key="step-1" className={`flex items-center justify-center w-8 h-8 rounded-full ${
          currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-400'
        }`}>
          1
        </div>
        <div key="step-1-2" className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-600'}`}></div>
        <div key="step-2" className={`flex items-center justify-center w-8 h-8 rounded-full ${
          currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-400'
        }`}>
          2
        </div>
        <div key="step-2-3" className={`w-12 h-0.5 ${currentStep >= 3 ? 'bg-purple-600' : 'bg-gray-600'}`}></div>
        <div key="step-3" className={`flex items-center justify-center w-8 h-8 rounded-full ${
          currentStep >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-400'
        }`}>
          3
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

  if (loadingInitialData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando datos del evento...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold">{isEditMode ? 'Completar Evento' : 'Crear Evento'}</h1>
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
                      {cities.map((city, index) => (
                        <option key={`city-${city.departmentID}-${index}`} value={city.departmentID}>
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
                    {locations.map((location, index) => (
                      <option key={`location-${location.addressID}-${index}`} value={location.addressID}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.locationID && <p className="text-red-500 text-xs mt-1">{fieldErrors.locationID}</p>}
                </div>
              </div>
            ) : currentStep === 2 ? (
              renderImageUploadSection()
            ) : (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-3">Seleccionar Categorías</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="parentCategory" className="block text-sm font-medium text-gray-300 mb-2">
                      Categoría Principal *
                    </label>
                    <select
                      id="parentCategory"
                      name="parentCategory"
                      value={categories.parentCategory || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Selecciona una categoría</option>
                      {availableCategories.map((category, index) => (
                        <option key={`cat-${category.categoryID || category.id}-${index}`} value={(category.categoryID || category.id)?.toString() || ''}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.parentCategory && <p className="text-red-500 text-xs mt-1">{fieldErrors.parentCategory}</p>}
                  </div>

                  <div>
                    <label htmlFor="subCategory" className="block text-sm font-medium text-gray-300 mb-2">
                      Subcategoría *
                    </label>
                    <select
                      id="subCategory"
                      name="subCategory"
                      value={categories.subCategory}
                      onChange={handleInputChange}
                      required
                      disabled={!categories.parentCategory}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {categories.parentCategory ? 'Selecciona una subcategoría' : 'Primero selecciona una categoría principal'}
                      </option>
                      {availableSubCategories.length > 0 ? (
                        availableSubCategories.map((subCategory, index) => (
                          <option key={`sub-${subCategory.categoryID}-${index}`} value={subCategory.categoryID}>
                            {subCategory.name}
                          </option>
                        ))
                      ) : categories.parentCategory ? (
                        // Si no hay subcategorías, mostrar opción para usar la categoría padre
                        <option key={`parent-fallback-${categories.parentCategory}-${Date.now()}`} value={categories.parentCategory}>
                          Usar: {availableCategories.find(cat => cat.categoryID === parseInt(categories.parentCategory))?.name}
                        </option>
                      ) : null}
                    </select>
                    {fieldErrors.subCategory && <p className="text-red-500 text-xs mt-1">{fieldErrors.subCategory}</p>}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              {(currentStep === 2 || currentStep === 3) && (
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
                  {loading ? 'Creando...' : currentStep === 1 || currentStep === 2 ? (
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