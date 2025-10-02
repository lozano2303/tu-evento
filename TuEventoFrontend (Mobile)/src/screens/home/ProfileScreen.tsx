import { View, Text, Image, Alert, TouchableOpacity, Platform, ScrollView, Modal, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useState, useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getUserIdFromToken, removeToken } from '../../api/services/Token';
import { getUserProfile, updateUserPhone, updateUserBirthDate, getAllDepartments, getCitiesByDepartment, deactivateUserAccount, createAddress, updateUserAddress, getAddressById, getCitiesByDepartmentId } from '../../api/services/UserApi';
import { IUserProfile, IDepartment, ICity } from '../../api/types/IUser';
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

  // Estados para el modal de dirección
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [filteredCities, setFilteredCities] = useState<ICity[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const fetchedUserId = await getUserIdFromToken();
        if (fetchedUserId) {
          setUserId(fetchedUserId);
          const response = await getUserProfile(fetchedUserId);
          setProfile(response.data);
          setEditedProfile(response.data);
          
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

  useEffect(() => {
    const loadDepartmentsAndCities = async () => {
      try {
        const deptResponse = await getAllDepartments();
        setDepartments(deptResponse.data || []);

        const cityResponse = await getCitiesByDepartment();
        setCities(cityResponse.data || []);
        setFilteredCities([]);
      } catch (error) {
        console.error('Error loading departments and cities:', error);
      }
    };

    loadDepartmentsAndCities();
  }, []);

  useEffect(() => {
    const loadAddress = async () => {
      if (profile?.address && cities.length > 0) {
        try {
          const addressResponse = await getAddressById(profile.address);
          const addressData = addressResponse.data;
          if (addressData && addressData.cityID) {
            const cityID = parseInt(addressData.cityID, 10);
            if (!isNaN(cityID) && cities.find(c => c.id === cityID)) {
              setSelectedCityId(cityID);
              const selectedCity = cities.find(c => c.id === cityID);
              if (selectedCity) {
                setSelectedDepartmentId(selectedCity.departmentID);
                setAddress(addressData.street);
                setPostalCode(addressData.postalCode);
                // Cargar ciudades del departamento
                try {
                  const cityResponse = await getCitiesByDepartmentId(selectedCity.departmentID);
                  setFilteredCities(cityResponse.data || []);
                } catch (error) {
                  console.error('Error cargando ciudades del departamento:', error);
                  setFilteredCities([]);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error cargando dirección existente:', error);
        }
      }
    };

    loadAddress();
  }, [profile, cities]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const onDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0];
      setEditedProfile(prev => ({ 
        ...prev, 
        birthDate: formattedDate 
      }));
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const DatePickerInput = () => (
    <View className="mb-4">
      <Text className="text-white text-base mb-2">
        Fecha de nacimiento
      </Text>
      
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
      
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}
    </View>
  );

  const handleSaveAddress = async () => {
    if (!userId || !selectedCityId) {
      Alert.alert('Error', 'Por favor selecciona una ciudad');
      return;
    }

    try {
      // Crear la dirección
      const addressResponse = await createAddress({
        cityID: selectedCityId,
        street: address,
        postalCode: postalCode,
      });

      if (addressResponse.success && addressResponse.data) {
        const newAddressId = addressResponse.data;

        // Actualizar la dirección del usuario
        await updateUserAddress(userId, newAddressId);

        // Recargar el perfil para mostrar la nueva dirección
        const profileResponse = await getUserProfile(userId);
        setProfile(profileResponse.data);

        setShowAddressModal(false);
        Alert.alert('Éxito', 'Dirección actualizada correctamente');
      } else {
        Alert.alert('Error', addressResponse.message || 'Error al crear la dirección');
      }
    } catch (error: any) {
      console.error('Error guardando dirección:', error);
      Alert.alert('Error', error.message || 'Error al guardar la dirección');
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    let updated = false;
    let errors: string[] = [];

    try {
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

  const handleDeactivateAccount = async () => {
    if (!userId) return;

    Alert.alert(
      'Desactivar Cuenta',
      '¿Estás seguro que deseas desactivar tu cuenta? Esta acción es reversible.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desactivar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deactivateUserAccount(userId);
              Alert.alert('Éxito', 'Cuenta desactivada correctamente');
              // Perhaps navigate to login or something
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Error al desactivar la cuenta');
            }
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
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ 
          paddingHorizontal: 24, 
          paddingTop: 64, 
          paddingBottom: 120 
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center mb-8">
          <LinearGradient
            colors={['#8B5CF6', '#3B82F6']}
            className="w-24 h-24 rounded-full justify-center items-center mb-4"
          >
            <Text className="text-white text-3xl font-bold">
              {profile?.fullName?.charAt(0).toUpperCase() || '?'}
            </Text>
          </LinearGradient>
          <Text className="text-white text-2xl font-bold text-center">
            {profile?.fullName || 'Usuario'}
          </Text>
        </View>

        {profile && (
          <View className="space-y-4">
            <Input
              label="Teléfono"
              value={editedProfile.telephone || ''}
              onChangeText={(value) => setEditedProfile(prev => ({ ...prev, telephone: value }))}
              keyboardType="phone-pad"
            />

            <DatePickerInput />

            {/* Card de Dirección */}
            <View className="mb-4">
              <Text className="text-white text-base mb-2">
                Dirección
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setFilteredCities([]);
                  setShowAddressModal(true);
                }}
                className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-4"
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    {selectedDepartmentId || selectedCityId || address || postalCode ? (
                      <>
                        <Text className="text-white text-base font-semibold mb-1">
                          {selectedCityId ? cities[selectedCityId - 1]?.name : 'Ciudad'}
                        </Text>
                        <Text className="text-gray-400 text-sm">
                          {address || 'Dirección'}
                        </Text>
                        {postalCode && (
                          <Text className="text-gray-400 text-sm mt-1">
                            CP: {postalCode}
                          </Text>
                        )}
                      </>
                    ) : (
                      <Text className="text-gray-400 text-base">
                        Agregar dirección
                      </Text>
                    )}
                  </View>
                  <Text className="text-purple-400 text-2xl ml-2">›</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View className="pt-4 space-y-3">
              <Button label="Guardar Cambios" onPress={handleSave} />
              <TouchableOpacity
                onPress={handleDeactivateAccount}
                className="bg-orange-600/20 border border-orange-600/50 py-3 rounded-lg"
                style={{ borderRadius: 25 }}
              >
                <Text className="text-orange-400 text-center font-semibold text-base">
                  Desactivar Cuenta
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                className="bg-red-600 py-3 rounded-lg"
                style={{ borderRadius: 25 }}
              >
                <Text className="text-white text-center font-semibold text-base">
                  Cerrar Sesión
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal Elegante para Dirección */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', width: '90%', borderRadius: 16, padding: 20 }}>
            
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 15 }}>
              <View style={{ width: 40, height: 4, backgroundColor: '#ccc', borderRadius: 2, marginBottom: 5 }} />
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Editar Dirección</Text>
            </View>

            {/* Departamento */}
            <Text style={{ fontSize: 14, marginBottom: 6, color: '#555' }}>Departamento</Text>
            <View style={{ backgroundColor: '#f3f4f6', borderRadius: 10, paddingHorizontal: 12 }}>
              <Picker
                selectedValue={selectedDepartmentId != null ? selectedDepartmentId.toString() : null}
                onValueChange={async (itemValue) => {
                  console.log('onValueChange departamento:', itemValue);
                  const numValue = itemValue ? parseInt(itemValue, 10) : null;
                  console.log('numValue departamento:', numValue);
                  setSelectedDepartmentId(numValue);
                  setSelectedCityId(null); // Reset city
                  if (numValue) {
                    console.log('Llamando getCitiesByDepartmentId para departamento:', numValue);
                    try {
                      const cityResponse = await getCitiesByDepartmentId(numValue);
                      console.log('Respuesta de ciudades:', cityResponse);
                      setFilteredCities(cityResponse.data || []);
                      console.log('filteredCities set:', cityResponse.data?.length || 0);
                    } catch (error) {
                      console.error('Error cargando ciudades:', error);
                      setFilteredCities([]);
                    }
                  } else {
                    setFilteredCities([]);
                  }
                }}
                style={{ height: 50, color: '#333' }}
              >
                <Picker.Item label="Seleccionar departamento" value={null} />
                {departments.map((dept, index) => (
                  <Picker.Item key={`dept-${index}`} label={dept.name} value={dept.id.toString()} />
                ))}
              </Picker>
            </View>

            {/* Ciudad */}
            <Text style={{ fontSize: 14, marginBottom: 6, color: '#555' }}>Ciudad</Text>
            <View style={{ backgroundColor: '#f3f4f6', borderRadius: 10, paddingHorizontal: 12 }}>
              <Picker
                selectedValue={selectedCityId != null ? selectedCityId.toString() : "0"}
                onValueChange={(itemValue) => {
                  const numValue = itemValue && itemValue !== "0" ? parseInt(itemValue, 10) : null;
                  setSelectedCityId(numValue);
                  if (numValue) {
                    const selectedCity = filteredCities[numValue - 1];
                    if (selectedCity) {
                      setSelectedDepartmentId(selectedCity.departmentID);
                    }
                  } else {
                    setSelectedCityId(null);
                  }
                }}
                style={{ height: 50, color: '#333' }}
              >
                <Picker.Item label="Seleccionar ciudad" value="0" />
                {filteredCities.map((city, index) => (
                  <Picker.Item key={`city-${index}`} label={city.name} value={city.id ? city.id.toString() : (index + 1).toString()} />
                ))}
              </Picker>
            </View>

            {/* Dirección */}
            <Text style={{ fontSize: 14, marginBottom: 6, marginTop: 12, color: '#555' }}>Dirección</Text>
            <View style={{ backgroundColor: '#f3f4f6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Ej: Calle 10 #5-20"
                multiline
                numberOfLines={2}
                style={{ color: '#333', fontSize:14}}
                placeholderTextColor="#999"
              />
            </View>

            {/* Código Postal */}
            <Text style={{ fontSize: 14, marginBottom: 6, marginTop: 12, color: '#555' }}>Código Postal</Text>
            <View style={{ backgroundColor: '#f3f4f6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}>
              <TextInput
                value={postalCode}
                onChangeText={setPostalCode}
                placeholder="Ej: 050001"
                style={{ color: '#333', fontSize: 16 }}
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            {/* Botones */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 }}>
              <TouchableOpacity
                onPress={() => setShowAddressModal(false)}
                style={{ flex: 1, marginRight: 8, backgroundColor: '#f87171', paddingVertical: 12, borderRadius: 10 }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveAddress}
                style={{ flex: 1, marginLeft: 8, backgroundColor: '#3b82f6', paddingVertical: 12, borderRadius: 10 }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}