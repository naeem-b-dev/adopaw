import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import DraggableBottomSheet from "../../../src/features/map/components/DraggableBottomSheet";
import LocationCategories, { locationCategories } from "../../../src/features/map/components/LocationCategories";
import MapCanvas from "../../../src/features/map/components/MapCanvas";
import { NearestPlacesList } from "../../../src/features/map/components/PlaceCard";
import RecenterButton from "../../../src/features/map/components/RecenterButton";
import places from "../../../src/features/map/data/places.json";
import { useCurrentLocation } from "../../../src/features/map/hooks/useCurrentLocation";
import { updateUserLocation } from "../../../src/shared/services/locationService";

export default function MapPage() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { region, setRegion, coords, loading, error, recenter } = useCurrentLocation();
  const [q, setQ] = useState("");
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const filteredMarkers = useMemo(() => {
    const query = q.trim().toLowerCase();
    
    // Filter by search query
    let basePlaces = places;
    if (query) {
      basePlaces = places.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.description?.toLowerCase().includes(query)) ||
        (p.category?.toLowerCase().includes(query))
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      basePlaces = basePlaces.filter(p => 
        p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Add category color information to each place
    const placesWithColors = basePlaces.map(place => {
      const categoryInfo = locationCategories.find(cat => cat.key === place.category);
      return {
        ...place,
        categoryColor: categoryInfo?.color || "#757575",
        categoryIcon: categoryInfo?.icon || "map-marker"
      };
    });
    
    // Add current location marker if coordinates are available
    const markersWithLocation = [...placesWithColors];
    if (coords) {
      markersWithLocation.push({
        id: "current-location",
        latitude: coords.latitude,
        longitude: coords.longitude,
        name: "📍 Your Location",
        description: "Your current location",
        isCurrentLocation: true
      });
    }
    
    return markersWithLocation;
  }, [q, coords, selectedCategory]);

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

  // Handle place card press - center map on selected place
  const handlePlacePress = (place) => {
    panTo(place.latitude, place.longitude, 0.01);
  };

  // Extract only the place data (without current location marker) for the places list
  const placesForList = useMemo(() => {
    return filteredMarkers.filter(marker => !marker.isCurrentLocation);
  }, [filteredMarkers]);

  return (
    <View style={styles.container}>
      {/* Full Screen Map */}
      <MapCanvas region={region || undefined} onRegionChange={setRegion} markers={filteredMarkers} />
      
      {/* Map Overlay Controls */}
      <SafeAreaView style={styles.mapOverlay}>
        <TextInput
          mode="outlined"
          value={q}
          onChangeText={setQ}
          placeholder="Search places"
          style={{ height: 48, backgroundColor: "#fff" }}
          outlineStyle={{ borderRadius: 16, borderWidth: 1 }}
          left={<TextInput.Icon icon="magnify" />}
          right={<TextInput.Icon icon="close" onPress={() => { setQ(""); setSelectedCategory(null); recenter(); }} />}
          returnKeyType="search"
          onSubmitEditing={() => {
            if (filteredMarkers.length > 0) {
              const f = filteredMarkers[0];
              panTo(f.latitude, f.longitude, 0.02);
            }
          }}
        />
        
        <LocationCategories
          selected={selectedCategory}
          onSelect={setSelectedCategory}
          style={{ marginTop: 12, marginBottom: 8 }}
        />
      </SafeAreaView>

      <RecenterButton
        onPress={async () => {
          setUpdatingLocation(true);
          try {
            // First recenter the map
            await recenter();
            // Then update the user's profile location (without showing alert)
            await updateUserLocation(false);
          } finally {
            setUpdatingLocation(false);
          }
        }}
        style={{ position: "absolute", right: 16, bottom: 200 + insets.bottom }}
        disabled={updatingLocation}
        loading={updatingLocation}
      />

      {loading && <View style={styles.loader}><ActivityIndicator /></View>}
      {error ? (
        <View style={styles.error}>
          <Text variant="labelMedium" style={{ color: theme.colors.error }}>{error}</Text>
        </View>
      ) : null}

      {/* Draggable Bottom Sheet with Places List */}
      <DraggableBottomSheet>
        <NearestPlacesList
          places={placesForList}
          userLocation={coords}
          selectedCategory={selectedCategory}
          onPlacePress={handlePlacePress}
        />
      </DraggableBottomSheet>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  mapOverlay: {
    position: "absolute",
    top: 8,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  loader: { position: "absolute", top: 16, alignSelf: "center", zIndex: 1001 },
  error: { position: "absolute", top: 70, alignSelf: "center", zIndex: 1001 },
});
