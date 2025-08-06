import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import arHome from "./locale/ar/home.json";
import enHome from "./locale/en/home.json";

i18n.use(initReactI18next).init({
  fallbackLng: "ar",
  lng: Localization.getLocales()[0].languageCode,
  ns: ["home"],
  defaultNS: "home",
  resources: {
    en: { home: enHome },
    ar: { home: arHome },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
