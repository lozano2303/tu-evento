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

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
      return;
    }

    setIsLoading(true);

    try {
      const result = await forgotPasswordApi({ email: email.trim() });

      if (result.success) {
        Alert.alert(
          'Correo enviado',
          'Hemos enviado un código de verificación a tu correo electrónico',
          [
            {
              text: 'OK',
              onPress: () => (navigation as any).navigate('CodeVerifcationForgotPassword', { 
                email: email.trim(), 
                userId: result.userId 
              })
            }
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al enviar la solicitud. Verifica tu conexión e intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#1a0033]">
      <View style={{ marginTop: 195, paddingHorizontal: 24, flex: 1 }}>
        {/* Título */}
        <Text className="text-white text-2xl font-bold text-center mb-4">
          Recuperación de contraseña
        </Text>
        
        {/* Descripción mejorada */}
        <Text className="text-gray-300 text-base text-center mb-8 px-2 leading-6">
          Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un enlace para restablecer tu contraseña.
        </Text>

        {/* Input mejorado */}
        <Input
          label="Ingresa tu correo electrónico"
          placeholder="tu@gmail.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Botón */}
        <Button
          label={isLoading ? "Enviando..." : "Siguiente"}
          onPress={handleForgotPassword}
          disabled={isLoading}
        />

        {/* Ícono del candado centrado y redimensionado */}
        <View className="flex-1 justify-center items-center mt-8">
          <View className="w-48 h-48 justify-center items-center">
            <Image
              source={require("assets/images/lock.png")}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
          
          {/* Texto adicional de seguridad */}
          <Text className="text-gray-400 text-sm text-center mt-6 px-8">
            🔒 Tu información está segura. Solo tú podrás restablecer tu contraseña.
          </Text>
        </View>
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