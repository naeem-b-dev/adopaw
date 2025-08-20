import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import FilterButton from "../../../src/features/home/components/filter_button";
import PetsCategories from "../../../src/features/home/components/pets_categories";
import SearchBar from "../../../src/features/home/components/search_bar";
import { useTranslationLoader } from "../../../src/localization/hooks/useTranslationLoader";
import PetsList from "../../../src/shared/components/ui/PetsList/PetsList";
import { getAuthToken } from "../../../src/shared/services/supabase/getters";

export default function Home() {
  const params = useLocalSearchParams(); // { category, age, size, gender, activity, distance }
  const userName = "Alexi";
  const theme = useTheme();
  const { t } = useTranslationLoader("home");

  const [searchQuery, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ✅ filters passed into PetsList
  const filters = useMemo(
    () => ({
      category: selectedCategory ?? (params.category || null),
      age: params.age || null,
      size: params.size || null,
      gender: params.gender || null,
      activity: params.activity || null,
      distance: params.distance ? Number(params.distance) : null,
      search: searchQuery.trim() ? searchQuery.trim() : null,
    }),
    [selectedCategory, params, searchQuery]
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
            onChangeText={setSearch}
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
        fetchUrl={`${process.env.EXPO_PUBLIC_BACKEND_API_URL}/pet/`}
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
