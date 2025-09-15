import { View, Text, Image, TouchableOpacity  } from "react-native";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useNavigation } from "@react-navigation/native";

export default function CodeVerificationScreenRegister() {
    View
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
        {/* Inputs */}
        <Input
        label="Código de Verificación"
        placeholder="Ingresa el código"
        />
        {/* Botón */}
        <Button label="Verificar" />
        </View>
    </View>
    );
}