import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import MapCanvas from "../../../src/features/map/components/MapCanvas";
import RecenterButton from "../../../src/features/map/components/RecenterButton";
import places from "../../../src/features/map/data/places.json";
import { useCurrentLocation } from "../../../src/features/map/hooks/useCurrentLocation";

export default function MapPage() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { region, setRegion, loading, error, recenter } = useCurrentLocation();
  const [q, setQ] = useState("");
  const filteredMarkers = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return places;
    return places.filter(p =>
      p.name.toLowerCase().includes(query) ||
      (p.description?.toLowerCase().includes(query)) ||
      (p.category?.toLowerCase().includes(query))
    );
  }, [q]);

  // Smoothly pan/zoom the map by updating region (WebView listens and updates instantly)
  const panTo = (lat, lng, delta = 0.015) => {
    setRegion(r => ({
      ...(r || {}),
      latitude: lat,
      longitude: lng,
      latitudeDelta: delta,
      longitudeDelta: delta,
    }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={StyleSheet.absoluteFill}>
        <MapCanvas region={region || undefined} onRegionChange={setRegion} markers={filteredMarkers} />
      </View>

      <View style={{ paddingTop: 8, paddingHorizontal: 16 }}>
        <TextInput
          mode="outlined"
          value={q}
          onChangeText={setQ}
          placeholder="Search places"
          style={{ height: 48, backgroundColor: "#fff" }}
          outlineStyle={{ borderRadius: 16, borderWidth: 1 }}
          left={<TextInput.Icon icon="magnify" />}
          right={<TextInput.Icon icon="close" onPress={() => { setQ(""); recenter(); }} />}
          returnKeyType="search"
          onSubmitEditing={() => {
            if (filteredMarkers.length > 0) {
              const f = filteredMarkers[0];
              panTo(f.latitude, f.longitude, 0.02);
            }
          }}
        />
      </View>

      <RecenterButton
        onPress={recenter}
        style={{ position: "absolute", right: 16, bottom: 90 + insets.bottom }}
      />

      {loading && <View style={styles.loader}><ActivityIndicator /></View>}
      {error ? (
        <View style={styles.error}>
          <Text variant="labelMedium" style={{ color: theme.colors.error }}>{error}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { position: "absolute", top: 16, alignSelf: "center" },
  error: { position: "absolute", top: 70, alignSelf: "center" },
});
