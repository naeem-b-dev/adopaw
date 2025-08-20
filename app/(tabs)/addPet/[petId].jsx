import React, { useState } from "react";
import { ScrollView, StyleSheet, I18nManager, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslationLoader } from "../../../src/localization/hooks/useTranslationLoader";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { uploadImageToSupabase } from "../../../src/shared/services/supabase/upload";
import { deleteImageFromSupabase } from "../../../src/shared/services/supabase/delete";
import axios from "axios";
import { getAuthToken } from "../../../src/shared/services/supabase/getters";
import LoadingModal from "../../../src/shared/components/ui/LoadingModal/LoadingModal";
import { fetchPetById } from "@/src/features/pets/services/petApi";
import PetForm from "../../../src/features/pets/Components/PetForm/PetForm";

export const unstable_settings = {
  tabBarStyle: { display: "none" },
  headerShown: false,
};

export default function EditPetScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { petId } = useLocalSearchParams();
  const { t } = useTranslationLoader(["addPet"]);
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const isRTL = I18nManager.isRTL;
  const { colors: ThemeColors } = theme;

  const {
    data: petData,
    isLoading: isPetLoading,
    error,
  } = useQuery({
    queryKey: ["pet", petId],
    queryFn: () => fetchPetById(petId),
    initialData: () => {
      const pets = queryClient.getQueryData(["pets", "list"]);
      return pets?.find((p) => p._id === petId);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Helper function to extract file path from Supabase URL
  const getFilePathFromUrl = (url) => {
    try {
      // Extract the file path from Supabase storage URL
      // URL format: https://domain.supabase.co/storage/v1/object/sign/bucket/filepath?token=...
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/");
      // Find 'sign' index and get the path after bucket name
      const signIndex = pathParts.indexOf("sign");
      if (signIndex !== -1 && pathParts.length > signIndex + 2) {
        return pathParts.slice(signIndex + 2).join("/");
      }
      return null;
    } catch (error) {
      console.error("Error parsing file path from URL:", error);
      return null;
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);

      // 1️⃣ Handle image deletion - Delete removed images from Supabase
      if (formData.removedImages.length > 0) {
        for (const imageUrl of formData.removedImages) {
          try {
            const filePath = getFilePathFromUrl(imageUrl);
            if (filePath) {
              await deleteImageFromSupabase("pets", filePath);
              console.log("Deleted image:", filePath);
            }
          } catch (deleteError) {
            console.error("Error deleting image:", deleteError);
            // Don't stop the update process if deletion fails
          }
        }
      }

      // 2️⃣ Upload new images (images that are not URLs from Supabase)
      const uploadedImages = [];
      for (const imageUri of formData.images) {
        if (imageUri.startsWith("http")) {
          // Existing image from Supabase, keep as is
          uploadedImages.push(imageUri);
        } else {
          // New image, upload it
          const uploaded = await uploadImageToSupabase(imageUri, "pets");
          uploadedImages.push(uploaded.signedUrl);
        }
      }

      // 3️⃣ Build updated pet object
      const updatedPetData = {
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
        location: formData.location,
      };

      console.log("Updated Pet Object:", updatedPetData);

      const auth = await getAuthToken();

      const res = await axios.put(
        `${process.env.EXPO_PUBLIC_BACKEND_API_URL}/pet/${petId}`,
        updatedPetData,
        {
          headers: {
            Authorization: `Bearer ${auth}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data) {
        console.log("Pet updated successfully:", res.data);

        queryClient.setQueryData(["pet", petId], res.data);

        await Promise.all([
          queryClient.invalidateQueries(["pet", petId]),
         queryClient.invalidateQueries({ queryKey: ["pets"] }),
        ]);

        setLoading(false);

        // Navigate after cache is fresh
        router.replace(`/home/${petId}`);
      }
    } catch (error) {
      console.error("Error updating pet:", error);
      setLoading(false);
    }
  };

  if (isPetLoading) {
    return (
      <View
        style={[styles.container, { backgroundColor: ThemeColors.surface }]}
      >
        <Text style={{ padding: 16 }}>{t("loading", "Loading...")}</Text>
      </View>
    );
  }

  if (error || !petData) {
    return (
      <View
        style={[styles.container, { backgroundColor: ThemeColors.surface }]}
      >
        <Text style={{ padding: 16, color: theme.colors.error }}>
          {t("error", "Failed to load pet data.")}
        </Text>
      </View>
    );
  }

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
          {t("editTitle", "Edit Pet")}
        </Text>
      </View>

      <PetForm
        initialData={petData}
        onSubmit={handleSubmit}
        loading={loading}
        isEditing={true}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  heading: { flexDirection: "row", paddingVertical: 20 },
});
