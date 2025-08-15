import React, { useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  I18nManager,
} from "react-native";
import { Text, useTheme, IconButton } from "react-native-paper";
import { pickMultipleImages } from "../../../src/shared/utils/pickImages";
import InputLabel from "../../../src/shared/components/ui/InputLabel/InputLabel";
import SpecieSelect from "../../../src/features/addPet/Components/SpecieSelect/SpecieSelect";
import { useTranslationLoader } from "../../../src/localization/hooks/useTranslationLoader";
import BreedSelect from "../../../src/features/addPet/Components/BreedSelect/BreedSelect";
import AppInput from "../../../src/shared/components/ui/AppInput/AppInput";
import ColorSelect from "../../../src/features/addPet/Components/ColorSelect/ColorSelect";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  activityOption,
  gender,
  sizeOptions,
} from "../../../src/shared/constants/prefs";
import SelectOption from "../../../src/shared/components/ui/CustomSelect/SelectOption";
import PetHealthCheckboxes from "../../../src/features/addPet/Components/PetHealthCheckboxes/PetHealthCheckboxes";
import PetAgeInput from "../../../src/features/addPet/Components/AgeInput/AgeInput";
import LocationInput from "../../../src/features/auth/components/LocationInput/LocationInput";
import MapPicker from "../../../src/features/addPet/Components/MapPicker/MapPicker";
import MapPickerModal from "../../../src/features/addPet/Components/MapPicker/MapPickerModal";
import MapView, { Marker } from "react-native-maps";
import AppButton from "../../../src/shared/components/ui/AppButton/AppButton";
import StandardSelect from "../../../src/features/addPet/Components/StandardSelect/StandardSelect";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { uploadImageToSupabase } from "../../../src/shared/services/supabase/upload";
import axios from "axios";
import { getAuthToken } from "../../../src/shared/services/supabase/getters";
import LoadingModal from "../../../src/shared/components/ui/LoadingModal/LoadingModal";

