import { View, Text, TextInput, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
}

export default function Input({ label, ...props }: InputProps) {
  return (
    <View className="w-full mb-4">
      {label && (
        <Text className="text-gray-300 text-xl font-medium mb-1">{label}</Text>
      )}
      <TextInput
        {...props}
        className=" w-full px-4 py-3 border border-gray-600 rounded-xl bg-gray-900 text-white focus:border-blue-500 " 
        placeholderTextColor="#aaa"
      />
    </View>
  );
}
