const API_BASE_URL = 'http://localhost:8080/api/v1';

export const getAllCategories = async () => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers,
    });
    const data = await response.json();
    return { success: data.success, data: data.data || [], message: data.message };
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    throw error;
  }
};

export const getRootCategories = async () => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/categories/root`, {
      method: 'GET',
      headers,
    });
    const data = await response.json();
    return { success: data.success, data: data.data || [], message: data.message };
  } catch (error) {
    console.error('Error obteniendo categorías raíz:', error);
    throw error;
  }
};

export const getSubCategories = async (parentId) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/categories/sub/${parentId}`, {
      method: 'GET',
      headers,
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, data: data || [], message: 'Subcategorías encontradas' };
    } else {
      return { success: false, data: [], message: 'Error al obtener subcategorías' };
    }
  } catch (error) {
    console.error('Error obteniendo subcategorías:', error);
    return { success: false, data: [], message: error.message };
  }
};

export const assignCategoryToEvent = async (categoryId, eventId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/category-events/assign`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        categoryID: categoryId,
        eventID: eventId
      }),
    });
    const data = await response.json();
    return { success: data.success, data: data.data, message: data.message };
  } catch (error) {
    console.error('Error asignando categoría al evento:', error);
    throw error;
  }
};

export const getCategoriesByEvent = async (eventId) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/category-events/event/${eventId}`, {
      method: 'GET',
      headers,
    });
    const data = await response.json();
    return { success: data.success, data: data.data || [], message: data.message };
  } catch (error) {
    console.error('Error obteniendo categorías del evento:', error);
    throw error;
  }
};