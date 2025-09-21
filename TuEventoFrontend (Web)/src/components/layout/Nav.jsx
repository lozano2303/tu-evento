import "../../styles/index.css";
import { Calendar, User, LogOut, Key } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUserById } from "../../services/Login.js";
import ChangePassword from "../views/ChangePassword.jsx";

export default function Navbar() {
  const [userData, setUserData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserID = localStorage.getItem('userID');
    if (token && storedUserID) {
      getUserById(storedUserID).then(result => {
        if (result.success) {
          setUserData(result.data);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('userID');
          localStorage.removeItem('role');
        }
      }).catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userID');
        localStorage.removeItem('role');
      });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isModalOpen && !event.target.closest('.user-modal')) {
        setIsModalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModalOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userID');
    localStorage.removeItem('role');
    setUserData(null);
    setIsModalOpen(false);
    window.location.reload(); // Recargar para actualizar estado
  };
  return (
    <header className="bg-gray-800 p-4">
      <nav className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 -translate-x-4">
          <Calendar className="w-8 h-8 text-purple-500" />
          <span className="text-xl font-bold text-white">Tu Evento</span> {/* Added text-white here for clarity */}
        </div>

        <div className="hidden md:flex space-x-6 text-white"> {/* Added text-white here for all links */}
          <Link to="/landingPage" className="hover:text-purple-400 transition-colors">Inicio</Link>
          <Link to="" className="hover:text-purple-400 transition-colors">Nosotros</Link>
          <Link to="/FloorPlanDesigner" className="hover:text-purple-400 transition-colors">Crear</Link>
          <Link to="/events" className="hover:text-purple-400 transition-colors">Eventos</Link>
        </div>

        <div className="flex space-x-2">
          <button className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors text-white">
            <Link to="/admin-login">Admin</Link>
          </button>
          {userData ? (
            <div className="relative">
              <button
                onClick={() => setIsModalOpen(!isModalOpen)}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors text-white flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>{userData.fullName.split(' ')[0]}</span>
              </button>
              {isModalOpen && (
                <div className="user-modal absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="p-4">
                    <div className="text-center mb-4">
                      <User className="w-12 h-12 mx-auto text-purple-400 mb-2" />
                      <h3 className="text-white font-semibold">{userData.fullName}</h3>
                      <p className="text-gray-400 text-sm">{userData.email}</p>
                      <p className="text-gray-400 text-sm">Rol: {userData.role}</p>
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setIsModalOpen(false);
                          setShowChangePasswordModal(true);
                        }}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <Key className="w-4 h-4" />
                        <span>Cambiar contraseña</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors text-white">
              <Link to="/login">Iniciar sesión</Link>
            </button>
          )}
        </div>
      </nav>

      {showChangePasswordModal && (
        <ChangePassword
          onClose={() => setShowChangePasswordModal(false)}
        />
      )}
    </header>
  );
}