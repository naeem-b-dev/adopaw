import { StyleSheet, View } from "react-native";
import { Chip, useTheme } from "react-native-paper";
export default function SuggestionChips({ suggestions = [] }) {
  const theme = useTheme();
  const { palette } = theme.colors;

  if (!Array.isArray(suggestions)) {
    console.warn("❌ 'suggestions' is not an array:", suggestions);
    return null;
  }

  return (
    <View style={styles.container}>
      {suggestions.map((suggestion, idx) => {
        const isBlue = suggestion.type === "blue";
        const isCoral = suggestion.type === "coral";

        const chipStyle = {
          backgroundColor: isBlue
            ? palette.blue[200]
            : isCoral
            ? palette.coral[200]
            : undefined,
          borderColor: isBlue
            ? palette.blue[300]
            : isCoral
            ? palette.coral[300]
            : undefined,
          borderWidth: 1,
        };

        const chipTextColor = isBlue
          ? palette.blue[600]
          : isCoral
          ? palette.coral[600]
          : undefined;

        return (
          <Chip
            key={idx}
            style={[styles.chip, chipStyle]}
            textStyle={[styles.chipText, { color: chipTextColor }]}
          >
            {suggestion.label}
          </Chip>
        );
      })}
    </View>
  );
}


const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 10,
        marginTop: 20,
    },
    chip: {
        borderRadius: 50,
    },
    chipText: {
        fontFamily: "Alexandria_400Regular",
        fontSize: 9,
    },
});
