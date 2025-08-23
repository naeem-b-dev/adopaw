import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  I18nManager,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";
import { useTranslationLoader } from "../../../../localization/hooks/useTranslationLoader";
import AppButton from "../../../../shared/components/ui/AppButton/AppButton";
import AppInput from "../../../../shared/components/ui/AppInput/AppInput";
import SelectOption from "../../../../shared/components/ui/CustomSelect/SelectOption";
import InputLabel from "../../../../shared/components/ui/InputLabel/InputLabel";
import WebMapPreview from "../../../../shared/components/ui/WebMap/WebMapPreview";
import {
  activityOption,
  gender,
  sizeOptions,
} from "../../../../shared/constants/prefs";
import { pickMultipleImages } from "../../../../shared/utils/pickImages";
import PetAgeInput from "../../../addPet/Components/AgeInput/AgeInput";
import BreedSelect from "../../../addPet/Components/BreedSelect/BreedSelect";
import ColorSelect from "../../../addPet/Components/ColorSelect/ColorSelect";
import MapPicker from "../../../addPet/Components/MapPicker/MapPicker";
import MapPickerModal from "../../../addPet/Components/MapPicker/MapPickerModal";
import PetHealthCheckboxes from "../../../addPet/Components/PetHealthCheckboxes/PetHealthCheckboxes";
import SpecieSelect from "../../../addPet/Components/SpecieSelect/SpecieSelect";
import StandardSelect from "../../../addPet/Components/StandardSelect/StandardSelect";
import LocationInput from "../../../auth/components/LocationInput/LocationInput";

export default function PetForm({
  initialData = null,
  onSubmit,
  isEditing = false,
  loading = false,
}) {
  const theme = useTheme();
  const { t } = useTranslationLoader(["addPet"]);

  const [images, setImages] = useState(initialData?.images || []);
  const [mainImage, setMainImage] = useState(initialData?.images?.[0] || null);
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [specie, setSpecie] = useState(initialData?.species || null);
  const [breed, setBreed] = useState(initialData?.breed || null);
  const [colors, setColors] = useState(initialData?.color || []);
  const [age, setAge] = useState(
    initialData?.age
      ? { value: initialData.age.value.toString(), unit: initialData.age.unit }
      : { value: "", unit: "" }
  );
  const [size, setSize] = useState(initialData?.size || null);
  const [activity, setActivity] = useState(initialData?.activityLevel || null);
  const [selectedGender, setSelectedGender] = useState(
    initialData?.gender || null
  );
  const [health, setHealth] = useState({
    sterilized: initialData?.sterilized || false,
    vaccinated: initialData?.vaccinated || false,
    dewormed: initialData?.dewormed || false,
    hasPassport: initialData?.hasPassport || false,
    specialNeeds: initialData?.specialNeeds || false,
  });
  const [location, setLocation] = useState(
    initialData?.location?.coordinates
      ? {
          geoJson: {
            coordinates: initialData.location.coordinates,
          },
          readable: "Current Location", // You might want to get the actual readable address
        }
      : null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [removedImages, setRemovedImages] = useState([]); // Track removed images for deletion

  // Errors state
  const [errors, setErrors] = useState({});
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

    // If it's an existing image from Supabase, add to removedImages for deletion
    if (isEditing && initialData?.images?.includes(uri)) {
      setRemovedImages((prev) => [...prev, uri]);
    }

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

  const handleSubmit = () => {
    if (validateForm()) {
      const formData = {
        images,
        name: name.trim(),
        description,
        species: specie,
        breed: breed || "",
        color: colors,
        age: {
          value: Number(age.value),
          unit: age.unit,
        },
        size,
        activityLevel: activity,
        gender: selectedGender,
        sterilized: health.sterilized,
        vaccinated: health.vaccinated,
        dewormed: health.dewormed,
        hasPassport: health.hasPassport,
        specialNeeds: health.specialNeeds,
        location: {
          type: "Point",
          coordinates: location?.geoJson.coordinates || [0, 0],
        },
        removedImages: isEditing ? removedImages : [], // Pass removed images for deletion
      };

      onSubmit(formData);
    } else {
      console.log("Validation failed");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Main Image */}
      {mainImage ? (
        <Image source={{ uri: mainImage }} style={styles.mainImage} />
      ) : (
        <TouchableOpacity
          style={[
            styles.addBox,
            {
              borderColor: theme.colors.outline,
              backgroundColor: ThemeColors.surface,
            },
          ]}
          onPress={handlePickImages}
        >
          <Ionicons name="image" size={36} color={ThemeColors.onSurface} />
          <Text style={{ color: ThemeColors.onSurface }}>{t("imagePick")}</Text>
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
            <WebMapPreview
              latitude={location.geoJson.coordinates[1]}
              longitude={location.geoJson.coordinates[0]}
              style={{ height: 200, borderRadius: 12, overflow: "hidden" }}
            />
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
        <AppButton
          text={isEditing ? t("update") : t("submit")}
          onPress={handleSubmit}
          loading={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
