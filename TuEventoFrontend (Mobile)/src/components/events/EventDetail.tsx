import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { getEventById } from '../../api/services/EventApi';
import { IEvent } from '../../api/types/IEvent';

const EventDetail: React.FC = () => {
  const route = useRoute();
  const { eventId } = route.params as { eventId: number };

  const [event, setEvent] = useState<IEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        const eventData = await getEventById(eventId);
        setEvent(eventData);
      } catch (err) {
        Alert.alert('Error', 'No se pudo cargar el evento');
        console.error('Error loading event:', err);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  if (loading) {
    return (
      <View className="flex-1 bg-[#1a0033] justify-center items-center">
        <Text className="text-white">Cargando evento...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View className="flex-1 bg-[#1a0033] justify-center items-center">
        <Text className="text-white">Evento no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#1a0033]">
      <View className="p-6">

        {/* Event Image */}
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop' }}
          className="w-full h-48 rounded-lg mb-4"
          resizeMode="cover"
        />

        {/* Event Details */}
        <Text className="text-white text-2xl font-bold mb-2">{event.eventName}</Text>
        <Text className="text-gray-300 text-base mb-4">{event.description}</Text>

        <View className="mb-4">
          <Text className="text-white text-lg font-semibold mb-2">Ubicación</Text>
          <Text className="text-gray-300">{event.locationID.name}</Text>
          <Text className="text-gray-300">{event.locationID.address.street}, {event.locationID.address.city.name}</Text>
        </View>

        <View className="mb-4">
          <Text className="text-white text-lg font-semibold mb-2">Fechas</Text>
          <Text className="text-gray-300">Inicio: {new Date(event.startDate).toLocaleDateString()}</Text>
          <Text className="text-gray-300">Fin: {new Date(event.finishDate).toLocaleDateString()}</Text>
        </View>

        <View className="mb-4">
          <Text className="text-white text-lg font-semibold mb-2">Organizador</Text>
          <Text className="text-gray-300">{event.userID.fullName}</Text>
          <Text className="text-gray-300">{event.userID.telephone || 'Sin teléfono'}</Text>
        </View>

        <View className="mb-4">
          <Text className="text-white text-lg font-semibold mb-2">Estado</Text>
          <Text className="text-gray-300">{event.status === 1 ? 'Activo' : 'Inactivo'}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default EventDetail;