import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";

const categories = [
  { key: "cat", label: "Cat", icon: require("../../../assets/icons/cat.png") },
  { key: "dog", label: "Dog", icon: require("../../../assets/icons/dog.png") },
  { key: "rabbit", label: "Rabbit", icon: require("../../../assets/icons/rabbit.png") },
  { key: "fish", label: "Fish", icon: require("../../../assets/icons/fish.png") },
  { key: "bird", label: "Bird", icon: require("../../../assets/icons/bird.png") },
  { key: "hamster", label: "Hamster", icon: require("../../../assets/icons/hamster.png") },
];

export default function PetsCategories({ selected, onSelect, style }) {
  const theme = useTheme();
  const { t } = useTranslation("home");

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContainer, style]}
    >
      {categories.map(cat => {
        const isSelected = selected === cat.key;
        return (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.button,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primary
                      : theme.colors.background,
                    borderColor: isSelected
                      ? theme.colors.primary
                      : theme.colors.onSurface,
                  },
                ]}
                onPress={() => onSelect(isSelected ? null : cat.key)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={cat.icon}
                  size={28}
                  color={isSelected ? "#fff" : theme.colors.onSurface}
                />
                <Text
                  style={{
                    color: isSelected ? "#fff" : theme.colors.onSurface,
                    marginTop: 4,
                  }}
                  variant="labelMedium"
                >
                  {t(cat.key, cat.label)}
                </Text>
              </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 8,
  },
  button: {
    width: 80,          
    height: 80,         
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderRadius: 16,
    borderWidth: 1.5, 
  },
});