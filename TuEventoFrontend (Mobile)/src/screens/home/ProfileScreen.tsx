import { View, Text, Image, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { getUserIdFromToken, removeToken } from '../../api/services/Token';
import { getUserProfile, updateUserPhone } from '../../api/services/UserApi';
import { IUserProfile } from '../../api/types/IUser';
import Input from "../../components/common/Input";
import Button from '../../components/common/Button';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editedProfile, setEditedProfile] = useState<Partial<IUserProfile>>({});
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const fetchedUserId = await getUserIdFromToken();
        if (fetchedUserId) {
          setUserId(fetchedUserId);
          const response = await getUserProfile(fetchedUserId);
          setProfile(response.data);
          setEditedProfile(response.data);
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

  const handleSave = async () => {
    if (!userId || !editedProfile.telephone) {
      Alert.alert('Error', 'Por favor, ingresa un número de teléfono válido.');
      return;
    }
    try {
      const newPhone = parseInt(editedProfile.telephone, 10);
      if (isNaN(newPhone)) {
        Alert.alert('Error', 'El teléfono debe ser un número válido.');
        return;
      }
      await updateUserPhone({ id: userId, newTelephone: newPhone });
      setProfile(prev => prev ? { ...prev, telephone: editedProfile.telephone! } : null);
      Alert.alert('Éxito', 'Los datos han sido actualizados correctamente.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo actualizar el teléfono.');
    }
  };

  const handleLogout = async () => {
    await removeToken();
    navigation.navigate('LoginScreen' as never);
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
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#1a0033] justify-center items-center">
      <View className="px-6 w-full h-full relative top-12" style={{ marginTop: 180 }}>
        <Text className="text-white text-2xl font-bold mb-6 text-center mt-4">Perfil del Usuario </Text>
        {profile && (
          <View>
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
            <Input
              label="Fecha de nacimiento"
              value={editedProfile.birthDate || ''}
              onChangeText={(value) => setEditedProfile(prev => ({ ...prev, birthDate: value }))}
            />
            <Input
              label="Dirección"
              value={editedProfile.address || ''}
              onChangeText={(value) => setEditedProfile(prev => ({ ...prev, address: value }))}
            />
            <Button label="Guardar Cambios" onPress={handleSave} />
            <Button label="Cerrar Sesión" onPress={handleLogout} />
          </View>
        )}
      </View>

    </View>
  );
}