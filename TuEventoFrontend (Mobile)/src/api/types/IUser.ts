export interface IRequestRegister {
  fullName: string;
  telephone: string;
 // birthDate: null;
 // address: null;
  email: string,
  password: string
}

export interface IRequestLogin {
  email: string,
  password: string
}

