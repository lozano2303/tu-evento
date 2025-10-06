import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { useRoute, useNavigation } from '@react-navigation/native';
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { codeVerificationRegister, resendCode } from "../../api/services/CodeVerificationRegisterApi";

type RouteParams = {
  userId: string;
};

export default function CodeVerificationScreenRegister() {
  const route = useRoute();
  const navigation = useNavigation();
  
  // Estados para manejar el input y loading
  const [activationCode, setactivationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Obtener los parámetros pasados desde RegisterScreen
  const { userId } = (route.params as RouteParams) || {};
  
  console.log('Parámetros recibidos:', { userId });

  // Función para manejar la verificación del código
  const handleVerification = async () => {
    // Validaciones básicas
    if (!activationCode.trim()) {
      Alert.alert('Error', 'Por favor ingresa el código de verificación');
      return;
    }

    if (activationCode.length !== 6) {
      Alert.alert('Error', 'El código debe tener exactamente 6 dígitos');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'ID de usuario no encontrado');
      return;
    }

    setIsLoading(true);
    
    try {
      // Preparar datos para enviar a la API
      const codeData = {
        userID: Number(userId),                    // El ID capturado del registro
        activationCode: activationCode // El código que ingresó el usuario
      };

      console.log('Intentando verificar código...');
      
      // Llamar a la API de verificación
      const result = await codeVerificationRegister(codeData);
      
      
      if (result.success) {
        Alert.alert(
          'Cuenta Verificada',
          result.message || 'Tu cuenta ha sido activada exitosamente',
          [
            {
              text: 'Continuar',
              onPress: () => {
                // Navigate to login screen
                (navigation as any).navigate('LoginScreen');
              }
            }
          ]
        );
      }

    } catch (error: any) {
      console.error('Error en verificación:', error);
      Alert.alert(
        'Error de Verificación',
        'codigo invalido'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar el reenvío del código
  const handleResend = async () => {
    if (!userId) {
      Alert.alert('Error', 'ID de usuario no encontrado');
      return;
    }

    setIsLoading(true);

    try {
      // Preparar datos para enviar a la API
      const resendData = {
        userID: Number(userId),
        activationCode: activationCode // Usar el código actual o vacío
      };

      console.log('Intentando reenviar código...');

      // Llamar a la API de reenvío
      const result = await resendCode(resendData);

      if (result.success) {
        Alert.alert(
          'Código Reenviado',
          result.message || 'Se ha enviado un nuevo código a tu correo electrónico.'
        );
      }

    } catch (error: any) {
      console.error('Error en reenvío:', error);
      Alert.alert(
        'Error de Reenvío',
        error.message || 'No se pudo reenviar el código. Intenta nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#1a0033]">
      <View style={{ marginTop: 250, paddingHorizontal: 24, width: '100%' }}>         
        {/* Título */}         
        <Text className="text-white text-2xl font-bold mb-4 text-center">             
          Verificación de Código         
        </Text>         
        
        <Text className="text-white text-base mb-4 text-center">             
          Ingresa el código que te enviamos a tu correo electrónico.         
        </Text>
        
        {/* Input para código de verificación */}         
        <Input         
          label="Código de Verificación"         
          placeholder="Ingresa el código de 6 dígitos"
          value={activationCode}
          onChangeText={setactivationCode}
          keyboardType="numeric"
          maxLength={6}
        />         
        
        {/* Botón de verificar */}
        <Button
          label={isLoading ? "Verificando..." : "Verificar Código"}
          onPress={handleVerification}
          disabled={isLoading || activationCode.length !== 6}
        />

        {/* Botón de reenviar código */}
        <TouchableOpacity
          onPress={handleResend}
          disabled={isLoading}
          className="mt-4"
        >
          <Text className="text-center underline" style={{ color: '#B06CFF' }}>
            {isLoading ? "Reenviando..." : "Reenviar Código"}
          </Text>
        </TouchableOpacity>
    </View>

      {/* Imagen de cuñrva en la parte inferior */}
      <Image
        source={require("assets/images/curve.png")}
        className="absolute bottom-0"
        resizeMode="cover"
      />
  
    </View>     
  ); 
}