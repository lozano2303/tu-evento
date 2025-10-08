export interface IRequestRegister {
  fullName: string;
 // birthDate: null;
 // address: null;
  email: string,
  password: string
}

export interface IRequestLogin {
  email: string,
  password: string
}

export interface IUserProfile {
  fullName: string;
  telephone: string;
  birthDate: string | null;
  address: number | null;
  activated: boolean;
}

export interface IUserProfileResponse {
  success: boolean;
  message: string;
  data: IUserProfile;
}

export interface IUserUpdatePhone {
  id: number;
  newTelephone: number;
}

export interface IAdress {
  cityID: number;
  street: string;
  postalCode: string;
}

export interface IDepartment {
  id: number;
  name: string;
}

export interface ICity {
  id: number;
  departmentID: number;
  name: string;
}

export interface IEventRating {
  ratingID: number;
  userId: number;
  eventId: number;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
}

