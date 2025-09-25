export interface IEvent {
  id: number;
  userID: {
    userID: number;
    fullName: string;
    telephone: string | null;
    status: boolean;
    activated: boolean;
    role: string;
    birthDate: string | null;
    address: any;
    organicer: boolean;
  };
  locationID: {
    locationID: number;
    address: {
      addressID: number;
      city: {
        cityID: number;
        department: {
          departmentID: number;
          name: string;
        };
        name: string;
      };
      street: string;
      postalCode: string;
    };
    name: string;
  };
  eventName: string;
  description: string;
  startDate: string;
  finishDate: string;
  status: number;
}

export interface IGetAllEventsResponse {
  success: boolean;
  message: string;
  data: IEvent[];
}