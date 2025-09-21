import React, { useState, useEffect } from "react";
import { Calendar, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { loginUser, registerUser, getUserById } from "../../services/Login.js";
import CodeVerification from "./CodeVerification.jsx";
import ForgotPassword from "./ForgotPassword.jsx";

export default function Login() {
  const [view, setView] = useState('login');
  const [userID, setUserID] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserID = localStorage.getItem('userID');
    if (token && storedUserID) {
      // Usuario logueado, obtener datos
      getUserById(storedUserID).then(result => {
        if (result.success) {
          setUserData(result.data);
          setView('profile');
        } else {
          // Token inválido, limpiar
          localStorage.removeItem('token');
          localStorage.removeItem('userID');
          localStorage.removeItem('role');
        }
      }).catch(() => {
        // Error, limpiar
        localStorage.removeItem('token');
        localStorage.removeItem('userID');
        localStorage.removeItem('role');
      });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Limpiar error del campo al cambiar
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: "",
      });
    }
  };

  const validateEmail = (email) => {
    if (!email || email.trim() === "") {
      return "El correo electrónico es obligatorio";
    }
    const trimmedEmail = email.trim();
    if (trimmedEmail.length > 100) {
      return "El correo electrónico no puede tener más de 100 caracteres";
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(trimmedEmail)) {
      return "El formato del correo electrónico no es válido";
    }
    const domain = trimmedEmail.substring(trimmedEmail.indexOf('@') + 1).toLowerCase();
    if (domain !== "gmail.com") {
      return "Solo tenemos soporte para correos de Gmail";
    }
    return "";
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

  const validateName = (name) => {
    if (!name || name.trim() === "") {
      return "El nombre completo es obligatorio";
    }
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return "El nombre completo debe tener al menos 2 caracteres";
    }
    if (trimmedName.length > 70) {
      return "El nombre completo no puede tener más de 70 caracteres";
    }
    if (!trimmedName.match(/^[a-zA-ZÀ-ÿ\s'-]+$/)) {
      return "El nombre completo solo puede contener letras, espacios y caracteres de acento";
    }
    const nameParts = trimmedName.split(/\s+/);
    if (nameParts.length < 2) {
      return "Por favor ingresa nombre y apellido";
    }
    return "";
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword || confirmPassword.trim() === "") {
      return "Confirmar contraseña es obligatorio";
    }
    if (confirmPassword !== password) {
      return "Las contraseñas no coinciden";
    }
    return "";
  };

  const handleVerificationSuccess = () => {
    setView('login');
    alert("Cuenta activada. Ahora puedes iniciar sesión.");
  };

  const handleBackToLogin = () => {
    setView('login');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userID');
    localStorage.removeItem('role');
    setUserData(null);
    setView('login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    const errors = {};

    // Validaciones comunes
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    if (view !== 'login') {
      const nameError = validateName(formData.name);
      if (nameError) errors.name = nameError;

      const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);
      if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      if (view === 'login') {
        const result = await loginUser(formData.email, formData.password);
        if (result.success) {
          // Guardar datos en localStorage
          localStorage.setItem('token', result.data.token);
          localStorage.setItem('userID', result.data.userID);
          localStorage.setItem('role', result.data.role);
          alert("¡Inicio de sesión exitoso!");
          // Redirigir a landing page
          window.location.href = '/';
        } else {
          setError(result.message || "Error en login");
        }
      } else {
        const result = await registerUser(formData.name, formData.email, formData.password);
        if (result.success) {
          alert("¡Registro exitoso! Revisa tu correo para el código de activación.");
          setUserID(result.data); // Asumiendo que result.data es el userID
          setView('verification');
        } else {
          setError(result.message || "Error en registro");
        }
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (view === 'verification') {
    return (
      <CodeVerification
        userID={userID}
        onVerificationSuccess={handleVerificationSuccess}
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  if (view === 'forgot') {
    return (
      <ForgotPassword
        onBackToLogin={() => setView('login')}
      />
    );
  }

  if (view === 'profile' && userData) {
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
              <h1 className="text-2xl font-bold text-white mb-1">Perfil de Usuario</h1>
              <p className="text-gray-400 text-sm">Bienvenido de vuelta</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Nombre completo</label>
                <p className="text-white bg-gray-800 rounded-lg px-4 py-3">{userData.fullName}</p>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Correo electrónico</label>
                <p className="text-white bg-gray-800 rounded-lg px-4 py-3">{userData.email || 'No disponible'}</p>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Rol</label>
                <p className="text-white bg-gray-800 rounded-lg px-4 py-3">{userData.role}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-sm"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

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
             <h1 className="text-2xl font-bold text-white mb-1">{view === 'login' ? "Iniciar Sesión" : "Registrarse"}</h1>
             <p className="text-gray-400 text-sm">Ingresa tus datos personales</p>
           </div>

          {/* Tabs */}
          <div className="space-y-1">
            <p className="text-gray-400 text-sm">Ingresa tu contraseña</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {view !== 'login' && (
              <>
                {/* Name */}
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                    placeholder="Nombre completo"
                    required
                  />
                  {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
                </div>
              </>
            )}
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
              {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
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
              {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
            </div>

            {view !== 'login' && (
              <>
                {/* Confirmar Contraseña */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                    placeholder="Confirmar contraseña"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
                </div>
              </>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Botón de iniciar/registrar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-sm"
            >
              {loading ? "Cargando..." : (view === 'login' ? "INICIAR" : "REGISTRAR")}
            </button>

            {/* Texto de contraseña olvidada */}
            <div className="text-center">
              <p className="text-gray-500 text-xs">¿No recuerdas tu contraseña?
                <button
                  type="button"
                  onClick={() => setView('forgot')}
                  className="text-purple-400 hover:text-purple-300 ml-1"
                >
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
                {view === 'login' ? "¿No tienes una cuenta aun?" : "¿Ya tienes una cuenta?"}
                <button
                  type="button"
                  onClick={() => setView(view === 'login' ? 'register' : 'login')}
                  className="text-purple-400 hover:text-purple-300 ml-1"
                >
                  {view === 'login' ? "Haz clic aquí" : "Inicia sesión"}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}