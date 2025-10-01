const API_BASE_URL = "http://192.168.0.26:8080/api/v1"; //  API base URL

export const USER_ENDPOINT = `${API_BASE_URL}/register`; // User registration endpoint

export const VERIFICATION_ENDPOINT_REGISTER = `${API_BASE_URL}/account-activation/verify`; // Account verification endpoint

export const RESEND_ENDPOINT = `${API_BASE_URL}/account-activation/resend`; // Resend activation code endpoint

export const FORGOT_ENDPOINT = `${API_BASE_URL}/login/forgot`; // Forgot password endpoint

export const RESET_ENDPOINT_TOKEN = `${API_BASE_URL}/login/validateResetToken`; // Validate reset token endpoint

export const RESET_PASSORD_WITH_TOKEN = `${API_BASE_URL}/login/resetPasswordWithToken`; // Reset password with token endpoint

export const LOGIN_ENDPOINT = `${API_BASE_URL}/login/start`; // Login endpoint

export const USER_PROFILE_ENDPOINT = `${API_BASE_URL}/users`; // User profile endpoint

export const UPDATE_PHONE_ENDPOINT = `${API_BASE_URL}/users/`; // Update phone endpoint

export const GET_ALL_DEPARTMENTS_ENDPOINT = `${API_BASE_URL}/departments`; // Get all departments endpoint

export const GET_CITIES_BY_DEPARTMENT_ENDPOINT = `${API_BASE_URL}/cities`; // Get cities by department endpoint

export const SEND_ADRESS_ENDPOINT = `${API_BASE_URL}/addresses`; // Send address endpoint

export const GET_ALL_EVENTS_ENDPOINT = `${API_BASE_URL}/event/getAll`; // Get all events endpoi

export const GET_EVENT_BY_ID_ENDPOINT = `${API_BASE_URL}/event`; // Get event by ID endpoint

export const GET_EVENT_IMAGES_ENDPOINT = `${API_BASE_URL}/event-img`; // Get event images endpoint

export const BUY_TICKET_ENDPOINT = `${API_BASE_URL}/tickets/cancel`; // Cancel ticket endpoint

export const EVENT_RATING_ENDPOINT = `${API_BASE_URL}/eventRating`; // Event rating endpoint

export const FILTER_EVENTS_ENDPOINT = `${API_BASE_URL}/event/filter`; // Filter events endpoint