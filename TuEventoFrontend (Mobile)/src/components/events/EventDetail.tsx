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
  ActivityIndicator,
  Modal,
  TextInput
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getEventById } from '../../api/services/EventApi';
import { EventImgService } from '../../api/services/EventImgService';
import { getEventRatingsByEvent, insertEventRating, updateEventRating, deleteEventRating } from '../../api/services/UserApi';
import { getUserIdFromToken } from '../../api/services/Token';
import { IEvent } from '../../api/types/IEvent';
import { IEventRating } from '../../api/types/IUser';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const EventDetail: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { eventId } = route.params as { eventId: number };

  const [event, setEvent] = useState<IEvent | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [ratings, setRatings] = useState<IEventRating[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [editingRating, setEditingRating] = useState<IEventRating | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [commentValue, setCommentValue] = useState('');
  const carouselRef = useRef<FlatList>(null);

  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentImageIndex(viewableItems[0].index || 0);
    }
  };

  const handleAddRating = () => {
    setEditingRating(null);
    setRatingValue(5);
    setCommentValue('');
    setShowRatingModal(true);
  };

  const handleEditRating = (rating: IEventRating) => {
    setEditingRating(rating);
    setRatingValue(rating.rating);
    setCommentValue(rating.comment);
    setShowRatingModal(true);
  };

  const handleSaveRating = async () => {
    if (!userId || !event) return;

    try {
      if (editingRating) {
        // Update
        await updateEventRating({
          ratingID: editingRating.ratingID,
          rating: ratingValue,
          comment: commentValue,
        });
        // Update local state
        setRatings(prev => prev.map(r => r.ratingID === editingRating.ratingID ? { ...r, rating: ratingValue, comment: commentValue } : r));
      } else {
        // Insert
        const result = await insertEventRating(userId, event.id, {
          rating: ratingValue,
          comment: commentValue,
        });
        // Add to local state
        setRatings(prev => [...prev, result.data]);
      }
      setShowRatingModal(false);
      Alert.alert('Éxito', 'Calificación guardada correctamente');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al guardar la calificación');
    }
  };

  const handleDeleteRating = async (ratingID: number) => {
    try {
      await deleteEventRating(ratingID);
      setRatings(prev => prev.filter(r => r.ratingID !== ratingID));
      Alert.alert('Éxito', 'Calificación eliminada correctamente');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al eliminar la calificación');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <Text key={star} className={`text-lg ${star <= rating ? 'text-white' : 'text-gray-400'}`}>
            ★
          </Text>
        ))}
      </View>
    );
  };

  const renderRatingItem = ({ item }: { item: IEventRating }) => {
    const isOwner = item.userId === userId;
    return (
      <View key={item.ratingID} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 mb-3">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-white text-base font-semibold mb-1">
              {item.userName}
            </Text>
            {renderStars(item.rating)}
          </View>
          {isOwner && (
            <View className="flex-row">
              <TouchableOpacity onPress={() => handleEditRating(item)} className="mr-2">
                <Text className="text-purple-400 text-sm">Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteRating(item.ratingID)}>
                <Text className="text-white text-sm">Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Text className="text-gray-300 text-sm">
          {item.comment}
        </Text>
        <Text className="text-white text-xs mt-2">
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    );
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Obtener userId
        const fetchedUserId = await getUserIdFromToken();
        setUserId(fetchedUserId);

        // Cargar evento
        const eventData = await getEventById(eventId);
        setEvent(eventData);

        // Cargar imágenes del evento
        const imagesData = await EventImgService.getEventImages(eventId);
        const sortedImages = imagesData.sort((a: any, b: any) => a.order - b.order);
        const defaultImage = { url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop&auto=format', order: 0 };
        setImages(sortedImages.length > 0 ? sortedImages : [defaultImage]);

        // Cargar ratings del evento
        const ratingsData = await getEventRatingsByEvent(eventId);
        setRatings(ratingsData.data || []);
      } catch (err) {
        Alert.alert('Error', 'No se pudo cargar el evento, imágenes o calificaciones');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      loadData();
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

  const renderCarouselItem = ({ item, index }: { item: any; index: number }) => (
    <View style={{ width: CARD_WIDTH, height: 250 }}>
      <Image
        source={{ uri: item.url }}
        className="w-full h-full rounded-xl"
        resizeMode="cover"
      />
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
    <>
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
          data={images}
          renderItem={renderCarouselItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          snapToAlignment="center"
          decelerationRate="fast"
        />
      </View>

      {/* Indicadores de página */}
      <View className="flex-row justify-center mt-4 mb-6">
        {images.map((_, index) => (
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

          {/* Sección de Comentarios */}
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-2">💬</Text>
                <Text className="text-white text-lg font-semibold">Comentarios</Text>
              </View>
              {userId && (
                <TouchableOpacity onPress={handleAddRating}>
                  <Text className="text-purple-400 text-sm font-semibold">Agregar comentario</Text>
                </TouchableOpacity>
              )}
            </View>
            {ratings.length > 0 ? (
              <View>
                {ratings.map((item) => renderRatingItem({ item }))}
              </View>
            ) : (
              <View className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <Text className="text-gray-400 text-center">Aún no hay comentarios</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>

    {/* Modal para Rating */}
    <Modal
      visible={showRatingModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowRatingModal(false)}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View style={{ backgroundColor: 'white', width: '90%', borderRadius: 16, padding: 20 }}>
          <View style={{ alignItems: 'center', marginBottom: 15 }}>
            <View style={{ width: 40, height: 4, backgroundColor: '#ccc', borderRadius: 2, marginBottom: 5 }} />
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
              {editingRating ? 'Editar comentario' : 'Agregar comentario'}
            </Text>
          </View>

          {/* Estrellas */}
          <View style={{ alignItems: 'center', marginBottom: 15 }}>
            <Text style={{ fontSize: 16, marginBottom: 10, color: '#555' }}>Calificación</Text>
            <View style={{ flexDirection: 'row' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRatingValue(star)}>
                  <Text style={{ fontSize: 30, color: star <= ratingValue ? '#FFD700' : '#ccc' }}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Comentario */}
          <Text style={{ fontSize: 14, marginBottom: 6, color: '#555' }}>Comentario</Text>
          <View style={{ backgroundColor: '#f3f4f6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}>
            <TextInput
              value={commentValue}
              onChangeText={setCommentValue}
              placeholder="Escribe tu comentario..."
              multiline
              numberOfLines={3}
              style={{ color: '#333', fontSize: 14 }}
              placeholderTextColor="#999"
            />
          </View>

          {/* Botones */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 }}>
            <TouchableOpacity
              onPress={() => setShowRatingModal(false)}
              style={{ flex: 1, marginRight: 8, backgroundColor: '#f87171', paddingVertical: 12, borderRadius: 10 }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSaveRating}
              style={{ flex: 1, marginLeft: 8, backgroundColor: '#3b82f6', paddingVertical: 12, borderRadius: 10 }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
};

export default EventDetail;