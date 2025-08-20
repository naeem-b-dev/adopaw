import React, { useEffect, useState } from "react";
import { View, StyleSheet, I18nManager } from "react-native";
import { Text, TextInput, useTheme } from "react-native-paper";
import CountryPicker from "react-native-country-picker-modal";
import * as Localization from "expo-localization";
import i18n from "../../../../localization/i18n";

// Arabic translations for common countries
const arabicTranslations = {
  "United States": "الولايات المتحدة",
  "Saudi Arabia": "المملكة العربية السعودية",
  "United Arab Emirates": "الإمارات العربية المتحدة",
  Egypt: "مصر",
  Jordan: "الأردن",
  Lebanon: "لبنان",
  Syria: "سوريا",
  Iraq: "العراق",
  Kuwait: "الكويت",
  Qatar: "قطر",
  Bahrain: "البحرين",
  Oman: "عُمان",
  Yemen: "اليمن",
  Palestine: "فلسطين",
  Morocco: "المغرب",
  Algeria: "الجزائر",
  Tunisia: "تونس",
  Libya: "ليبيا",
  Sudan: "السودان",
  // Add more countries as needed
};

export default function PhoneNumberInput({
  value,
  onChangePhone,
  disabled,
  countryCode,
  onChangeCountry,
  error,
  errorMessage,
  style,
}) {
  const deviceCountry = Localization.useLocales()[0]?.regionCode;
  const deviceLanguage = i18n.language;
  const [selectedCountry, setSelectedCountry] = useState(
    countryCode || deviceCountry
  );
  const isRTL = I18nManager.isRTL;
  const { colors } = useTheme();

  const handleSelect = (country) => {
    setSelectedCountry(country.cca2);
    if (onChangeCountry) {
      onChangeCountry(country);
    }
  };

  return (
    <View style={styles.inputWrapper}>
      <View
        style={styles.countryPickerWrapper}
        pointerEvents={disabled ? "none" : "auto"}
      >
        <CountryPicker
          countryCode={selectedCountry}
          withFilter
          withFlag
          withCallingCode
          withCallingCodeButton
          onSelect={handleSelect}
          containerButtonStyle={styles.countryButton}
          excludeCountries={[]} // You can exclude specific countries if needed
        />
      </View>
      <TextInput
        value={value}
        onChangeText={onChangePhone}
        mode="outlined"
        disabled={disabled}
        keyboardType="phone-pad"
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            textAlign: isRTL ? "right" : "left",
            paddingStart: 100,
          },
          style,
        ]}
        outlineColor={error ? colors.error : "rgba(169, 169, 169, 0.5)"}
        error={error}
      />
      {error && (
        <Text style={{ color: colors.error, marginTop: 4, marginStart: 8 }}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  countryPickerWrapper: {
    position: "absolute",
    top: 18, // adjust to center vertically
    left: 12,
    zIndex: 10,
    borderEndColor: "#ccc",
    borderEndWidth: 1,
    paddingEnd: 8,
  },
  countryButton: {
    padding: 0,
    margin: 0,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderRadius: 100,
    backgroundColor: "#fff",
    paddingVertical: 8,
    height: 50,
  },
});
