import { StyleSheet } from "react-native";
import { FAB, useTheme } from "react-native-paper";

export default function RecenterButton({ onPress, style, disabled, loading }) {
  const theme = useTheme();
  return (
    <FAB
      icon="crosshairs-gps"
      onPress={onPress}
      color={theme.colors.primary}
      style={[styles.fab, { backgroundColor: theme.colors.surface }, style]}
      size="small"
      disabled={disabled}
      loading={loading}
    />
  );
}

const styles = StyleSheet.create({
  fab: { elevation: 6 },
});
