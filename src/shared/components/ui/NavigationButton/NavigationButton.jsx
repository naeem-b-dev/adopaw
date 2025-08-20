import React from "react";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  I18nManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, Text } from "react-native-paper";
import i18n from "../../../../localization/i18n";

export default function NavigationButton({
  iconName,
  iconSvg: IconSvg,
  title,
  trailingText,
  danger,
  onPress,
}) {
  const { colors } = useTheme();
  const isRTL = I18nManager.isRTL || i18n.language === "ar";

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        {iconName ? (
          <Ionicons
            name={iconName}
            size={24}
            color={danger ? colors.error : colors.onSurface}
          />
        ) : IconSvg ? (
          <IconSvg />
        ) : null}
      </View>

      <Text
        style={[
          styles.title,
          { color: danger ? colors.error : colors.onSurface },
        ]}
      >
        {title}
      </Text>

      {trailingText ? (
        <Text
          style={[styles.trailingText, { color: colors.palette.neutral[500] }]}
        >
          {trailingText}
        </Text>
      ) : null}

      <Ionicons
        name={isRTL ? "chevron-back" : "chevron-forward"}
        size={20}
        color={colors.palette.neutral[500]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    width: "100%",
  },
  iconContainer: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconImage: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  title: {
    flex: 1,
    fontSize: 16,
  },
  trailingText: {
    marginRight: 8,
    fontSize: 14,
  },
});
