import { StatusBar } from "expo-status-bar";
import "./global.css";
import AppNavigator from './src/navigation/AppNavigation';
import * as WebBrowser from 'expo-web-browser';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


WebBrowser.maybeCompleteAuthSession();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}