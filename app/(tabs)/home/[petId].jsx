// app/(tabs)/home/[petId].jsx
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Menu, Snackbar, Text, useTheme } from "react-native-paper";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

import AboutText from "@/src/features/pets/Components/PetDetails/AboutText";
import PetChips from "@/src/features/pets/Components/PetDetails/PetChips";
import PetHeader from "@/src/features/pets/Components/PetDetails/PetHeader";
import PostedByCard from "@/src/features/pets/Components/PetDetails/PostedByCard";
import StatCards from "@/src/features/pets/Components/PetDetails/StatCards";
import {
  createOrGetChatWithParticipants,
  sendMessage,               // ⬅️ used to send the pet card + opener
} from "@/src/shared/services/chatService";
import AppButton from "@/src/shared/components/ui/AppButton/AppButton";

import {
  deletePet,
  fetchPetById,
  setAdopted,
} from "@/src/features/pets/services/petApi";
import { deleteImageFromSupabase } from "@/src/shared/services/supabase/delete";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getReadableAddress } from "@/src/features/home/utils/getReadbleAddress";
import { formatTimeAgo } from "@/src/features/home/utils/timeAgo";
import LoadingModal from "@/src/shared/components/ui/LoadingModal/LoadingModal";
import { getAuthToken } from "@/src/shared/services/supabase/getters";

export const unstable_settings = {
  tabBarStyle: { display: "none" },
  headerShown: false,
};

