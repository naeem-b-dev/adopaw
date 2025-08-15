import React from "react";
import { View,  StyleSheet } from "react-native";
import { useTranslationLoader } from "../../../../localization/hooks/useTranslationLoader";
import StandardSelect from "../StandardSelect/StandardSelect";
import AppInput from "../../../../shared/components/ui/AppInput/AppInput";

const ageUnits = [
  { labelKey: "inputs.age", value: "days" },
  { labelKey: "inputs.age", value: "months" },
  { labelKey: "inputs.age", value: "years" },
];

export default function PetAgeInput({ age, onChange }) {
  const { t } = useTranslationLoader("addPet");

  return (
    <View style={styles.container}>
      <AppInput
        keyboardType="numeric"
        placeholder={t("inputs.age.placeholder")}
        value={age.value}
        onChangeText={(text) =>
          onChange({ ...age, value: parseFloat(text) || 0 })
        }
        style={{ height: 50 }}
      />
      <View style={{ flex: 1 }}>
        <StandardSelect
          data={ageUnits}
          value={age.unit}
          onChange={(unitValue) => onChange({ ...age, unit: unitValue })}
          placeholderKey="inputs.ageUnit.placeholder"
          translationNamespace={["addPet", "common"]}
          labelKey="inputs.age"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
});
