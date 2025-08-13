// app/(tabs)/home/[petId].jsx (or your PetDetailScreen file)
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Text, useTheme } from "react-native-paper";

// i18n
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

// Pet UI
import AboutText from "@/src/features/pets/Components/PetDetails/AboutText";
import PetChips from "@/src/features/pets/Components/PetDetails/PetChips";
import PetHeader from "@/src/features/pets/Components/PetDetails/PetHeader";
import PostedByCard from "@/src/features/pets/Components/PetDetails/PostedByCard";
import StatCards from "@/src/features/pets/Components/PetDetails/StatCards";
import AppButton from "@/src/shared/components/ui/AppButton/AppButton";

// Demo assets
import LucyImage from "@/assets/images/Lucy.png";
import Lucy2Image from "@/assets/images/Lucy2.png";
import AvatarImage from "@/assets/images/avatar.png";

// Chat service (correct path)
import { ensureDirectChatWith } from "@/src/shared/services/chatService";

// 🔁 Redux auth
import { selectIsAuthed, selectJwt } from "@/src/features/auth/store/authSlice";
import { useSelector } from "react-redux";

export const unstable_settings = {
  tabBarStyle: { display: "none" },
  headerShown: false,
};

export default function PetDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslationLoader("petdetails");

  // Prefer ownerId from params if provided
  const { petId, ownerId: ownerIdParam } = useLocalSearchParams();

  // Redux auth → build getToken() that chatService expects
  const isAuthed = useSelector(selectIsAuthed);
  const jwt = useSelector(selectJwt);
  const getToken = useCallback(async () => jwt || "", [jwt]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleScroll = (event) => {
    const slide = Math.round(
      event.nativeEvent.contentOffset.x / Dimensions.get("window").width
    );
    if (slide !== activeIndex) setActiveIndex(slide);
  };

  // Demo data; ensure you pass real ownerId via params or fetched pet object
  const petData = {
    id: petId,
    images: [LucyImage, Lucy2Image],
    colors: ["#b57a4f", "#fffaf8ff"], // visual only; safe to keep
    name: "Lucy",
    gender: "Female",
    breed: "Mixed Breed",
    vaccinated: true,
    sterilized: true,
    size: "Medium",
    age: "2 years",
    activity: "Medium",
    postedBy: {
      name: "Naim Ahmed",
      avatarUrl: AvatarImage,
      postedAt: 2, // days
      // IMPORTANT: replace with real owner’s userId from backend
      userId: ownerIdParam || "owner-user-id-placeholder",
    },
    description:
      "Lucy is a playful yet calm cat who loves to explore and have fun, but also enjoys quiet moments and relaxing by your side.",
    location: {
      address: "Lebanon, Tripoli, Abu Samra",
      distance: 5,
      coordinates: { latitude: 34.4361, longitude: 35.8497 },
    },
  };

  const handleAdopt = async () => {
    // Business rule: only create chat from this CTA
    if (!isAuthed) {
      // TODO: route to your login screen
      // router.push("/login");
      return;
    }

    const ownerId = String(petData.postedBy.userId || ownerIdParam || "");
    if (!ownerId) return;

    try {
      const { chatId } = await ensureDirectChatWith(ownerId, getToken);
      router.push(`/chats/${chatId}`);
    } catch (e) {
      // Optional: show a snackbar/toast
      // console.log("Failed to ensure chat", e);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.surface }}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroContainer}>
        <Pressable onPress={() => router.back()} style={styles.backIcon}>
          <View
            style={[styles.backIconWrapper, { backgroundColor: theme.colors.surface }]}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.palette.blue[500]}
            />
          </View>
        </Pressable>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {petData.images.map((img, index) => (
            <Pressable
              key={index}
              onPress={() => {
                setSelectedImage(img);
                setActiveIndex(index);
                setIsModalVisible(true);
              }}
            >
              <Image source={img} style={styles.carouselImage} resizeMode="cover" />
            </Pressable>
          ))}
        </ScrollView>

        {petData.images.length > 1 && (
          <View style={styles.carouselIndicators}>
            {petData.images.map((_, index) => (
              <View key={index} style={[styles.dot, index === activeIndex && styles.activeDot]} />
            ))}
          </View>
        )}
      </View>

      <View style={styles.content}>
        <PetHeader name={petData.name} colors={petData.colors}>
          <PetChips
            gender={petData.gender}
            breed={petData.breed}
            vaccinated={petData.vaccinated}
            sterilized={petData.sterilized}
          />
        </PetHeader>

        <StatCards size={petData.size} age={parseInt(petData.age)} activity={petData.activity} />

        <PostedByCard
          name={petData.postedBy.name}
          avatarUrl={petData.postedBy.avatarUrl}
          postedAt={t("daysAgo", { days: petData.postedBy.postedAt })}
        />

        <AboutText description={t("aboutText")} />

        <View style={styles.section}>
          <Text variant="headlineMedium" style={styles.sectionTitle}>
            {t("locationTitle")}
          </Text>

          <MapView
            style={styles.map}
            initialRegion={{
              latitude: petData.location.coordinates.latitude,
              longitude: petData.location.coordinates.longitude,
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
                latitude: petData.location.coordinates.latitude,
                longitude: petData.location.coordinates.longitude,
              }}
              title={petData.name}
              description={petData.location.address}
            />
          </MapView>

          <View style={styles.locationInfoRow}>
            <Ionicons
              name="location-outline"
              size={18}
              color={theme.colors.outline}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.locationText, { color: theme.colors.outline }]}>
              {petData.location.address} •{" "}
              {t("locationDistance", { distance: `${petData.location.distance} km` })}
            </Text>
          </View>
        </View>

        <AppButton onPress={handleAdopt} text={t("adoptMe")} style={styles.adoptButton} />
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
            {petData.images.map((img, index) => (
              <Image key={index} source={img} style={styles.fullscreenImage} resizeMode="contain" />
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
  backIconWrapper: {
    padding: 8,
    borderRadius: 12,
    elevation: 3, // Android shadow
    shadowColor: "#000", // iOS shadow
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
  activeDot: { backgroundColor: "#fff" },
  content: { padding: 16 },
  section: { marginTop: 24, marginBottom: 16 },
  sectionTitle: { marginBottom: 8 },
  map: {
    width: Dimensions.get("window").width - 32,
    height: 200,
    borderRadius: 10,
    alignSelf: "center",
  },
  adoptButton: { marginTop: 24, alignSelf: "center" },
});
