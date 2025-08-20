import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Surface, Text, RadioButton, useTheme } from "react-native-paper";
import { useThemeContext } from "@/src/context/ThemeContext";
import ScreenLayout from "../../../src/shared/layout/ScreenLayout/ScreenLayout";
import { useTranslationLoader } from "../../../src/localization/hooks/useTranslationLoader";

const themeOptionsValues = ["system", "light", "dark"]; // ⬅️ values only

export default function ThemeScreen() {
  const { themePreference, updateTheme } = useThemeContext();
  const { colors } = useTheme();
  const [selected, setSelected] = useState(themePreference);
  const { t } = useTranslationLoader("profile");

  useEffect(() => {
    setSelected(themePreference);
  }, [themePreference]);

  const handleThemeChange = (value) => {
    setSelected(value);
    updateTheme(value);
  };

  return (
    <ScreenLayout title={t("appearance.theme.label")}>
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        {themeOptionsValues.map((value) => {
          const isSelected = selected === value;
          return (
            <TouchableOpacity
              key={value}
              onPress={() => handleThemeChange(value)}
              style={{ marginVertical: 2, width: "100%" }}
            >
              <Surface
                elevation={0}
                style={[
                  styles.optionContainer,
                  {
                    backgroundColor: isSelected
                      ? (colors?.palette?.blue?.[100] ?? "#D0E8FF")
                      : colors.surface,
                    borderWidth: 1,
                    borderColor: isSelected
                      ? (colors?.palette?.blue?.[500] ?? "#007BFF")
                      : (colors?.palette?.neutral?.[500] ?? "#AAAAAA"),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.label,
                    { color: isSelected ? colors.primary : colors.text },
                  ]}
                >
                  {t(`appearance.theme.options.${value}`)}
                </Text>

                <RadioButton
                  value={value}
                  status={isSelected ? "checked" : "unchecked"}
                  onPress={() => handleThemeChange(value)}
                />
              </Surface>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: "white",
  },
  label: {
    fontSize: 16,
  },
});
