import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import { locationCategories } from "./LocationCategories";

const getCategoryLabel = (categoryKey) => {
  const category = locationCategories.find(cat => cat.key === categoryKey);
  return category?.label || categoryKey;
};

const getDistanceFromCoords = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

export default function PlaceCard({ place, userLocation, onPress }) {
  const theme = useTheme();
  
  // Find category info for styling
  const categoryInfo = locationCategories.find(cat => cat.key === place.category);
  const categoryColor = categoryInfo?.color || "#757575";
  const categoryIcon = categoryInfo?.icon || "📍";
  
  // Calculate distance if user location is available
  let distance = null;
  if (userLocation && place.latitude && place.longitude) {
    distance = getDistanceFromCoords(
      userLocation.latitude,
      userLocation.longitude,
      place.latitude,
      place.longitude
    );
  }

  return (
    <TouchableOpacity onPress={() => onPress?.(place)} activeOpacity={0.7}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <View style={[styles.categoryIcon, { backgroundColor: categoryColor }]}>
                <Text style={styles.iconText}>{categoryIcon}</Text>
              </View>
              <View style={styles.titleContainer}>
                <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
                  {place.name}
                </Text>
                <Text variant="bodySmall" style={[styles.category, { color: categoryColor }]}>
                  {categoryInfo?.label || place.category}
                </Text>
              </View>
            </View>
            {distance && (
              <View style={styles.distanceContainer}>
                <Text variant="bodySmall" style={[styles.distance, { color: theme.colors.primary }]}>
                  {formatDistance(distance)}
                </Text>
              </View>
            )}
          </View>
          
          {place.description && (
            <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
              {place.description}
            </Text>
          )}
          
          <View style={styles.footer}>
            <View style={styles.rating}>
              <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                4.5 • 120 reviews
              </Text>
            </View>
            <Text variant="bodySmall" style={[styles.status, { color: "#4caf50" }]}>
              Open now
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

export function NearestPlacesList({ places, userLocation, selectedCategory, onPlacePress }) {
  const theme = useTheme();
  
  // Sort by distance if user location is available (places are already filtered by category)
  const sortedPlaces = [...places].sort((a, b) => {
    if (!userLocation) return 0;
    
    const distanceA = getDistanceFromCoords(
      userLocation.latitude, userLocation.longitude,
      a.latitude, a.longitude
    );
    const distanceB = getDistanceFromCoords(
      userLocation.latitude, userLocation.longitude,
      b.latitude, b.longitude
    );
    
    return distanceA - distanceB;
  });
  
  // Take only the nearest 10 places
  const nearestPlaces = sortedPlaces.slice(0, 10);

  if (nearestPlaces.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          No places found in this category
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text variant="headlineSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {selectedCategory ? `Nearest ${getCategoryLabel(selectedCategory)}` : 'Nearest places'}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {nearestPlaces.length} places found
        </Text>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      >
        {nearestPlaces.map((place, index) => (
          <PlaceCard
            key={place.id || index}
            place={place}
            userLocation={userLocation}
            onPress={onPlacePress}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 4,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 12,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "600",
    marginBottom: 2,
  },
  category: {
    fontWeight: "500",
    textTransform: "capitalize",
  },
  distanceContainer: {
    alignItems: "flex-end",
  },
  distance: {
    fontWeight: "600",
    fontSize: 16,
  },
  description: {
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
  },
  stars: {
    fontSize: 12,
    marginRight: 6,
  },
  status: {
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
});
