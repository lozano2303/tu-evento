const API_BASE_URL = 'http://localhost:8080/api/v1';

export const uploadEventImage = async (eventId, file, order) => {
  try {
    const formData = new FormData();
    formData.append('eventId', eventId);
    formData.append('file', file);
    formData.append('order', order);

    const response = await fetch(`${API_BASE_URL}/event-img`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Error uploading event image:', error);
    return {
      success: false,
      message: error.message || 'Error al subir la imagen',
    };
  }
};

export const getEventImages = async (eventId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/event-img/${eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Error getting event images:', error);
    return {
      success: false,
      message: error.message || 'Error al obtener las imágenes',
    };
  }
};

export const deleteEventImage = async (eventImgId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/event-img/${eventImgId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return {
      success: true,
      message: 'Imagen eliminada correctamente',
    };
  } catch (error) {
    console.error('Error deleting event image:', error);
    return {
      success: false,
      message: error.message || 'Error al eliminar la imagen',
    };
  }
};