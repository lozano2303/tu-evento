import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
}

export default function Button({ label, ...props }: ButtonProps) {
  return (
    <TouchableOpacity
      {...props}
      className="w-full mt-4"
      activeOpacity={0.8}
      style={{ borderRadius: 25 }}
    >
      <LinearGradient
        colors={['#8B5CF6', '#3B82F6']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="w-full py-3 items-center"
        style={{ borderRadius: 25 }}
      >
        <Text className="text-white font-semibold text-base">{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}