import { useEffect, useState } from "react";
import NavigationButton from "../../../src/shared/components/ui/NavigationButton/NavigationButton";
import ScreenLayout from "../../../src/shared/layout/ScreenLayout/ScreenLayout";
import {
Image,
StyleSheet,
TouchableOpacity,
View,
I18nManager,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslationLoader } from "../../../src/localization/hooks/useTranslationLoader";
import { useRouter } from "expo-router";
import { RadioButton, Surface, Text, useTheme } from "react-native-paper";
import { languagesOptions } from "../../../src/shared/constants/languages";
import { setLanguage } from "../../../src/localization/i18n";
import * as Updates from "expo-updates";

// Define RTL languages
const RTL_LANGUAGES = ["ar", "he", "fa", "ur"]; // Add more RTL language codes as needed

export default function UserLanguageScreen() {
const { t } = useTranslationLoader("profile");
const router = useRouter();
const { colors } = useTheme();
const [selected, setSelected] = useState("en");

useEffect(() => {
  (async () => {
    const lang = (await AsyncStorage.getItem("user-language")) || "en";
    setSelected(lang);
  })();
}, []);


// Handle language selection with RTL support

const handleLanguageChange = async (selectedLanguage) => {
  const prev = selected;
  try {
    setSelected(selectedLanguage); // immediate UI feedback
    await setLanguage(selectedLanguage); // handles RTL + reload if needed
  } catch (error) {
    console.error("Error changing language:", error);
    setSelected(prev); // revert if something went wrong
  }
};


return (
  <ScreenLayout title={t("appearance.language.label")}>
    <View style={{ paddingHorizontal: 20, gap: 12 }}>
      {languagesOptions.map((option) => {
        const isSelected = selected === option.value;

        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => handleLanguageChange(option.value)}
            style={{ marginVertical: 2, width: "100%" }}
          >
            <Surface
              elevation={0}
              style={[
                styles.optionContainer,
                {
                  backgroundColor: isSelected
                    ? (colors?.palette?.blue?.[100] ?? "#D0E8FF")
                    : colors.surface,
                  borderWidth: 1,
                  borderColor: isSelected
                    ? (colors?.palette?.blue?.[500] ?? "#007BFF")
                    : (colors?.palette?.neutral?.[500] ?? "#AAAAAA"),
                },
              ]}
            >
              <View style={styles.contentRow}>
                <Image
                  source={option.image}
                  style={{ width: 24, height: 24, marginRight: 8 }}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.label,
                    { color: isSelected ? colors.primary : colors.text },
                  ]}
                >
                  {option.label}
                </Text>
              </View>

              <RadioButton
                value={option.value}
                status={isSelected ? "checked" : "unchecked"}
                onPress={() => handleLanguageChange(option.value)}
              />
            </Surface>
          </TouchableOpacity>
        );
      })}
    </View>
  </ScreenLayout>
);
}

const styles = StyleSheet.create({
imageBackground: {
  flex: 1,
  width: "100%",
  height: "100%",
},
container: {
  flex: 1,
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 16,
  padding: 32,
},
btn: {
  width: 200,
},
optionContainer: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  padding: 16,
  borderRadius: 16,
  elevation: 2,
  backgroundColor: "white",
},
selected: {
  borderColor: "#6200ee",
  borderWidth: 2,
},
label: {
  fontSize: 16,
},
contentRow: {
  flexDirection: "row",
  alignItems: "center",
  flexShrink: 1,
},
});
