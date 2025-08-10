import { Image, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function ImageMessage({ imageSource, label, timestamp }) {
  const theme = useTheme();

  const labelColor = theme.colors.onSurface;
  const timestampColor = theme.colors.onSurfaceVariant ?? theme.colors.onSurface;

  return (
    <View
      style={[
        styles.imageContainer,
        { backgroundColor: theme.colors.surface },
      ]}
    >
      <Image source={imageSource} style={styles.petImage} />
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        <Text style={[styles.timestamp, { color: timestampColor }]}>
          {timestamp}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    alignSelf: "flex-start",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  petImage: {
    width: 140,
    height: 140,
    borderRadius: 12,
  },
  labelRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontFamily: "Alexandria_700Bold",
    fontSize: 14,
  },
  timestamp: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 11,
  },
});
