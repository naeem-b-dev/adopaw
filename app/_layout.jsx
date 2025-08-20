import React, { useEffect } from "react";
import { Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { I18nextProvider } from "react-i18next";
import { PaperProvider } from "react-native-paper";
import { I18nManager } from "react-native";
import i18n, { initializeLanguageAndRTL } from "@/src/localization/i18n";
import { CustomDarkTheme, CustomLightTheme } from "@/src/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useThemeContext } from "@/src/context/ThemeContext";

const queryClient = new QueryClient();

function RootContent() {
  const { resolvedTheme } = useThemeContext();
  const theme = resolvedTheme === "dark" ? CustomDarkTheme : CustomLightTheme;

  return (
    <PaperProvider theme={theme}>
      <Slot />
    </PaperProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Initialize language and RTL setup
    initializeLanguageAndRTL();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider>
            <RootContent />
          </ThemeProvider>
        </I18nextProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
