import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import RedSocialButton from "../../components/RedSocialButton";
import { useNavigation } from "@react-navigation/native";
import { login } from "../../api/services/LoginApi";

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoToRegister = () => {
    navigation.navigate("RegisterScreen" as never);
  };

  const handleGoToForgotPassword = () => {
    navigation.navigate("ForgotPasswordScreen" as never);
  };

  const handleLogin = async () => {
    try {
      const result = await login({ email, password });
      if (result.token) {
        console.log('Token:', result.token);
        navigation.navigate("EvenList" as never);
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error durante el login");
    }
  };

  //  Función para manejar login exitoso con redes sociales
  const handleOAuthSuccess = (authData: any) => {
    console.log('OAuth exitoso - Navegando a EvenList');
    console.log('Datos recibidos:', authData);
    
    // Navegar directamente a la lista de eventos
    navigation.navigate("EvenList" as never);
  };

  //  Función para manejar errores 
  const handleOAuthError = (error: any) => {
    console.log('Error en OAuth:', error);
    // Aquí podrías mostrar un mensaje de error si quieres
  };

  return (
    <View className="flex-1 bg-[#1a0033] items-center px-6 w-full h-full relative">
      <View className="w-full top-12">
        {/* Título */}
        <Text className="text-white text-2xl font-bold mb-4 text-center">
          Iniciar Sesión
        </Text>

        {/* Inputs */}
        <Input
          label="Ingresa tu Correo Electronico"
          placeholder="Correo o nombre"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          label="Ingresa tu contraseña"
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Botón */}
        <Button label="Iniciar" onPress={handleLogin} />

        {/* Texto inferior */}
        <Text className="text-white mt-6 text-left mt-2">
          ¿No tienes una cuenta?
        </Text>
        {/* Navegar a RegisterScreen */}
        <TouchableOpacity onPress={handleGoToRegister}>
          <Text className="text-blue-400">Crea tu cuenta</Text>
        </TouchableOpacity>

        {/*Recuperar contraseña */}
        <Text className="text-white mt-2 text-left">
          ¿Olvidaste tu contraseña?{"  "}
          <TouchableOpacity onPress={handleGoToForgotPassword}>
            <Text className="text-blue-400">Recuperar contraseña</Text>
          </TouchableOpacity>
        </Text>

        {/* Línea divisoria */}
        <Text className="text-white text-sm text-center my-6">
          __________________________O____________________________
        </Text>

        {/* Texto "Inicia sesión con:" */}
        <Text className="text-gray-300 text-lg text-left mb-3 font-semibold">
          Inicia sesión con:
        </Text>

        {/* Botones de redes sociales  */}
        <RedSocialButton 
          social="google" 
          onSuccess={handleOAuthSuccess}
          onError={handleOAuthError}
        />
        <RedSocialButton 
          social="facebook" 
          onSuccess={handleOAuthSuccess}
          onError={handleOAuthError}
        />

        {/* Terminos y condiciones */}
        <Text className="text-white text-base text-center mt-4 px-4">
          Al iniciar sesión, aceptas nuestros{" "}
          <Text className="text-blue-400 font-semibold">Términos y condiciones</Text>
        </Text>
      </View>

      {/* Imagen de curva en la parte inferior */}
      <Image
        source={require("assets/images/curve.png")}
        className="absolute bottom-0"
        resizeMode="cover"
      />
    </View>
  );
}