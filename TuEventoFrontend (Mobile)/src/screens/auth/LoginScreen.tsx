import { View, Text, Image } from "react-native";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function LoginScreen() {
  return (
    <View className="flex-1 bg-[#1a0033] items-center px-6 w-full ">

     <View className="w-full flex-1 justify-center top-12">
         {/* Título */}
      <Text className="text-white text-2xl font-bold mb-4 text-center ">
          Iniciar Sesión
      </Text>

      {/* Inputs */}
      <Input placeholder="Correo o nombre" />
      <Input placeholder="Contraseña" secureTextEntry />

      {/* Botón */}
      <Button label="Iniciar" />

      {/* Texto inferior */}
      <Text className="text-white-400 mt-4 text-center">
        ¿No tienes una cuenta?{" "}
        <Text className="text-blue-400 underline">Crea tu cuenta</Text>
      </Text>

      {/* Línea divisoria */}
          <Text className="text-white-400 text-sm text-center mb-3">
        ____________________________________________________________
      </Text>
      {/* Texto "Inicia sesión con:" */}
      <Text className="text--400 text-sm text-center mb-3">
        Inicia sesión con:
      </Text>

    </View>
    
     
      {/* Imagen de curva en la parte inferior */}
      <Image
        source={require("assets/images/curve.png")}  className="absolute bottom-0 w-32 h-32" 
        resizeMode="cover"
      />
    </View>
  );
}