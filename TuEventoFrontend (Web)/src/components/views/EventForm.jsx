import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, MapPin } from 'lucide-react';
import { createEvent } from '../../services/EventService.js';
import { getAllLocations } from '../../services/LocationService.js';
import { getAllCities } from '../../services/CityService.js';
import { getDepartmentById } from '../../services/DepartmentService.js';

const EventForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    startDate: '',
    finishDate: '',
    cityID: '',
    locationID: '',
  });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Frontend validations
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
        setSuccess(true);
        setCreatedEvent(result.data);
      } else {
        setError(result.message || 'Error al crear el evento');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error creating event:', err);
    } finally {
      setLoading(false);
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
            <h2 className="text-2xl font-bold text-green-400 mb-4">¡Evento Creado!</h2>
            <p className="text-gray-300 mb-6">
              El evento "{createdEvent.eventName}" ha sido creado exitosamente.
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
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            {error && (
              <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

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

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Creando...' : 'Crear Evento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventForm;