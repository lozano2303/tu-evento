import { View, Text , Image } from 'react-native';
import Input from "../../components/Input";
import Button from "../../components/Button";
import RedSocialButton from "../../components/RedSocialButton";

export default function RegisterScreen() {
  return (
    <View className="flex-1 bg-[#1a0033] justify-center items-center ">

      <View className="px-6 w-full h-full relative top-12">
        {/* Título de crear cuenta*/}
        <Text className="text-white text-2xl font-bold text-center ">Crea tu cuenta </Text>

          {/* Inputs */}
          <Input
          label="Nombre completo"
          placeholder="Correo o nombre"
          />
          <Input
          label="Telefono"
          placeholder="Contraseña"
          secureTextEntry
          />
          <Input
          label="Correo Electrónico"
          placeholder="Contraseña"
          secureTextEntry
          />
          <Input
          label="Contraseña"
          placeholder="Contraseña"
          secureTextEntry
          />

          {/* Botón */}
          <Button label="Siguiente" />

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
        source={require("assets/images/curve.png")}  className="absolute bottom-0" 
        resizeMode="cover"
      />



    </View>
  );
} 