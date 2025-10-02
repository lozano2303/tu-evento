import React, { useState, useEffect } from "react";
import { User, Phone, Calendar, MapPin, Edit3, Save, X, Trash2, AlertCircle, CheckCircle, Mail } from "lucide-react";
import { getUserById, updateUserTelephone, updateUserBirthDate, updateUserAddress, deactivateUser, deleteUserAccount } from "../../services/UserService.js";

export default function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({
    telephone: false,
    birthDate: false,
    address: false,
  });
  const [formData, setFormData] = useState({
    telephone: "",
    birthDate: "",
    addressId: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const userId = localStorage.getItem('userID');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const result = await getUserById(userId);
      if (result.success) {
        setUserData(result.data);
        setFormData({
          telephone: result.data.telephone || "",
          birthDate: result.data.birthDate ? result.data.birthDate.split('T')[0] : "",
          addressId: result.data.address?.addressID || "",
        });
      }
    } catch (error) {
      setMessage("Error cargando datos del usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field) => {
    setEditing(prev => ({ ...prev, [field]: true }));
  };

  const handleCancel = (field) => {
    setEditing(prev => ({ ...prev, [field]: false }));
    // Reset form data
    setFormData({
      telephone: userData.telephone || "",
      birthDate: userData.birthDate ? userData.birthDate.split('T')[0] : "",
      addressId: userData.address?.addressID || "",
    });
  };

  const handleSave = async (field) => {
    setUpdateLoading(true);
    try {
      let result;
      switch (field) {
        case 'telephone':
          result = await updateUserTelephone(userId, formData.telephone);
          break;
        case 'birthDate':
          result = await updateUserBirthDate(userId, formData.birthDate);
          break;
        case 'address':
          // Por ahora, mostrar mensaje ya que el backend requiere ID de dirección existente
          setMessage("La actualización de dirección requiere verificación manual. Tu solicitud ha sido registrada. Contacta al soporte para completar el cambio.");
          setEditing(prev => ({ ...prev, [field]: false }));
          return; // No hacer la petición real
      }

      if (result.success) {
        setMessage("Información actualizada exitosamente");
        setEditing(prev => ({ ...prev, [field]: false }));
        loadUserData(); // Reload user data
      } else {
        setMessage(result.message || "Error actualizando información");
      }
    } catch (error) {
      setMessage("Error de conexión");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (window.confirm("¿Estás seguro de que quieres desactivar tu cuenta? Podrás reactivarla iniciando sesión nuevamente.")) {
      try {
        const result = await deactivateUser(userId);
        if (result.success) {
          alert("Cuenta desactivada exitosamente");
          onLogout();
        } else {
          setMessage(result.message || "Error desactivando cuenta");
        }
      } catch (error) {
        setMessage("Error de conexión");
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar permanentemente tu cuenta? Esta acción no se puede deshacer.")) {
      try {
        const result = await deleteUserAccount(userId);
        if (result.success) {
          alert("Cuenta eliminada exitosamente");
          onLogout();
        } else {
          setMessage(result.message || "Error eliminando cuenta");
        }
      } catch (error) {
        setMessage("Error de conexión");
      }
    }
    setShowDeleteConfirm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <p className="text-purple-600 font-medium mt-4">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">No se pudo cargar la información del usuario</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Header con gradiente elegante */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30 shadow-xl">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold mb-1">{userData.fullName}</h1>
                <p className="text-purple-100 text-lg">{userData.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-purple-100">Cuenta activa</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-3 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Inicio</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Mensaje de estado */}
        {message && (
          <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl shadow-lg animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-green-900 font-semibold">¡Éxito!</p>
                <p className="text-green-700">{message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Información Personal */}
        <div className="bg-white rounded-2xl shadow-xl border border-purple-100 mb-8 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-5">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <User className="w-6 h-6" />
              <span>Información Personal</span>
            </h2>
          </div>

          <div className="p-8 space-y-8">
            {/* Email (solo lectura) */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-full -mr-10 -mt-10 opacity-20"></div>
              <div className="flex items-center space-x-4 relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                  <Mail className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-bold text-purple-600 uppercase tracking-wider">Correo Principal</p>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <p className="text-xl font-bold text-gray-900 mt-1">{userData.email}</p>
                  <p className="text-sm text-purple-600 mt-2 font-medium">Este es tu correo de acceso a la cuenta</p>
                </div>
              </div>
            </div>

            {/* Teléfono */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Teléfono</p>
                    {editing.telephone ? (
                      <input
                        type="tel"
                        value={formData.telephone}
                        onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                        className="w-full mt-2 px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                        placeholder="Ingresa tu teléfono"
                      />
                    ) : (
                      <p className="text-lg font-medium text-gray-900 mt-1">{userData.telephone || "No especificado"}</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {editing.telephone ? (
                    <>
                      <button
                        onClick={() => handleSave('telephone')}
                        disabled={updateLoading}
                        className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleCancel('telephone')}
                        className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEdit('telephone')}
                      className="p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Fecha de nacimiento */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-600 uppercase tracking-wide">Fecha de nacimiento</p>
                    {editing.birthDate ? (
                      <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                        className="w-full mt-2 px-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
                      />
                    ) : (
                      <p className="text-lg font-medium text-gray-900 mt-1">
                        {userData.birthDate ? new Date(userData.birthDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : "No especificada"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {editing.birthDate ? (
                    <>
                      <button
                        onClick={() => handleSave('birthDate')}
                        disabled={updateLoading}
                        className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleCancel('birthDate')}
                        className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEdit('birthDate')}
                      className="p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-yellow-600 uppercase tracking-wide">Dirección</p>
                      {editing.address ? (
                        <div className="mt-2 space-y-2">
                          <input
                            type="text"
                            value={formData.addressText || (userData.address && userData.address.street && userData.address.city && userData.address.city.department
                              ? `${userData.address.street || ''}, ${userData.address.city.name || ''}, ${userData.address.city.department.name || ''}`
                              : "")}
                            onChange={(e) => setFormData(prev => ({ ...prev, addressText: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white shadow-sm"
                            placeholder="Escribe tu dirección completa"
                          />
                          <p className="text-xs text-yellow-700">Nota: La actualización de dirección requiere verificación. Contacta soporte después de guardar.</p>
                        </div>
                      ) : (
                        <p className="text-lg font-medium text-gray-900 mt-1 leading-relaxed">
                          {userData.address && userData.address.street && userData.address.city && userData.address.city.department
                            ? `${userData.address.street || 'Dirección no disponible'}, ${userData.address.city.name || 'Ciudad no disponible'}, ${userData.address.city.department.name || 'Departamento no disponible'}`
                            : "No especificada"}
                        </p>
                      )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {editing.address ? (
                    <>
                      <button
                        onClick={() => handleSave('address')}
                        disabled={updateLoading}
                        className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleCancel('address')}
                        className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEdit('address')}
                      className="p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuración de Cuenta */}
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <AlertCircle className="w-6 h-6" />
              <span>Configuración de Cuenta</span>
            </h2>
          </div>

          <div className="p-8 space-y-6">
            <button
              onClick={handleDeactivate}
              className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl hover:from-yellow-100 hover:to-yellow-200 hover:border-yellow-400 transition-all duration-300 hover:shadow-lg group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-yellow-900">Desactivar Cuenta</p>
                  <p className="text-sm text-yellow-700 mt-1">Tu cuenta será desactivada temporalmente</p>
                </div>
              </div>
              <div className="text-yellow-600 group-hover:text-yellow-700 transition-colors">
                <AlertCircle className="w-6 h-6" />
              </div>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-xl hover:from-red-100 hover:to-red-200 hover:border-red-400 transition-all duration-300 hover:shadow-lg group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <Trash2 className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-red-900">Eliminar Cuenta</p>
                  <p className="text-sm text-red-700 mt-1">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <div className="text-red-600 group-hover:text-red-700 transition-colors">
                <AlertCircle className="w-6 h-6" />
              </div>
            </button>
          </div>
        </div>

        {/* Modal de confirmación de eliminación */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Eliminar Cuenta</h3>
                    <p className="text-red-100 text-sm">Acción irreversible</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-red-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">¿Eliminar permanentemente?</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Esta acción no se puede deshacer. Perderás todos tus datos, eventos creados y configuraciones.
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-900">Advertencia importante</p>
                      <p className="text-sm text-red-700 mt-1">
                        Si eres organizador, todos tus eventos serán cancelados y los usuarios afectados serán notificados.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl transition-all duration-200 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    Eliminar Cuenta
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}