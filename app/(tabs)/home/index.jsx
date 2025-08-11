import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchPets } from "../../../src/features/home/api/pets";
import FilterButton from "../../../src/features/home/components/filter_button";
import PetCard from "../../../src/features/home/components/pet_card";
import PetsCategories from "../../../src/features/home/components/pets_categories";
import SearchBar from "../../../src/features/home/components/search_bar";
import { fonts, fontSizes } from "../../../src/theme/fonts";

export default function Chats() {
  const params = useLocalSearchParams(); // { category, age, size, gender, activity, distance }
  const userName = "Alexi";
  const theme = useTheme();
  const { t } = useTranslation("home");

  const [searchQuery, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();
  const controllerRef = useRef(null);

  // merge category chip + filter page + search
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

  const load = async () => {
    controllerRef.current?.abort();
    const ac = new AbortController();
    controllerRef.current = ac;
    setLoading(true);
    setError(null);
    try {
      const { items } = await fetchPets(filters, ac.signal);
      setPets(items);
    } catch (e) {
      if (e.name !== "AbortError") setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  };

  // initial + whenever filters change
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Text
        style={{
          fontFamily: fonts.light,
          fontSize: fontSizes.bodyLarge,
          color: theme.colors.onSurface,
          marginBottom: 4,
        }}
      >
        {t("greeting", { userName })}
      </Text>
      <Text
        style={{
          fontFamily: fonts.bold,
          fontSize: fontSizes.displayLarge,
          color: theme.colors.text,
          fontWeight: "bold",
        }}
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        <PetsCategories
          selected={selectedCategory}
          onSelect={setSelectedCategory}
          style={{ marginTop: 7, marginBottom: 50 }}
        />
      </ScrollView>

      {error ? (
        <Text style={{ textAlign: "center", marginTop: 16, color: theme.colors.error }}>
          {error}
        </Text>
      ) : null}

      <FlatList
  data={pets}
  keyExtractor={(item, index) => String(item.id ?? item._id ?? index)}
  numColumns={2}
  columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 12 }}
  renderItem={({ item }) => (
    <PetCard
      pet={item}
      onPress={() => router.push(`/home/${item.id ?? item._id}`)}
    />
  )}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingVertical: 12 }}
  refreshing={loading}
  onRefresh={load}
  ListHeaderComponent={
    <Text style={{ textAlign: "center", marginVertical: 8 }}>
      {`Found ${pets.length} pets`}
    </Text>
  }
  ListEmptyComponent={
    !loading && !error ? (
      <Text style={{ textAlign: "center", marginTop: 24 }}>
        {t("noResults", "No pets found")}
      </Text>
    ) : null
  }
  ListFooterComponent={
    loading ? (
      <Text style={{ textAlign: "center", marginVertical: 12 }}>
        {t("loading", "Loading…")}
      </Text>
    ) : null
  }
/>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  filterButton: { marginLeft: 8 },
  container: { flex: 1, padding: 16 },
  categoriesScroll: { paddingRight: 8 },
});
