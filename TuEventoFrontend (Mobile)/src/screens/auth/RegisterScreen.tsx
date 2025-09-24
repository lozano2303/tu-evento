import React, { useState } from 'react';
import { View, Text, Image, Alert } from 'react-native';
import Input from "../../components/Input";
import Button from "../../components/Button";
import RedSocialButton from "../../components/RedSocialButton";
import { registerUser } from '../../api/services/UserApi';
import { useNavigation } from "@react-navigation/native";

export default function RegisterScreen() {
  const navigation = useNavigation();

  //  Función para manejar login exitoso con redes sociales
  const handleOAuthSuccess = (authData: any) => {
    console.log(' OAuth exitoso - Navegando a EvenList');
    console.log(' Datos recibidos:', authData);
    
    // Navegar directamente a la lista de eventos
    navigation.navigate("MainTabs" as never);
  };

  //  Función para manejar errores (opcional)
  const handleOAuthError = (error: any) => {
    console.log(' Error en OAuth:', error);
    // Aquí podrías mostrar un mensaje de error si quieres
  };

  // Estado para capturar los datos del formulario
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);

  // Función para actualizar los campos
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  //  FUNCIÓN MODIFICADA - Ahora captura el userId de la respuesta
  const handleRegister = async () => {
    try {
      setLoading(true);

      // Preparar datos para enviar al API
      const userData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      console.log(' Intentando registrar usuario...');
      console.log(' Datos enviados:', userData);
      
      // Llamar al API y obtener la respuesta completa
      const responseData = await registerUser(userData);
      
      console.log(' Registro exitoso - Respuesta completa:', responseData);
      
      if (responseData.success) {
        //  AQUÍ CAPTURAMOS EL ID DEL USUARIO
        const userId = responseData.data; 
        
        console.log(' ID del usuario capturado:', userId);
        console.log(' Email del usuario:', formData.email);
        
        // Navegar directamente a verificación con parámetros
        console.log(' Navegando a verificación con parámetros:');
        console.log('   - userId:', userId);
        console.log('   - email:', formData.email);

        // Navegación sin tipos estrictos
        (navigation as any).navigate("CodeVerificationScreenRegister", {
          userId: userId,
          email: formData.email
        });
      }

    } catch (error: any) {
      console.error(' Error en el registro:', error);
      Alert.alert(
        'Error al Registrarse',
        error.message || 'No se pudo crear la cuenta. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#1a0033] justify-center items-center">
      <View className="px-6 w-full h-full relative top-12">
        {/* Título de crear cuenta*/}
        <Text className="text-white text-2xl font-bold text-center">Crea tu cuenta</Text>
        
        {/* Inputs con funcionalidad */}
        <Input
          label="Nombre completo"
          placeholder="Ingresa tu nombre completo"
          value={formData.fullName}
          onChangeText={(value) => updateField('fullName', value)}
        />
        
        <Input
          label="Correo Electrónico"
          placeholder="example@gmail.com"
          value={formData.email}
          onChangeText={(value) => updateField('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <Input
          label="Contraseña"
          placeholder="Crea una contraseña"
          value={formData.password}
          onChangeText={(value) => updateField('password', value)}
          secureTextEntry
        />
        
        {/* Botón con funcionalidad */}
        <Button 
          label={loading ? "Registrando..." : "Siguiente"}
          onPress={handleRegister}
          disabled={loading}
        />
        
        {/* Línea divisoria */}
        <Text className="text-white text-sm text-center my-6">
          _______________________________________________________
        </Text>
        
        {/* Texto "Inicia sesión con:" */}
       <Text className="text-gray-300 text-lg text-center mb-4 font-semibold">
          Registrate mediante:
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
        <Text className="text-white text-base text-center mt-4 px-4">
          Al crear una cuenta, aceptas nuestros{" "}
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