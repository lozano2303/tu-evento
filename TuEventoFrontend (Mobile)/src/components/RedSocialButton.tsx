import React from 'react';
import { TouchableOpacity, Text, View, Alert } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import * as WebBrowser from 'expo-web-browser';

// Esto es OBLIGATORIO para Expo
WebBrowser.maybeCompleteAuthSession();

interface RedSocialButtonProps {
  social: "google" | "facebook";
  onSuccess?: (userData: any) => void;
  onError?: (error: any) => void;
}

const icons = {
  google: { name: "google", color: "#EA4335", label: "Google" },
  facebook: { name: "facebook-f", color: "#1877F3", label: "Facebook" },
};

// 🔥 Tu IP correcta
const BASE_URL = 'http://192.168.249.235:8080';

export default function RedSocialButton({ social, onSuccess, onError }: RedSocialButtonProps) {
  const { name, color, label } = icons[social];

  const handleOAuthLogin = async () => {
    try {
      console.log(`🚀 [${social.toUpperCase()}] Iniciando OAuth...`);
      
      // 1. URL de tu backend Spring Boot
      const authUrl = `${BASE_URL}/oauth2/authorization/${social}`;
      console.log(`🌐 [${social.toUpperCase()}] Auth URL:`, authUrl);
      
      // 2. Redirect URI simple para Expo
      const redirectUri = 'https://auth.expo.io/@anonymous/your-app-slug';
      console.log(`📍 [${social.toUpperCase()}] Redirect URI:`, redirectUri);
      
      // 3. Abrir el navegador OAuth
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri
      );
      
      console.log(`📋 [${social.toUpperCase()}] Resultado completo:`, JSON.stringify(result, null, 2));
      
      // 4. Procesar el resultado
      if (result.type === 'success') {
        console.log(`✅ [${social.toUpperCase()}] ¡Login exitoso!`);
        console.log(`🔗 [${social.toUpperCase()}] URL de respuesta:`, result.url);
        
        onSuccess?.(result);
        Alert.alert(
          '🎉 ¡Éxito!', 
          `Has iniciado sesión con ${label} correctamente`,
          [{ text: 'Continuar', style: 'default' }]
        );
        
      } else if (result.type === 'cancel') {
        console.log(`⚠️ [${social.toUpperCase()}] Cancelado por el usuario`);
        // No mostrar alerta para cancelación (es comportamiento normal)
        
      } else {
        console.log(`❌ [${social.toUpperCase()}] Resultado no exitoso:`, result.type);
        onError?.(result);
        Alert.alert(
          '❌ Error', 
          `No se pudo completar el login con ${label}`,
          [{ text: 'Reintentar', style: 'default' }]
        );
      }
      
    } catch (error) {
      console.error(`💥 [${social.toUpperCase()}] Error inesperado:`, error);
      onError?.(error);
      Alert.alert(
        '💥 Error de Conexión', 
        `No se pudo conectar con ${label}. Verifica tu internet y que el servidor esté funcionando.`,
        [{ text: 'OK', style: 'cancel' }]
      );
    }
  };

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