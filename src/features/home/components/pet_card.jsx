import { MaterialIcons } from "@expo/vector-icons";
import { Image, StyleSheet, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { Text, useTheme } from "react-native-paper";

/**
 * Props: { pet, onPress }
 * pet: { id, name, image, age, breed, gender, distance | distanceKm }
 */
export default function PetCard({ pet, onPress }) {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  // Match Home padding (16) and column gap (12)
  const H_PADDING = 16;
  const GAP = 12;
  const COLS = 2;
  const cardWidth = Math.floor((width - H_PADDING * 2 - GAP) / COLS);

  const isMale = pet.gender?.toLowerCase() === "male";
  const genderIcon = isMale ? "male" : "female";
  const genderColor = isMale ? "#3B82F6" : "#EC4899"; // blue / pink
  const distanceText = pet.distance ?? (typeof pet.distanceKm === "number" ? `${pet.distanceKm} km` : "");

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.card,
        {
          width: cardWidth,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
          shadowColor: theme.colors.shadow,
        },
      ]}
    >
      {/* Framed image with a primary outline and large radius */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: pet.image }} style={{ width: "100%", aspectRatio: 1, borderRadius: 24 }} />
      </View>


      {/* Name + gender icon */}
      <View style={styles.titleRow}>
        <Text
          numberOfLines={1}
          style={[styles.name, { color: theme.colors.onSurface }]}
        >
          {pet.name}
        </Text>
        <MaterialIcons name={genderIcon} size={20} color={genderColor} />
      </View>

      {/* Pills */}
      <View style={styles.chipsRow}>
        {pet.age ? (
          <Pill text={pet.age} bg="#E8F2FF" fg="#3B82F6" icon="access-time" />
        ) : null}
        {pet.breed ? (
          <Pill text={pet.breed} bg="#FDE7EF" fg="#EC4899" icon="pets" />
        ) : null}
        {distanceText ? (
          <Pill text={`${distanceText} Far`} bg="#EEEEEE" fg="#6B7280" icon="location-on" />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

function Pill({ text, bg, fg, icon }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      {icon ? <MaterialIcons name={icon} size={14} color={fg} style={{ marginRight: 6 }} /> : null}
      <Text numberOfLines={1} style={{ color: fg, fontSize: 12, fontWeight: "600" }}>
        {text}
      </Text>
    </View>
  );
}

const RADIUS = 24;

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 3,
    marginBottom: 12,
    padding: 12, // inner padding to match the mock
  },
  imageWrapper: {
    borderRadius: 24,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    aspectRatio: 1, // square image like the mock
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  name: {
    fontWeight: "800",
    fontSize: 20,
    flexShrink: 1,
    marginRight: 8,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
    marginTop: 8,
  },
});
