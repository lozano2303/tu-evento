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