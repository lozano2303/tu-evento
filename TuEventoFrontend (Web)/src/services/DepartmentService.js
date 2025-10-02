import { API_BASE_URL } from './apiconstant.js';

export const getAllDepartments = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/departments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo departamentos:', error);
    throw error;
  }
};

export const getDepartmentById = async (departmentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/departments/${departmentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo departamento:', error);
    throw error;
  }
};