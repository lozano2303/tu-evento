import React, { useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import EventHero from '../components/event-info/EventHero.jsx';
import EventDetailsCard from '../components/event-info/EventDetailsCard.jsx';
import CommentsSection from '../components/event-info/CommentsSection.jsx';
import EditRatingModal from '../components/event-info/modals/EditRatingModal.jsx';
import DeleteConfirmModal from '../components/event-info/modals/DeleteConfirmModal.jsx';
import SuccessModal from '../components/event-info/modals/SuccessModal.jsx';
import PurchaseModal from '../components/event-info/modals/PurchaseModal.jsx';
import MapModal from '../components/event-info/modals/MapModal.jsx';
import { useEventData } from '../hooks/event-info/useEventData.js';
import { useImageCarousel } from '../hooks/event-info/useImageCarousel.js';
import { useComments } from '../hooks/event-info/useComments.js';
import { useSeatsManagement } from '../hooks/event-info/useSeatsManagement.js';

const ReservaEvento = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const eventId = searchParams.get('id');

  // Custom hooks
  const { event, loading, error, eventImages, loadingImages, eventCategories, tickets, loadingTickets } = useEventData(eventId);
  const { currentImageIndex, autoplay, nextImage, prevImage, goToImage } = useImageCarousel(eventImages);

  const checkSession = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      navigate('/login');
      return false;
    }
    return true;
  }, [navigate]);

  const {
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
    setMensaje,
    setEditRatingValue,
    setEditCommentValue,
    setShowEditModal,
    setShowSuccessModal,
    setShowDeleteConfirmModal,
    setDeleteRatingId,
    setEditingRating,
    loadEventRatings,
    handleSubmitRating,
    handleEditRating,
    handleSaveEditRating,
    handleDeleteRating,
    confirmDeleteRating,
    handleShowMoreComments,
    handleShowLessComments,
    handleStarClick
  } = useComments(eventId, checkSession);

  const {
    MAX_SEATS_PER_PURCHASE,
    DEFAULT_SEAT_PRICE,
    layoutElements,
    layoutId,
    loadingLayout,
    selectedSeats,
    reservingSeats,
    sections,
    seats,
    selectedSection,
    showPurchaseModal,
    zoom,
    offset,
    modalError,
    modalLoading,
    lastUpdate,
    showMapModal,
    selectedSeatDetails,
    selectedSeatCount,
    totalPrice,
    setSelectedSection,
    setShowPurchaseModal,
    setZoom,
    setOffset,
    setShowMapModal,
    setLastUpdate,
    setModalLoading,
    loadSections,
    loadSeatsForSection,
    handleSeatSelect,
    handleSeatPositionSelect,
    handlePurchaseSeats,
    handleShowMap,
    loadEventLayout
  } = useSeatsManagement(eventId, checkSession);

  if (loading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
        <p>Cargando evento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
        <p>Evento no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#1a1a1a' }}>

      <EventHero
        event={event}
        eventImages={eventImages}
        loadingImages={loadingImages}
        currentImageIndex={currentImageIndex}
        nextImage={nextImage}
        prevImage={prevImage}
        goToImage={goToImage}
        autoplay={autoplay}
      />

      {/* Contenido principal */}
      <div className="px-4">
        <div className="max-w-7xl mx-auto">

          <EventDetailsCard
            event={event}
            eventCategories={eventCategories}
            tickets={tickets}
            loadingTickets={loadingTickets}
            checkSession={checkSession}
            handleShowMap={handleShowMap}
          />

          <CommentsSection
            rating={rating}
            mensaje={mensaje}
            setMensaje={setMensaje}
            handleSubmitRating={handleSubmitRating}
            submittingRating={submittingRating}
            handleStarClick={handleStarClick}
            eventRatings={eventRatings}
            loadingRatings={loadingRatings}
            userInfo={userInfo}
            handleEditRating={handleEditRating}
            handleDeleteRating={handleDeleteRating}
            deletingRating={deletingRating}
            visibleCommentsCount={visibleCommentsCount}
            handleShowMoreComments={handleShowMoreComments}
            handleShowLessComments={handleShowLessComments}
            navigate={navigate}
          />

          {/* Footer de la página */}
          <div className="text-center py-8">
          </div>

        </div>
      </div>

      <EditRatingModal
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        editingRating={editingRating}
        setEditingRating={setEditingRating}
        editRatingValue={editRatingValue}
        setEditRatingValue={setEditRatingValue}
        editCommentValue={editCommentValue}
        setEditCommentValue={setEditCommentValue}
        handleSaveEditRating={handleSaveEditRating}
      />

      <DeleteConfirmModal
        showDeleteConfirmModal={showDeleteConfirmModal}
        setShowDeleteConfirmModal={setShowDeleteConfirmModal}
        setDeleteRatingId={setDeleteRatingId}
        confirmDeleteRating={confirmDeleteRating}
      />

      <SuccessModal
        showSuccessModal={showSuccessModal}
        setShowSuccessModal={setShowSuccessModal}
        successMessage={successMessage}
      />

      <PurchaseModal
        showPurchaseModal={showPurchaseModal}
        setShowPurchaseModal={setShowPurchaseModal}
        selectedSeatCount={selectedSeatCount}
        totalPrice={totalPrice}
        selectedSeatDetails={selectedSeatDetails}
        handlePurchaseSeats={handlePurchaseSeats}
        reservingSeats={reservingSeats}
      />

      <MapModal
        showMapModal={showMapModal}
        setShowMapModal={setShowMapModal}
        event={event}
        modalLoading={modalLoading}
        setModalLoading={setModalLoading}
        modalError={modalError}
        sections={sections}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        selectedSeats={selectedSeats}
        selectedSeatCount={selectedSeatCount}
        MAX_SEATS_PER_PURCHASE={MAX_SEATS_PER_PURCHASE}
        totalPrice={totalPrice}
        selectedSeatDetails={selectedSeatDetails}
        seats={seats}
        layoutElements={layoutElements}
        zoom={zoom}
        setZoom={setZoom}
        offset={offset}
        setOffset={setOffset}
        handleSeatSelect={handleSeatSelect}
        handleSeatPositionSelect={handleSeatPositionSelect}
        lastUpdate={lastUpdate}
        setLastUpdate={setLastUpdate}
        loadSeatsForSection={loadSeatsForSection}
        setShowPurchaseModal={setShowPurchaseModal}
        DEFAULT_SEAT_PRICE={DEFAULT_SEAT_PRICE}
      />

    </div>
  );
};

export default ReservaEvento;
