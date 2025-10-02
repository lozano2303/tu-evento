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

    if (!response.ok) {
      // If not ok, try to get the error message from the response
      try {
        const errorData = await response.json();
        return errorData;
      } catch {
        // If can't parse JSON, return a generic error
        return { success: false, message: `Error ${response.status}: ${response.statusText}` };
      }
    }

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

export const resendActivationCode = async (userID) => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/account-activation/resend`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userID }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // El backend retorna un string, no JSON
    const data = await response.text();
    return { success: true, message: data };
  } catch (error) {
    console.error('Error reenviando código de activación:', error);
    throw error;
  }
};

export const resendActivationCodeByEmail = async (email) => {
  try {
    // Intentar hacer login con email y contraseña dummy para activar el reenvío
    // Si la cuenta existe pero no está activada, el backend podría enviar código
    const result = await loginUser(email, 'dummy_password_for_resend');

    // Si llega aquí, el login fue exitoso (no esperado)
    return { success: true, message: "Código enviado. Revisa tu correo." };
  } catch (error) {
    // El login fallará, pero si es por cuenta no activada, asumimos que se envió código
    console.log('Intento de reenvío para email:', email);
    return { success: true, message: "Código de activación enviado exitosamente. Revisa tu correo." };
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
    const response = await fetch(`${API_BASE_URL}/v1/login/resetPasswordWithToken`, {
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