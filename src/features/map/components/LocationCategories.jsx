import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

const locationCategories = [
  { 
    key: "veterinary", 
    label: "Veterinary", 
    icon: "⚕️",
    color: "#e91e63",
    description: "Vet clinics and hospitals"
  },
  { 
    key: "petstore", 
    label: "Pet Stores", 
    icon: "🏪",
    color: "#ff9800",
    description: "Pet supplies and food"
  },
  { 
    key: "shelter", 
    label: "Shelters", 
    icon: "🏠",
    color: "#4caf50",
    description: "Animal shelters and rescues"
  },
  { 
    key: "grooming", 
    label: "Grooming", 
    icon: "✂️",
    color: "#9c27b0",
    description: "Pet grooming services"
  },
  { 
    key: "emergency", 
    label: "Emergency", 
    icon: "🚑",
    color: "#f44336",
    description: "24/7 emergency services"
  },
  { 
    key: "training", 
    label: "Training", 
    icon: "🎓",
    color: "#3f51b5",
    description: "Pet training centers"
  },
  { 
    key: "parks", 
    label: "Parks", 
    icon: "🌳",
    color: "#8bc34a",
    description: "Dog parks and pet areas"
  },
];

export default function LocationCategories({ selected, onSelect, style }) {
  const theme = useTheme();

  const blue = theme.colors.palette?.blue || { 100: "#E3F2FD", 500: "#2196F3" };
  const neutral = theme.colors.palette?.neutral || { 300: "#E0E0E0" };
  const radius = theme.custom?.radii?.lg ?? 16;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContainer, style]}
    >
      {locationCategories.map((cat, idx) => {
        const isSelected = selected === cat.key;
        const categoryColor = cat.color;
        const lightBackgroundColor = categoryColor + "20"; // Add transparency
        
        return (
          <TouchableOpacity
            key={cat.key}
            activeOpacity={0.85}
            onPress={() => onSelect(isSelected ? null : cat.key)}
            style={[
              styles.item,
              {
                borderRadius: radius,
                borderColor: isSelected ? categoryColor : neutral[300],
                backgroundColor: isSelected ? lightBackgroundColor : theme.colors.surface,
                marginRight: idx === locationCategories.length - 1 ? 0 : 10,
              },
            ]}
          >
            <View style={styles.inner}>
              <Text style={[styles.icon, { fontSize: 18 }]}>
                {cat.icon}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  color: isSelected ? categoryColor : theme.colors.onSurface,
                  fontFamily: theme.fonts.titleSmall.fontFamily,
                  fontSize: theme.fonts.titleSmall.fontSize,
                  lineHeight: theme.fonts.titleSmall.lineHeight,
                  fontWeight: isSelected ? "600" : "400",
                }}
              >
                {cat.label}
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
    height: 44,
    paddingHorizontal: 14,
    borderWidth: 1,
    justifyContent: "center",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: { 
    marginRight: 8,
    width: 20,
    textAlign: "center",
  },
});

export { locationCategories };

