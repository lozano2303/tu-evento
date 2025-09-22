import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Input from "../../components/Input";
import Button from "../../components/Button";

type RouteParams = {
  token: string;
};

export default function NewPasswordScreen() {
  const route = useRoute();

  // Estado para los campos de contraseña
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });



  // Función para actualizar los campos
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
          label="Cambiar Contraseña"
          onPress={() => {
            // Aquí implementarás la lógica para cambiar contraseña
          }}
        />
      </View>
    </View>
  );
}