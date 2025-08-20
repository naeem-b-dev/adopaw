import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Chats() {
  const [region, setRegion] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profileString = await AsyncStorage.getItem("user-profile");
        if (!profileString) return;

        const profile = JSON.parse(profileString);
        const [longitude, latitude] = profile?.location?.coordinates || [];

        if (latitude && longitude) {
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  if (!region) return null; // or a loading spinner

  return (
    <MapView provider={PROVIDER_GOOGLE} style={{ flex: 1 }} region={region}>
      <Marker
        coordinate={{ latitude: region.latitude, longitude: region.longitude }}
      />
    </MapView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
});
