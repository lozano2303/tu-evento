import { View, Text, Image, Alert } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Input from "../../components/Input";
import Button from "../../components/Button";
import { forgotPasswordApi } from "../../api/services/ForgotPasswordApi";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }

    setIsLoading(true);

    try {
      const result = await forgotPasswordApi({ email });

      if (result.success) {
        (navigation as any).navigate('CodeVerifcationForgotPassword', { email, userId: result.userId });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al enviar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#1a0033] justify-center items-center">

      <View className="px-6 w-full  h-full relative top-12">

        <Text className="text-white text-2xl font-bold text-center">Recuperación de contraseña </Text>
        <Text className="text-white text-lg mt-4 px-4 text-left">
          Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un enlace para restablecer tu contraseña.
        </Text>
        {/* Inputs */}
        <Input
          label="Ingresa tu correo electronico"
          placeholder="Correo elctronico"
          value={email}
          onChangeText={setEmail}
        />
        {/* Botón */}
        <Button
          label={isLoading ? "Enviando..." : "Siguiente"}
          onPress={handleForgotPassword}
          disabled={isLoading}
        />

        {/* Ícono del candado centrado */}
        <View className="flex-1 justify-center items-center ">
          <Image
            source={require("assets/images/lock.png")}
            className="w-full h-full "
            resizeMode="contain"
          />
        </View>

      </View>

      {/* Imagen de curva en la parte inferior */}
      <Image
        source={require("assets/images/curve.png")}  className="absolute bottom-0 "
        resizeMode="cover"
      />
    </View>
  );
}