import Slider from "@react-native-community/slider";
import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useTranslationLoader } from "../../../localization/hooks/useTranslationLoader";
import AppButton from "../../../shared/components/ui/AppButton/AppButton";
import PetsCategories from "./pets_categories";



export default function Filter({ 
  onClose, 
  onApply, 
  initialCategory = null,
  initialAge = null,
  initialSize = null,
  initialGender = null,
  initialActivity = null,
  initialDistance = 150
}) {
  const theme = useTheme();
  const { t } = useTranslationLoader("home");
  const neutral = theme.colors?.palette?.neutral;
  
  // Initialize all filter states with initial values
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedAge, setSelectedAge] = useState(initialAge);
  const [selectedSize, setSelectedSize] = useState(initialSize);
  const [selectedGender, setSelectedGender] = useState(initialGender);
  const [selectedActivity, setSelectedActivity] = useState(initialActivity);
  const [distance, setDistance] = useState(initialDistance);
  
  const ageOptions = [
  { key: "baby", label: t("age.baby", "Baby (0-1 yr)") },
  { key: "young", label: t("age.young", "Young (1-3 yrs)") },
  { key: "adult", label: t("age.adult", "Adult (3-7 yrs)") },
  { key: "senior", label: t("age.senior", "Senior (7+ yrs)") },
  ];
  
  const sizeOptions = [
    { key: "small", label: t("size.small", "Small") },
    { key: "medium", label: t("size.medium", "Medium") },
    { key: "large", label: t("size.large", "Large") },
  ];
  
  const genderOptions = [
    { key: "male", label: t("gender.male", "Male") },
    { key: "female", label: t("gender.female", "Female") },
  ];
  
  const activityOptions = [
    { key: "low", label: t("activity.low", "Low") },
    { key: "medium", label: t("activity.medium", "Medium") },
    { key: "high", label: t("activity.high", "High") },
  ];

  // Sync with all initial values when they change
  useEffect(() => {
    if (initialCategory !== selectedCategory) {
      console.log("🔄 Filter page category synced from home:", initialCategory);
      setSelectedCategory(initialCategory);
    }
    if (initialAge !== selectedAge) {
      console.log("🔄 Filter page age synced from home:", initialAge);
      setSelectedAge(initialAge);
    }
    if (initialSize !== selectedSize) {
      console.log("🔄 Filter page size synced from home:", initialSize);
      setSelectedSize(initialSize);
    }
    if (initialGender !== selectedGender) {
      console.log("🔄 Filter page gender synced from home:", initialGender);
      setSelectedGender(initialGender);
    }
    if (initialActivity !== selectedActivity) {
      console.log("🔄 Filter page activity synced from home:", initialActivity);
      setSelectedActivity(initialActivity);
    }
    if (initialDistance !== distance) {
      console.log("🔄 Filter page distance synced from home:", initialDistance);
      setDistance(initialDistance);
    }
  }, [initialCategory, initialAge, initialSize, initialGender, initialActivity, initialDistance]);

  const applyFilters = () => {
    const payload = {
      category: selectedCategory,
      age: selectedAge,
      size: selectedSize,
      gender: selectedGender,
      activity: selectedActivity,
      distance,
    };
    console.log("✅ Filter applied with payload:", payload);
    console.log("📅 Age filter in payload:", selectedAge);
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
      padding: 16,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
      backgroundColor: theme.colors.surface,
      borderColor: neutral ? neutral[300] : theme.colors.onSurface,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.onSurface,
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
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" style={styles.backButton} onPress={onClose}>
          <Text>{"←"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("filters.title", "Filters")}</Text>
      </View>

      <View style={styles.group}>
      <Text style={styles.sectionTitle}>{t("category.label", "Category")}</Text>
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
                            : theme.colors.surface,
                          borderColor: isSelected
                            ? theme.colors.primary
                            : (neutral ? neutral[300] : theme.colors.onSurface),
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
                            : theme.colors.surface,
                          borderColor: isSelected
                            ? theme.colors.primary
                            : (neutral ? neutral[300] : theme.colors.onSurface),
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
                        : theme.colors.surface,
                      borderColor: isSelected
                        ? theme.colors.primary
                        : (neutral ? neutral[300] : theme.colors.onSurface),
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
                        : theme.colors.surface,
                    borderColor: isSelected
                        ? theme.colors.primary
                        : (neutral ? neutral[300] : theme.colors.onSurface),
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
            setDistance(150);
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

