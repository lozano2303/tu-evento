// api/services/CodeVerificationRegisterApi.ts - VERSIÓN CORREGIDA
import { VERIFICATION_ENDPOINT_REGISTER } from "../../constants/Endpoint";
import { IRequestCodeVerification } from "../types/IcodeVerificationRegister";

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
