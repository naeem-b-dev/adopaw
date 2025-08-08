import { Slot, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useColorScheme } from "@/hooks/useColorScheme";
import i18n from "@/src/localization/i18n";
import { CustomDarkTheme, CustomLightTheme } from "@/src/theme";
import { I18nextProvider } from "react-i18next";
import { useLoadFonts } from "../src/fonts/alexandria";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const fontsLoaded = useLoadFonts();
  const router = useRouter();

  const theme = colorScheme === "dark" ? CustomDarkTheme : CustomLightTheme;
  const { colors, fonts } = theme;

  // Hardcoded simulation
  const firstLaunch = false;
  const token = true;

  useEffect(() => {
    if (fontsLoaded) {
      // Navigate right away
      if (firstLaunch) {
        router.replace("/(onboarding)/step1");
      } else if (!token) {
        router.replace("/login");
      } else {
        router.replace("/(tabs)/home");
      }
    }
  }, [fontsLoaded, firstLaunch, token, router]);

  if (!fontsLoaded) {
    // Show loading only while fonts are loading
    return (
      <SafeAreaProvider>
        <I18nextProvider i18n={i18n}>
          <PaperProvider theme={theme}>
            <View style={styles.loading}>
              <Text
                style={[
                  styles.title,
                  {
                    color: colors.text,
                    fontFamily: fonts.displayLarge.fontFamily,
                    fontSize: fonts.displayLarge.fontSize,
                    lineHeight: fonts.displayLarge.lineHeight,
                  },
                ]}
              >
                Loading...
              </Text>
            </View>
          </PaperProvider>
        </I18nextProvider>
      </SafeAreaProvider>
    );
  }

  // When fontsLoaded and no redirect triggered, render Slot (fallback)
  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        <PaperProvider theme={theme}>
          <Slot />
        </PaperProvider>
      </I18nextProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    marginBottom: 8,
    textAlign: "center",
  },
});
