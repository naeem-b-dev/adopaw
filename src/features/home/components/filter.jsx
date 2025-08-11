import Slider from "@react-native-community/slider";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import AppButton from "../../../shared/components/ui/AppButton/AppButton";
import PetsCategories from "./pets_categories";
import { useTranslationLoader } from "../../../localization/hooks/useTranslationLoader";



export default function Filter({ onClose, onApply }) {
  const theme = useTheme();
  const { t } = useTranslationLoader("home");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAge, setSelectedAge] = useState(null);
  const ageOptions = [
  { key: "baby", label: t("age.baby", "Baby (0-1 yr)") },
  { key: "young", label: t("age.young", "Young (1-3 yrs)") },
  { key: "adult", label: t("age.adult", "Adult (3-7 yrs)") },
  { key: "senior", label: t("age.senior", "Senior (7+ yrs)") },
  ];
  const [selectedSize, setSelectedSize] = useState(null);
  const sizeOptions = [
    { key: "small", label: t("size.small", "Small") },
    { key: "medium", label: t("size.medium", "Medium") },
    { key: "large", label: t("size.large", "Large") },
  ];
  const [selectedGender, setSelectedGender] = useState(null);
  const genderOptions = [
    { key: "male", label: t("gender.male", "Male") },
    { key: "female", label: t("gender.female", "Female") },
  ];
  const [selectedActivity, setSelectedActivity] = useState(null);
  const activityOptions = [
    { key: "low", label: t("activity.low", "Low") },
    { key: "medium", label: t("activity.medium", "Medium") },
    { key: "high", label: t("activity.high", "High") },
  ];
  const [distance, setDistance] = useState(50); // default 50 km

  const applyFilters = () => {
    const payload = {
      category: selectedCategory,
      age: selectedAge,
      size: selectedSize,
      gender: selectedGender,
      activity: selectedActivity,
      distance,
    };
    if (onApply) onApply(payload);
    else onClose && onClose();
  };

  const styles = StyleSheet.create({
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 8,
      color: theme.colors.primary,
    },  
      group: {
          marginVertical: 8,
        },
        groupLabel: {
          marginBottom: 4,
        },
        row: {
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 8,
        },
        optionButton: {
          flex: 1,
          alignItems: "center",
          padding: 12,
          marginHorizontal: 4,
          borderRadius: 12,
          borderWidth: 1.5,
        },
    container: {
      flex: 1,
      justifyContent: "space-between",
    },
    options: {
      flex: 1,
      minHeight: 120,
      marginBottom: 24,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    resetButton: {
      flex: 1,
      marginRight: 8,
    },
    doneButton: {
      flex: 1,
      marginLeft: 8,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.options.group}>
      <Text style={styles.sectionTitle}>{t("category", "Category")}</Text>
        <PetsCategories
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.sectionTitle}>
            {t("age.label", "Age")}
        </Text>
        <View style={styles.row}>
            {ageOptions.map(opt => {
                const isSelected = selectedAge === opt.key;
                return (
                    <TouchableOpacity
                    key={opt.key}
                    style={[
                        styles.optionButton,
                        {
                          backgroundColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.background,
                          borderColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.onSurface,
                        },
                    ]}
                    onPress={() => setSelectedAge(isSelected ? null : opt.key)}
                    >
                    <Text
                        style={{
                            color: isSelected ? "#fff" : theme.colors.onSurface,
                        }}
                        variant="labelMedium"
                    >
                        {opt.label}
                    </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.sectionTitle}>
            {t("size.label", "Size")}
        </Text>
        <View style={styles.row}>
            {sizeOptions.map(opt => {
                const isSelected = selectedSize === opt.key;
                return (
                    <TouchableOpacity
                     key={opt.key}
                     style={[
                        styles.optionButton,
                        {
                          backgroundColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.background,
                          borderColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.onSurface,
                        },
                     ]}
                     onPress={() => setSelectedSize(isSelected ? null : opt.key)}
                    >
                     <Text
                        style={{
                          color: isSelected ? "#fff" : theme.colors.onSurface,
                        }}
                        variant="labelMedium"
                     >
                        {opt.label}
                     </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.sectionTitle}>
            {t("gender.label", "Gender")}
        </Text>
        <View style={styles.row}>
            {genderOptions.map(opt => {
              const isSelected = selectedGender === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: isSelected
                        ? theme.colors.primary
                        : theme.colors.background,
                      borderColor: isSelected
                        ? theme.colors.primary
                        : theme.colors.onSurface,
                    },
                  ]}
                  onPress={() => setSelectedGender(isSelected ? null : opt.key)}
                >
                  <Text
                    style={{
                      color: isSelected ? "#fff" : theme.colors.onSurface,
                    }}
                    variant="labelMedium"
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.sectionTitle}>
            {t("activity.label", "Activity Level")}
        </Text>
        <View style={styles.row}>
          {activityOptions.map(opt => {
            const isSelected = selectedActivity === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: isSelected
                        ? theme.colors.primary
                        : theme.colors.background,
                    borderColor: isSelected
                        ? theme.colors.primary
                        : theme.colors.onSurface,
                  },
                ]}
                onPress={() => setSelectedActivity(isSelected ? null : opt.key)}
              >
                <Text
                    style={{
                      color: isSelected ? "#fff" : theme.colors.onSurface,
                    }}
                    variant="labelMedium"
              >
                    {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.sectionTitle}>
            {t("location.label", "Location (km)")}
        </Text>
        <Text style={{ marginBottom: 8 }}>
            {distance >= 150 ? "150+ km" : `${distance} km`}
        </Text>
        <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={1}
            maximumValue={150}
            step={1}
            value={distance}
            onValueChange={setDistance}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.onSurface}
            thumbTintColor={theme.colors.primary}
        />
      </View>
      
      <View style={styles.buttonRow}>
        <AppButton
          text={t("reset", "Reset")}
          variant="secondary"
          onPress={() => {
            setSelectedCategory(null);
            setSelectedAge(null);
            setSelectedSize(null);
            setSelectedGender(null);
            setSelectedActivity(null);
            setDistance(50);
          }}
          style={styles.resetButton}
        />
        <AppButton
          text={t("done", "Done")}
          variant="primary"
          onPress={applyFilters}
          style={styles.doneButton}
        />
      </View>
    </View>
  );
}

