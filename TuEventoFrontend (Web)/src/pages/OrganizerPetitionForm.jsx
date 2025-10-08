import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText } from 'lucide-react';
import { createPetition } from '../services/OrganizerPetitionService.js';

const OrganizerPetitionForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Selecciona un documento');
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Solo archivos PDF, JPG o PNG');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('El archivo no puede ser mayor a 5MB');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const userID = localStorage.getItem('userID');

      if (!token || !userID) {
        setError('Sesión expirada. Inicia sesión nuevamente.');
        navigate('/login');
        return;
      }

      console.log('Token exists:', !!token);
      console.log('UserID:', userID);
      console.log('File:', selectedFile.name, selectedFile.size, 'bytes');


      const formData = new FormData();
      formData.append('userID', parseInt(userID)); // Convertir a número
      formData.append('file', selectedFile);

      const result = await createPetition(formData);

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message || 'Error al enviar la solicitud');
      }
    } catch (err) {
      setError('Error de conexión. Verifica que el backend esté ejecutándose.');
      console.error('Error submitting petition:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Solicitud Enviada</h2>
          <p className="text-gray-300 mb-6">
            Tu solicitud ha sido enviada. El administrador la revisará pronto.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <h1 className="text-2xl font-bold">Solicitud de Organizador</h1>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
              {error}
              <button
                onClick={() => setError(null)}
                className="float-right ml-4"
              >
                ×
              </button>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Solicitud de Organizador</h2>
              <p className="text-gray-300">
                Sube un documento para ser aprobado como organizador de eventos.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Documento <span className="text-red-400">*</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-purple-500 bg-purple-500/10'
                      : selectedFile
                      ? 'border-green-500 bg-green-500/5'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {selectedFile ? (
                    <div className="space-y-2">
                      <FileText className="w-8 h-8 text-green-400 mx-auto" />
                      <p className="text-white font-medium">{selectedFile.name}</p>
                      <p className="text-gray-400 text-sm">
                        Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-green-400 text-xs">
                        Archivo válido
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="text-red-400 hover:text-red-300 text-sm underline"
                      >
                        Cambiar archivo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-white font-medium mb-2">
                          Arrastra y suelta tu documento aquí
                        </p>
                        <p className="text-gray-400 text-sm mb-4">
                          O haz clic para seleccionar un archivo
                        </p>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                        >
                          Seleccionar Archivo
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4">
                <h3 className="text-blue-300 font-medium mb-3">Documentos requeridos:</h3>
                <div className="space-y-2">
                  <div>
                    <h4 className="text-blue-200 font-medium text-sm">Obligatorio:</h4>
                    <p className="text-blue-200 text-sm">Sube tu documento root para que un administrador lo apruebe</p>
                  </div>

                  <div className="border-t border-blue-600 pt-2">
                    <p className="text-blue-200 text-sm">
                      Formato: PDF
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedFile}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-colors"
                >
                  {loading ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerPetitionForm;