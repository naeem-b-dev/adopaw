import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import FilterButton from "../../../src/features/home/components/filter_button";
import PetsCategories from "../../../src/features/home/components/pets_categories";
import SearchBar from "../../../src/features/home/components/search_bar";
import { useTranslationLoader } from "../../../src/localization/hooks/useTranslationLoader";
import PetsList from "../../../src/shared/components/ui/PetsList/PetsList";

export default function Home() {
  const params = useLocalSearchParams(); // { category, age, size, gender, activity, distance }
  const userName = "Alexi";
  const theme = useTheme();
  const { t } = useTranslationLoader("home");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  
  // Local filter states that can be changed independently
  const [localSelectedCategory, setLocalSelectedCategory] = useState(null);
  const [localSelectedAge, setLocalSelectedAge] = useState(null);
  const [localSelectedSize, setLocalSelectedSize] = useState(null);
  const [localSelectedGender, setLocalSelectedGender] = useState(null);
  const [localSelectedActivity, setLocalSelectedActivity] = useState(null);
  const [localDistance, setLocalDistance] = useState(150);
  
  // Sync all filters from filter page params when they change
  useEffect(() => {
    console.log("🔄 Filter sync effect triggered with params:", params);
    
    if (params.category) {
      console.log("🔄 Category synced from filter page:", params.category);
      setLocalSelectedCategory(params.category);
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
    }
    if (params.gender) {
      console.log("🔄 Gender synced from filter page:", params.gender);
      setLocalSelectedGender(params.gender);
    }
    if (params.activity) {
      console.log("🔄 Activity synced from filter page:", params.activity);
      setLocalSelectedActivity(params.activity);
    }
    if (params.distance) {
      console.log("🔄 Distance synced from filter page:", params.distance);
      setLocalDistance(Number(params.distance));
    }
  }, [params.category, params.age, params.size, params.gender, params.activity, params.distance]);
  
  // Determine which filters to use: local selection takes priority
  const selectedCategory = localSelectedCategory;
  const selectedAge = localSelectedAge;
  const selectedSize = localSelectedSize;
  const selectedGender = localSelectedGender;
  const selectedActivity = localSelectedActivity;
  const selectedDistance = localDistance;

  // Debounced search effect
  const debounceSearch = useCallback((query) => {
    const timeoutId = setTimeout(() => {
      console.log("⏰ Debounced search query updated:", query);
      setDebouncedSearchQuery(query);
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, []);

  // Handle search input changes
  const handleSearchChange = useCallback((text) => {
    console.log("🔤 Search input changed:", text);
    setSearchQuery(text);
    debounceSearch(text);
  }, [debounceSearch]);

  // Handle category selection in home page
  const handleCategorySelect = useCallback((category) => {
    console.log("🐾 Home page category selected:", category);
    setLocalSelectedCategory(category);
  }, []);

  // ✅ filters passed into PetsList
  const filters = useMemo(
    () => {
      const filterObj = {
        // All filters from local selection (can be changed independently)
        category: selectedCategory,
        age: selectedAge,
        size: selectedSize,
        gender: selectedGender,
        activity: selectedActivity,
        distance: selectedDistance,
        
        // Search: from search bar
        search: debouncedSearchQuery.trim() ? debouncedSearchQuery.trim() : null,
      };
      
      console.log("🎯 Filters object created:", filterObj);
      console.log("📋 Filter sources:", {
        category: selectedCategory ? `"${selectedCategory}" (local)` : 'none',
        age: selectedAge ? `"${selectedAge}" (local)` : 'none',
        size: selectedSize ? `"${selectedSize}" (local)` : 'none',
        gender: selectedGender ? `"${selectedGender}" (local)` : 'none',
        activity: selectedActivity ? `"${selectedActivity}" (local)` : 'none',
        distance: selectedDistance ? `${selectedDistance}km (local)` : 'none',
        search: debouncedSearchQuery.trim() || 'none'
      });
      
      return filterObj;
    },
    [selectedCategory, selectedAge, selectedSize, selectedGender, selectedActivity, selectedDistance, debouncedSearchQuery]
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* ✅ Keep your header + search + categories */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <Text
          style={{
            color: theme.colors.onSurface,
            marginBottom: 4,
          }}
          variant="bodyLarge"
        >
          {t("greeting", { userName })}
        </Text>

        <Text
          style={{
            color: theme.colors.text,
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
          <FilterButton style={styles.filterButton} />
        </View>

        <PetsCategories
          selected={selectedCategory}
          onSelect={handleCategorySelect}
          style={{ marginTop: 8, marginBottom: 12 }}
        />
      </View>

      {/* ✅ Replaced FlatList with PetsList */}
      <PetsList
        filters={filters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchRow: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  filterButton: { marginLeft: 8 },
});
