import React, { useState } from "react";
import { ScrollView, StyleSheet, I18nManager, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslationLoader } from "../../../src/localization/hooks/useTranslationLoader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { uploadImageToSupabase } from "../../../src/shared/services/supabase/upload";
import axios from "axios";
import { getAuthToken } from "../../../src/shared/services/supabase/getters";
import LoadingModal from "../../../src/shared/components/ui/LoadingModal/LoadingModal";
import PetForm from "../../../src/features/pets/Components/PetForm/PetForm";

export default function AddPetScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslationLoader(["addPet"]);

  const [loading, setLoading] = useState(false);
  const isRTL = I18nManager.isRTL;
  const { colors: ThemeColors } = theme;

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);

      // 1️⃣ Get profileId from AsyncStorage
      let profileId = null;
      const profile = await AsyncStorage.getItem("user-profile");
      const parsedProfile = JSON.parse(profile);
      console.log("Parsed Profile:");
      console.log(parsedProfile);

      if (!parsedProfile) throw new Error("No profile ID found in storage");
      else profileId = parsedProfile._id;

      // 2️⃣ Upload all images
      const uploadedImages = [];
      for (const imageUri of formData.images) {
        const uploaded = await uploadImageToSupabase(imageUri, "pets");
        uploadedImages.push(uploaded.signedUrl);
      }

      // 3️⃣ Build pet object (following your schema)
      const petData = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed,
        gender: formData.gender || "unknown",
        age: formData.age,
        color: formData.color || [],
        size: formData.size || undefined,
        activityLevel: formData.activityLevel || undefined,
        description: formData.description || "",
        sterilized: formData.sterilized ?? false,
        vaccinated: formData.vaccinated ?? false,
        dewormed: formData.dewormed ?? false,
        hasPassport: formData.hasPassport ?? false,
        specialNeeds: formData.specialNeeds ?? false,
        images: uploadedImages,
        status: "available",
        location: formData.location,
        postedBy: profileId,
      };

      // 4️⃣ Log final object
      console.log("Final Pet Object:", petData);

      const auth = await getAuthToken();

      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_API_URL}/pet/`,
        petData,
        {
          headers: {
            Authorization: `Bearer ${auth}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data) {
        setLoading(false);
        console.log("pet created");
        router.replace("/home");
      }
    } catch (error) {
      console.error("Error submitting pet:", error);
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          backgroundColor: ThemeColors.surface,
          paddingBottom: insets.bottom + 12,
          paddingTop: insets.top,
          paddingHorizontal: 24,
        },
      ]}
    >
      <LoadingModal loading={loading} />
      <View style={styles.heading}>
        <Ionicons
          name={isRTL ? "arrow-forward" : "arrow-back"}
          size={32}
          color={ThemeColors.onSurface}
          onPress={() => router.back()}
        />
        <Text variant="headlineLarge" style={{ color: ThemeColors.text }}>
          {t("title")}
        </Text>
      </View>

      <PetForm onSubmit={handleSubmit} loading={loading} isEditing={false} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  heading: { flexDirection: "row", paddingVertical: 20 },
});
