import React from "react";
import { View, StyleSheet, I18nManager } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import i18n, { isRTL } from "../../../localization/i18n";

export default function ScreenLayout({ title, children }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const checkRTL = isRTL(i18n.language);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingBottom: insets.bottom,
          paddingTop: insets.top + 12,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons
            name={checkRTL ? "arrow-forward" : "arrow-back"}
            size={32}
            color={colors.onSurface}
            onPress={() => router.back()}
          />
          <Text variant="headlineLarge" style={{ color: colors.text }}>
            {title}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
