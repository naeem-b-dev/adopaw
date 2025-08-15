import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Text, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";
import { fetchProfile } from "../../../src/features/profile/services/profileAPI";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuthInfo } from "../../../src/shared/services/supabase/getters";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NavigationButton from "../../../src/shared/components/ui/NavigationButton/NavigationButton";
import { profileMenuOptions } from "../../../src/shared/constants/options";
import { useTranslationLoader } from "../../../src/localization/hooks/useTranslationLoader";
import { supabase } from "../../../src/shared/services/supabase/client";

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);

  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslationLoader("profile");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem("user-profile");

        if (storedProfile) {
          const parsedProfile = JSON.parse(storedProfile);
          setProfile(parsedProfile);
        } else {
          const { token, supaId } = await getAuthInfo();
          const profileData = await fetchProfile(supaId, token);

          setProfile(profileData);

          await AsyncStorage.setItem(
            "user-profile",
            JSON.stringify(profileData)
          );
          await AsyncStorage.setItem("p-id", JSON.stringify(profileData._id));
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();

      // Clear AsyncStorage keys
      await AsyncStorage.multiRemove(["user-profile", "p-id"]);

      // Navigate to login screen
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <ScrollView
      style={[
        styles.container,
        {
          paddingTop: insets.top + 28,
          paddingBottom: insets.bottom + 16,
          paddingLeft: insets.left + 16,
          paddingRight: insets.right + 16,
          backgroundColor: colors.background,
        },
      ]}
    >
      {profile && (
        <View
          style={[
            styles.profileContainer,
            // { borderWidth: 1, borderColor: "red" },
          ]}
        >
          <Avatar.Image
            size={128}
            source={
              profile.avatarUrl
                ? { uri: profile.avatarUrl }
                : require("../../../src/assets/images/avatar-placeholder.png") // fallback image
            }
          />
          <View style={styles.profileInfo}>
            <Text variant="displayMedium" style={{ color: colors.text }}>
              {profile.name}
            </Text>
            <Text
              variant="bodyLarge"
              style={{ color: colors.palette.neutral[500] }}
            >
              {profile.email}
            </Text>
          </View>
        </View>
      )}
      <View
        style={[
          styles.optionsContainer,
          // { borderWidth: 1, borderColor: "red", width: "100%" },
        ]}
      >
        {profileMenuOptions.map((item) => (
          <NavigationButton
            key={item.id}
            title={t(`menu.${item.titleKey}`)}
            iconName={item.iconName}
            iconSvg={item.iconSvg}
            onPress={() => router.push(item.route)}
          />
        ))}
        <NavigationButton
          key={0}
          title={t("menu.logout")}
          iconName={"log-out-outline"}
          onPress={handleLogout}
          danger={true}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: "100%",
  },
  profileContainer: {
    alignItems: "center",
    flexDirection: "column",
    textAlign: "center",
  },
  profileInfo: {
    paddingVertical: 12,
    gap: 4,
    alignItems: "center",
  },
  optionsContainer: {
    gap: 12,
  },
  scrollContentContainer: {
    alignItems: "center", // horizontally center children
    width: "100%",
    justifyContent: "center",
  },
});
