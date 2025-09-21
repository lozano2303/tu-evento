export interface IRequestCodeVerification {
    userID : number;
    activationCode : string;
}

export interface IRequestResendCode {
    userID : number;
    activationCode : string;
}