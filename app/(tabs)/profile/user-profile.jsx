import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, I18nManager, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, IconButton, Text, useTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslationLoader } from "../../../src/localization/hooks/useTranslationLoader";
import { pickOneImage } from "../../../src/shared/utils/pickImages";
import { uploadImageToSupabase } from "../../../src/shared/services/supabase/upload";
import { supabase } from "../../../src/shared/services/supabase/client";
import LoadingModal from "../../../src/shared/components/ui/LoadingModal/LoadingModal";
import AppButton from "../../../src/shared/components/ui/AppButton/AppButton";
import InputLabel from "../../../src/shared/components/ui/InputLabel/InputLabel";
import AppInput from "../../../src/shared/components/ui/AppInput/AppInput";
import LocationInput from "../../../src/features/auth/components/LocationInput/LocationInput";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import LocationPreview from "../../../src/shared/components/ui/LocationPreview/LocationPreview";
import PhoneNumberInput from "../../../src/shared/components/ui/PhoneNumberInput/PhoneNumberInput";

export default function ProfilePreviewScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslationLoader(["profile"]);
  const isRTL = I18nManager.isRTL;

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState(null);
  const [errors, setErrors] = useState({ name: "", location: "", phone: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [originalProfile, setOriginalProfile] = useState(null); // New state

  useEffect(() => {
    (async () => {
      const savedProfile = await AsyncStorage.getItem("user-profile");
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setOriginalProfile(profile);
        setName(profile.name || "");
        setBio(profile.bio || "");
        setPhone(profile.phone || "");
        setLocation(profile.location || null);
        setImage(profile.avatarUrl || null);
      }
    })();
  }, []);

  const handleImagePick = async () => {
    const img = await pickOneImage();
    if (img) setImage(img);
  };

  const handleSubmit = async () => {
    const nameError = name.trim() === "" ? "Name is required" : "";
    const locationError = !location ? "Location is required" : "";
    setErrors({ name: nameError, location: locationError, phone: "" });
    if (nameError || locationError) return;

    setLoading(true);
    try {
      let signedUrl = image;
      if (image && !image.startsWith("http")) {
        const uploadResult = await uploadImageToSupabase(image, "avatars");
        signedUrl = uploadResult.signedUrl;
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error("No session found.");

      const user = session.user;
      const accessToken = session.access_token;

      const updatedProfile = {
        name,
        bio,
        phone,
        avatarUrl: signedUrl,
        location: {
          type: "Point",
          coordinates: [
            location.geoJson?.coordinates?.[0] ??
              location.coordinates?.[0] ??
              0,
            location.geoJson?.coordinates?.[1] ??
              location.coordinates?.[1] ??
              0,
          ],
        },
      };

      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_BACKEND_API_URL}/profile/${user.id}`,
        updatedProfile,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response?.data) {
        await AsyncStorage.setItem(
          "user-profile",
          JSON.stringify(response.data)
        );
        setOriginalProfile(response.data); // update stored profile
        setIsEditing(false); // exit edit mode
      }
    } catch (err) {
      console.error("Update error:", err);
      Alert.alert("Error", "Could not update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEdit = () => {
    if (isEditing && originalProfile) {
      // Reset form values
      setName(originalProfile.name || "");
      setBio(originalProfile.bio || "");
      setPhone(originalProfile.phone || "");
      setLocation(originalProfile.location || null);
      setImage(originalProfile.avatarUrl || null);
    }
    setIsEditing((prev) => !prev);
  };

  return (
    <ScrollView>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            paddingBottom: insets.bottom + 12,
            paddingTop: insets.top,
            paddingHorizontal: 24,
          },
        ]}
      >
        <LoadingModal loading={loading} />

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Ionicons
              name={isRTL ? "arrow-forward" : "arrow-back"}
              size={32}
              color={colors.onSurface}
              onPress={() => router.back()}
            />
            <Text variant="headlineLarge" style={{ color: colors.text }}>
              {t("profilePreview.title")}
            </Text>
          </View>
          <IconButton
            icon={isEditing ? "close" : "pencil"}
            onPress={handleToggleEdit}
          />
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Avatar.Image
            size={150}
            source={
              image
                ? { uri: image }
                : require("../../../src/assets/images/avatar-placeholder.png")
            }
            style={styles.avatar}
          />
          {isEditing && (
            <AppButton
              variant="secondary"
              style={{ width: "fit-content" }}
              text={t("profilePreview.uploadButton")}
              onPress={handleImagePick}
            />
          )}
        </View>

        {/* Name */}
        <View>
          <InputLabel text={t("profilePreview.name.label")} />
          <AppInput
            placeholder={t("profilePreview.name.placeholder")}
            value={name}
            onChangeText={(text) => {
              setName(text);
              setErrors((prev) => ({ ...prev, name: "" }));
            }}
            disabled={!isEditing}
            error={!!errors.name}
            errorMessage={errors.name}
          />
        </View>

        {/* Bio */}
        <View>
          <InputLabel text={t("profilePreview.bio.label")} />
          <AppInput
            placeholder={t("profilePreview.bio.placeholder")}
            value={bio}
            onChangeText={(text) => setBio(text)}
            multiline={true}
            style={{ height: 120 }}
            max={200}
            disabled={!isEditing}
          />
        </View>

        {/* Phone */}
        <View>
          <InputLabel text={t("profilePreview.phone")} />
          <PhoneNumberInput
            value={phone}
            onChangePhone={setPhone}
            countryCode="LB"
            disabled={!isEditing}
            onChangeCountry={(country) => {
              console.log(
                "Selected country:",
                country.cca2,
                country.callingCode
              );
            }}
            error={!!errors.phone}
            errorMessage={errors.phone}
          />
        </View>

        {/* Location */}
        <View>
          <InputLabel text={t("profilePreview.location.label")} />
          <LocationPreview
            location={location}
            setLocation={setLocation}
            editable={isEditing}
          />
        </View>

        {/* Actions */}
        {isEditing && (
          <View style={styles.actions}>
            <AppButton
              text={t("profilePreview.submit")}
              onPress={handleSubmit}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 28,
    flex: 1,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  avatar: {
    marginBottom: 12,
  },
  previewText: {
    fontSize: 16,
    color: "#444",
    marginVertical: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
});
