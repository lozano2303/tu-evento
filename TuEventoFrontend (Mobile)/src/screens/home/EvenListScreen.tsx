import { View, Text, Image, TouchableOpacity  } from "react-native";
import SearchHeader from '../../components/common/SearchHeader';


export default function EvenList() {
  return (
    <View className="flex-1 bg-[#1a0033] items-center px-6 w-full h-full relative ">
        <View className="w-full top-12 ">
            <SearchHeader /> 
            {/* Título */}
            <Text className="text-white text-2xl font-bold mb-4 text-center">
                Hola esta es es la pantalla de lista de eventos
            </Text>
            </View>
    </View>
    );
}