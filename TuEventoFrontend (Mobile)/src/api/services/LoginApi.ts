import {IRequestLogin} from '../types/IUser'; // import the IRequestLogin interface
import {LOGIN_ENDPOINT} from '../../constants/Endpoint'; // import the LOGIN_ENDPOINT constant
import {getToken, setToken} from './Token'; // import the getToken and setToken functions

export const login = async (data: IRequestLogin) => {
    try {
        const response = await fetch(LOGIN_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (response.ok && result.data && result.data.token) {
            await setToken(result.data.token); // store the token using setToken function
            return {success: true, token: result.data.token};
        }
        return {success: false, message: result.message || 'Login failed'};
    } catch (error) {
        return {success: false, message: 'An error occurred during login'};
    }
}

// Function to get user profile using the stored token
export const getProfile = async () => {
  try {
    const token= await getToken();
    const response = await fetch(`${LOGIN_ENDPOINT}`, {

      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      // body: JSON.stringify(register),
    });

    if (!response.ok) throw new Error("Error en el login");
    let data = await response.json();
    // data=data("token");
    console.log(data);
    return data;
  } catch (error) {
    return error;
  }
};
