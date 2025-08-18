import { Platform, StyleSheet } from "react-native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";

const FALLBACK = {
  latitude: 33.8938,
  longitude: 35.5018,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapCanvas({ region, onRegionChange, markers = [] }) {
  return (
    <MapView
      style={styles.map}
      {...(Platform.OS === "android" ? { provider: PROVIDER_GOOGLE } : {})}
      initialRegion={FALLBACK}
      {...(region ? { region } : {})}
      onRegionChangeComplete={onRegionChange}
      showsUserLocation
      moveOnMarkerPress={false}
    >
      {markers.map((m) => (
        <Marker
          key={m.id}
          coordinate={{ latitude: m.latitude, longitude: m.longitude }}
          title={m.name}
          description={m.description}
        >
          <Callout>
            <>
              {/* Minimal callout; can be customized later */}
            </>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}
const styles = StyleSheet.create({ map: { flex: 1 } });
