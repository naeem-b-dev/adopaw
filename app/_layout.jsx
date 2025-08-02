import { Slot, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useColorScheme } from "@/hooks/useColorScheme";
import { CustomDarkTheme, CustomLightTheme } from "@/src/theme";
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
  const token = false;

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
      </SafeAreaProvider>
    );
  }

  // When fontsLoaded and no redirect triggered, render Slot (fallback)
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <Slot />
      </PaperProvider>
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
