import React, { useState } from 'react';
import { View, Text, Image, Alert } from 'react-native';
import Input from "../../components/Input";
import Button from "../../components/Button";
import RedSocialButton from "../../components/RedSocialButton";
import { registerUser } from '../../api/services/UserApi';
import { useNavigation } from "@react-navigation/native";

export default function RegisterScreen() {
  // Estado para capturar los datos del formulario
  const [formData, setFormData] = useState({
    fullName: '',
    telephone: '',
    email: '',
    password: ''
  });

     const navigation = useNavigation();
    
    const handleGoToRegister = () => {
      navigation.navigate("CodeVerificationScreenRegister" as never); 
    };
  
  const [loading, setLoading] = useState(false);

  // Función para actualizar los campos
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para manejar el registro
  const handleRegister = async () => {
    try {
      setLoading(true);

      // Preparar datos para enviar al API
      const userData = {
        fullName: formData.fullName.trim(),
        telephone: formData.telephone.trim(),
        email: formData.email.trim(),
        password: formData.password,

      };

      console.log('Intentando registrar usuario...');
      
      // Llamar al API
      const result = await registerUser(userData);
      
      console.log('Registro exitoso:', result);
      // Navegar a la pantalla de verificación de código
      handleGoToRegister();
      

    } catch (error: any) {
      console.error('Error en el registro:', error);
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
          label="Telefono"
          placeholder="Número de teléfono"
          value={formData.telephone}
          onChangeText={(value) => updateField('telephone', value)}
          keyboardType="phone-pad"
        />
        
        <Input
          label="Correo Electrónico"
          placeholder="tu@email.com"
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
          __________________________O____________________________
        </Text>
        
        {/* Texto "Inicia sesión con:" */}
        <Text className="text-gray-300 text-lg text-left mb-3 font-semibold">
          Registrate mediante:
        </Text>
        
        {/* Botones de redes sociales */}
        <RedSocialButton social="google" onPress={() => {}} />
        <RedSocialButton social="facebook" onPress={() => {}} />
        
        {/* Terminos y condiciones */}
        <Text className="text-white text-base text-center mt-4 px-4">
          Al crear una cuenta, aceptas nuestros{" "}
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