// app/_layout.jsx
import { Slot } from "expo-router";
import React, { useLayoutEffect, useCallback } from "react";
import { I18nextProvider } from "react-i18next";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider, useSelector } from "react-redux";

import { useColorScheme } from "@/hooks/useColorScheme";
import i18n from "@/src/localization/i18n";
import { CustomDarkTheme, CustomLightTheme } from "@/src/theme";

// ✅ use your actual file locations
import { store } from "@/src/features/auth/store";
import { selectIsAuthed, selectJwt } from "@/src/features/auth/store/authSlice";
import { initSocket } from "@/src/shared/services/chatService";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? CustomDarkTheme : CustomLightTheme;

  // Quick sanity log: should print → true "function"
  // If it doesn't, the import path to store is wrong.
  console.log("STORE_DEFINED?", !!store, typeof store?.getState);

  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        <Provider store={store}>
          <PaperProvider theme={theme}>
            <AppShell />
          </PaperProvider>
        </Provider>
      </I18nextProvider>
    </SafeAreaProvider>
  );
}

function AppShell() {
  const isAuthed = useSelector(selectIsAuthed);
  const jwt = useSelector(selectJwt);
  const getToken = useCallback(async () => jwt || "", [jwt]);

  useLayoutEffect(() => {
    // Always create/refresh the socket so screens can safely subscribe.
    initSocket(getToken);
  }, [getToken]);

  return <Slot />;
}
