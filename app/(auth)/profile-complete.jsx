import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Avatar, useTheme } from "react-native-paper";
import LocationInput from "../../src/features/auth/components/LocationInput/LocationInput";
import { useTranslationLoader } from "../../src/localization/hooks/useTranslationLoader";
import AppButton from "../../src/shared/components/ui/AppButton/AppButton";
import AppInput from "../../src/shared/components/ui/AppInput/AppInput";
import Heading from "../../src/shared/components/ui/Heading/Heading";
import InputLabel from "../../src/shared/components/ui/InputLabel/InputLabel";
import { supabase } from "../../src/shared/services/supabase/client";
import { uploadImageToSupabase } from "../../src/shared/services/supabase/upload";
import { pickOneImage } from "../../src/shared/utils/pickImages";
import LoadingModal from "../../src/shared/components/ui/LoadingModal/LoadingModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileCompleteScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [imagePath, setImagePath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState(null);
  const [errors, setErrors] = useState({
    name: "",
    location: "",
  });
  const { t } = useTranslationLoader(["auth"]);

  const handleImagePick = async () => {
    const image = await pickOneImage();
    if (image) {
      setImage(image);
    } else {
      console.log("No image selected");
    }
  };

  const handleNameBlur = () => {
    const error = name.trim() === "" ? "Name is required" : "";
    setErrors((prev) => ({ ...prev, name: error }));
  };

  const handleSubmit = async () => {
    const nameError = name.trim() === "" ? "Name is required" : "";
    const locationError = !location ? "Location is required" : "";

    const newErrors = {
      name: nameError,
      location: locationError,
    };

    setErrors(newErrors);

    if (nameError || locationError) {
      return;
    }

    setLoading(true); // Show loading state

    try {
      // Upload avatar image
      const { signedUrl } = await uploadImageToSupabase(image, "avatars");

      // Get user and access token from session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session)
        throw new Error("Failed to retrieve user session.");

      const user = session.user;
      const accessToken = session.access_token;

      // Construct profile payload
      const newProfile = {
        supaId: user.id,
        email: user.email,
        name,
        avatarUrl: signedUrl,
        location,
      };

      // Send profile to backend
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_API_URL}/profile/`,
        newProfile,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response?.data) {
        const { _id, ...restProfile } = response.data;
        await AsyncStorage.setItem("profileId", _id.toString());
        await AsyncStorage.setItem("profile", JSON.stringify(response.data));

        router.replace("/pet-preferences");
      }
    } catch (error) {
      console.error("Submit error:", error);
      console.error("Response error:", error.response?.data || error.message);
      Alert.alert("Error", "Could not complete profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <LoadingModal loading={loading} />
      <Heading
        title={t("profile-c.title")}
        description={t("profile-c.description")}
        align="start"
      />
      <View style={styles.avatarContainer}>
        <Avatar.Image
          size={150}
          source={
            image
              ? { uri: image }
              : require("../../src/assets/images/avatar-placeholder.png")
          }
          style={styles.avatar}
        />
        <AppButton
          variant="secondary"
          style={{ width: "fit-content" }}
          text={t("profile-c.uploadButton")}
          onPress={handleImagePick}
        />
      </View>
      <View>
        <InputLabel text={t("profile-c.name.label")} />
        <AppInput
          placeholder={t("profile-c.name.placeholder")}
          value={name}
          onChangeText={(text) => {
            setName(text);
            setErrors((prev) => ({ ...prev, name: "" }));
          }}
          onBlur={handleNameBlur}
          error={!!errors.name}
          errorMessage={errors.name}
        />
      </View>
      <View>
        <InputLabel text={t("profile-c.location.label")} />
        <LocationInput
          onLocationRetrieved={({ geoJson, readable }) => {
            setLocation(geoJson);
            setErrors((prev) => ({ ...prev, location: "" }));
          }}
          error={!!errors.location}
          errorMessage={errors.location}
        />
      </View>

      <AppButton
        text={t("profile-c.submit")}
        onPress={handleSubmit}
        disabled={loading} // Disable the button while loading
        style={styles.submitButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 60,
    paddingHorizontal: 28,
    paddingTop: 100,
    height: "100%",
    gap: 12,
  },
  avatar: {
    marginBottom: 12,
  },
  avatarContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginVertical: 32,
  },
  submitButton: {
    width: "100%",
    marginTop: 16,
  },
});
