import { GET_ALL_EVENTS_ENDPOINT } from "../../constants/Endpoint";
import { IGetAllEventsResponse } from "../types/IEvent";
import { getToken } from "./Token";

export const getAllEvents = async (): Promise<IGetAllEventsResponse> => {
  try {
    const token = await getToken();
    console.log('Token obtenido:', token ? 'Presente' : 'No encontrado');
    if (!token) {
      throw new Error("No token found");
    }

    console.log('Haciendo petición a:', GET_ALL_EVENTS_ENDPOINT);
    const response = await fetch(GET_ALL_EVENTS_ENDPOINT, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Respuesta status:', response.status);
    const data: IGetAllEventsResponse = await response.json();
    console.log('Datos recibidos:', data);

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Error obteniendo eventos");
    }

    return data;
  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    throw error;
  }
};