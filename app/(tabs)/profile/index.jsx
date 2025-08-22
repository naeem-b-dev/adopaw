import React, { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
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
import { useFocusEffect } from "@react-navigation/native";

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);

  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslationLoader("profile");

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        try {
          const storedProfile = await AsyncStorage.getItem("user-profile");

          if (storedProfile) {
            const parsedProfile = JSON.parse(storedProfile);
            setProfile(parsedProfile);
          } else {
            const { token, supaId } = await getAuthInfo();
            console.log("token: ", token);
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
    }, [])
  );

  const logToken = async () => {
    try {
      const { token } = await getAuthInfo();
      console.log("Auth Token:", token);
    } catch (error) {
      console.error("Failed to get auth token:", error);
    }
  };

  logToken();

  const confirmLogout = () => {
    Alert.alert(
      t("logoutConfirmation.title"), // e.g. "Confirm Logout"
      t("logoutConfirmation.message"), // e.g. "Are you sure you want to log out?"
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.confirm"),
          onPress: handleLogout,
          style: "destructive",
        },
      ]
    );
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();

      await AsyncStorage.multiRemove(["user-profile", "p-id"]);

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
          backgroundColor: colors.background,
        },
      ]}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={styles.centeredWrapper}>
        {profile && (
          <View style={styles.profileContainer}>
            <Avatar.Image
              size={128}
              source={
                profile.avatarUrl
                  ? { uri: profile.avatarUrl }
                  : require("../../../src/assets/images/avatar-placeholder.png")
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
        <View style={styles.optionsContainer}>
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
            onPress={confirmLogout}
            danger={true}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  centeredWrapper: {
    alignItems: "center",
    width: "100%",
    flex: 1,
    paddingHorizontal: 20,
  },
});
