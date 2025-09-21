import { API_BASE_URL } from './apiconstant.js';

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/login/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

export const registerUser = async (fullName, email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullName, email, password }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
};

export const verifyActivationCode = async (userID, activationCode) => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/account-activation/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userID, activationCode }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en verificación de código:', error);
    throw error;
  }
};

export const getUserById = async (userID) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/users/${userID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/login/forgot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en forgot password:', error);
    throw error;
  }
};

export const changePassword = async (oldPassword, newPassword) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/v1/login/changePassword`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en change password:', error);
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/login/resetPassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en reset password:', error);
    throw error;
  }
};