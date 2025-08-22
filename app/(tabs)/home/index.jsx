import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import { debounce } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, RefreshControl, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPets } from "../../../src/features/home/api/pets";
import FilterButton from "../../../src/features/home/components/filter_button";
import PetsCategories from "../../../src/features/home/components/pets_categories";
import SearchBar from "../../../src/features/home/components/search_bar";
import { useTranslationLoader } from "../../../src/localization/hooks/useTranslationLoader";
import PetsList from "../../../src/shared/components/ui/PetsList/PetsList";

// Function to update user location
const updateUserLocation = async () => {
  try {
    console.log("📍 Starting location update...");
    
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("📍 Location permission denied");
      Alert.alert("Location Permission", "Please enable location permission to get accurate results.");
      return false;
    }

    console.log("📍 Getting current position with high accuracy...");
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation, // Highest accuracy
      timeout: 15000, // 15 seconds timeout
      maximumAge: 0, // Don't use cached location
    });

    const coords = [loc.coords.longitude, loc.coords.latitude];
    const geoJson = {
      type: "Point",
      coordinates: coords,
    };

    console.log("📍 Location obtained:", {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      accuracy: loc.coords.accuracy,
      altitude: loc.coords.altitude,
      heading: loc.coords.heading,
      speed: loc.coords.speed,
    });

    // Get current profile
    const profileJson = await AsyncStorage.getItem("user-profile");
    if (profileJson) {
      const profile = JSON.parse(profileJson);
      
      // Update location in profile
      const updatedProfile = {
        ...profile,
        location: geoJson,
      };

      // Save updated profile
      await AsyncStorage.setItem("user-profile", JSON.stringify(updatedProfile));
      console.log("📍 User location updated successfully:", coords);
      
      // Show success message
      Alert.alert(
        "Location Updated", 
        `Your location has been updated to:\nLatitude: ${loc.coords.latitude.toFixed(6)}\nLongitude: ${loc.coords.longitude.toFixed(6)}\nAccuracy: ${loc.coords.accuracy ? `${loc.coords.accuracy.toFixed(1)}m` : 'Unknown'}`
      );
      
      return true;
    } else {
      console.log("📍 No user profile found");
      Alert.alert("Error", "No user profile found. Please complete your profile first.");
      return false;
    }
  } catch (error) {
    console.error("📍 Error updating location:", error);
    Alert.alert("Location Error", `Failed to get location: ${error.message}`);
    return false;
  }
};

