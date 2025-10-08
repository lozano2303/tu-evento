import { useState, useCallback } from 'react';
import { insertEventRating, getEventRatingByEvent, deleteEventRating, updateEventRating } from '../../services/EventRatingService.js';
import { getUserById } from '../../services/UserService.js';

export const useComments = (eventId, checkSession) => {
  const [rating, setRating] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [eventRatings, setEventRatings] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(5);
  const [userInfo, setUserInfo] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [deletingRating, setDeletingRating] = useState(null);
  const [editingRating, setEditingRating] = useState(null);
  const [editRatingValue, setEditRatingValue] = useState(5);
  const [editCommentValue, setEditCommentValue] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteRatingId, setDeleteRatingId] = useState(null);

  const loadUserInfo = async (userIds) => {
    if (!userIds || userIds.length === 0) return;

    try {
      setLoadingUsers(true);
      const userPromises = userIds.map(userId => getUserById(userId));
      const userResults = await Promise.allSettled(userPromises);

      const newUserInfo = {};
      userResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          const userId = userIds[index];
          newUserInfo[userId] = result.value.data;
        }
      });

      setUserInfo(prev => ({ ...prev, ...newUserInfo }));
    } catch (error) {
      console.error('Error loading user info:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadEventRatings = async () => {
    if (!eventId) return;

    try {
      setLoadingRatings(true);
      const result = await getEventRatingByEvent(eventId);
      if (result.success) {
        const ratings = result.data || [];
        setEventRatings(ratings);

        // Extraer IDs únicos de usuarios y cargar su información
        const userIds = [...new Set(ratings.map(rating => rating.userId))];
        await loadUserInfo(userIds);
      } else {
        setEventRatings([]);
      }
    } catch (error) {
      console.error('Error loading event ratings:', error);
      setEventRatings([]);
    } finally {
      setLoadingRatings(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!rating || !mensaje.trim()) {
      alert('Por favor, selecciona una calificación y escribe un comentario.');
      return;
    }
    if (!checkSession()) return;

    setSubmittingRating(true);
    try {
      const userId = localStorage.getItem("userID");

      const result = await insertEventRating(
        parseInt(userId),
        parseInt(eventId),
        {
          rating: rating,
          comment: mensaje.trim()
        }
      );

      if (result.success) {
        setMensaje('');
        setRating(0);
        loadEventRatings();
        setSuccessMessage('¡Comentario enviado!\nTu comentario ha sido publicado exitosamente.');
        setShowSuccessModal(true);
      } else {
        alert(result.message || 'Error al enviar el comentario.');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Error al enviar el comentario.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleEditRating = (rating) => {
    setEditingRating(rating);
    setEditRatingValue(rating.rating);
    setEditCommentValue(rating.comment);
    setShowEditModal(true);
  };

  const handleSaveEditRating = async () => {
    if (!editingRating) return;

    try {
      const result = await updateEventRating({
        ratingID: editingRating.ratingID,
        rating: editRatingValue,
        comment: editCommentValue,
      });

      if (result.success) {
        setShowEditModal(false);
        setEditingRating(null);
        loadEventRatings();
        setSuccessMessage('¡Comentario actualizado!\nTu comentario ha sido actualizado exitosamente.');
        setShowSuccessModal(true);
      } else {
        alert(result.message || 'Error al actualizar el comentario.');
      }
    } catch (error) {
      console.error('Error updating rating:', error);
      alert('Error al actualizar el comentario.');
    }
  };

  const handleDeleteRating = (ratingId, userId) => {
    if (!checkSession()) return;
    setDeleteRatingId(ratingId);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteRating = async () => {
    if (!deleteRatingId) return;

    setShowDeleteConfirmModal(false);
    setDeletingRating(deleteRatingId);
    try {
      const result = await deleteEventRating(deleteRatingId);
      if (result.success) {
        loadEventRatings();
        setSuccessMessage('¡Comentario eliminado!\nTu comentario ha sido eliminado exitosamente.');
        setShowSuccessModal(true);
      } else {
        alert(result.message || 'Error al eliminar el comentario.');
      }
    } catch (error) {
      console.error('Error deleting rating:', error);
      alert('Error al eliminar el comentario.');
    } finally {
      setDeletingRating(null);
      setDeleteRatingId(null);
    }
  };

  const handleShowMoreComments = () => {
    setVisibleCommentsCount(prev => Math.min(prev + 5, eventRatings.length));
  };

  const handleShowLessComments = () => {
    setVisibleCommentsCount(5);
  };

  const handleStarClick = (starNumber) => {
    setRating(starNumber);
  };

  return {
    // State
    rating,
    mensaje,
    eventRatings,
    loadingRatings,
    submittingRating,
    visibleCommentsCount,
    userInfo,
    deletingRating,
    editingRating,
    editRatingValue,
    editCommentValue,
    showEditModal,
    showSuccessModal,
    successMessage,
    showDeleteConfirmModal,
    deleteRatingId,

    // Setters
    setMensaje,
    setEditRatingValue,
    setEditCommentValue,
    setShowEditModal,
    setShowSuccessModal,
    setShowDeleteConfirmModal,
    setDeleteRatingId,
    setEditingRating,

    // Methods
    loadEventRatings,
    handleSubmitRating,
    handleEditRating,
    handleSaveEditRating,
    handleDeleteRating,
    confirmDeleteRating,
    handleShowMoreComments,
    handleShowLessComments,
    handleStarClick
  };
};