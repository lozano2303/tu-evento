import { USER_ENDPOINT } from "../../constants/Endpoint"; 
import { IRequestRegister } from "../types/IUser";
//import axios from "axios";

export const registerUser = async (userData: IRequestRegister) => {
  try {
    console.log('🚀 Enviando datos a:', USER_ENDPOINT);
    console.log('📤 Datos enviados:', userData);

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

    console.log('📥 Respuesta exitosa:', responseData);
    return responseData;


  } catch (error) {
    console.error('❌ Error en registerUser:', error);
    throw error; // ✅ Lanzar el error en lugar de devolverlo
  }
};