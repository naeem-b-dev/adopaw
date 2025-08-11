import { MaterialCommunityIcons as MDI } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";

export default function FilterButton({ style }) {
  const theme = useTheme();
  const router = useRouter();

  const blue = theme.colors.palette.blue;
  const neutral = theme.colors.palette.neutral;
  const radius = theme.custom?.radii?.xl ?? 20;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push("/(tabs)/home/filter")}
      style={[
        styles.button,
        {
          backgroundColor: "#FFFFFF",
          borderColor: neutral[300],
          borderRadius: radius,
        },
        style,
      ]}
      hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
    >
      <View style={styles.iconWrap}>
        <MDI name="filter-variant" size={22} color={blue[500]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 52,           // same height as SearchBar (52)
    height: 52,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
