import { useState } from 'react';
import { getAllUsers, reactivateUser } from '../../services/UserService.js';

export const useAdminUsers = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [mostrarDetalleUsuario, setMostrarDetalleUsuario] = useState(false);

  // Estados para modal de reactivar usuario
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [userToReactivate, setUserToReactivate] = useState(null);
  const [showReactivateSuccess, setShowReactivateSuccess] = useState(false);

  const loadUsers = async () => {
    try {
      setLoadingUsuarios(true);
      const result = await getAllUsers();
      if (result.success) {
        setUsuarios(result.data);
      } else {
        console.error('Error loading users:', result.message);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const handleReactivateUser = (userId) => {
    if (!userId) {
      alert('Error: ID de usuario no válido');
      console.error('UserId es undefined:', userId);
      return;
    }

    const user = usuarios.find(u => u.userID === userId);
    setUserToReactivate(user);
    setShowReactivateModal(true);
  };

  const confirmReactivateUser = async () => {
    if (!userToReactivate) return;

    try {
      console.log('Reactivando usuario con ID:', userToReactivate.userID);
      const result = await reactivateUser(userToReactivate.userID);
      console.log('Resultado de reactivación:', result);
      if (result.success) {
        // Actualizar directamente el estado del usuario en la lista local
        setUsuarios(prev => prev.map(u => {
          if (u.userID === userToReactivate.userID) {
            console.log('Actualizando usuario:', u.userID, 'estado anterior:', u.status, 'nuevo estado: true');
            return { ...u, status: true };
          }
          return u;
        }));

        setShowReactivateModal(false);
        setUserToReactivate(null);
        setShowReactivateSuccess(true);
      } else {
        console.error('Error en respuesta del backend:', result);
        throw new Error(result.message || 'Error reactivando usuario');
      }
    } catch (err) {
      console.error('Error reactivating user:', err);
      throw err;
    } finally {
      setShowReactivateModal(false);
    }
  };

  const handleReactivateSuccess = () => {
    setShowReactivateSuccess(false);
  };

  return {
    // State
    usuarios,
    loadingUsuarios,
    usuarioSeleccionado,
    mostrarDetalleUsuario,
    showReactivateModal,
    userToReactivate,
    showReactivateSuccess,

    // Setters
    setUsuarioSeleccionado,
    setMostrarDetalleUsuario,
    setShowReactivateModal,
    setUserToReactivate,

    // Methods
    loadUsers,
    handleReactivateUser,
    confirmReactivateUser,
    handleReactivateSuccess
  };
};