export default function AddPetScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslationLoader(["addPet"]);

  const [images, setImages] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [specie, setSpecie] = useState(null);
  const [breed, setBreed] = useState(null);
  const [colors, setColors] = useState([]);
  const [age, setAge] = useState({ value: "", unit: "" });
  const [size, setSize] = useState(null);
  const [activity, setActivity] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
  const [health, setHealth] = useState({
    sterilized: false,
    vaccinated: false,
    dewormed: false,
    hasPassport: false,
    specialNeeds: false,
  });
  const [location, setLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Errors state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const isRTL = I18nManager.isRTL;
  const { colors: ThemeColors } = theme;

  const handlePickImages = async () => {
    const picked = await pickMultipleImages();
    if (picked.length > 0) {
      const newImages = [...images, ...picked].slice(0, 8);
      setImages(newImages);
      if (!mainImage) setMainImage(newImages[0]);
    }
  };

  const handleRemoveImage = (uri) => {
    const filtered = images.filter((img) => img !== uri);
    setImages(filtered);
    if (mainImage === uri) {
      setMainImage(filtered[0] || null);
    }
  };

  const toggleGenderSelection = (value) => {
    setSelectedGender(value);
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    if (!images.length) newErrors.images = t("errors.imagesRequired");
    if (!name.trim()) newErrors.name = t("errors.nameRequired");
    if (!specie) newErrors.specie = t("errors.specieRequired");
    if (!colors.length) newErrors.colors = t("errors.colorRequired");
    if (!age.value) newErrors.age = t("errors.ageRequired");
    if (!age.unit) newErrors.age = t("errors.ageUnitRequired");
    if (!size) newErrors.size = t("errors.sizeRequired");
    if (!activity) newErrors.activity = t("errors.activityRequired");
    if (!selectedGender) newErrors.gender = t("errors.genderRequired");
    if (!location) newErrors.location = t("errors.locationRequired");

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setLoading(true);
        // 1️⃣ Get profileId from AsyncStorage
        let profileId = await AsyncStorage.getItem("p-id");
        if (!profileId) {
          const profile = await AsyncStorage.getItem("user-profile");
          const parsedProfile = JSON.parse(profile);
          if (!parsedProfile) throw new Error("No profile ID found in storage");
          else profileId = parsedProfile._id;
        }

        // 2️⃣ Upload all images
        const uploadedImages = [];
        for (const imageUri of images) {
          const uploaded = await uploadImageToSupabase(imageUri, "pets");
          uploadedImages.push(uploaded.signedUrl); // or uploaded.path if you prefer storing path
        }

        // 3️⃣ Build pet object (following your schema)
        const petData = {
          name: name.trim(),
          species: specie,
          breed: breed || "",
          gender: selectedGender || "unknown",
          age: {
            value: Number(age.value),
            unit: age.unit,
          },
          color: colors || [],
          size: size || undefined,
          activityLevel: activity || undefined,
          description: description || "",
          sterilized: health.sterilized ?? false,
          vaccinated: health.vaccinated ?? false,
          dewormed: health.dewormed ?? false,
          hasPassport: health.hasPassport ?? false,
          specialNeeds: health.specialNeeds ?? false,
          // healthNotes: healthNotes || "",
          images: uploadedImages,
          status: "available",
          location: {
            type: "Point",
            coordinates: location?.geoJson.coordinates || [0, 0],
            // city: formValues.location?.city || "",
            // state: formValues.location?.state || "",
            // country: formValues.location?.country || "",
          },
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
    } else {
      console.log("Validation failed");
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

      {/* Main Image */}
      {mainImage ? (
        <Image source={{ uri: mainImage }} style={styles.mainImage} />
      ) : (
        <TouchableOpacity
          style={[styles.addBox, { borderColor: theme.colors.outline }]}
          onPress={handlePickImages}
        >
          <Ionicons name="image" size={36} />
          <Text style={{ color: ThemeColors.surface }}>{t("imagePick")}</Text>
        </TouchableOpacity>
      )}
      {errors.images && (
        <Text
          style={[styles.errorText, { color: ThemeColors.palette.error[500] }]}
        >
          {errors.images}
        </Text>
      )}

      {/* Thumbnails */}
      {images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbRow}
        >
          {images.map((uri) => (
            <View key={uri} style={styles.thumbWrapper}>
              <TouchableOpacity onPress={() => setMainImage(uri)}>
                <Image source={{ uri: uri }} style={styles.thumbnail} />
              </TouchableOpacity>
              <IconButton
                icon="close"
                size={12}
                style={styles.deleteIcon}
                onPress={() => handleRemoveImage(uri)}
              />
            </View>
          ))}
          {images.length < 8 && (
            <TouchableOpacity
              style={[styles.thumbAdd, { borderColor: theme.colors.outline }]}
              onPress={handlePickImages}
            >
              <IconButton icon="plus" size={20} />
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {/* Name */}
      <View>
        <InputLabel text={t("inputs.name.label")} />
        <AppInput value={name} onChangeText={setName} style={{ height: 50 }} />
        {errors.name && (
          <Text
            style={[
              styles.errorText,
              { color: ThemeColors.palette.error[500] },
            ]}
          >
            {errors.name}
          </Text>
        )}
      </View>

      {/* Description */}

      <View>
        <InputLabel text={t("inputs.description.label")} />
        <AppInput
          value={description}
          onChangeText={setDescription}
          multiline={true}
          max={120}
          style={{ height: 120 }}
        />
      </View>

      {/* Specie + Breed */}
      <View style={{ flexDirection: "row", gap: 12, paddingVertical: 12 }}>
        <View style={{ flex: 1 }}>
          <InputLabel text={t("inputs.specie.label")} />
          <SpecieSelect value={specie} onChange={setSpecie} />
          {errors.specie && (
            <Text
              style={[
                styles.errorText,
                { color: ThemeColors.palette.error[500] },
              ]}
            >
              {errors.specie}
            </Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <InputLabel text={t("inputs.breed.label")} />
          <BreedSelect specie={specie} value={breed} onChange={setBreed} />
        </View>
      </View>

      {/* Colors */}
      <View>
        <InputLabel text={t("inputs.color.label")} />
        <ColorSelect value={colors} onChange={setColors} />
        {errors.colors && (
          <Text
            style={[
              styles.errorText,
              { color: ThemeColors.palette.error[500] },
            ]}
          >
            {errors.colors}
          </Text>
        )}
      </View>

      {/* Age */}
      <View>
        <InputLabel text={t("inputs.age.label")} />
        <PetAgeInput age={age} onChange={setAge} />
        {errors.age && (
          <Text
            style={[
              styles.errorText,
              { color: ThemeColors.palette.error[500] },
            ]}
          >
            {errors.age}
          </Text>
        )}
      </View>

      {/* Size + Activity */}
      <View style={{ flexDirection: "row", gap: 12, paddingVertical: 12 }}>
        <View style={{ flex: 1 }}>
          <InputLabel text={t("inputs.size.label")} />
          <StandardSelect
            data={sizeOptions}
            value={size}
            onChange={setSize}
            placeholderKey="inputs.size.placeholder"
            translationNamespace={["addPet", "common"]}
            labelKey="inputs.size"
          />
          {errors.size && (
            <Text
              style={[
                styles.errorText,
                { color: ThemeColors.palette.error[500] },
              ]}
            >
              {errors.size}
            </Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <InputLabel text={t("inputs.activity.label")} />
          <StandardSelect
            data={activityOption}
            value={activity}
            onChange={setActivity}
            placeholderKey="inputs.activity.placeholder"
            translationNamespace={["addPet", "common"]}
            labelKey="inputs.activity"
          />
          {errors.activity && (
            <Text
              style={[
                styles.errorText,
                { color: ThemeColors.palette.error[500] },
              ]}
            >
              {errors.activity}
            </Text>
          )}
        </View>
      </View>

      {/* Gender */}
      <View>
        <InputLabel text={t("inputs.gender.label")} />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {gender.map((option) => {
            const translatedLabel = t(`gender.${option.value}`, {
              ns: "common",
            });
            return (
              <SelectOption
                key={option.value}
                label={translatedLabel}
                icon={option.iconName}
                iconColor={option.iconColor}
                selected={selectedGender === option.value}
                onPress={() => toggleGenderSelection(option.value)}
                style={{ width: 180 }}
              />
            );
          })}
        </View>
        {errors.gender && (
          <Text
            style={[
              styles.errorText,
              { color: ThemeColors.palette.error[500] },
            ]}
          >
            {errors.gender}
          </Text>
        )}
      </View>

      {/* Health */}
      <View>
        <InputLabel text={t("inputs.health.label")} />
        <PetHealthCheckboxes values={health} onChange={setHealth} />
      </View>

      {/* Location */}
      <View>
        <InputLabel text={t("location.label", { ns: "common" })} />
        {location && (
          <View style={{ marginTop: 12 }}>
            <MapView
              style={{ height: 200, borderRadius: 12, overflow: "hidden" }}
              region={{
                latitude: location.geoJson.coordinates[1],
                longitude: location.geoJson.coordinates[0],
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: location.geoJson.coordinates[1],
                  longitude: location.geoJson.coordinates[0],
                }}
              />
            </MapView>
            {/* Action Buttons */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginTop: 8,
                paddingHorizontal: 4,
              }}
            >
              <Ionicons
                name="location-outline"
                size={24}
                color={ThemeColors.onSurface}
              />
              <Text variant="bodyMedium" style={{ flex: 1 }}>
                {location.readable}
              </Text>
              <View style={{ flexDirection: "row", gap: 4 }}>
                <TouchableOpacity
                  onPress={() => setModalVisible(true)}
                  style={{
                    backgroundColor: theme.colors.primary,
                    padding: 12,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="pencil"
                    size={16}
                    color={ThemeColors.surface}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setLocation(null)}
                  style={{
                    backgroundColor: theme.colors.error,
                    padding: 12,
                    borderRadius: 8,
                    alignItems: "center",
                    marginStart: 8,
                  }}
                >
                  <Ionicons
                    name="trash"
                    size={16}
                    color={ThemeColors.surface}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        <LocationInput onLocationRetrieved={setLocation} />
        <MapPicker onPress={() => setModalVisible(true)} />
        <MapPickerModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={setLocation}
        />
        {errors.location && (
          <Text
            style={[
              styles.errorText,
              { color: ThemeColors.palette.error[500] },
            ]}
          >
            {errors.location}
          </Text>
        )}
      </View>

      {/* Submit */}
      <View style={{ marginVertical: 12 }}>
        <AppButton text={t("submit")} onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  heading: { flexDirection: "row", paddingVertical: 20 },
  addBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 8,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
  },
  mainImage: { width: "100%", height: 220, borderRadius: 8 },
  thumbRow: { marginTop: 8, flexDirection: "row" },
  thumbWrapper: { position: "relative", marginRight: 8 },
  thumbnail: { width: 60, height: 60, borderRadius: 8 },
  deleteIcon: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "white",
  },
  thumbAdd: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: { marginVertical: 4, fontSize: 12 },
});
