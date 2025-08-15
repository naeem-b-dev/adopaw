import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LANGUAGE_PREFERENCE_KEY = "user-language";

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  lng: "ar",
  ns: [],
  interpolation: { escapeValue: false },
});

export const setLanguage = async (lng) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_PREFERENCE_KEY, lng);
    await i18n.changeLanguage(lng);
    console.log("Language set to:", lng);
  } catch (error) {
    console.error("Error setting language:", error);
  }
};

export const getStoredLanguage = async () => {
  try {
    const storedLang = await AsyncStorage.getItem(LANGUAGE_PREFERENCE_KEY);
    return storedLang || null;
  } catch (error) {
    console.error("Error getting stored language:", error);
    return null;
  }
};

export default i18n;
