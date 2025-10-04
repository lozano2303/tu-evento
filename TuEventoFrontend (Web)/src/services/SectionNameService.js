import { API_BASE_URL } from './apiconstant.js';

export const getAllSectionNames = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/section-names`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo nombres de secciones:', error);
    throw error;
  }
};

export const getSectionNameById = async (sectionNameId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/section-names/${sectionNameId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo nombre de sección:', error);
    throw error;
  }
};

export const createSectionName = async (sectionNameData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/section-names`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sectionNameData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creando nombre de sección:', error);
    throw error;
  }
};

export const updateSectionName = async (sectionNameData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/section-names`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sectionNameData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error actualizando nombre de sección:', error);
    throw error;
  }
};

export const deleteSectionName = async (sectionNameId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/section-names/${sectionNameId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error eliminando nombre de sección:', error);
    throw error;
  }
};