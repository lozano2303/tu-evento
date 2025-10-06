import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getUserById } from '../../services/Login.js';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUserID = localStorage.getItem('userID');

        if (!token || !storedUserID) {
          setLoading(false);
          return;
        }

        const result = await getUserById(storedUserID);
        if (result.success) {
          const user = result.data;
          setUserData(user);

          // Verificar autorización
          if (requiredRole === 'ADMIN') {
            // Permitir si es ADMIN o el email específico
            const isAdmin = user.role === 'ADMIN' || user.email === 'atuevento72@gmail.com';
            setIsAuthorized(isAdmin);
          } else if (requiredRole === 'ORGANIZER') {
            // Para organizadores: debe ser organizador aprobado
            setIsAuthorized(user.organizer === true);
          } else {
            // Si no se requiere rol específico, solo verificar que esté autenticado
            setIsAuthorized(true);
          }
        } else {
          // Limpiar datos de autenticación inválidos
          localStorage.removeItem('token');
          localStorage.removeItem('userID');
          localStorage.removeItem('role');
          localStorage.removeItem('pendingActivationUserID');
          localStorage.removeItem('adminLoggedIn');
        }
      } catch (error) {
        console.error('Error checking authorization:', error);
        // Limpiar datos de autenticación en caso de error
        localStorage.removeItem('token');
        localStorage.removeItem('userID');
        localStorage.removeItem('role');
        localStorage.removeItem('pendingActivationUserID');
        localStorage.removeItem('adminLoggedIn');
      } finally {
        setLoading(false);
      }
    };

    checkAuthorization();
  }, [requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <p className="text-purple-400 font-medium mt-4">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full text-center p-8 border border-red-500">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Acceso Denegado</h2>
          <p className="text-gray-300 mb-6">
            {requiredRole === 'ADMIN'
              ? 'No tienes permisos de administrador para acceder a esta sección.'
              : 'No tienes permisos para acceder a esta sección.'
            }
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Ir al Inicio
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;