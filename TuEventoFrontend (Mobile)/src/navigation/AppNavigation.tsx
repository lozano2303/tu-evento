import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import CodeVerificationScreenRegister from '../screens/auth/CodeVerificationScreenRegister';
import CodeVerifcationForgotPassword from '../screens/auth/CodeVerifcationForgotPassword';
import NewPasswordScreen from '../screens/auth/NewPasswordScreen';
import EvenList from '../screens/home/EvenListScreen';
import ReaderQr from '../screens/home/readerQr';
import ProfileScreen from '../screens/home/ProfileScreen';
import EventDetail from '../components/events/EventDetail';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack navigator for the Home tab
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EvenList" component={EvenList} />
      <Stack.Screen name="EventDetail" component={EventDetail} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
    const loadOrganizerStatus = async () => {
      try {
        const organizerStatus = await AsyncStorage.getItem('isOrganizer');
        setIsOrganizer(organizerStatus === 'true');
      } catch (error) {
        console.log('Error loading organizer status:', error);
      }
    };
    loadOrganizerStatus();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#000000ff' },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#888888',
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      {isOrganizer && (
        <Tab.Screen
          name="Lector Qr"
          component={ReaderQr}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="qr-code-outline" size={size} color={color} />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
        <Stack.Screen name="CodeVerificationScreenRegister" component={CodeVerificationScreenRegister} />
        <Stack.Screen name="CodeVerifcationForgotPassword" component={CodeVerifcationForgotPassword} />
        <Stack.Screen name="NewPasswordScreen" component={NewPasswordScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}