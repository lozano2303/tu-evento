import React, { useState } from 'react';
import { View, Text, Image, Alert, Modal, TouchableOpacity, ScrollView } from 'react-native';
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

import { registerUser } from '../../api/services/UserApi';
import { useNavigation } from "@react-navigation/native";

export default function RegisterScreen() {
  const navigation = useNavigation();

  //  Función para manejar login exitoso con redes sociales
  const handleOAuthSuccess = (authData: any) => {
    console.log(' OAuth exitoso - Navegando a EvenList');
    console.log(' Datos recibidos:', authData);
    
    // Navegar directamente a la lista de eventos
    navigation.navigate("MainTabs" as never);
  };

  //  Función para manejar errores (opcional)
  const handleOAuthError = (error: any) => {
    console.log(' Error en OAuth:', error);
    // Aquí podrías mostrar un mensaje de error si quieres
  };

  // Estado para capturar los datos del formulario
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Función para actualizar los campos
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  //  FUNCIÓN MODIFICADA - Ahora captura el userId de la respuesta
  const handleRegister = async () => {
    try {
      setLoading(true);

      // Preparar datos para enviar al API
      const userData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      console.log(' Intentando registrar usuario...');
      console.log(' Datos enviados:', userData);
      
      // Llamar al API y obtener la respuesta completa
      const responseData = await registerUser(userData);
      
      console.log(' Registro exitoso - Respuesta completa:', responseData);
      
      if (responseData.success) {
        //  AQUÍ CAPTURAMOS EL ID DEL USUARIO
        const userId = responseData.data; 
        
        console.log(' ID del usuario capturado:', userId);
        console.log(' Email del usuario:', formData.email);
        
        // Navegar directamente a verificación con parámetros
        console.log(' Navegando a verificación con parámetros:');
        console.log('   - userId:', userId);
        console.log('   - email:', formData.email);

        // Navegación sin tipos estrictos
        (navigation as any).navigate("CodeVerificationScreenRegister", {
          userId: userId,
          email: formData.email
        });
      }

    } catch (error: any) {
      console.error(' Error en el registro:', error);
      Alert.alert(
        'Error al Registrarse',
        error.message || 'No se pudo crear la cuenta. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#1a0033] justify-center items-center">
      <View className="px-6 w-full h-full relative top-12" style={{ marginTop: 180 }}>
        {/* Título de crear cuenta*/}
        <Text className="text-white text-2xl font-bold text-center">Crea tu cuenta</Text>
        
        {/* Inputs con funcionalidad */}
        <Input
          label="Nombre completo"
          placeholder="Ingresa tu nombre completo"
          value={formData.fullName}
          onChangeText={(value) => updateField('fullName', value)}
        />
        
        <Input
          label="Correo Electrónico"
          placeholder="example@gmail.com"
          value={formData.email}
          onChangeText={(value) => updateField('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <Input
          label="Contraseña"
          placeholder="Crea una contraseña"
          value={formData.password}
          onChangeText={(value) => updateField('password', value)}
          secureTextEntry
        />
        
        {/* Botón con funcionalidad */}
        <Button 
          label={loading ? "Registrando..." : "Siguiente"}
          onPress={handleRegister}
          disabled={loading}
        />
        
        {/* Línea divisoria */}
        <Text className="text-white text-sm text-center my-6">
          _______________________________________________________
        </Text>
        
      
        {/* Terminos y condiciones */}
        <Text className="text-white text-base text-center mt-4 px-4">
          Al crear una cuenta, aceptas nuestros{" "}
          <TouchableOpacity onPress={() => setShowTermsModal(true)}>
            <Text style={{ color: '#B06CFF' }} className="font-semibold">Términos y condiciones</Text>
          </TouchableOpacity>
        </Text>
      </View>

      {/* Modal de Términos y Condiciones */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white rounded-2xl w-11/12 max-h-5/6">
            {/* Header */}
            <View className="bg-purple-500 rounded-t-2xl p-4">
              <Text className="text-lg font-bold text-white text-center">
                Términos y Condiciones de Uso
              </Text>
            </View>

            {/* Contenido scrollable */}
            <ScrollView className="p-4 max-h-96">
              <Text className="text-sm text-gray-700 mb-4">
                <Text className="font-semibold">Última actualización:</Text> 2/10/2025
              </Text>

              <Text className="text-sm text-gray-700 mb-4 font-semibold">
                1. Aceptación de los términos
              </Text>
              <Text className="text-sm text-gray-700 mb-4">
                Al acceder, registrarse o utilizar la aplicación "Tu Evento" (en su versión web o Android),
                desarrollada por CapySoft, el usuario acepta expresamente los presentes Términos y Condiciones.
                Si no está de acuerdo, deberá abstenerse de utilizar la plataforma.
              </Text>

              <Text className="text-sm text-gray-700 mb-4 font-semibold">
                2. Definiciones
              </Text>
              <Text className="text-sm text-gray-700 mb-2">
                • <Text className="font-semibold">Aplicación / Plataforma:</Text> Hace referencia a "Tu Evento" en su versión web y móvil.
              </Text>
              <Text className="text-sm text-gray-700 mb-2">
                • <Text className="font-semibold">Usuario:</Text> Persona que accede y utiliza la aplicación, ya sea como asistente u organizador.
              </Text>
              <Text className="text-sm text-gray-700 mb-2">
                • <Text className="font-semibold">Organizador:</Text> Usuario autorizado para crear, administrar y publicar eventos en la plataforma.
              </Text>
              <Text className="text-sm text-gray-700 mb-2">
                • <Text className="font-semibold">Asistente:</Text> Usuario que reserva, comenta o participa en eventos.
              </Text>
              <Text className="text-sm text-gray-700 mb-4">
                • <Text className="font-semibold">Administrador:</Text> Usuario con permisos especiales de validación y gestión dentro del sistema.
              </Text>

              <Text className="text-sm text-gray-700 mb-4 font-semibold">
                3. Uso de la plataforma
              </Text>
              <Text className="text-sm text-gray-700 mb-2">
                • El acceso a la aplicación requiere conexión estable a Internet.
              </Text>
              <Text className="text-sm text-gray-700 mb-2">
                • Los usuarios deben registrarse con datos verídicos.
              </Text>
              <Text className="text-sm text-gray-700 mb-4">
                • El sistema no gestiona pagos en línea; la confirmación de pagos se realiza directamente con los organizadores.
              </Text>

              <Text className="text-sm text-gray-700 mb-4 font-semibold">
                4. Registro y cuentas
              </Text>
              <Text className="text-sm text-gray-700 mb-2">
                • El usuario debe crear una cuenta con correo válido y contraseña segura.
              </Text>
              <Text className="text-sm text-gray-700 mb-2">
                • Es posible el registro mediante redes sociales (Google/Facebook) a través de OAuth.
              </Text>
              <Text className="text-sm text-gray-700 mb-2">
                • Cada usuario es responsable de mantener la confidencialidad de sus credenciales.
              </Text>
              <Text className="text-sm text-gray-700 mb-4">
                • El usuario puede solicitar la eliminación definitiva de su cuenta.
              </Text>

              <Text className="text-sm text-gray-700 mb-4 font-semibold">
                5. Reservas y tickets
              </Text>
              <Text className="text-sm text-gray-700 mb-2">
                • Los asistentes pueden reservar asientos para eventos disponibles.
              </Text>
              <Text className="text-sm text-gray-700 mb-2">
                • La reserva quedará en estado pendiente hasta la validación física del pago por parte del organizador.
              </Text>
              <Text className="text-sm text-gray-700 mb-2">
                • Una vez confirmado el pago, se generará un código QR único e intransferible que servirá como comprobante de acceso al evento.
              </Text>
              <Text className="text-sm text-gray-700 mb-4">
                • El mal uso, duplicación o falsificación de códigos QR será motivo de denegación de acceso.
              </Text>

              <Text className="text-sm text-gray-700 mb-4 font-semibold">
                6. Responsabilidades del usuario
              </Text>
              <Text className="text-sm text-gray-700 mb-2">
                • Hacer un uso correcto y lícito de la plataforma.
              </Text>
              <Text className="text-sm text-gray-700 mb-2">
                • No utilizar la aplicación para difundir información falsa, ofensiva o ilícita.
              </Text>
              <Text className="text-sm text-gray-700 mb-4">
                • No manipular ni intentar vulnerar la seguridad del sistema.
              </Text>

              <Text className="text-sm text-gray-700 mb-4 font-semibold">
                7. Limitación de responsabilidades
              </Text>
              <Text className="text-sm text-gray-700 mb-4">
                CapySoft no se hace responsable de:
              </Text>
              <Text className="text-sm text-gray-700 mb-2">
                • Fallas de conexión a Internet del usuario.
              </Text>
              <Text className="text-sm text-gray-700 mb-2">
                • Información falsa proporcionada por organizadores o asistentes.
              </Text>
              <Text className="text-sm text-gray-700 mb-2">
                • Cancelaciones o cambios en eventos ajenos al control de la plataforma.
              </Text>
              <Text className="text-sm text-gray-700 mb-4">
                La aplicación se ofrece "tal cual", sin garantía de disponibilidad ininterrumpida.
              </Text>

              <Text className="text-sm text-gray-700 mb-4 font-semibold">
                8. Seguridad y privacidad
              </Text>
              <Text className="text-sm text-gray-700 mb-4">
                No somos responsables de los eventos que publicas, los documentos que subas o los contenidos que compartas.
              </Text>
              <Text className="text-sm text-gray-700 mb-2">
                • Se implementan medidas de seguridad como autenticación de dos pasos (en registro normal) y validación de credenciales.
              </Text>
              <Text className="text-sm text-gray-700 mb-4">
                • En inicios de sesión con redes sociales, la seguridad dependerá del proveedor externo.
              </Text>

              <Text className="text-sm text-gray-700 mb-4 font-semibold">
                9. Propiedad intelectual
              </Text>
              <Text className="text-sm text-gray-700 mb-4">
                Queda prohibida la reproducción, distribución o modificación sin autorización expresa.
              </Text>

              <Text className="text-sm text-gray-700 mb-4 font-semibold">
                10. Modificaciones
              </Text>
              <Text className="text-sm text-gray-700 mb-4">
                CapySoft se reserva el derecho de modificar los presentes Términos y Condiciones en cualquier momento.
                Los cambios entrarán en vigor desde su publicación en la aplicación.
              </Text>

              <Text className="text-sm text-gray-700 mb-4 font-semibold">
                11. Legislación aplicable
              </Text>
              <Text className="text-sm text-gray-700 mb-4">
                Los presentes términos se regirán por las leyes vigentes en Colombia, sin perjuicio de la normativa aplicable
                en el país de residencia del usuario.
              </Text>
            </ScrollView>

            {/* Footer */}
            <View className="flex-row justify-end p-4 border-t border-gray-200">
              <TouchableOpacity
                onPress={() => setShowTermsModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                <Text className="text-sm text-gray-700">Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Imagen de curva en la parte inferior */}
      <Image
        source={require("assets/images/curve.png")}
        className="absolute bottom-0"
        resizeMode="cover"
      />
    </View>
  );
}