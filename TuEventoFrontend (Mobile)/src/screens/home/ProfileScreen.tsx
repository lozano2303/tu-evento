import { View, Text, Image, Alert, TouchableOpacity, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getUserIdFromToken, removeToken } from '../../api/services/Token';
import { getUserProfile, updateUserPhone, updateUserBirthDate } from '../../api/services/UserApi';
import { IUserProfile } from '../../api/types/IUser';
import Input from "../../components/common/Input";
import Button from '../../components/common/Button';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editedProfile, setEditedProfile] = useState<Partial<IUserProfile>>({});
  const [userId, setUserId] = useState<number | null>(null);
  
  // Estados para el DatePicker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const fetchedUserId = await getUserIdFromToken();
        if (fetchedUserId) {
          setUserId(fetchedUserId);
          const response = await getUserProfile(fetchedUserId);
          setProfile(response.data);
          setEditedProfile(response.data);
          
          // Si hay fecha de nacimiento, convertirla a Date
          if (response.data.birthDate) {
            setSelectedDate(new Date(response.data.birthDate));
          }
        } else {
          setError('No se pudo obtener el ID del usuario');
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Función para formatear la fecha
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Manejar el cambio de fecha
  const onDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
      setEditedProfile(prev => ({ 
        ...prev, 
        birthDate: formattedDate 
      }));
    }
  };

  // Mostrar el DatePicker
  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  // Componente personalizado para el campo de fecha
const DatePickerInput = () => (
  <View className="mb-4">
    <Text className="text-white text-base mb-2">
      Fecha de nacimiento
    </Text>
    
    {/* Input con gradiente */}
    <LinearGradient
      colors={['#8B5CF6', '#3B82F6']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{
        borderRadius: 8,
        padding: 1, 
      }}
    >
      <TouchableOpacity
        onPress={showDatePickerModal}
        className="bg-[#1a0033] rounded-lg px-4 py-3 flex-row justify-between items-center"
      >
        <Text className="text-white text-base">
          {editedProfile.birthDate ? formatDate(selectedDate) : 'Seleccionar fecha'}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
    
    {/* DatePicker Modal */}
    {showDatePicker && (
      <DateTimePicker
        value={selectedDate}
        mode="date"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={onDateChange}
        maximumDate={new Date()} // No permitir fechas futuras
        minimumDate={new Date(1900, 0, 1)} // Fecha mínima razonable
      />
    )}
  </View>
);

  // Guardar cambios
  const handleSave = async () => {
    if (!userId) return;

    let updated = false;
    let errors: string[] = [];

    try {
      // Update phone if changed
      if (editedProfile.telephone && editedProfile.telephone !== profile?.telephone) {
        try {
          const newPhone = parseInt(editedProfile.telephone, 10);
          if (isNaN(newPhone)) {
            throw new Error('El teléfono debe ser un número válido.');
          }
          await updateUserPhone({ id: userId, newTelephone: newPhone });
          setProfile(prev => prev ? { ...prev, telephone: editedProfile.telephone! } : null);
          updated = true;
          console.log('Teléfono actualizado correctamente');
        } catch (phoneError: any) {
          errors.push(`Teléfono: ${phoneError.message}`);
          console.error('Error actualizando teléfono:', phoneError);
        }
      }

      // Update birth date if changed
      if (editedProfile.birthDate && editedProfile.birthDate !== profile?.birthDate) {
        try {
          console.log('Intentando actualizar fecha de:', profile?.birthDate, 'a:', editedProfile.birthDate);
          await updateUserBirthDate(userId, editedProfile.birthDate);
          setProfile(prev => prev ? { ...prev, birthDate: editedProfile.birthDate! } : null);
          updated = true;
          console.log('Fecha de nacimiento actualizada correctamente');
        } catch (dateError: any) {
          errors.push(`Fecha de nacimiento: ${dateError.message}`);
          console.error('Error actualizando fecha:', dateError);
        }
      }

      // Mostrar resultado
      if (errors.length > 0) {
        Alert.alert('Errores al actualizar', errors.join('\n'));
      } else if (updated) {
        Alert.alert('Éxito', 'Los datos han sido actualizados correctamente.');
      } else {
        Alert.alert('Info', 'No hay cambios para guardar.');
      }
    } catch (error: any) {
      console.error('Error general en handleSave:', error);
      Alert.alert('Error', error.message || 'Error inesperado al actualizar datos.');
    }
  };


  // Cerrar sesión
  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sí, cerrar sesión', 
          onPress: async () => {
            await removeToken();
            navigation.navigate('LoginScreen' as never);
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#1a0033] items-center justify-center">
        <Text className="text-white text-xl">Cargando perfil...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-[#1a0033] items-center justify-center">
        <Text className="text-white text-xl">Error: {error}</Text>
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
    <View className="flex-1 bg-[#1a0033]">
      <View className="px-6 pt-16">
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-purple-600 rounded-full justify-center items-center mb-4">
            <Text className="text-white text-3xl font-bold">
              {profile?.fullName?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <Text className="text-white text-2xl font-bold text-center">
            Perfil del Usuario
          </Text>
        </View>

        {profile && (
          <View className="space-y-4">
            <Input
              label="Nombre completo"
              value={editedProfile.fullName || ''}
              onChangeText={(value) => setEditedProfile(prev => ({ ...prev, fullName: value }))}
            />
            
            <Input
              label="Teléfono"
              value={editedProfile.telephone || ''}
              onChangeText={(value) => setEditedProfile(prev => ({ ...prev, telephone: value }))}
              keyboardType="phone-pad"
            />
            
            {/* Campo de fecha personalizado */}
            <DatePickerInput />
            
            <View className="pt-4 space-y-3">
              <Button label="Guardar Cambios" onPress={handleSave} />
              <TouchableOpacity
                onPress={handleLogout}
                className="bg-red-600 py-3 rounded-lg mt-4 "
                style={{ borderRadius: 25 }}
              >
                <Text className="text-white text-center font-semibold text-base ">
                  Cerrar Sesión
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}