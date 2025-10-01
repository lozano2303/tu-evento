import { View, Text, Image, TouchableOpacity, FlatList, Alert } from "react-native";
import { useState, useEffect } from 'react';
import SearchHeader from '../../components/common/SearchHeader';
import PopularEventCard from '../../components/events/PopularEventCard';
import { getAllEventsWithImage } from '../../api/services/EventWithImageApi';
import { IEventWithImage } from '../../api/types/IEventWithImage';

export default function EvenList() {
  const [events, setEvents] = useState<IEventWithImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const result = await getAllEventsWithImage();
        if (result.success) {
          setEvents(result.data);
        } else {
          Alert.alert('Error', result.message || 'Error al cargar eventos');
        }
      } catch (err) {
        Alert.alert('Error', 'Error de conexión al cargar eventos');
        console.error('Error loading events:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const renderEvent = ({ item }: { item: IEventWithImage }) => (
    <PopularEventCard event={item} />
  );

  return (
    <View className="flex-1 bg-[#1a0033] px-6 w-full h-full relative">
      <View className="w-full top-12">
        <SearchHeader />
        {/* Título */}
        <Text className="text-white text-1xl font-bold mb-4 text-center">EVENTOS</Text>
        {loading ? (
          <Text className="text-white text-center">Cargando eventos...</Text>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderEvent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 170 }}
          />
        )}
      </View>
    </View>
  );
}