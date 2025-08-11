import { getSession } from "@/src/shared/services/supabase/getters";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useLoadFonts } from "../src/fonts/alexandria";
import { clearAllKeys } from "../src/shared/utils/asyncStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function BootScreen() {
  const router = useRouter();
  const fontsLoaded = useLoadFonts();
  const [message, setMessage] = useState("Loading...");
  const didRun = useRef(false);

  // useEffect(() => {
  //   // Clear all keys on app load
  //   clearAllKeys();
  // }, []);

  useEffect(() => {
    if (!fontsLoaded || didRun.current) return;
    didRun.current = true;

    const checkRTLAndAppState = async () => {
      try {
        // 1️⃣ Check user-language in AsyncStorage
        // const lang = "ar";
        // const lang = await AsyncStorage.getItem("user-language");
        // const shouldBeRTL = lang === "ar";
        // console.log("user-language:", lang, "shouldBeRTL:", shouldBeRTL);

        // // Set RTL/LTR without reload (works in Expo Go)
        // if (I18nManager.isRTL !== shouldBeRTL) {
        //   I18nManager.allowRTL(shouldBeRTL);
        //   I18nManager.forceRTL(shouldBeRTL);
        //   console.log("RTL setting updated for this session.");
        // }

        // 2️⃣ Continue with onboarding/session logic
        setMessage("Checking onboarding flag...");
        const firstLaunchFlag = await AsyncStorage.getItem("alreadyLaunched");
        // const firstLaunchFlag = true;
        if (!firstLaunchFlag) {
          router.replace("/(onboarding)");
          return;
        }

        setMessage("Checking session...");
        const session = await getSession();
        const tokenValid = !!session?.access_token; // simple check
        if (!tokenValid) {
          router.replace("/login");
          return;
        }

        router.replace("/(tabs)/home");
      } catch (err) {
        console.error("Boot error:", err);
        router.replace("/login");
      }
    };

    checkRTLAndAppState();
  }, [fontsLoaded, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { marginTop: 12, fontSize: 16, textAlign: "center" },
});
