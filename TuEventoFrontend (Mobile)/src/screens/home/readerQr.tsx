import { View, Text, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { CameraView, Camera } from "expo-camera";
import Button from "../../components/common/Button";
import { cancelTicket, getTicketById } from "../../api/services/ticket";
import { getEventById } from "../../api/services/EventApi";
import { getUserIdFromToken } from "../../api/services/Token";
import { useNavigation } from "@react-navigation/native";

export default function QrScannerScreen() {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [dataQR, setDataQR] = useState<string | null>(null);
  const [canCancel, setCanCancel] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    setScanned(true);
    const ticketId = data.split(":")[1];
    setDataQR(ticketId);

    // Check if user can cancel this ticket
    setCheckingPermission(true);
    try {
      const ticketResult = await getTicketById(ticketId);
      if (ticketResult.success && ticketResult.data) {
        const eventResult = await getEventById(ticketResult.data.eventId);
        if (eventResult) {
          const currentUserId = await getUserIdFromToken();
          const eventCreatorId = eventResult.userID.userID;
          setCanCancel(currentUserId === eventCreatorId);
        } else {
          setCanCancel(false);
        }
      } else {
        setCanCancel(false);
      }
    } catch (error) {
      console.log('Error checking ticket permission:', error);
      setCanCancel(false);
    } finally {
      setCheckingPermission(false);
    }
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
          {scanned ? (checkingPermission ? "Verificando permisos..." : canCancel ? "Si el pago está completado, oprime el botón para confirmar" : "No tienes permiso para cancelar este ticket") : "Asegúrate de ubicar bien la cámara"}
        </Text>
        {scanned && !checkingPermission && (
          <View style={{ marginTop: 20, width: "80%" }}>
            <Button label="Escanear de nuevo" onPress={() => { setScanned(false); setCanCancel(false); setDataQR(null); setCheckingPermission(false); }} />
            {canCancel && (
              <Button label="Confirmar pago" onPress={async () => {
                if (dataQR) {
                  const result = await cancelTicket(dataQR);
                  if (result.success) {
                    alert("✅ Ticket cancelado con éxito");
                    navigation.goBack();
                  } else {
                    alert("❌ " + result.message);
                  }
                }
              }} />
            )}
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
