import { StyleSheet } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

const FALLBACK = {
  latitude: 33.8938,
  longitude: 35.5018,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapCanvas({ region, onRegionChange }) {
  return (
    <MapView
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      initialRegion={FALLBACK}
      {...(region ? { region } : {})}
      onRegionChangeComplete={onRegionChange}
      showsUserLocation
      moveOnMarkerPress={false}
    />
  );
}
const styles = StyleSheet.create({ map: { flex: 1 } });
