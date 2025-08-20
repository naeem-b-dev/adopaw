// app/_layout.jsx
import React, { useEffect, useLayoutEffect, useCallback } from "react";
import { Slot } from "expo-router";
import { I18nextProvider } from "react-i18next";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider, useSelector } from "react-redux";

import { useColorScheme } from "@/hooks/useColorScheme";
import i18n, { initializeLanguageAndRTL } from "@/src/localization/i18n";

import { CustomDarkTheme, CustomLightTheme } from "@/src/theme";

import { store } from "@/src/features/auth/store";
import { selectIsAuthed, selectJwt } from "@/src/features/auth/store/authSlice";
import { initSocket } from "@/src/shared/services/chatService";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useThemeContext } from "@/src/context/ThemeContext";

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    initializeLanguageAndRTL();
  }, []);


  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <Provider store={store}>
            <ThemeProvider>
              <AppShell />
            </ThemeProvider>
          </Provider>
        </I18nextProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

function AppShell() {
  const { resolvedTheme } = useThemeContext();
  const theme = resolvedTheme === "dark" ? CustomDarkTheme : CustomLightTheme;

  const isAuthed = useSelector(selectIsAuthed);
  const jwt = useSelector(selectJwt);
  const getToken = useCallback(async () => jwt || "", [jwt]);

  useLayoutEffect(() => {
    initSocket(getToken);
  }, [getToken]);

  return (
    <PaperProvider theme={theme}>
      <Slot />
    </PaperProvider>
  );
}