export default function PetDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { petId } = useLocalSearchParams();
  const { t } = useTranslationLoader("petdetails");
  const queryClient = useQueryClient();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [readableAddress, setReadableAddress] = useState("");
  const [profile, setProfile] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Optional: gate the button until we know if there is a session
  const [authReady, setAuthReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    (async () => {
      const tok = await getAuthToken();
      setHasSession(!!tok);
      setAuthReady(true);
    })();
  }, []);

  const {
    data: petData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pet", petId],
    queryFn: () => fetchPetById(String(petId)),
    initialData: () => {
      const pets = queryClient.getQueryData(["pets", "list"]);
      return pets?.find((p) => p._id === petId);
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleScroll = (event) => {
    const slide = Math.round(
      event.nativeEvent.contentOffset.x / Dimensions.get("window").width
    );
    if (slide !== activeIndex) setActiveIndex(slide);
  };

  // Load local profile (for owner self-check + UI labels)
  useEffect(() => {
    AsyncStorage.getItem("user-profile").then((s) => {
      if (s) setProfile(JSON.parse(s));
    });
  }, []);

  const isOwner = profile?._id && petData?.postedBy?._id === profile._id;

  const handleAdoptMe = async () => {
    try {
      // ✅ Check the real auth signal (Supabase token)
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Login required", "Please sign in to start a chat.");
        return;
      }

      const ownerId = petData?.postedBy?._id ? String(petData.postedBy._id) : "";
      if (!ownerId) throw new Error("No owner found for this pet.");

      // Optional self-check if profile is loaded
      if (profile?._id && String(profile._id) === ownerId) {
        Alert.alert("Note", "You are the owner of this pet.");
        return;
      }

      setLoading(true);

      // Ensure (or create) chat — include petId only if truthy to avoid duplicate keys
      const payload = { otherUserId: ownerId };
      if (petId) payload.petId = String(petId);

      const { chatId } = await createOrGetChatWithParticipants(
        payload,
        async () => (await getAuthToken()) || ""
      );
      if (!chatId) throw new Error("No chatId returned");

      // --- Compose a compact pet summary
      const imgUrl = Array.isArray(petData?.images) ? petData.images[0] : null;
      const summaryBits = [
        petData?.name,
        petData?.breed && String(petData.breed).replace(/([A-Z])/g, " $1").trim(),
        petData?.age?.value ? `${petData.age.value} ${petData.age.unit}` : null,
        petData?.gender,
      ].filter(Boolean);
      const summary = summaryBits.join(" • ");

      // 1) Send image card first
      if (imgUrl) {
        await sendMessage(
          chatId,
          {
            type: "image",
            content: {
              imageUrl: imgUrl,
              // Send both fields so either renderer shows something
              label: summary,
              text: summary,
            },
          },
          async () => (await getAuthToken()) || ""
        );
      }

      // 2) Then a friendly opener
      const ownerFirst = petData?.postedBy?.name?.split(" ")?.[0] || "";
      await sendMessage(
        chatId,
        {
          type: "text",
          content: {
            text: `Hi ${ownerFirst ? ownerFirst + "," : ""} I'm interested in adopting ${petData?.name || "your pet"}.`,
          },
        },
        async () => (await getAuthToken()) || ""
      );

      // Navigate to the chat
      router.push({
        pathname: "/chats/[chatId]",
        params: { chatId, title: petData?.postedBy?.name || "Chat" },
      });
    } catch (e) {
      Alert.alert("Couldn’t start chat", e?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPet = () => {
    setMenuVisible(false);
    router.push(`/addPet/${petId}`);
  };

  const handleMarkAsAdopted = () => {
    setMenuVisible(false);
    Alert.alert(
      t("confirmAdoptTitle", "Mark as Adopted?"),
      t("confirmAdoptMessage", "Are you sure you want to mark this pet as adopted?"),
      [
        { text: t("cancel", "Cancel"), style: "cancel" },
        {
          text: t("confirm", "Confirm"),
          onPress: async () => {
            try {
              setLoading(true);
              await setAdopted(petId);
              await queryClient.invalidateQueries(["pet", petId]);
              await queryClient.invalidateQueries(["pets", "list"]);
              setSnackbarVisible(true);
            } catch {
              Alert.alert(
                t("adoptErrorTitle", "Error"),
                t("adoptErrorMessage", "Failed to mark the pet as adopted.")
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeletePet = async () => {
    setMenuVisible(false);
    Alert.alert(
      t("confirmDeleteTitle", "Delete Pet?"),
      t("confirmDeleteMessage", "Are you sure you want to delete this pet? This action cannot be undone."),
      [
        { text: t("cancel", "Cancel"), style: "cancel" },
        {
          text: t("delete", "Delete"),
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const imagePaths =
                petData?.images
                  ?.map((url) => {
                    const match = url.match(/\/object\/sign\/([^/]+)\/(.+)\?/);
                    if (!match) return null;
                    return { bucketName: match[1], filePath: match[2] };
                  })
                  .filter(Boolean) || [];

              await deletePet(petId);

              for (const { bucketName, filePath } of imagePaths) {
                await deleteImageFromSupabase(bucketName, filePath);
              }

              setLoading(false);
              router.back();
            } catch {
              setLoading(false);
              Alert.alert(
                t("deleteErrorTitle", "Deletion Failed"),
                t("deleteErrorMessage", "There was an error deleting the pet. Please try again.")
              );
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (petData?.location?.coordinates?.length === 2) {
      const [longitude, latitude] = petData.location.coordinates;
      getReadableAddress(latitude, longitude).then(setReadableAddress);
    }
  }, [petData]);

  if (isLoading) {
    return <Text style={{ padding: 16 }}>{t("loading", "Loading…")}</Text>;
  }
  if (error || !petData) {
    return (
      <Text style={{ padding: 16, color: theme.colors.error }}>
        {t("error", "Failed to load pet data.")}
      </Text>
    );
  }

  const {
    name,
    gender,
    breed,
    vaccinated,
    sterilized,
    size,
    activityLevel,
    postedBy,
    description,
    location,
    images,
    age,
    color,
  } = petData;

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.surface }}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{ label: t("ok", "OK"), onPress: () => setSnackbarVisible(false) }}
      >
        {t("adoptedSuccess", "Pet has been marked as adopted.")}
      </Snackbar>

      <LoadingModal loading={loading} />

      <View style={styles.heroContainer}>
        <Pressable onPress={() => router.back()} style={styles.backIcon}>
          <View style={styles.backIconWrapper}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.palette.blue[500]} />
          </View>
        </Pressable>

        {isOwner && (
          <View style={styles.menuIcon}>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Pressable onPress={() => setMenuVisible(true)} style={styles.menuButton}>
                  <Ionicons name="ellipsis-vertical" size={22} color={theme.colors.palette.blue[500]} />
                </Pressable>
              }
            >
              <Menu.Item onPress={handleMarkAsAdopted} title="Mark As Adopted" leadingIcon="check" />
              <Menu.Item onPress={handleEditPet} title="Edit Pet Details" leadingIcon="pencil" />
              <Menu.Item
                onPress={handleDeletePet}
                title="Delete Pet"
                leadingIcon={() => (
                  <Ionicons name="trash" size={20} color={theme.colors.palette.error[500]} />
                )}
                titleStyle={{ color: theme.colors.palette.error[500] }}
              />
            </Menu>
          </View>
        )}

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {images?.map((img, index) => (
            <Pressable
              key={index}
              onPress={() => {
                setSelectedImage(img);
                setActiveIndex(index);
                setIsModalVisible(true);
              }}
            >
              <Image source={{ uri: img }} style={styles.carouselImage} resizeMode="cover" />
            </Pressable>
          ))}
        </ScrollView>

        {images?.length > 1 && (
          <View style={styles.carouselIndicators}>
            {images.map((_, index) => (
              <View key={index} style={[styles.dot, index === activeIndex && styles.activeDot]} />
            ))}
          </View>
        )}
      </View>

      <View style={styles.content}>
        <PetHeader
          name={name}
          colors={color ?? ["#ccc", "#fff"]}
          adopted={petData.status === "adopted"}
        >
          <PetChips
            gender={gender}
            breed={breed}
            vaccinated={vaccinated}
            sterilized={sterilized}
          />
        </PetHeader>

        <StatCards size={size} age={age?.value} activity={activityLevel} />

        <PostedByCard
          name={postedBy?.name ?? "Unknown"}
          avatarUrl={postedBy?.avatarUrl}
          postedAt={formatTimeAgo(petData.createdAt, t)}
        />

        <AboutText description={description || t("noDescription")} />

        <View style={styles.section}>
          <Text variant="headlineMedium" style={styles.sectionTitle}>
            {t("locationTitle")}
          </Text>

          {location?.coordinates && (
            <>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location.coordinates[1],
                  longitude: location.coordinates[0],
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: location.coordinates[1],
                    longitude: location.coordinates[0],
                  }}
                  title={name}
                  description={readableAddress}
                />
              </MapView>

              <View style={styles.locationInfoRow}>
                <Ionicons name="location-outline" size={18} color="#6c757d" style={{ marginRight: 6 }} />
                <Text style={styles.locationText}>
                  {readableAddress} •
                  {petData.distanceText && t("locationDistance", { distance: petData.distanceText })}
                </Text>
              </View>
            </>
          )}
        </View>

        <AppButton
          onPress={handleAdoptMe}
          text={t("adoptMe")}
          disabled={isOwner || !authReady || !hasSession}
          style={styles.adoptButton}
        />
      </View>

      <Modal visible={isModalVisible} transparent>
        <View style={styles.modalContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(event) => {
              const newIndex = Math.round(
                event.nativeEvent.contentOffset.x / Dimensions.get("window").width
              );
              setActiveIndex(newIndex);
            }}
            contentOffset={{
              x: Dimensions.get("window").width * activeIndex,
              y: 0,
            }}
          >
            {images?.map((img, index) => (
              <Image key={index} source={{ uri: img }} style={styles.fullscreenImage} resizeMode="contain" />
            ))}
          </ScrollView>

          <Pressable style={styles.modalClose} onPress={() => setIsModalVisible(false)}>
            <Ionicons name="close" size={28} color="#fff" />
          </Pressable>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    position: "relative",
    width: "100%",
    height: 350,
    overflow: "hidden",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: "lightgray",
  },
  carouselImage: {
    width: Dimensions.get("window").width,
    height: 350,
  },
  backIcon: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  menuIcon: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  menuButton: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 12,
    elevation: 3,
  },
  backIconWrapper: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  locationInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    color: "#6c757d",
    flexShrink: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalClose: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 20,
    padding: 8,
  },
  fullscreenImage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  carouselIndicators: {
    position: "absolute",
    bottom: 16,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    zIndex: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  map: {
    width: Dimensions.get("window").width - 32,
    height: 200,
    borderRadius: 10,
    alignSelf: "center",
  },
  adoptButton: {
    marginTop: 24,
    alignSelf: "center",
  },
});
