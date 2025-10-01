import React from 'react';
import { View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchHeaderProps {
  onSearch?: (text: string) => void; // ✅ añadimos prop opcional
}

const SearchHeader: React.FC<SearchHeaderProps> = ({ onSearch }) => {
  return (
    <View className="mx-4 mb-6">
      {/* Search Container */}
      <View className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
        <View className="flex-row items-center">
          <Ionicons 
            name="search-outline" 
            size={20} 
            color="#ffffff" 
            style={{ marginRight: 12 }}
          />
          <TextInput
            placeholder="Buscar eventos..."
            placeholderTextColor="#ffffff80"
            className="flex-1 text-white text-base font-medium"
            style={{ fontSize: 16 }}
            onChangeText={onSearch} // ✅ llama al padre
          />
        </View>
      </View>
    </View>
  );
};

export default SearchHeader;
