import {FORGOT_ENDPOINT } from "../../constants/Endpoint";
import { IRequestForgotPassword } from "../types/IforgotPassword";

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