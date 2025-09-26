import { View, Text, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { CameraView, Camera } from "expo-camera";
import Button from "../../components/common/Button";
import { useNavigation } from "@react-navigation/native";

export default function QrScannerScreen() {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [dataQR, setDataQR] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    setScanned(true);
    setDataQR(data);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Solicitando permiso a la cámara...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>No tienes acceso a la cámara</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Cámara ocupando toda la pantalla */}
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={{ flex: 1 }}
      />

      {/* Overlay transparente */}
      <View style={styles.overlay}>
        <Text style={styles.text}>
          {scanned ? `Si el pago esta completado oplime el boton para confirmar` : "Asegurate de ubicar bien la camara"}
        </Text>

        {scanned && (
          <View style={{ marginTop: 20, width: "80%" }}>
            <Button label="Escanear de nuevo" onPress={() => setScanned(false)} />
            <Button label="Confirmar pago" onPress={() => navigation.goBack()} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: "#1a0033",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, // cubre toda la cámara
    backgroundColor: "rgba(0,0,0,0.3)", // transparente oscuro
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 40,
  },
  text: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.57)", // transparente oscuro
    padding: 9,
    borderRadius: 10,
    margin: 15,
  },
});
