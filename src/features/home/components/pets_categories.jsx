import { useTranslation } from "react-i18next";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
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
      {categories.map((cat) => {
        const isSelected = selected === cat.key;
        return (
          <TouchableOpacity
            key={cat.key}
            activeOpacity={0.85}
            onPress={() => onSelect(isSelected ? null : cat.key)}
            style={[
              styles.pill,
              {
                borderColor: isSelected ? theme.colors.primary : theme.colors.outlineVariant,
                backgroundColor: isSelected ? "#E8F2FF" : theme.colors.surface,
              },
            ]}
          >
            <View style={styles.pillInner}>
              <Image source={cat.icon} style={styles.icon} resizeMode="contain" />
              <Text
                variant="labelMedium"
                style={{ color: isSelected ? theme.colors.primary : theme.colors.onSurface }}
                numberOfLines={1}
              >
                {t(cat.key, cat.label)}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { paddingHorizontal: 4, gap: 10 },
  pill: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    justifyContent: "center",
  },
  pillInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  icon: { width: 20, height: 20 },
});
