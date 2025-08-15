import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { useTheme, Text, Button } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { animalsColors } from "../../../../shared/constants/prefs";
import { useTranslationLoader } from "../../../../localization/hooks/useTranslationLoader";

export default function ColorSelectMulti({ value = [], onChange }) {
  const { colors } = useTheme();
  const { t } = useTranslationLoader(["common", "addPet"]);
  const [selectedColors, setSelectedColors] = useState(value);
  const [modalVisible, setModalVisible] = useState(false);

  // Create dynamic styles using useMemo to avoid inline style warnings
  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        dropdownButtonWithBorder: {
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderRadius: 12,
          padding: 12,
          minHeight: 48,
          borderColor: "rgba(169, 169, 169, 0.5)",
        },
        modalContentWithBg: {
          borderRadius: 8,
          padding: 16,
          maxHeight: "80%",
          backgroundColor: colors.background,
        },
      }),
    [colors.background]
  );

  const toggleColor = (colorLabel) => {
    setSelectedColors((prev) =>
      prev.includes(colorLabel)
        ? prev.filter((c) => c !== colorLabel)
        : [...prev, colorLabel]
    );
  };

  const handleDone = () => {
    onChange && onChange(selectedColors);
    setModalVisible(false);
  };

  return (
    <>
      {/* Button that opens modal */}
      <TouchableOpacity
        style={dynamicStyles.dropdownButtonWithBorder}
        onPress={() => setModalVisible(true)}
      >
        {selectedColors.length > 0 ? (
          <View style={styles.selectedColorsRow}>
            {selectedColors.map((value) => {
              const colorData = animalsColors.find((c) => c.value === value);
              const backgroundColor = colorData?.value || "#ccc";
              return (
                <View
                  key={value}
                  style={[styles.colorCircle, { backgroundColor }]}
                />
              );
            })}
          </View>
        ) : (
          <Text>{t("inputs.color.placeholder", { ns: "addPet" })}</Text>
        )}
      </TouchableOpacity>

      {/* Modal for color selection */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={dynamicStyles.modalContentWithBg}>
            <Text style={styles.modalTitle}>
              {t("inputs.color.placeholder", { ns: "addPet" })}
            </Text>

            <FlatList
              data={animalsColors}
              keyExtractor={(item) => item.label}
              renderItem={({ item }) => {
                const isSelected = selectedColors.includes(item.value);
                const backgroundColor = item.value;
                return (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => toggleColor(item.value)}
                  >
                    <View style={[styles.colorCircle, { backgroundColor }]} />
                    <Text style={{ marginLeft: 8 }}>
                      {t(`colors.${item.label}`)}
                    </Text>
                    {isSelected && (
                      <Text style={{ marginLeft: "auto" }}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            <Button
              mode="contained"
              onPress={handleDone}
              style={{ marginTop: 12 }}
            >
              {t("done")}
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selectedColorsRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: "bold",
  },
});
