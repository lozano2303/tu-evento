import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { PinchGestureHandler, PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import { EventImgService } from './EventImgService';

const { width, height } = Dimensions.get('window');

interface Event {
  id: number;
  eventName: string;
  // otros campos
}

interface ImageItem {
  eventImgID: number;
  url: string;
  order: number;
}

const EventImagesView: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [zoom, setZoom] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [baseZoom, setBaseZoom] = useState(1);
  const [showEventPicker, setShowEventPicker] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        console.log('Loading events...');
        const eventsData = await EventImgService.getAllEvents();
        console.log('Events data received:', eventsData);
        console.log('Events array length:', Array.isArray(eventsData) ? eventsData.length : 'not array');
        if (Array.isArray(eventsData) && eventsData.length > 0) {
          console.log('First event:', eventsData[0]);
        }
        setEvents(eventsData);
      } catch (err) {
        console.error('Error loading events:', err);
        setEvents([]);
      }
    };

    loadEvents();
  }, []);

  useEffect(() => {
    const loadImages = async () => {
      if (!selectedEventId) {
        setImages([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await EventImgService.getEventImages(selectedEventId);
        setImages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [selectedEventId]);

  const openModal = (image: ImageItem) => {
    setSelectedImage(image);
    setModalVisible(true);
    setZoom(1);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
    setZoom(1);
    setBaseZoom(1);
    setTranslateX(0);
    setTranslateY(0);
    setPanOffset({ x: 0, y: 0 });
  };

  const resetZoom = () => {
    setZoom(1);
    setBaseZoom(1);
    setTranslateX(0);
    setTranslateY(0);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(5, zoom + 0.5);
    setZoom(newZoom);
    setBaseZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.5, zoom - 0.5);
    setZoom(newZoom);
    setBaseZoom(newZoom);
  };

  const renderImageItem = ({ item }: { item: ImageItem }) => (
    <TouchableOpacity
      style={styles.imageContainer}
      onPress={() => openModal(item)}
    >
      <Image
        source={{ uri: item.url }}
        style={styles.image}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventItem}
      onPress={() => {
        setSelectedEventId(item.id);
        setShowEventPicker(false);
      }}
    >
      <Text style={styles.eventText}>{item.eventName || `Evento ${item.id}`}</Text>
    </TouchableOpacity>
  );

  if (loading && events.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (error && events.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        Vista test para ver las imágenes asociadas a un evento
      </Text>

      <View style={styles.pickerContainer}>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowEventPicker(!showEventPicker)}
        >
          <Text style={styles.pickerText}>
            {selectedEventId
              ? events.find(e => e.id === selectedEventId)?.eventName || `Evento ${selectedEventId}`
              : 'Seleccionar evento'
            }
          </Text>
        </TouchableOpacity>

        {showEventPicker && (
          <View style={styles.eventList}>
            <FlatList
              data={[{ id: null, eventName: 'Seleccionar evento' }, ...events]}
              keyExtractor={(item) => item.id ? item.id.toString() : 'select'}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.eventItem}
                  onPress={() => {
                    setSelectedEventId(item.id);
                    setShowEventPicker(false);
                  }}
                >
                  <Text style={styles.eventText}>{item.eventName || `Evento ${item.id}`}</Text>
                </TouchableOpacity>
              )}
              style={styles.eventFlatList}
            />
          </View>
        )}
      </View>

      {selectedEventId ? (
        loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text>Cargando imágenes...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        ) : images.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text>No hay imágenes disponibles para este evento.</Text>
          </View>
        ) : (
          <FlatList
            data={images.sort((a, b) => a.order - b.order)}
            keyExtractor={(item) => item.eventImgID.toString()}
            renderItem={renderImageItem}
            numColumns={2}
            contentContainerStyle={styles.imageGrid}
          />
        )
      ) : (
        <View style={styles.centerContainer}>
          <Text>Selecciona un evento del menú desplegable para ver sus imágenes.</Text>
        </View>
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          {selectedImage && (
            <PinchGestureHandler
              onGestureEvent={(event) => {
                const newZoom = Math.max(0.5, Math.min(5, baseZoom * event.nativeEvent.scale));
                setZoom(newZoom);
                // Reset translation if zoom returns to 1
                if (newZoom <= 1) {
                  setTranslateX(0);
                  setTranslateY(0);
                }
              }}
              onHandlerStateChange={(event) => {
                if (event.nativeEvent.state === State.END) {
                  setBaseZoom(zoom);
                }
              }}
            >
              <PanGestureHandler
                onGestureEvent={(event) => {
                  if (zoom > 1) {
                    const maxTranslateX = (width * 0.9 * (zoom - 1)) / 2;
                    const maxTranslateY = (height * 0.7 * (zoom - 1)) / 2;

                    // Usar velocidad del gesto para movimiento más consistente
                    const velocityX = event.nativeEvent.velocityX || 0;
                    const velocityY = event.nativeEvent.velocityY || 0;

                    // Factor de amortiguación basado en velocidad (más lento)
                    const dampingFactor = 0.02; // Muy bajo para movimiento suave
                    const dampedVelocityX = velocityX * dampingFactor;
                    const dampedVelocityY = velocityY * dampingFactor;

                    // Aplicar movimiento incremental
                    const newTranslateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX + dampedVelocityX));
                    const newTranslateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY + dampedVelocityY));

                    setTranslateX(newTranslateX);
                    setTranslateY(newTranslateY);
                  }
                }}
                onHandlerStateChange={(event) => {
                  if (event.nativeEvent.state === State.END) {
                    // Mantener la posición final
                  }
                }}
              >
                <View style={styles.modalImageContainer}>
                  <Image
                    source={{ uri: selectedImage.url }}
                    style={[
                      styles.modalImage,
                      {
                        transform: [
                          { scale: zoom },
                          { translateX: translateX },
                          { translateY: translateY }
                        ]
                      }
                    ]}
                    resizeMode="contain"
                  />
                </View>
              </PanGestureHandler>
            </PinchGestureHandler>
          )}

          <View style={styles.zoomControls}>
            <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
              <Text style={styles.zoomText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetButton} onPress={resetZoom}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <Text style={styles.zoomText}>Zoom: {Math.round(zoom * 100)}%</Text>
            <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
              <Text style={styles.zoomText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        </GestureHandlerRootView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50, // Espacio adicional arriba para evitar superposición con notificaciones
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  pickerText: {
    fontSize: 16,
  },
  eventList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: '#fff',
  },
  eventFlatList: {
    maxHeight: 200,
  },
  eventItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  eventText: {
    fontSize: 16,
  },
  imageGrid: {
    paddingBottom: 16,
  },
  imageContainer: {
    flex: 1,
    margin: 4,
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalImage: {
    width: width * 0.9,
    height: height * 0.7,
  },
  modalImageContainer: {
    width: width * 0.9,
    height: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomControls: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  zoomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  zoomText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetButton: {
    width: 60,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  resetText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default EventImagesView;