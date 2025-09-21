import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  label: string;
}

export default function Button({ label, ...props }: ButtonProps) {
  return (
    <TouchableOpacity
      {...props}
      className="w-full bg-blue-600 rounded-xl py-3 items-center active:bg-blue-700 mt-4"
    >
      <Text className="text-white font-semibold">{label}</Text>
    </TouchableOpacity>
  );
}
