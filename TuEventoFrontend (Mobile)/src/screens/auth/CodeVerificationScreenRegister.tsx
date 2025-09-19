import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { useRoute, useNavigation } from '@react-navigation/native';
import Input from "../../components/Input";
import Button from "../../components/Button";
import { codeVerificationRegister } from "../../api/services/CodeVerificationRegisterApi";

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

    if (!userId) {
      Alert.alert('Error', 'ID de usuario no encontrado');
      return;
    }

    setIsLoading(true);
    
    try {
      // Preparar datos para enviar a la API
      const codeData = {
        userID: userId,                    // El ID capturado del registro
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
              text: 'Iniciar Sesión',
              onPress: () => {
                // Navegar al login o pantalla principal
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
        error.message || 'El código ingresado es incorrecto. Intenta nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (     
    <View className="flex-1 bg-[#1a0033] items-center px-6 w-full h-full relative ">         
      <View className="w-full top-12 ">         
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
          disabled={isLoading || activationCode.length < 4}
        />
        
        {/* Botón para volver */}
        <TouchableOpacity 
          className="mt-6 p-2"
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text className="text-gray-400 text-center">
            ← Volver al registro
          </Text>
        </TouchableOpacity>
      </View>     
    </View>     
  ); 
}

