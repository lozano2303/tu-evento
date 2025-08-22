import React, { useState } from "react";
import { Calendar, Eye, EyeOff, Mail, Lock, User } from "lucide-react";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      console.log("Iniciando sesión:", {
        email: formData.email,
        password: formData.password,
      });
      alert("¡Inicio de sesión exitoso!");
    } else {
      if (formData.password !== formData.confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
      }
      console.log("Registrando usuario:", formData);
      alert("¡Registro exitoso!");
    }
  };

  return (
   <div className="min-h-screen flex">
  {/* Columna izquierda - Ilustración con gradiente púrpura */}
  <div className="w-1/2 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 flex items-center justify-center p-8">
    <div className="text-center space-y-6 max-w-sm">
      {/* Ilustración en vez de divs */}
      <img 
        src="/src/assets/images/fondologin.png" 
        alt="Ilustración escritorio" 
        className="w-380 h-130 mx-auto drop-shadow-2xl"
      />
    </div>
  </div>

  
      <div className="w-1/2 bg-gray-900 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-white mb-1">Iniciar Sesión</h1>
            <p className="text-gray-400 text-sm">Ingresa tus datos personales</p>
          </div>

          {/* Tabs */}
          <div className="space-y-1">
            <p className="text-gray-400 text-sm">Ingresa tu contraseña</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                placeholder="Correo electronico"
                required
              />
            </div>

            {/* Contraseña */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                placeholder="Contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Botón de iniciar */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-sm"
            >
              INICIAR
            </button>

            {/* Texto de contraseña olvidada */}
            <div className="text-center">
              <p className="text-gray-500 text-xs">¿No recuerdas tu contraseña? 
                <button type="button" className="text-purple-400 hover:text-purple-300 ml-1">
                  Ponla aquí
                </button>
              </p>
            </div>

            {/* Texto adicional */}
            <div className="text-center">
              <p className="text-gray-500 text-xs">Tambien puedes iniciar:</p>
            </div>

            {/* Botones de redes sociales */}
            <div className="flex justify-center space-x-3">
      {/* Google */}
            <button
              type="button"
              className="w-10 h-10 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors flex items-center justify-center"
            >
              <img src="/src/assets/images/gogle.png" alt="Google" className="w-5 h-5" />
            </button>

            {/* Twitter/X */}
            <button
              type="button"
              className="w-10 h-10 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors flex items-center justify-center"
            >
              <img src="/src/assets/images/x.png" alt="Twitter/X" className="w-5 h-5" />
            </button>

            {/* Facebook */}
            <button
              type="button"
              className="w-10 h-10 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors flex items-center justify-center"
            >
              <img src="/src/assets/images/facebok.png" alt="Facebook" className="w-5 h-5" />
            </button>
          </div>

            {/* Texto final */}
            <div className="text-center pt-2">
              <p className="text-gray-500 text-xs">
                ¿No tienes una cuenta aun? 
                <button 
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-purple-400 hover:text-purple-300 ml-1"
                >
                  Haz clic aquí
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}