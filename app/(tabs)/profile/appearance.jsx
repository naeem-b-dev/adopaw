import { useCallback, useEffect, useState } from "react";
import NavigationButton from "../../../src/shared/components/ui/NavigationButton/NavigationButton";
import ScreenLayout from "../../../src/shared/layout/ScreenLayout/ScreenLayout";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslationLoader } from "../../../src/localization/hooks/useTranslationLoader";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useThemeContext } from "../../../src/context/ThemeContext";

export default function AppearanceScreen() {
  const { t } = useTranslationLoader("profile");
  const [language, setLanguage] = useState("en");
  const { themePreference } = useThemeContext();
  const router = useRouter();
  useFocusEffect(
    useCallback(() => {
      const loadPreferences = async () => {
        const lang = (await AsyncStorage.getItem("user-language")) || "en";
        setLanguage(lang);
      };

      loadPreferences();
    }, [])
  );

  return (
    <ScreenLayout title={t("appearance.title")}>
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        <NavigationButton
          iconName={"color-palette-outline"}
          title={t("appearance.theme.label")}
          trailingText={t(`appearance.theme.options.${themePreference}`)} // show current theme
          onPress={() => {
            router.push("/(tabs)/profile/user-theme");
          }}
        />
        <NavigationButton
          iconName={"globe-outline"}
          title={t("appearance.language.label")}
          trailingText={t(`appearance.language.options.${language}`)} // show current lang
          onPress={() => {
            router.push("/(tabs)/profile/user-language");
          }}
        />
      </View>
    </ScreenLayout>
  );
}
