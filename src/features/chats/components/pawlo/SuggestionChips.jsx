// src/features/chats/components/pawlo/SuggestionChips.jsx
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Chip, Text, useTheme } from "react-native-paper";

export default function SuggestionChips({ suggestions, onSelect }) {
  const theme = useTheme();
  const { palette } = theme.colors;

  // Always return a safe array of {label, type}
  const items = useMemo(() => {
    const raw = suggestions;
    if (!Array.isArray(raw)) {
      console.warn("❌ 'suggestions' is not an array:", raw);
      return [];
    }
    return raw
      .map((s) =>
        typeof s === "string"
          ? { label: s, type: "neutral" }
          : { label: String(s?.label ?? ""), type: String(s?.type ?? "neutral") }
      )
      .filter((x) => x.label.length > 0);
  }, [suggestions]);

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      {items.map(({ label, type }, idx) => {
        const isBlue = type === "blue";
        const isCoral = type === "coral";

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

        const chipTextColor =
          isBlue ? palette.blue[600] : isCoral ? palette.coral[600] : theme.colors.onSurface;

        return (
          <Chip
            key={`${label}-${idx}`}
            style={[styles.chip, chipStyle]}
            onPress={() => onSelect?.(label)}
            compact
          >
            {/* 👇 wrap the label in Text so RN never sees a bare string */}
            <Text style={[styles.chipText, { color: chipTextColor }]}>{label}</Text>
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
