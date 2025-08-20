import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { Text, useTheme } from "react-native-paper";
import InputLabel from "../InputLabel/InputLabel";
import MapPickerModal from "../../../../features/addPet/Components/MapPicker/MapPickerModal";
import MapPicker from "../../../../features/addPet/Components/MapPicker/MapPicker";
import { getReadableAddress } from "../../../../features/home/utils/getReadbleAddress";
import LocationInput from "../../../../features/auth/components/LocationInput/LocationInput";
export default function LocationPreview({
  location,
  setLocation,
  editable = false,
}) {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [address, setAddress] = useState("Loading...");
  const latitude =
    location?.geoJson?.coordinates?.[1] ?? location?.coordinates?.[1] ?? 0;

  const longitude =
    location?.geoJson?.coordinates?.[0] ?? location?.coordinates?.[0] ?? 0;

  useEffect(() => {
    if (latitude != null && longitude != null) {
      (async () => {
        const readable = await getReadableAddress(latitude, longitude);
        setAddress(readable);
      })();
    } else {
      setAddress("Unknown location");
    }
  }, [latitude, longitude]);
  return (
    <View>
      {location && (
        <View style={{ marginTop: 12 }}>
          <MapView
            style={{ height: 200, borderRadius: 12, overflow: "hidden" }}
            region={{
              latitude,
              longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker
              coordinate={{
                latitude,
                longitude,
              }}
              description={address}
            />
          </MapView>

          {/* Address & Actions */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginTop: 8,
              paddingHorizontal: 4,
            }}
          >
            <Ionicons
              name="location-outline"
              size={24}
              color={theme.colors.onSurface}
            />
            <Text variant="bodyMedium" style={{ flex: 1 }}>
              {address}
            </Text>

            {editable && (
              <View style={{ flexDirection: "row", gap: 4 }}>
                <TouchableOpacity
                  onPress={() => setModalVisible(true)}
                  style={{
                    backgroundColor: theme.colors.primary,
                    padding: 12,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="pencil"
                    size={16}
                    color={theme.colors.surface}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setLocation(null)}
                  style={{
                    backgroundColor: theme.colors.error,
                    padding: 12,
                    borderRadius: 8,
                    alignItems: "center",
                    marginStart: 8,
                  }}
                >
                  <Ionicons
                    name="trash"
                    size={16}
                    color={theme.colors.surface}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Only show when editing */}
      {editable && (
        <>
          <LocationInput onLocationRetrieved={setLocation} />
          <MapPicker onPress={() => setModalVisible(true)} />
          <MapPickerModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onSubmit={setLocation}
          />
        </>
      )}
    </View>
  );
}
