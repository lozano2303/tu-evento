import React, { useState } from 'react';
import { ArrowLeft, Upload, FileText, Building, Send } from 'lucide-react';

const EventRequestForm = ({ onBack }) => {
  const [formData, setFormData] = useState({
    // Información de la empresa
    nombreEmpresa: '',
    nombreRemitente: '',
    emailRemitente: '',
    telefonoRemitente: '',
    idFiscal: '',
    direccionEmpresa: '',

    // Archivos
    archivoRUT: null,
    archivoTriptico: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);


  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileChange = (field, file) => {
    if (file && file.size > 10 * 1024 * 1024) { // 10MB límite
      setErrors(prev => ({
        ...prev,
        [field]: 'El archivo no puede ser mayor a 10MB'
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [field]: file
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones requeridas - solo campos de empresa
    const requiredFields = {
      nombreEmpresa: 'Nombre de la empresa es requerido',
      nombreRemitente: 'Nombre del remitente es requerido',
      emailRemitente: 'Email es requerido',
      telefonoRemitente: 'Teléfono es requerido',
      idFiscal: 'ID Fiscal es requerido'
    };

    Object.keys(requiredFields).forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = requiredFields[field];
      }
    });

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.emailRemitente && !emailRegex.test(formData.emailRemitente)) {
      newErrors.emailRemitente = 'Email no válido';
    }

    // Validación de archivos
    if (!formData.archivoRUT) {
      newErrors.archivoRUT = 'Archivo RUT es requerido';
    }

    if (!formData.archivoTriptico) {
      newErrors.archivoTriptico = 'Archivo de tríptico/brochure es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simular envío (aquí conectarías con tu backend)
    setTimeout(() => {
      // Aquí enviarías los datos al servidor
      console.log('Datos del formulario:', formData);
      
      setSubmitted(true);
      setIsSubmitting(false);
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Solicitud Enviada!</h2>
          <p className="text-gray-600 mb-6">
            Tu solicitud de habilitación para "{formData.nombreEmpresa}" ha sido enviada correctamente.
            Recibirás una respuesta en las próximas 24-48 horas sobre la aprobación como organizador.
          </p>
          <button
            onClick={onBack}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Volver al Diseñador
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Solicitud de Habilitación como Organizador</h1>
              <p className="text-gray-600">Completa la información de tu empresa para solicitar habilitación</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6">
        <div className="space-y-8">

          {/* Información de la Empresa */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Building className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Solicitud de Habilitación para Organizador</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Completa la información de tu empresa para solicitar habilitación como organizador de eventos.
              Una vez aprobado, podrás crear y gestionar tus propios eventos.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  value={formData.nombreEmpresa}
                  onChange={(e) => handleInputChange('nombreEmpresa', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.nombreEmpresa ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ingresa el nombre de tu empresa"
                />
                {errors.nombreEmpresa && <p className="mt-1 text-sm text-red-600">{errors.nombreEmpresa}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Fiscal *
                </label>
                <input
                  type="text"
                  value={formData.idFiscal}
                  onChange={(e) => handleInputChange('idFiscal', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.idFiscal ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="123456-7"
                />
                {errors.idFiscal && <p className="mt-1 text-sm text-red-600">{errors.idFiscal}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Remitente *
                </label>
                <input
                  type="text"
                  value={formData.nombreRemitente}
                  onChange={(e) => handleInputChange('nombreRemitente', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.nombreRemitente ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Tu nombre completo"
                />
                {errors.nombreRemitente && <p className="mt-1 text-sm text-red-600">{errors.nombreRemitente}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de Contacto *
                </label>
                <input
                  type="email"
                  value={formData.emailRemitente}
                  onChange={(e) => handleInputChange('emailRemitente', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.emailRemitente ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="correo@empresa.com"
                />
                {errors.emailRemitente && <p className="mt-1 text-sm text-red-600">{errors.emailRemitente}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono de Contacto *
                </label>
                <input
                  type="tel"
                  value={formData.telefonoRemitente}
                  onChange={(e) => handleInputChange('telefonoRemitente', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.telefonoRemitente ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+57 300 123 4567"
                />
                {errors.telefonoRemitente && <p className="mt-1 text-sm text-red-600">{errors.telefonoRemitente}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección de la Empresa
                </label>
                <input
                  type="text"
                  value={formData.direccionEmpresa}
                  onChange={(e) => handleInputChange('direccionEmpresa', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Dirección completa"
                />
              </div>
            </div>
          </div>

          {/* Documentos Requeridos */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Documentos Requeridos</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RUT de la Empresa *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-purple-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500">
                        <span>Subir archivo RUT</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange('archivoRUT', e.target.files[0])}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG hasta 10MB</p>
                    {formData.archivoRUT && (
                      <p className="text-sm text-green-600 font-medium">{formData.archivoRUT.name}</p>
                    )}
                  </div>
                </div>
                {errors.archivoRUT && <p className="mt-1 text-sm text-red-600">{errors.archivoRUT}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tríptico/Brochure de la Empresa *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-purple-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500">
                        <span>Subir tríptico</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange('archivoTriptico', e.target.files[0])}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG hasta 10MB</p>
                    {formData.archivoTriptico && (
                      <p className="text-sm text-green-600 font-medium">{formData.archivoTriptico.name}</p>
                    )}
                  </div>
                </div>
                {errors.archivoTriptico && <p className="mt-1 text-sm text-red-600">{errors.archivoTriptico}</p>}
              </div>
            </div>
          </div>

          {/* Botón de envío */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Solicitud
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EventRequestForm;