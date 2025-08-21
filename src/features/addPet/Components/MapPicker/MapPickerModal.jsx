import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  View
} from "react-native";
import { WebView } from "react-native-webview";

export default function MapPickerModal({ visible, onClose, onSubmit }) {
  const [initialRegion, setInitialRegion] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visible) return;

    (async () => {
      setLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          alert("Permission denied");
          onClose();
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setInitialRegion(region);
        setSelectedLocation({
          latitude: region.latitude,
          longitude: region.longitude,
        });
      } catch (e) {
        console.error("Location error", e);
        alert("Error getting location");
        onClose();
      } finally {
        setLoading(false);
      }
    })();
  }, [visible]);

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const handleSubmit = async () => {
    if (!selectedLocation) return;

    try {
      const geocode = await Location.reverseGeocodeAsync(selectedLocation);
      const address = geocode?.[0];
      const readable = address
        ? `${address.city || address.region || ""}, ${address.country || ""}`
        : "Unknown location";

      const geoJson = {
        type: "Point",
        coordinates: [selectedLocation.longitude, selectedLocation.latitude],
      };

      onSubmit({ geoJson, readable });
    } catch (err) {
      console.error("Reverse geocode failed:", err);
      alert("Error getting address");
    }

    onClose();
  };

  const html = initialRegion ? `<!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; }
        .leaflet-control-attribution { display: none; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        const RNW = window.ReactNativeWebView;
        const CENTER = { lat: ${initialRegion?.latitude ?? 0}, lng: ${initialRegion?.longitude ?? 0} };
        const map = L.map('map', { zoomControl: true }).setView([CENTER.lat, CENTER.lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 20,
          minZoom: 1,
          attribution: ''
        }).addTo(map);
        let marker = L.marker([CENTER.lat, CENTER.lng], { draggable: false }).addTo(map);
        function sendSelected(lat, lng){
          if (RNW && RNW.postMessage) RNW.postMessage(JSON.stringify({ type: 'selected', payload: { latitude: lat, longitude: lng } }));
        }
        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng(e.latlng);
          sendSelected(lat, lng);
        });
      </script>
    </body>
  </html>` : null;

  const handleWebMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.type === 'selected') {
        const { latitude, longitude } = data.payload || {};
        setSelectedLocation({ latitude, longitude });
      }
    } catch {}
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {loading || !initialRegion ? (
          <ActivityIndicator size="large" style={{ marginTop: 50 }} />
        ) : (
          <>
            <WebView
              originWhitelist={["*"]}
              source={{ html }}
              style={styles.map}
              onMessage={handleWebMessage}
              javaScriptEnabled
              domStorageEnabled
            />
            <View style={styles.controls}>
              <Pressable style={styles.iconButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#fff" />
              </Pressable>
              <Pressable style={styles.submitButton} onPress={handleSubmit}>
                <Ionicons name="checkmark" size={24} color="#fff" />
              </Pressable>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 30,
  },
  submitButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 30,
  },
});
