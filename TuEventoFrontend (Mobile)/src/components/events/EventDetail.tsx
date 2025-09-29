import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Dimensions, 
  FlatList,
  ActivityIndicator 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getEventById } from '../../api/services/EventApi';
import { IEvent } from '../../api/types/IEvent';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const EventDetail: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { eventId } = route.params as { eventId: number };

  const [event, setEvent] = useState<IEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const carouselRef = useRef<FlatList>(null);

  // Imágenes para el carrusel (repetir 3 veces la misma imagen)
  const carouselImages = [
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=300&fit=crop&auto=format'
  ];

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const viewSize = event.nativeEvent.layoutMeasurement;
    const pageNum = Math.floor(contentOffset.x / viewSize.width);
    setCurrentImageIndex(pageNum);
  };

  const renderCarouselItem = ({ item, index }: { item: string; index: number }) => (
    <View style={{ width: CARD_WIDTH, height: 250 }}>
      <Image
        source={{ uri: item }}
        className="w-full h-full rounded-xl"
        resizeMode="cover"
      />
    </View>
  );

  const renderDots = () => (
    <View className="flex-row justify-center mt-4 mb-6">
      {carouselImages.map((_, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            carouselRef.current?.scrollToIndex({ index, animated: true });
            setCurrentImageIndex(index);
          }}
          className={`w-2 h-2 rounded-full mx-1 ${
            currentImageIndex === index ? 'bg-purple-500' : 'bg-gray-500'
          }`}
        />
      ))}
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-[#1a0033] justify-center items-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className="text-white mt-4">Cargando evento...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View className="flex-1 bg-[#1a0033] justify-center items-center">
        <Text className="text-white text-lg">Evento no encontrado</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 px-6 py-2 bg-purple-600 rounded-lg"
        >
          <Text className="text-white">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-[#1a0033]" 
      showsVerticalScrollIndicator={false}
    >
      {/* Header con botón de regreso */}
    <View className="relative flex-row items-center p-4 pt-12">
        <View className="flex-1 items-center">
          <Text className="text-white text-2xl font-bold">Detalles del Evento</Text>
        </View>
      </View>

      {/* Carrusel de imágenes */}
      <View className="px-4 mb-2">
        <FlatList
          ref={carouselRef}
          data={carouselImages}
          renderItem={renderCarouselItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          snapToAlignment="center"
          decelerationRate="fast"
        />
      </View>

      {/* Indicadores de página */}
      {renderDots()}

      {/* Contenido principal */}
      <View className="px-6 pb-8">
        {/* Título del evento */}
        <Text className="text-white text-3xl font-bold mb-3 leading-tight">
          {event.eventName}
        </Text>

        {/* Status badge */}
        <View className="flex-row mb-4">
          <View className={`px-3 py-1 rounded-full ${
            event.status === 1 ? 'bg-green-600' : 'bg-red-600'
          }`}>
            <Text className="text-white text-xs font-medium">
              {event.status === 1 ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>

        {/* Descripción */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-2">Descripción</Text>
          <Text className="text-gray-300 text-base leading-6">
            {event.description}
          </Text>
        </View>

        {/* Información en cards */}
        <View className="space-y-4">
          {/* Card de Fechas */}
          <View className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <View className="flex-row items-center mb-3">
              <Text className="text-2xl mr-2">📅</Text>
              <Text className="text-white text-lg font-semibold">Fechas del Evento</Text>
            </View>
            <View className="space-y-2">
              <View>
                <Text className="text-gray-400 text-sm">Inicio</Text>
                <Text className="text-white font-medium">
                  {formatDate(event.startDate)} a las {formatTime(event.startDate)}
                </Text>
              </View>
              <View>
                <Text className="text-gray-400 text-sm">Finalización</Text>
                <Text className="text-white font-medium">
                  {formatDate(event.finishDate)} a las {formatTime(event.finishDate)}
                </Text>
              </View>
            </View>
          </View>

          {/* Card de Ubicación */}
          <View className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 mb-4 mt-4">
            <View className="flex-row items-center mb-3">
              <Text className="text-2xl mr-2">📍</Text>
              <Text className="text-white text-lg font-semibold">Ubicación</Text>
            </View>
            <View className="space-y-2">
              <Text className="text-white font-medium text-base">
                {event.locationID.name}
              </Text>
              <Text className="text-gray-300">
                {event.locationID.address.street}
              </Text>
              <Text className="text-gray-300">
                {event.locationID.address.city.name}, {event.locationID.address.city.department.name}
              </Text>
              <Text className="text-gray-400 text-sm">
                CP: {event.locationID.address.postalCode}
              </Text>
            </View>
          </View>

          {/* Card de Organizador */}
          <View className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 mb-4">
            <View className="flex-row items-center mb-3">
              <Text className="text-2xl mr-2">👤</Text>
              <Text className="text-white text-lg font-semibold">Organizador</Text>
            </View>
            <View className="space-y-2">
              <Text className="text-white font-medium text-base">
                {event.userID.fullName}
              </Text>
              {event.userID.telephone && (
                <Text className="text-gray-300">
                  📞 {event.userID.telephone}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default EventDetail;