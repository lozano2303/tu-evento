import React, { useState } from "react";
import { CheckCircle, Mail, ArrowRight } from "lucide-react";
import { verifyActivationCode } from "../../services/Login.js";

export default function CodeVerification({ userID, onVerificationSuccess, onBackToLogin }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await verifyActivationCode(userID, code);
      if (result.success) {
        setShowSuccessNotification(true);
      } else {
        setError(result.message || "Código inválido");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToLogin = () => {
    setShowSuccessNotification(false);
    onVerificationSuccess();
  };

  return (
    <div className="min-h-screen flex">
      {/* Columna izquierda - Ilustración con gradiente púrpura */}
      <div className="w-1/2 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 flex items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-sm">
          <img
            src="/src/assets/images/fondologin.png"
            alt="Ilustración escritorio"
            className="w-380 h-130 mx-auto drop-shadow-2xl"
          />
        </div>
      </div>

      <div className="w-1/2 bg-gray-900 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-white mb-1">Verificar Cuenta</h1>
            <p className="text-gray-400 text-sm">Ingresa el código de activación enviado a tu correo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                placeholder="Código de activación"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-sm"
            >
              {loading ? "Verificando..." : "VERIFICAR"}
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-purple-400 hover:text-purple-300"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>

      {/* Notificación de activación exitosa */}
      {showSuccessNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform animate-pulse">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white rounded-full p-3">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">¡Cuenta Activada!</h3>
              <p className="text-green-100 text-sm">Tu cuenta ha sido verificada exitosamente</p>
            </div>

            {/* Contenido */}
            <div className="p-6 text-center">
              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-gray-700 text-sm font-medium mb-1">Verificación completada</p>
                  <p className="text-gray-500 text-xs">Ya puedes acceder a todas las funcionalidades</p>
                </div>
                
                <div className="text-gray-600 text-sm">
                  <p className="mb-2">🎉 <span className="font-medium">¡Bienvenido a TuEvento!</span></p>
                  <p className="text-xs text-gray-500">Ahora puedes iniciar sesión con tu cuenta</p>
                </div>
              </div>

              {/* Botón para continuar */}
              <button
                onClick={handleContinueToLogin}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-sm flex items-center justify-center space-x-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Continuar al Login</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}