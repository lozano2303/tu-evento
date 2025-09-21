import { View, Text } from 'react-native';
import { useState, useEffect } from 'react';
import { getUserIdFromToken } from '../../api/services/Token';
import { getUserProfile } from '../../api/services/UserApi';
import { IUserProfile } from '../../api/types/IUser';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editedProfile, setEditedProfile] = useState<Partial<IUserProfile>>({});

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userId = await getUserIdFromToken();
        if (userId) {
          const response = await getUserProfile(userId);
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
    <View className="flex-1 bg-[#1a0033] p-6">
      <Text className="text-white text-3xl font-bold mb-6 text-center">Perfil del Usuario</Text>
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
          <Button label="Guardar Cambios" onPress={() => {}} />
        </View>
      )}
    </View>
  );
}