import { View, Text, TextInput, TextInputProps } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

interface InputProps extends TextInputProps {
  label: string;
}

export default function Input({ label, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {/* Label */}
      <Text className="text-white text-base mb-2 text-left">
        {label}
      </Text>
      
      {/* Input con gradiente */}
      <LinearGradient
        colors={['#8B5CF6', '#3B82F6']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          borderRadius: 8,
          padding: 1, 
        }}
      >
        <TextInput
          {...props}
          className="w-full text-white text-base"
          style={{
            backgroundColor: 'rgba(26, 0, 51, 0.8)',
            borderRadius: 7,
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
          placeholderTextColor="#B8B8B8"
        />
      </LinearGradient>
    </View>
  );
}