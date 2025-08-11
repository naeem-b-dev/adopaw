import { useTranslation } from "react-i18next";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

const categories = [
  { key: "cat", label: "Cat", icon: require("../../../assets/images/animal/cat.png") },
  { key: "dog", label: "Dog", icon: require("../../../assets/images/animal/dog.png") },
  { key: "rabbit", label: "Rabbit", icon: require("../../../assets/images/animal/rabbit.png") },
  { key: "fish", label: "Fish", icon: require("../../../assets/images/animal/fish.png") },
  { key: "bird", label: "Bird", icon: require("../../../assets/images/animal/bird.png") },
  { key: "hamster", label: "Hamster", icon: require("../../../assets/images/animal/hamster.png") },
];

export default function PetsCategories({ selected, onSelect, style }) {
  const theme = useTheme();
  const { t } = useTranslation("home");

  const blue = theme.colors.palette.blue;
  const neutral = theme.colors.palette.neutral;
  const radius = theme.custom?.radii?.lg ?? 16; // rounded-rect (not full pill)

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContainer, style]}
    >
      {categories.map((cat, idx) => {
        const isSelected = selected === cat.key;
        return (
          <TouchableOpacity
            key={cat.key}
            activeOpacity={0.85}
            onPress={() => onSelect(isSelected ? null : cat.key)}
            style={[
              styles.item,
              {
                borderRadius: radius,
                borderColor: isSelected ? blue[500] : neutral[300],
                backgroundColor: isSelected ? blue[100] : theme.colors.surface,
                marginRight: idx === categories.length - 1 ? 0 : 10, // fallback if gap not supported
              },
            ]}
          >
            <View style={styles.inner}>
              <Image source={cat.icon} style={styles.icon} resizeMode="contain" />
              <Text
                numberOfLines={1}
                style={{
                  color: theme.colors.onSurface,
                  fontFamily: theme.fonts.titleSmall.fontFamily,
                  fontSize: theme.fonts.titleSmall.fontSize,
                  lineHeight: theme.fonts.titleSmall.lineHeight,
                }}
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
  scrollContainer: {
    paddingHorizontal: 4,
  },
  item: {
    height: 44,                 // more rectangle feel (vs oval)
    paddingHorizontal: 14,
    borderWidth: 1,
    justifyContent: "center",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: { width: 22, height: 22, marginRight: 8 },
});
