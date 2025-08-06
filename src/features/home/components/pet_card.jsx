import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

const CARD_WIDTH = 180; // from Figma
const CARD_HEIGHT = 209; // from Figma
const BORDER_RADIUS = 14.84;
const PADDING = 7;

export default function PetCard({ pet, onPress }) {
  const theme = useTheme();

  const isMale = pet.gender?.toLowerCase() === "male";
  const genderColor = isMale ? "#4FC3F7" : "#F06292";
  const genderSymbol = isMale ? "♂" : "♀";

  // Responsive scale based on screen width
  const screenWidth = Dimensions.get("window").width;
  const scale = screenWidth < 400 ? screenWidth / 400 : 1;
  const cardWidth = CARD_WIDTH * scale;
  const cardHeight = CARD_HEIGHT * scale;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: cardWidth,
          height: cardHeight,
          borderRadius: BORDER_RADIUS * scale,
          backgroundColor: theme.colors.surface,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Pet Image */}
      <Image
        source={{ uri: pet.image }}
        style={[
          styles.image,
          { height: cardHeight * 0.55, borderTopLeftRadius: BORDER_RADIUS, borderTopRightRadius: BORDER_RADIUS },
        ]}
        resizeMode="cover"
      />

      {/* Content */}
      <View style={[styles.content, { padding: PADDING * scale }]}>
        {/* Name & Gender */}
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: theme.colors.onSurface, fontSize: 16 * scale }]}>
            {pet.name}
          </Text>
          <View
            style={[
              styles.genderBadge,
              { backgroundColor: genderColor, width: 24 * scale, height: 24 * scale, borderRadius: 12 * scale },
            ]}
          >
            <Text style={[styles.genderText, { fontSize: 14 * scale }]}>{genderSymbol}</Text>
          </View>
        </View>

        {/* Tags Row */}
        <View style={styles.tagsRow}>
          {/* Age */}
          <View style={[styles.tag, { backgroundColor: "#E3F2FD" }]}>
            <MaterialIcons name="access-time" size={14 * scale} color="#1976D2" />
            <Text style={[styles.tagText, { color: "#1976D2", fontSize: 12 * scale }]}>{pet.age}</Text>
          </View>

          {/* Breed */}
          <View style={[styles.tag, { backgroundColor: "#FCE4EC" }]}>
            <MaterialIcons name="pets" size={14 * scale} color="#C2185B" />
            <Text style={[styles.tagText, { color: "#C2185B", fontSize: 12 * scale }]}>{pet.breed}</Text>
          </View>

          {/* Distance */}
          <View style={[styles.tag, { backgroundColor: "#EEEEEE" }]}>
            <MaterialIcons name="location-on" size={16 * scale} color="#616161" />
            <Text style={[styles.tagText, { color: "#424242", fontSize: 12 * scale }]}>{pet.distance}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: "100%",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: {
    fontWeight: "bold",
    flex: 1,
    marginRight: 8,
  },
  genderBadge: {
    justifyContent: "center",
    alignItems: "center",
  },
  genderText: {
    color: "#fff",
    fontWeight: "bold",
  },
  tagsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 3,
    marginBottom: 0,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 4,
    flex: 1,
    marginRight: 4,
  },
  tagText: {
    marginLeft: 4,
    fontWeight: "600",
  },
});
