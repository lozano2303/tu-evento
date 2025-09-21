import React, { useState } from "react";
import { changePassword } from "../../services/Login.js";
import { Eye, EyeOff } from "lucide-react";

export default function ChangePassword({ onClose }) {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: "",
      });
    }
  };

  const validatePassword = (password) => {
    if (!password || password.trim() === "") {
      return "La contraseña es obligatoria";
    }
    if (password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres";
    }
    if (password.length > 100) {
      return "La contraseña no puede tener más de 100 caracteres";
    }
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordPattern.test(password)) {
      return "La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial (@$!%*?&)";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const errors = {};

    const oldError = validatePassword(formData.oldPassword);
    if (oldError) errors.oldPassword = oldError;

    const newError = validatePassword(formData.newPassword);
    if (newError) errors.newPassword = newError;

    if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (formData.oldPassword === formData.newPassword) {
      errors.newPassword = "La nueva contraseña no puede ser igual a la anterior";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword(formData.oldPassword, formData.newPassword);
      if (result.success) {
        alert("Contraseña cambiada exitosamente");
        onClose();
      } else {
        setError(result.message || "Error al cambiar contraseña");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Cambiar Contraseña</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
              placeholder="Contraseña actual"
              required
            />
            {fieldErrors.oldPassword && <p className="text-red-500 text-xs mt-1">{fieldErrors.oldPassword}</p>}
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
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
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
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

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? "Cambiando..." : "Cambiar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}