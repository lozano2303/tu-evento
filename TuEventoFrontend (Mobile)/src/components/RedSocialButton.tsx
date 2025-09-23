import React from 'react';
import { TouchableOpacity, Text, View, Alert } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

interface RedSocialButtonProps {
  social: "google" | "facebook";
  onSuccess?: (userData: any) => void;
  onError?: (error: any) => void;
  iconOnly?: boolean; 
}

const icons = {
  google: { name: "google", color: "#EA4335", label: "Google" },
  facebook: { name: "facebook-f", color: "#1877F3", label: "Facebook" },
};

// IP correcta
const BASE_URL = 'http://192.168.0.16:8080';

export default function RedSocialButton({ social, onSuccess, onError, iconOnly = false }: RedSocialButtonProps) {
  const { name, color, label } = icons[social];

  const handleOAuthLogin = async () => {
    try {
      console.log(`[${social.toUpperCase()}] Iniciando OAuth...`);
      
      const authUrl = `${BASE_URL}/oauth2/authorization/${social}`;
      console.log(`[${social.toUpperCase()}] Auth URL:`, authUrl);
 
      const redirectUri = 'https://auth.expo.io/@anonymous/your-app-slug';
      console.log(`[${social.toUpperCase()}] Redirect URI:`, redirectUri);
      
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri
      );
      
      console.log(`[${social.toUpperCase()}] Resultado completo:`, JSON.stringify(result, null, 2));
      

      if (result.type === 'success') {
        console.log(`[${social.toUpperCase()}] ¡Login exitoso!`);
        console.log(`[${social.toUpperCase()}] URL de respuesta:`, result.url);
        
        onSuccess?.(result);
        Alert.alert(
          '¡Éxito!',
          `Has iniciado sesión con ${label} correctamente`,
          [{ text: 'Continuar', style: 'default' }]
        );
        
      } else if (result.type === 'cancel') {
        console.log(`[${social.toUpperCase()}] Cancelado por el usuario`);
        
      } else {
        console.log(`[${social.toUpperCase()}] Resultado no exitoso:`, result.type);
        onError?.(result);
        Alert.alert(
          'Error',
          `No se pudo completar el login con ${label}`,
          [{ text: 'Reintentar', style: 'default' }]
        );
      }
      
    } catch (error) {
      console.error(`[${social.toUpperCase()}] Error inesperado:`, error);
      onError?.(error);
      Alert.alert(
        'Error de Conexión',
        `No se pudo conectar con ${label}. Verifica tu internet y que el servidor esté funcionando.`,
        [{ text: 'OK', style: 'cancel' }]
      );
    }
  };

  if (iconOnly) {
    return (
      <TouchableOpacity
        onPress={handleOAuthLogin}
        activeOpacity={0.8}
        style={{
          width: 56,
          height: 56,
          backgroundColor: 'rgba(55, 65, 81, 0.5)',
          borderRadius: 28,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: 'rgba(156, 163, 175, 0.3)'
        }}
      >
        <FontAwesome name={name as any} size={24} color={color} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handleOAuthLogin}
      activeOpacity={0.8}
      style={{ marginTop: 24 }}
    >
      <View className="flex-row items-center border border-gray-200 rounded-full px-4 py-2 bg-white/10">
        <FontAwesome name={name as any} size={20} color={color} />
        <Text className="ml-2 text-white font-semibold text-center flex-1">
          Continuar con {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}