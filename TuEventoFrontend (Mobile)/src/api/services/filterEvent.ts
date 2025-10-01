import { FILTER_EVENTS_ENDPOINT, GET_EVENT_IMAGES_ENDPOINT } from "../../constants/Endpoint";
import { getToken } from "./Token";
import { IGetAllEventsResponse } from "../types/IEvent";
import { IEventWithImage, IGetAllEventsWithImageResponse } from "../types/IEventWithImage";

interface FilterEventParams {
  name?: string;
  date?: string; // formato 'YYYY-MM-DD'
  onlyUpcoming?: boolean;
  locationId?: number;
}

export const filterEventWithImage = async (
  params: FilterEventParams
): Promise<IGetAllEventsWithImageResponse> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }

    // Construir query string
    const query = new URLSearchParams();
    if (params.name) query.append("name", params.name);
    if (params.date) query.append("date", params.date);
    if (params.onlyUpcoming !== undefined)
      query.append("onlyUpcoming", String(params.onlyUpcoming));
    if (params.locationId !== undefined)
      query.append("locationId", String(params.locationId));

    const url = `${FILTER_EVENTS_ENDPOINT}?${query.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const baseData: IGetAllEventsResponse = await response.json();
    if (!response.ok || !baseData.success) {
      throw new Error(baseData.message || "Error filtrando eventos");
    }

    // Mapear con imágenes
    const eventsWithImage: IEventWithImage[] = await Promise.all(
      baseData.data.map(async (event: any) => {
        try {
          const imagesResponse = await fetch(`${GET_EVENT_IMAGES_ENDPOINT}/${event.id}`);
          if (!imagesResponse.ok) return { ...event, imageUrl: "" };

          const imagesData = await imagesResponse.json();
          const images = Array.isArray(imagesData) ? imagesData : [];
          const mainImage = images.find((img: any) => img.order === 1) || images[0];

          return {
            ...event,
            imageUrl: mainImage ? mainImage.url : "",
          };
        } catch {
          return { ...event, imageUrl: "" };
        }
      })
    );

    return {
      success: true,
      message: "Eventos filtrados exitosamente",
      data: eventsWithImage,
    };
  } catch (error) {
    console.error("Error filtrando eventos con imagen:", error);
    return {
      success: false,
      message: "Error filtrando eventos con imagen",
      data: [],
    };
  }
};
