const API_BASE_URL = "http://192.168.215.235:8080/api/v1"; //  API base URL

export const USER_ENDPOINT = `${API_BASE_URL}/register`; // User registration endpoint

export const VERIFICATION_ENDPOINT_REGISTER = `${API_BASE_URL}/account-activation/verify`; // Account verification endpoint

export const RESEND_ENDPOINT = `${API_BASE_URL}/account-activation/resend`; // Resend activation code endpoint

export const FORGOT_ENDPOINT = `${API_BASE_URL}/login/forgot`; // Forgot password endpoint

export const RESET_ENDPOINT_TOKEN = `${API_BASE_URL}/login/validateResetToken`; // Validate reset token endpoint

export const RESET_PASSORD_WITH_TOKEN = `${API_BASE_URL}/login/resetPasswordWithToken`; // Reset password with token endpoint

export const LOGIN_ENDPOINT = `${API_BASE_URL}/login/start`; // Login endpoint

export const USER_PROFILE_ENDPOINT = `${API_BASE_URL}/users`; // User profile endpoint

export const GET_ALL_EVENTS_ENDPOINT = `${API_BASE_URL}/event/getAll`; // Get all events endpoint
