import { TouchableOpacity, Text, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface RedSocialButtonProps {
  social: "google" | "facebook";
  onPress?: () => void;
}

const icons = {
  google: { name: "google", color: "#EA4335", label: "Google" },
  facebook: { name: "facebook-f", color: "#1877F3", label: "Facebook" },
};

export default function RedSocialButton({ social, onPress }: RedSocialButtonProps) {
  const { name, color, label } = icons[social];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View className="mt-6 flex-row items-center border border-gray-200 rounded-full px-4 py-2">
        <FontAwesome name={name as any} size={20} color={color} />
        <Text className="ml-2 text-gray-800 font-semibold text-white ">{label}</Text>
      </View>
    </TouchableOpacity>
  );
}