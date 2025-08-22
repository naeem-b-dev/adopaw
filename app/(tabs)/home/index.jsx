import { useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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
  const [selectedCategory, setSelectedCategory] = useState(null);

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

  // ✅ filters passed into PetsList
  const filters = useMemo(
    () => {
      const filterObj = {
        category: selectedCategory ?? (params.category || null),
        age: params.age || null,
        size: params.size || null,
        gender: params.gender || null,
        activity: params.activity || null,
        distance: params.distance ? Number(params.distance) : null,
        search: debouncedSearchQuery.trim() ? debouncedSearchQuery.trim() : null,
      };
      
      console.log("🎯 Filters object created:", filterObj);
      return filterObj;
    },
    [selectedCategory, params, debouncedSearchQuery]
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
          onSelect={setSelectedCategory}
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
