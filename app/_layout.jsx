// app/_layout.jsx
import React from "react";
import { Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { I18nextProvider } from "react-i18next";
import { PaperProvider } from "react-native-paper";
import i18n from "@/src/localization/i18n";
import { useColorScheme } from "@/hooks/useColorScheme";
import { CustomDarkTheme, CustomLightTheme } from "@/src/theme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? CustomDarkTheme : CustomLightTheme;

  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n} >
        <PaperProvider theme={theme}>
          <Slot />
        </PaperProvider>
      </I18nextProvider>
    </SafeAreaProvider>
  );
}
