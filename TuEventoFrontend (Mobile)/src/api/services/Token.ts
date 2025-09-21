import AsyncStorage from "@react-native-async-storage/async-storage";

export const setToken = async (token: string) => {
    try {
        await AsyncStorage.setItem("token", token);
    } catch (error) {
        console.log(error)

    }
}

export const getToken = async () => {
    try {
        return await AsyncStorage.getItem("token");
    } catch (error) {
        return null;
    }
}

export const removeToken = async () => {
    try {
        return await AsyncStorage.removeItem("token");
    } catch (error) {
        return null;
    }
}

export const getUserIdFromToken = async (): Promise<number | null> => {
    try {
        const token = await getToken();
        if (!token) return null;

        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        return decoded.userID || null;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}