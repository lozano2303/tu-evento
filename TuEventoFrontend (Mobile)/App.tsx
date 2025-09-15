import { StatusBar } from "expo-status-bar";
import "./global.css";
import AppNavigator from './src/navigation/AppNavigation';
import * as WebBrowser from 'expo-web-browser';

// Esto debe estar ANTES de cualquier componente
WebBrowser.maybeCompleteAuthSession();

export default function App() {
  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}