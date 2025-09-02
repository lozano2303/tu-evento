import { StatusBar } from "expo-status-bar";
import "./global.css";
import AppNavigator from './src/navigation/AppNavigation';

export default function App() {
  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}