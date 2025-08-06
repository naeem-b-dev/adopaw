import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";

export default function SearchBar({ value, onChangeText, style }) {
  const { t } = useTranslation("home");

  return (
    <TextInput
      mode="outlined"
      placeholder={t("searchPlaceholder", "Search pets...")}
      value={value}
      onChangeText={onChangeText}
      style={[styles.input, style]}
      left={<TextInput.Icon icon="magnify" />}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    marginVertical: 12,
  },
});