import { USER_ENDPOINT, USER_PROFILE_ENDPOINT ,UPDATE_PHONE_ENDPOINT , GET_ALL_DEPARTMENTS_ENDPOINT , GET_CITIES_BY_DEPARTMENT_ENDPOINT , SEND_ADRESS_ENDPOINT, EVENT_RATING_ENDPOINT } from "../../constants/Endpoint";
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

    // Asegurar que address sea number
    if (responseData.data && responseData.data.address) {
      responseData.data.address = parseInt(responseData.data.address, 10) || null;
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

export const createAddress = async (addressData: { cityID: number; street: string; postalCode: string }): Promise<any> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }
    const response = await fetch(`${SEND_ADRESS_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(addressData),
    });
    const responseData = await response.json();
    if (!response.ok || responseData.success === false) {
      throw new Error(responseData.message || "Error al crear la dirección");
    }
    console.log('Dirección creada:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error en createAddress:', error);
    throw error;
  }
};

export const updateUserAddress = async (userId: number, newAddressId: number): Promise<IUserProfileResponse> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }
    const response = await fetch(`${USER_PROFILE_ENDPOINT}/${userId}/address?newAddressId=${newAddressId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    const responseData = await response.json();
    if (!response.ok || responseData.success === false) {
      throw new Error(responseData.message || "Error al actualizar la dirección");
    }
    console.log('Dirección actualizada:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error en updateUserAddress:', error);
    throw error;
  }
};

export const getAddressById = async (addressId: number): Promise<any> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }
    const response = await fetch(`${SEND_ADRESS_ENDPOINT}/${addressId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    const responseData = await response.json();
    if (!response.ok || responseData.success === false) {
      throw new Error(responseData.message || "Error al obtener la dirección");
    }
    console.log('Dirección obtenida:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error en getAddressById:', error);
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


export const deactivateUserAccount = async (userId: number): Promise<IUserProfileResponse> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }
    const response = await fetch(`${USER_PROFILE_ENDPOINT}/${userId}/deactivate`, {
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
    // Mapear para incluir id
    if (responseData.data) {
      responseData.data = responseData.data.map((dept: any) => ({
        id: dept.departmentID ?? 0,
        name: dept.name
      }));
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
    // Mapear para incluir id
    if (responseData.data) {
      responseData.data = responseData.data.map((city: any) => ({
        id: city.cityID ?? 0,
        departmentID: city.departmentID,
        name: city.name
      }));
    }
    console.log('Ciudades obtenidas:', responseData);
    return responseData;
  }
  catch (error) {
    console.error('Error en getCitiesByDepartment:', error);
    throw error;
  }
};

// Traer ciudades por departamento
export const getCitiesByDepartmentId = async (departmentId: number): Promise<any> => {
  console.log('Iniciando consulta de ciudades para departamento:', departmentId);
  try {
    const url = `${GET_CITIES_BY_DEPARTMENT_ENDPOINT}/department/${departmentId}`;
    console.log('URL de consulta:', url);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log('Respuesta del servidor:', response.status, response.statusText);
    const responseData = await response.json();
    console.log('Datos de respuesta:', responseData);
    if (!response.ok) {
      throw new Error(responseData.message || "Error al obtener las ciudades");
    }
    // Mapear para incluir id
    if (responseData.data) {
      responseData.data = responseData.data.map((city: any) => ({
        id: city.cityID,
        departmentID: city.departmentID,
        name: city.name
      }));
      console.log('Ciudades mapeadas:', responseData.data.length);
    }
    console.log('Ciudades obtenidas por departamento:', responseData);
    return responseData;
  }
  catch (error) {
    console.error('Error en getCitiesByDepartmentId:', error);
    throw error;
  }
};

// Event Ratings
export const getEventRatingsByEvent = async (eventId: number): Promise<any> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }
    const response = await fetch(`${EVENT_RATING_ENDPOINT}/getByEvent/${eventId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    const responseData = await response.json();
    if (!response.ok || responseData.success === false) {
      throw new Error(responseData.message || "Error al obtener las calificaciones");
    }
    console.log('Calificaciones obtenidas:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error en getEventRatingsByEvent:', error);
    throw error;
  }
};

export const insertEventRating = async (userId: number, eventId: number, ratingData: { rating: number; comment: string }): Promise<any> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }
    const response = await fetch(`${EVENT_RATING_ENDPOINT}/insert/${userId}/${eventId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(ratingData),
    });
    const responseData = await response.json();
    if (!response.ok || responseData.success === false) {
      throw new Error(responseData.message || "Error al insertar la calificación");
    }
    console.log('Calificación insertada:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error en insertEventRating:', error);
    throw error;
  }
};

export const updateEventRating = async (ratingData: { ratingID: number; rating: number; comment: string }): Promise<any> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }
    const response = await fetch(`${EVENT_RATING_ENDPOINT}/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(ratingData),
    });
    const responseData = await response.json();
    if (!response.ok || responseData.success === false) {
      throw new Error(responseData.message || "Error al actualizar la calificación");
    }
    console.log('Calificación actualizada:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error en updateEventRating:', error);
    throw error;
  }
};

export const deleteEventRating = async (ratingID: number): Promise<any> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }
    const response = await fetch(`${EVENT_RATING_ENDPOINT}/delete?id=${ratingID}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    const responseData = await response.json();
    if (!response.ok || responseData.success === false) {
      throw new Error(responseData.message || "Error al eliminar la calificación");
    }
    console.log('Calificación eliminada:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error en deleteEventRating:', error);
    throw error;
  }
};

