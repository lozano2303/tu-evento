import { View, Text, Image } from "react-native";
import Input from "../../components/Input";
import Button from "../../components/Button";
import RedSocialButton from "../../components/RedSocialButton";

export default function LoginScreen() {
  return (
    <View className="flex-1 bg-[#1a0033] items-center px-6 w-full h-full relative ">

     <View className="w-full top-12 ">
         {/* Título */}
      <Text className="text-white text-2xl font-bold mb-4 text-center">
          Iniciar Sesión 
      </Text>

      {/* Inputs */}
      <Input
      label="Ingresa tu Correo Electronico"
      placeholder="Correo o nombre"
      />
      <Input
      label="Ingresa tu contraseña"
      placeholder="Contraseña"
      secureTextEntry
     />

      {/* Botón */}
      <Button label="Iniciar" />

      {/* Texto inferior */}
      <Text className="text-white mt-4 text-left">
        ¿No tienes una cuenta?{" "}
        <Text className="text-blue-400 underline">Crea tu cuenta</Text>
      </Text>

      {/*Recuperar contraseña */}
      <Text className="text-white mt-2 text-left">
        ¿Olvidaste tu contraseña?{" "}
        <Text className="text-blue-400 underline">Recuperar contraseña</Text>
      </Text>

      {/* Línea divisoria */}
         <Text className="text-white text-sm text-center my-6">
              __________________________O____________________________
            </Text>
           {/* Texto "Inicia sesión con:" */}
          <Text className="text-gray-300 text-sm text-center mb-3">
             Inicia sesión con:
          </Text>

        {/* Botones de redes sociales */}
      <RedSocialButton social="google" onPress={() => {}} />
      <RedSocialButton social="facebook" onPress={() => {}} />

    </View>
    
      {/* Imagen de curva en la parte inferior */}
      <Image
        source={require("assets/images/curve.png")}  className="absolute bottom-0" 
        resizeMode="cover"
      />
    </View>
  );
}