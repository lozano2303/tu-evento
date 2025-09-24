import { View, Text, TouchableOpacity, Alert, Image } from "react-native";
import { useState } from "react";
import { useRoute, useNavigation } from '@react-navigation/native';
import Input from "../../components/Input";
import Button from "../../components/Button";
import { validateResetTokenApi } from "../../api/services/ForgotPasswordApi";

type RouteParams = {
  email: string;
  userId: string;
};

export default function CodeVerifcationForgotPassword() {
  const route = useRoute();
  const navigation = useNavigation();

  // Estado para el código
  const [activationCode, setactivationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState<string | null>(null);

  // Obtener los parámetros
  const { email } = (route.params as RouteParams) || {};

  // Función para manejar la verificación del código
  const handleVerifyCode = async () => {
    if (activationCode.length !== 6) {
      Alert.alert('Error', 'El código debe tener 6 dígitos');
      return;
    }

    try {
      setLoading(true);

      console.log('Verificando código:', activationCode);

      // Llamar a la API para validar el token
      const response = await validateResetTokenApi({ token: activationCode });

      console.log('Token validado exitosamente:', response);

      // Almacenar el token válido
      setValidToken(activationCode);

      // Navegar a la pantalla de nueva contraseña
      (navigation as any).navigate('NewPasswordScreen', {
        token: activationCode,
        email: email
      });

    } catch (error: any) {
      console.error('Error al validar el código:', error);
      Alert.alert(
        'Error',
        error.message || 'Código inválido o expirado. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#1a0033]">
      <View style={{ marginTop: 250, paddingHorizontal: 24, width: '100%' }}>
        {/* Título */}
        <Text className="text-white text-2xl font-bold mb-4 text-center">
          Verificación de Código para Recuperación
        </Text>

        <Text className="text-white text-base mb-4 text-center">
          Ingresa el código que te enviamos a tu correo electrónico {email}.
        </Text>

        {/* Input para código de verificación */}
        <Input
          label="Código de Verificación"
          placeholder="Ingresa el código de 6 dígitos"
          value={activationCode}
          onChangeText={setactivationCode}
          maxLength={6}
          keyboardType="numeric"
        />

        {/* Botón de verificar */}
        <Button
          label={loading ? "Verificando..." : "Verificar Código"}
          onPress={handleVerifyCode}
          disabled={loading || activationCode.length !== 6}
        />
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