export default function Home() {
  const { colors } = useTheme();
  const { t } = useTranslationLoader("home");
  const params = useLocalSearchParams();
  const userName = "Alexi"; // Add the missing userName variable

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Local filter states for bidirectional sync
  const [localSelectedCategory, setLocalSelectedCategory] = useState(null);
  const [localSelectedAge, setLocalSelectedAge] = useState(null);
  const [localSelectedSize, setLocalSelectedSize] = useState(null);
  const [localSelectedGender, setLocalSelectedGender] = useState(null);
  const [localSelectedActivity, setLocalSelectedActivity] = useState(null);
  const [localDistance, setLocalDistance] = useState(null);

  // Refresh state
  const [refreshing, setRefreshing] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query) => {
      setDebouncedSearchQuery(query);
    }, 500),
    []
  );

  // Handle search input
  const handleSearchChange = (text) => {
    setSearchQuery(text);
    debouncedSearch(text);
    console.log("🔍 Search input changed:", text);
  };

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Update location first
      await updateUserLocation();
      // Refetch pets data
      await refetch();
    } catch (error) {
      console.error("❌ Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Sync filters from filter page
  useEffect(() => {
    console.log("🔄 Filter sync effect triggered with params:", params);
    
    if (params.category) {
      console.log("🔄 Category synced from filter page:", params.category);
      setLocalSelectedCategory(params.category);
    } else {
      console.log("🔄 No category param found in filter page params");
    }
    
    if (params.age) {
      console.log("🔄 Age synced from filter page:", params.age);
      setLocalSelectedAge(params.age);
    } else {
      console.log("🔄 No age param found in filter page params");
    }
    
    if (params.size) {
      console.log("🔄 Size synced from filter page:", params.size);
      setLocalSelectedSize(params.size);
    } else {
      console.log("🔄 No size param found in filter page params");
    }
    
    if (params.gender) {
      console.log("🔄 Gender synced from filter page:", params.gender);
      setLocalSelectedGender(params.gender);
    } else {
      console.log("🔄 No gender param found in filter page params");
    }
    
    if (params.activity) {
      console.log("🔄 Activity synced from filter page:", params.activity);
      setLocalSelectedActivity(params.activity);
    } else {
      console.log("🔄 No activity param found in filter page params");
    }
    
    if (params.distance) {
      console.log("🔄 Distance synced from filter page:", params.distance);
      setLocalDistance(params.distance);
    } else {
      console.log("🔄 No distance param found in filter page params");
    }
  }, [params]);

  // Create filters object
  const filters = useMemo(() => {
    const filterObj = {
      search: debouncedSearchQuery,
      category: localSelectedCategory,
      age: localSelectedAge,
      size: localSelectedSize,
      gender: localSelectedGender,
      activity: localSelectedActivity,
      distance: localDistance,
    };
    console.log("🎯 Filters object created:", filterObj);
    return filterObj;
  }, [
    debouncedSearchQuery,
    localSelectedCategory,
    localSelectedAge,
    localSelectedSize,
    localSelectedGender,
    localSelectedActivity,
    localDistance,
  ]);

  // Fetch pets with infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["pets", "infinite", JSON.stringify(filters)],
    queryFn: ({ pageParam = 1 }) => fetchPets(filters, pageParam, 10),
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNextPage) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    keepPreviousData: false,
    refetchOnWindowFocus: false,
  });

  // Flatten all pets from all pages
  const allPets = useMemo(() => {
    return data?.pages?.flatMap((page) => page.items) || [];
  }, [data]);

  // Handle category selection
  const handleCategorySelect = (category) => {
    console.log("🐾 Category selected in home:", category);
    setLocalSelectedCategory(category);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* ✅ Keep your header + search + categories */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <Text
          style={{
            color: colors.onSurface,
            marginBottom: 4,
          }}
          variant="bodyLarge"
        >
          {t("greeting", { userName })}
        </Text>

        <Text
          style={{
            color: colors.text,
          }}
          variant="displayLarge"
        >
          {t("mainMessage")}
        </Text>

        <View style={styles.searchRow}>
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearchChange}
            style={[styles.searchBar, { flex: 1 }]}
          />
          <TouchableOpacity
            onPress={async () => {
              setUpdatingLocation(true);
              try {
                const success = await updateUserLocation();
                if (success) {
                  // Refetch pets data with new location
                  await refetch();
                }
              } finally {
                setUpdatingLocation(false);
              }
            }}
            style={styles.locationButton}
            disabled={updatingLocation}
          >
            <Ionicons 
              name={updatingLocation ? "location-outline" : "location"} 
              size={24} 
              color={updatingLocation ? colors.outline : colors.primary} 
            />
          </TouchableOpacity>
          <FilterButton style={styles.filterButton} />
        </View>

        <PetsCategories
          selected={localSelectedCategory}
          onSelect={handleCategorySelect}
          style={{ marginTop: 8, marginBottom: 12 }}
        />
      </View>

      {/* ✅ Replaced FlatList with PetsList */}
      <PetsList
        pets={allPets}
        filters={filters}
        onLoadMore={fetchNextPage}
        hasNextPage={hasNextPage}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        error={error}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchRow: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  filterButton: { marginLeft: 8 },
  locationButton: {
    marginLeft: 8,
    padding: 8,
  },
});
