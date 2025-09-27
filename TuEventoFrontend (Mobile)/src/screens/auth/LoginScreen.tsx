import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import RedSocialButton from "../../components/common/RedSocialButton";
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

  const handleGoToTestImages = () => {
    navigation.navigate("TestImages" as never);
  };

  const handleLogin = async () => {
    try {
      const result = await login({ email, password });
      if (result.token) {
        console.log('Token:', result.token);
        navigation.navigate("MainTabs" as never);
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
    navigation.navigate("MainTabs" as never);
  };

  //  Función para manejar errores 
  const handleOAuthError = (error: any) => {
    console.log('Error en OAuth:', error);
    // Aquí podrías mostrar un mensaje de error si quieres
  };

  return (
    <View className="flex-1 bg-[#1a0033] items-center px-6 w-full h-full relative">
      <View className="w-full" style={{ marginTop: 100 }}>
        {/* Título */}
        <Text className="text-white text-2xl font-bold mb-4 text-center">
          Iniciar Sesión
        </Text>

        {/* Inputs */}
        <Input
          label="Correo electrónico o nombre de usuario"
          placeholder="Ingresa tu correo"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
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

        {/* Texto inferior alineado a la izquierda */}
        <View className="mt-4">
          <Text className="text-white text-left mb-1">
            ¿No tienes una cuenta?
          </Text>
          {/* Navegar a RegisterScreen */}
          <TouchableOpacity onPress={handleGoToRegister}>
            <Text style={{ color: '#B06CFF' }}>Crea tu cuenta</Text>
          </TouchableOpacity>
        </View>

        {/*Recuperar contraseña alineado a la izquierda */}
        <View className="mt-4">
          <Text className="text-white text-left mb-1">
            ¿Olvidaste tu contraseña?
          </Text>
          <TouchableOpacity onPress={handleGoToForgotPassword}>
            <Text style={{ color: '#B06CFF' }}>Recuperar contraseña</Text>
          </TouchableOpacity>
        </View>

        {/* Botón para acceder a la vista de test */}
        <View className="mt-4">
          <TouchableOpacity onPress={handleGoToTestImages}>
            <Text style={{ color: '#FFD700', textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>
              🖼️ Ir a Test de Imágenes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Línea divisoria */}
        <Text className="text-white text-sm text-center my-6">
          ___________________________________________________________
        </Text>

        {/* Texto "Inicia sesión con:" */}
        <Text className="text-gray-300 text-lg text-center mb-4 font-semibold">
          Inicia sesión con:
        </Text>
        
        {/* Botones de redes sociales con solo iconos */}
        <View className="flex-row justify-center items-center mb-4" style={{ gap: 20 }}>
          <RedSocialButton 
            social="google" 
            onSuccess={handleOAuthSuccess}
            onError={handleOAuthError}
            iconOnly={true}
          />
          <RedSocialButton 
            social="facebook" 
            onSuccess={handleOAuthSuccess}
            onError={handleOAuthError}
            iconOnly={true}
          />
        </View>

        {/* Terminos y condiciones */}
        <Text className="text-white text-base text-center mt-3 px-3">
          Al iniciar sesión, aceptas nuestros{" "}
          <Text style={{ color: '#B06CFF' }} className="font-semibold">Términos y condiciones</Text>
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