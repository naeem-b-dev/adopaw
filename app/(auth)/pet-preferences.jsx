import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { formatAgeRange } from "../../src/features/auth/utils/age-range";
import { useTranslationLoader } from "../../src/localization/hooks/useTranslationLoader";
import AgeSlider from "../../src/shared/components/ui/AgeSlider/AgeSlider";
import AppButton from "../../src/shared/components/ui/AppButton/AppButton";
import ColorSelectOption from "../../src/shared/components/ui/ColorSelectOption/ColorSelectOption";
import SelectOption from "../../src/shared/components/ui/CustomSelect/SelectOption";
import Heading from "../../src/shared/components/ui/Heading/Heading";
import InputLabel from "../../src/shared/components/ui/InputLabel/InputLabel";
import LoadingModal from "../../src/shared/components/ui/LoadingModal/LoadingModal";
import { animalOptions } from "../../src/shared/constants/animals";
import { animalsColors, gender } from "../../src/shared/constants/prefs";
import { getAuthInfo } from "../../src/shared/services/supabase/getters";

export default function PetPreferencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [selectedSpecies, setSelectedSpecies] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedAge, setSelectedAge] = useState([0.083, 15]);
  const [loading, setLoading] = useState(false);

  const handleAgeChange = (minValue, maxValue) => {
    setSelectedAge([minValue, maxValue]);
  };

  const toggleSpeciesSelection = (value) => {
    setSelectedSpecies((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const toggleColorsSelection = (value) => {
    setSelectedColors((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const toggleGenderSelection = (value) => {
    setSelectedGenders((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const { t } = useTranslationLoader(["auth", "common"]);
  const skip = () => {
    router.replace("/home");
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const ageRange = formatAgeRange(selectedAge);
      const { token, supaId } = await getAuthInfo();

      if (!token || !supaId) {
        throw new Error("Not authenticated");
      }

      const petPreferences = {
        species: selectedSpecies,
        gender: selectedGenders,
        ageRange: ageRange,
        colors: selectedColors,
      };


      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_BACKEND_API_URL}/profile/${supaId}`,
        { petPreferences: petPreferences },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response?.data) {
        await AsyncStorage.setItem("profile", JSON.stringify(response.data));
        router.replace("/home");
      }
    } catch (error) {
      console.error("Error updating pet preferences:", error);
      console.log(error.response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surface }]}>
      <Heading
        title={t("petPref.title")}
        description={t("petPref.description")}
        align="start"
      />
      <LoadingModal loading={loading} />
      <InputLabel text={t("petPref.labels.specie")} />
      <View
        style={{
          width: "100%",
          rowGap: 8,
          columnGap: 8,
          flexWrap: "wrap",
          flexDirection: "row",
        }}
      >
        {animalOptions.map((option) => {
          const translatedLabel = t(option.labelKey, { ns: "common" });
          return (
            <SelectOption
              key={option.value}
              label={translatedLabel}
              image={option.image}
              selected={selectedSpecies.includes(option.value)}
              onPress={() => toggleSpeciesSelection(option.value)}
            />
          );
        })}
      </View>
      <InputLabel text={t("petPref.labels.gender")} />
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        {gender.map((option) => {
          const translatedLabel = t(`gender.${option.value}`, { ns: "common" });
          return (
            <SelectOption
              key={option.value}
              label={translatedLabel}
              icon={option.iconName}
              iconColor={option.iconColor}
              selected={selectedGenders.includes(option.value)}
              onPress={() => toggleGenderSelection(option.value)}
              style={{ width: 180 }}
            />
          );
        })}
      </View>
      <InputLabel text={t("petPref.labels.color")} />
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        {animalsColors.map((option) => {
          const translatedLabel = t(`colors.${option.label}`, { ns: "common" });
          return (
            <ColorSelectOption
              key={option.value}
              label={translatedLabel}
              color={option.value}
              onPress={() => toggleColorsSelection(option.value)}
              selected={selectedColors.includes(option.value)}
              style={{ width: "20%" }}
            />
          );
        })}
      </View>
      <InputLabel text={t("petPref.labels.age")} />
      <AgeSlider
        valueMin={selectedAge[0]}
        valueMax={selectedAge[1]}
        onRangeChange={handleAgeChange}
      />
      <View style={styles.buttonsContainer}>
        <AppButton
          variant="secondary"
          text={t("petPref.skip")}
          onPress={skip}
          style={{ flex: 1, width: "auto" }}
        />
        <AppButton
          text={t("petPref.submit")}
          onPress={handleSubmit}
          style={{ flex: 1, width: "auto" }}
          loading={loading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 60,
    paddingHorizontal: 28,
    paddingTop: 100,
    height: "100%",
    gap: 12,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 20,
    marginVertical: 24,
  },
});
