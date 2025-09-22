import {FORGOT_ENDPOINT, RESET_ENDPOINT_TOKEN } from "../../constants/Endpoint";
import { IRequestForgotPassword , ItokenForgotPassword, IResetPassword } from "../types/IforgotPassword";

export const forgotPasswordApi = async (data: IRequestForgotPassword) => {
    try {
        console.log(' Enviando datos a:', FORGOT_ENDPOINT);
        console.log(' Datos enviados:', data);

        const response = await fetch(`${FORGOT_ENDPOINT}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        const responseData = await response.json(); // siempre parseamos

        if (!response.ok || responseData.success === false) {
            throw new Error(responseData.message || "Error en el proceso de recuperación de contraseña");
        }

        console.log(' Respuesta exitosa:', responseData);
        return responseData;
    } catch (error) {
        console.error(' Error en forgotPasswordApi:', error);
        throw error; //  Lanzar el error en lugar de devolverlo
    }
}

//Correcion en la conexion a la API GET no puede tener body
export const validateResetTokenApi = async (data: ItokenForgotPassword) => {
    try {
        console.log(' Enviando datos a:', RESET_ENDPOINT_TOKEN);
        console.log(' Datos enviados:', data);
        const response = await fetch(`${RESET_ENDPOINT_TOKEN}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        const responseData = await response.json(); // siempre parseamos
        if (!response.ok || responseData.success === false) {
            throw new Error(responseData.message || "Error en la validación del token de restablecimiento");
        }
        console.log(' Respuesta exitosa:', responseData);
        return responseData;
    } catch (error) {
        console.error(' Error en validateResetTokenApi:', error);
        throw error; //  Lanzar el error en lugar de devolverlo
    }

}