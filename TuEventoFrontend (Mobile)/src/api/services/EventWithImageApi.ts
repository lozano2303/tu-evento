import { GET_ALL_EVENTS_ENDPOINT, GET_EVENT_IMAGES_ENDPOINT } from '../../constants/Endpoint';
import { IEventWithImage, IGetAllEventsWithImageResponse } from '../types/IEventWithImage';

export const getAllEventsWithImage = async (): Promise<IGetAllEventsWithImageResponse> => {
  try {
    // Obtener todos los eventos
    const eventsResponse = await fetch(GET_ALL_EVENTS_ENDPOINT);
    if (!eventsResponse.ok) {
      throw new Error(`Error al obtener eventos: ${eventsResponse.status}`);
    }
    const eventsData = await eventsResponse.json();
    const events = eventsData.data || eventsData;

    // Para cada evento, obtener la imagen con order 1
    const eventsWithImage: IEventWithImage[] = await Promise.all(
      events.map(async (event: any) => {
        try {
          const imagesResponse = await fetch(`${GET_EVENT_IMAGES_ENDPOINT}/${event.id}`);
          if (!imagesResponse.ok) {
            console.warn(`No se pudieron obtener imágenes para el evento ${event.id}`);
            return {
              id: event.id,
              eventName: event.eventName,
              imageUrl: '', // Sin imagen
              description: event.description,
              startDate: event.startDate,
              finishDate: event.finishDate,
              status: event.status,
            };
          }
          const imagesData = await imagesResponse.json();
          const images = Array.isArray(imagesData) ? imagesData : [];
          const mainImage = images.find((img: any) => img.order === 1) || images[0]; // Tomar order 1 o la primera

          return {
            id: event.id,
            eventName: event.eventName,
            imageUrl: mainImage ? mainImage.url : '',
            description: event.description,
            startDate: event.startDate,
            finishDate: event.finishDate,
            status: event.status,
          };
        } catch (error) {
          console.error(`Error obteniendo imagen para evento ${event.id}:`, error);
          return {
            id: event.id,
            eventName: event.eventName,
            imageUrl: '',
            description: event.description,
            startDate: event.startDate,
            finishDate: event.finishDate,
            status: event.status,
          };
        }
      })
    );

    return {
      success: true,
      message: 'Eventos obtenidos exitosamente',
      data: eventsWithImage,
    };
  } catch (error) {
    console.error('Error en getAllEventsWithImage:', error);
    return {
      success: false,
      message: 'Error al obtener eventos con imagen',
      data: [],
    };
  }
};