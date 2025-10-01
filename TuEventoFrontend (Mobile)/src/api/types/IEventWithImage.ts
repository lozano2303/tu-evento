export interface IEventWithImage {
  id: number;
  eventName: string;
  imageUrl: string;
  description: string;
  startDate: string;
  finishDate: string;
  status: number;
}

export interface IGetAllEventsWithImageResponse {
  success: boolean;
  message: string;
  data: IEventWithImage[];
}