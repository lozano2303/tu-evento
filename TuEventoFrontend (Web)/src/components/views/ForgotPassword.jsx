import React, { useState } from "react";
import { forgotPassword, resetPassword } from "../../services/Login.js";
import { Eye, EyeOff } from "lucide-react";

export default function ForgotPassword({ onBackToLogin }) {
  const [step, setStep] = useState('email'); // 'email' or 'reset'
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setStep('reset');
      } else {
        setError(result.message || "Error al enviar el correo");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const errors = {};
    if (!token.trim()) {
      errors.token = "El código es obligatorio";
    }
    if (!newPassword.trim()) {
      errors.newPassword = "La nueva contraseña es obligatoria";
    } else if (newPassword.length < 8) {
      errors.newPassword = "La contraseña debe tener al menos 8 caracteres";
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(token, newPassword);
      if (result.success) {
        alert("Contraseña restablecida exitosamente");
        onBackToLogin();
      } else {
        setError(result.message || "Error al restablecer contraseña");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (step === 'reset') {
    return (
      <div className="min-h-screen flex">
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
              <h1 className="text-2xl font-bold text-white mb-1">Restablecer contraseña</h1>
              <p className="text-gray-400 text-sm">Ingresa el código recibido y tu nueva contraseña.</p>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                  placeholder="Código de recuperación"
                  required
                />
                {fieldErrors.token && <p className="text-red-500 text-xs mt-1">{fieldErrors.token}</p>}
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                  placeholder="Nueva contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {fieldErrors.newPassword && <p className="text-red-500 text-xs mt-1">{fieldErrors.newPassword}</p>}
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                  placeholder="Confirmar nueva contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-sm"
              >
                {loading ? "Restableciendo..." : "RESTABLECER"}
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
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
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
            <h1 className="text-2xl font-bold text-white mb-1">Olvidé mi contraseña</h1>
            <p className="text-gray-400 text-sm">Ingresa tu correo electrónico para recibir instrucciones.</p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                placeholder="Correo electrónico"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-sm"
            >
              {loading ? "Enviando..." : "ENVIAR"}
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
    </div>
  );
}