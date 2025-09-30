import { USER_ENDPOINT, USER_PROFILE_ENDPOINT ,UPDATE_PHONE_ENDPOINT , GET_ALL_DEPARTMENTS_ENDPOINT , GET_CITIES_BY_DEPARTMENT_ENDPOINT , SEND_ADRESS_ENDPOINT } from "../../constants/Endpoint";
import { IRequestRegister, IUserProfileResponse , IUserUpdatePhone , IAdress } from "../types/IUser";
import { getToken } from "./Token";


export const registerUser = async (userData: IRequestRegister) => {
  try {
    console.log(' Enviando datos a:', USER_ENDPOINT);
    console.log(' Datos enviados:', userData);

    const response = await fetch(`${USER_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

  
    const responseData = await response.json(); // siempre parseamos

    if (!response.ok || responseData.success === false) {
      throw new Error(responseData.message || "Error en el registro");
    }

    console.log(' Respuesta exitosa:', responseData);
    return responseData;


  } catch (error) {
    console.error(' Error en registerUser:', error);
    throw error; //  Lanzar el error en lugar de devolverlo
  }
};

export const getUserProfile = async (userId: number): Promise<IUserProfileResponse> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }

    const response = await fetch(`${USER_PROFILE_ENDPOINT}/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const responseData = await response.json();

    if (!response.ok || responseData.success === false) {
      throw new Error(responseData.message || "Error al obtener el perfil");
    }

    console.log('Perfil obtenido:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error en getUserProfile:', error);
    throw error;
  }
};

export const updateUserPhone = async (userData: IUserUpdatePhone): Promise<IUserProfileResponse> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }
    const response = await fetch(`${UPDATE_PHONE_ENDPOINT}${userData.id}/telephone?newTelephone=${userData.newTelephone}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    const responseData = await response.json();
    if (!response.ok || responseData.success === false) {
      throw new Error(responseData.message || "Error al actualizar el teléfono");
    }
    console.log('Teléfono actualizado:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error en updateUserPhone:', error);
    throw error;
  }
};

export const updateUserBirthDate = async (userId: number, newBirthDate: string): Promise<IUserProfileResponse> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }

    // Convertir fecha a formato DateTime ISO
    const dateTimeString = newBirthDate.includes('T') 
      ? newBirthDate 
      : `${newBirthDate}T00:00:00`;

    console.log('Enviando fecha:', dateTimeString);
    console.log('URL:', `${USER_PROFILE_ENDPOINT}/${userId}/birthDate`);

    const response = await fetch(`${USER_PROFILE_ENDPOINT}/${userId}/birthdate?newBirthDate=${encodeURIComponent(dateTimeString)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    console.log('Status de respuesta:', response.status);
    
    const responseData = await response.json();
    console.log('Respuesta completa:', responseData);
    
    if (!response.ok) {
      throw new Error(responseData.message || `Error HTTP ${response.status}: No se pudo actualizar la fecha de nacimiento`);
    }

    if (responseData.success === false) {
      throw new Error(responseData.message || "La API retornó success: false");
    }

    console.log('Fecha de nacimiento actualizada exitosamente:', responseData);
    return responseData;
    
  } catch (error: any) {
    console.error('Error detallado en updateUserBirthDate:', error);
    
    // Mensaje de error más específico
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu internet.');
    }
    
    if (error.message.includes('401')) {
      throw new Error('Tu sesión ha expirado. Inicia sesión nuevamente.');
    }
    
    if (error.message.includes('400')) {
      throw new Error('Formato de fecha inválido. Intenta con otra fecha.');
    }
    
    throw new Error(error.message || 'Error desconocido al actualizar fecha');
  }
}; 

// No funciona en el backend por el momento
export const deactivateUserAccount = async (userId: number): Promise<IUserProfileResponse> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }
    const response = await fetch(`${USER_PROFILE_ENDPOINT}/${userId}/deactive`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    const responseData = await response.json();
    if (!response.ok || responseData.success === false) {
      throw new Error(responseData.message || "Error al desactivar la cuenta");
    }
    console.log('Cuenta desactivada:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error en deactivateUserAccount:', error);
    throw error;
  }
};

// Traer todos los departamentos
export const getAllDepartments = async (): Promise<any> => {
  try {
    const response = await fetch(`${GET_ALL_DEPARTMENTS_ENDPOINT}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || "Error al obtener los departamentos");
    }
    console.log('Departamentos obtenidos:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error en getAllDepartments:', error);
    throw error;
  }
};

// Traer ciudades
export const getCitiesByDepartment = async(): Promise<any> => {
  try {
    const response = await fetch(`${GET_CITIES_BY_DEPARTMENT_ENDPOINT}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || "Error al obtener las ciudades");
    }
    console.log('Ciudades obtenidas:', responseData);
    return responseData;
  }
  catch (error) {
    console.error('Error en getCitiesByDepartment:', error);
    throw error;
  }
};

