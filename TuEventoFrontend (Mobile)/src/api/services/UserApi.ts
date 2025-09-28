import { USER_ENDPOINT, USER_PROFILE_ENDPOINT ,UPDATE_PHONE_ENDPOINT } from "../../constants/Endpoint";
import { IRequestRegister, IUserProfileResponse , IUserUpdatePhone } from "../types/IUser";
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
        