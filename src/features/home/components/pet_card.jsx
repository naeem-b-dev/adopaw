import { MaterialIcons } from "@expo/vector-icons";
import { Image, StyleSheet, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { Text, useTheme } from "react-native-paper";

const headerBgByCategory = {
  cat: "#FFE8F0",
  dog: "#FFEFE2",
  rabbit: "#F3E9FF",
  fish: "#E8F5FF",
  bird: "#F1FFE8",
  hamster: "#FFF6E8",
};

export default function PetCard({ pet, onPress }) {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const H_PADDING = 16;
  const GAP = 12;
  const cardWidth = Math.floor((width - H_PADDING * 2 - GAP) / 2);

  const isMale = pet.gender?.toLowerCase() === "male";
  const genderIcon = isMale ? "male" : "female";
  const genderColor = isMale ? "#3B82F6" : "#EC4899";
  const distanceText = pet.distance ?? (typeof pet.distanceKm === "number" ? `${pet.distanceKm} km` : "");
  const headerBg = headerBgByCategory[pet.category] ?? "#F3F4F6";

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
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <Image source={{ uri: pet.image }} style={styles.image} resizeMode="cover" />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={[styles.name, { color: theme.colors.onSurface }]}>
            {pet.name}
          </Text>
          <MaterialIcons name={genderIcon} size={20} color={genderColor} />
        </View>

        <View style={styles.pills}>
          {pet.age ? <Pill text={pet.age} bg="#E8F2FF" fg="#3B82F6" icon="access-time" /> : null}
          {pet.breed ? <Pill text={pet.breed} bg="#FDE7EF" fg="#EC4899" icon="pets" /> : null}
          {distanceText ? <Pill text={`${distanceText} Far`} bg="#EEEEEE" fg="#6B7280" icon="location-on" /> : null}
        </View>
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

const RADIUS = 18;

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 3,
    marginBottom: 12,
    padding: 12,
  },
  header: {
    borderRadius: RADIUS,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
  },
  content: { marginTop: 10 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: { fontWeight: "800", fontSize: 20, flexShrink: 1, marginRight: 8 },
  pills: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
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
