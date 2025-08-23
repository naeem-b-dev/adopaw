import { useLocalSearchParams } from "expo-router";
import { debounce } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPets } from "../../../src/features/home/api/pets";
import FilterButton from "../../../src/features/home/components/filter_button";
import PetsCategories from "../../../src/features/home/components/pets_categories";
import SearchBar from "../../../src/features/home/components/search_bar";
import { useTranslationLoader } from "../../../src/localization/hooks/useTranslationLoader";
import PetsList from "../../../src/shared/components/ui/PetsList/PetsList";

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
});
