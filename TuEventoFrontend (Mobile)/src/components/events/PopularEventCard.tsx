import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IEventWithImage } from '../../api/types/IEventWithImage';

interface PopularEventCardProps {
  event: IEventWithImage;
  onPress?: () => void;
}

const PopularEventCard: React.FC<PopularEventCardProps> = ({ event, onPress }) => {
  const navigation = useNavigation();

  const handleDetails = () => {
    (navigation as any).navigate('EventDetail', { eventId: event.id });
  };

  // Función para truncar la descripción si es muy larga
  const truncateDescription = (description: string, maxLength: number = 60) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  return (
    <View className="flex-1 relative rounded-lg overflow-hidden mb-4 mx-1 bg-gray-800">
      {/* Imagen del evento */}
      <Image
        source={{
          uri: event.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=200&fit=crop&auto=format'
        }}
        className="w-full h-32"
        resizeMode="cover"
      />

      {/* Contenido del evento */}
      <View className="p-3">
        {/* Nombre del evento */}
        <Text className="text-white text-sm font-bold mb-2 leading-5">
          {event.eventName}
        </Text>

        {/* Descripción */}
        <Text className="text-gray-300 text-xs mb-2 leading-4">
          {truncateDescription(event.description)}
        </Text>

        {/* Información adicional */}
        <View className="mb-3">
          <Text className="text-gray-400 text-xs">
            📅 {formatDate(event.startDate)}
          </Text>
        </View>

        {/* Botón de detalles */}
        <TouchableOpacity
          className="px-3 py-2 rounded-md"
          style={{ backgroundColor: '#8b5cf6' }}
          onPress={handleDetails}
        >
          <Text className="text-white text-xs font-medium text-center">
            Ver detalles
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PopularEventCard;