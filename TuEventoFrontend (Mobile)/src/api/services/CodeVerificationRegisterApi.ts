// api/services/CodeVerificationRegisterApi.ts - VERSIÓN CORREGIDA
import { VERIFICATION_ENDPOINT_REGISTER, RESEND_ENDPOINT } from "../../constants/Endpoint";
import { IRequestCodeVerification, IRequestResendCode } from "../types/IcodeVerificationRegister";

export const codeVerificationRegister = async (codeData: IRequestCodeVerification) => {
  try {
    console.log(" Enviando datos a:", VERIFICATION_ENDPOINT_REGISTER);
    console.log(" Datos enviados:", codeData);

    const response = await fetch(`${VERIFICATION_ENDPOINT_REGISTER}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(codeData),
    });

    // Verificar si la respuesta es OK
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`❌ Error HTTP ${response.status}: ${errorText}`);
    }

    // Aquí ya obtenemos el JSON directamente
    const responseData = await response.json();
    console.log(" Verificación exitosa:", responseData);

    return responseData;
  } catch (error) {
    console.error(" Error en codeVerificationRegister:", error);
    throw error;
  }
};

export const resendCode = async (resendData: IRequestResendCode) => {
  try {
    console.log(" Enviando datos a:", RESEND_ENDPOINT);
    console.log(" Datos enviados:", resendData);

    const response = await fetch(`${RESEND_ENDPOINT}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendData),
    });

    // Obtener el texto de la respuesta
    const responseData = await response.text();
    console.log(" Respuesta del reenvío:", responseData);

    // Verificar si la respuesta es OK
    if (!response.ok) {
      throw new Error(`❌ Error HTTP ${response.status}: ${responseData}`);
    }

    // Intentar parsear como JSON, si no, devolver como texto
    try {
      const jsonData = JSON.parse(responseData);
      return jsonData;
    } catch {
      return { success: true, message: responseData };
    }
  } catch (error) {
    console.error(" Error en resendCode:", error);
    throw error;
  }
};
