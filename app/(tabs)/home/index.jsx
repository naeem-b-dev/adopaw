import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import FilterButton from "../../../src/features/home/components/filter_button";
import PetCard from "../../../src/features/home/components/pet_card";
import PetsCategories from "../../../src/features/home/components/pets_categories";
import SearchBar from "../../../src/features/home/components/search_bar";
import { fonts, fontSizes } from "../../../src/theme/fonts";



export default function Chats() {
  const userName = "Alexi";
  const theme = useTheme();
  const { t } = useTranslation("home");
  const [searchQuery, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const router = useRouter();
  const pets = [
    {
      id: "1",
      name: "Bella",
      image: "https://placekitten.com/400/300",
      age: "2y",
      breed: "Persian Cat",
      gender: "female",
      distance: "5 km",
    },
    {
      id: "2",
      name: "Max",
      image: "https://placekitten.com/401/301",
      age: "1y",
      breed: "Golden Retriever",
      gender: "male",
      distance: "12 km",
    },
    {
      id: "1",
      name: "ella",
      image: "https://placekitten.com/400/300",
      age: "2y",
      breed: "Persian Cat",
      gender: "female",
      distance: "5 km",
    },
    {
      id: "2",
      name: "Maxim",
      image: "https://placekitten.com/401/301",
      age: "1y",
      breed: "Golden Retriever",
      gender: "male",
      distance: "12 km",
    },
    {
      id: "1",
      name: "adth",
      image: "https://placekitten.com/400/300",
      age: "2y",
      breed: "Persian Cat",
      gender: "female",
      distance: "5 km",
    },
    {
      id: "2",
      name: "aetrgh",
      image: "https://placekitten.com/401/301",
      age: "1y",
      breed: "Golden Retriever",
      gender: "male",
      distance: "12 km",
    },
    {
      id: "1",
      name: "Beaethlla",
      image: "https://placekitten.com/400/300",
      age: "2y",
      breed: "Persian Cat",
      gender: "female",
      distance: "5 km",
    },
    {
      id: "2",
      name: "MaaertghEx",
      image: "https://placekitten.com/401/301",
      age: "1y",
      breed: "Golden Retriever",
      gender: "male",
      distance: "12 km",
    },
    {
      id: "1",
      name: "aeth",
      image: "https://placekitten.com/400/300",
      age: "2y",
      breed: "Persian Cat",
      gender: "female",
      distance: "5 km",
    },
    {
      id: "2",
      name: "AERTHG",
      image: "https://placekitten.com/401/301",
      age: "1y",
      breed: "Golden Retriever",
      gender: "male",
      distance: "12 km",
    },
    {
      id: "1",
      name: "Belsrthjla",
      image: "https://placekitten.com/400/300",
      age: "2y",
      breed: "Persian Cat",
      gender: "female",
      distance: "5 km",
    },
    {
      id: "2",
      name: "Masrhx",
      image: "https://placekitten.com/401/301",
      age: "1y",
      breed: "Golden Retriever",
      gender: "male",
      distance: "12 km",
    },
  ];

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
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 12 }}
        renderItem={({ item }) => (
          <PetCard
            pet={item}
            onPress={() => router.push(`/home/${item.id}`)}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 12 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  filterButton: {
    marginLeft: 8,
  },  
  container: {
    flex: 1,
    padding: 16,
  },
});
