import { View, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useRoute, useNavigation } from '@react-navigation/native';
import Input from "../../components/Input";
import Button from "../../components/Button";

type RouteParams = {
  email: string;
  userId: string;
};

export default function CodeVerifcationForgotPassword() {
  const route = useRoute();
  const navigation = useNavigation();

  // Estado para el código
  const [activationCode, setactivationCode] = useState('');

  // Obtener los parámetros
  const { email } = (route.params as RouteParams) || {};

  return (
    <View className="flex-1 bg-[#1a0033] items-center px-6 w-full h-full relative ">
      <View className="w-full top-12 ">
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
        />

        {/* Botón de verificar */}
        <Button
          label="Verificar Código"
          onPress={() => {
            // Aquí implementarás la lógica de verificación
          }}
        />

      </View>
    </View>
  );
}