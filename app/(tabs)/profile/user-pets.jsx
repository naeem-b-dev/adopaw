import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, I18nManager, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useTranslationLoader } from "../../../src/localization/hooks/useTranslationLoader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PetsList from "../../../src/shared/components/ui/PetsList/PetsList";

export default function UserPetsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslationLoader(["profile"]);
  const isRTL = I18nManager.isRTL;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingBottom: insets.bottom,
          paddingTop: insets.top + 12,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons
            name={isRTL ? "arrow-forward" : "arrow-back"}
            size={32}
            color={colors.onSurface}
            onPress={() => router.back()}
          />
          <Text variant="headlineLarge" style={{ color: colors.text }}>
            {t("myPets.title")}
          </Text>
        </View>
      </View>

      {/* Pets List */}
      <View style={{ flex: 1 }}>
        <PetsList
          fetchUrl={`${process.env.EXPO_PUBLIC_BACKEND_API_URL}/pet/`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
