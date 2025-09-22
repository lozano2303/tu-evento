export  interface IRequestForgotPassword {
    email: string
}

export interface ItokenForgotPassword {
    token: string
}

export interface IResetPassword {
    token: string;
    newPassword: string;
}
