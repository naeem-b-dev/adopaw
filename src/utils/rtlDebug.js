// First, let's create a debug utility to check RTL status
// Create: src/utils/rtlDebug.js

import { I18nManager } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const debugRTL = async () => {
  const storedLang = await AsyncStorage.getItem("user-language");
  const storedRTL = await AsyncStorage.getItem("user-rtl");

  console.log("=== RTL DEBUG INFO ===");
  console.log("Stored Language:", storedLang);
  console.log("Stored RTL:", storedRTL);
  console.log("I18nManager.isRTL:", I18nManager.isRTL);
  console.log(
    "I18nManager.doLeftAndRightSwapInRTL:",
    I18nManager.doLeftAndRightSwapInRTL
  );
  console.log("I18nManager.allowRTL:", I18nManager.allowRTL);
  console.log("======================");

  return {
    storedLang,
    storedRTL,
    currentRTL: I18nManager.isRTL,
    allowRTL: I18nManager.allowRTL,
    swapEnabled: I18nManager.doLeftAndRightSwapInRTL,
  };
};

// Enhanced RTL setup function
export const setupRTL = async (languageCode) => {
  const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];
  const isRTL = RTL_LANGUAGES.includes(languageCode);

  console.log(
    `Setting up RTL for language: ${languageCode}, should be RTL: ${isRTL}`
  );

  try {
    // First, ensure RTL is allowed
    I18nManager.allowRTL(true);

    // Force the RTL setting
    I18nManager.forceRTL(isRTL);

    // Store the preference
    await AsyncStorage.setItem("user-rtl", isRTL.toString());

    console.log(`RTL setup complete. I18nManager.isRTL: ${I18nManager.isRTL}`);

    return {
      success: true,
      isRTL: I18nManager.isRTL,
      needsReload: true, // Always needs reload in Expo Go
    };
  } catch (error) {
    console.error("Error setting up RTL:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
