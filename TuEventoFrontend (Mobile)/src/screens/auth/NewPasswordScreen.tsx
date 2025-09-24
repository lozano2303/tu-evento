import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { resetPaswwordWithTokenApi } from "../../api/services/ForgotPasswordApi";

type RouteParams = {
  token: string;
};

export default function NewPasswordScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  // Estado para los campos de contraseña
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);

  // Obtener los parámetros
  const { token } = (route.params as RouteParams) || {};



  // Función para actualizar los campos
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para manejar el cambio de contraseña
  const handleChangePassword = async () => {
    // Validaciones básicas
    if (!formData.newPassword.trim()) {
      Alert.alert('Error', 'La nueva contraseña es requerida');
      return;
    }

    if (formData.newPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);

      console.log('Cambiando contraseña con token:', token);

      // Llamar a la API para cambiar la contraseña
      const response = await resetPaswwordWithTokenApi({
        token: token,
        newPassword: formData.newPassword
      });

      console.log('Contraseña cambiada exitosamente:', response);

      Alert.alert(
        'Éxito',
        'Contraseña cambiada exitosamente',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navegar al login
              navigation.navigate('LoginScreen' as never);
            }
          }
        ]
      );

    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo cambiar la contraseña. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#1a0033] justify-center items-center">
      <View className="px-6 w-full h-full relative top-12">
        {/* Título */}
        <Text className="text-white text-2xl font-bold text-center mb-8">
          Nueva Contraseña
        </Text>

 
        {/* Input para nueva contraseña */}
        <Input
          label="Nueva Contraseña"
          placeholder="Ingresa tu nueva contraseña"
          value={formData.newPassword}
          onChangeText={(value) => updateField('newPassword', value)}
          secureTextEntry
        />

        {/* Input para confirmar contraseña */}
        <Input
          label="Confirmar Contraseña"
          placeholder="Confirma tu nueva contraseña"
          value={formData.confirmPassword}
          onChangeText={(value) => updateField('confirmPassword', value)}
          secureTextEntry
        />

        {/* Botón para cambiar contraseña */}
        <Button
          label={loading ? "Cambiando..." : "Cambiar Contraseña"}
          onPress={handleChangePassword}
          disabled={loading}
        />
      </View>
    </View>
  );
}