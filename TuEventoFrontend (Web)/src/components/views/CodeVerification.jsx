import React, { useState } from "react";
import { verifyActivationCode } from "../../services/Login.js";

export default function CodeVerification({ userID, onVerificationSuccess, onBackToLogin }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await verifyActivationCode(userID, code);
      if (result.success) {
        alert("Cuenta activada exitosamente!");
        onVerificationSuccess();
      } else {
        setError(result.message || "Código inválido");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
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
    </div>
  );
}