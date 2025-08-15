// components/BreedSelect.js
import React from "react";
import { View, StyleSheet } from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import { useTheme, Text } from "react-native-paper";
import { PET_BREEDS } from "../../../../shared/constants/animals";
import { useTranslationLoader } from "../../../../localization/hooks/useTranslationLoader";
import { Ionicons } from "@expo/vector-icons";

export default function BreedSelect({ specie, value, onChange }) {
  const { colors } = useTheme();
  const { t } = useTranslationLoader(["common", "addPet"]);
  const breeds = PET_BREEDS[specie] || [];

  return (
    <SelectDropdown
      data={breeds}
      disabled={!specie}
      onSelect={(selectedItem) => onChange(selectedItem.key)}
      defaultValue={breeds.find((b) => b.key === value)}
      renderButton={(selectedItem, isOpened) => (
        <View
          style={[
            styles.dropdownButton,
            { borderColor: "rgba(169, 169, 169, 0.5)" },
          ]}
        >
          <Text style={styles.label}>
            {selectedItem
              ? t(`breed.${selectedItem.key}`)
              : t("inputs.breed.placeholder", { ns: "addPet" })}
          </Text>
          <Ionicons
            name={isOpened ? "chevron-up" : "chevron-down"}
            size={20}
            color="#888"
          />
        </View>
      )}
      renderItem={(item) => (
        <View style={styles.dropdownItem}>
          <Text>{t(`breed.${item.key}`)}</Text>
        </View>
      )}
      buttonStyle={{ backgroundColor: colors.background }}
      dropdownStyle={{ backgroundColor: colors.background }}
    />
  );
}

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    height: 50,
  },
  dropdownItem: {
    padding: 12,
  },
  label: {
    flex: 1,
  },
});
