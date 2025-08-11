// app/(tabs)/chats/_layout.jsx
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";

export default function ChatsLayout() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslationLoader("chatId");

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      {/* Chats list */}
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />

      {/* Chat detail: title comes from route params */}
      <Stack.Screen
        name="[chatId]"
        options={({ route }) => ({
          headerShown: true,
          // Prefer a provided display name; otherwise fallback to i18n "Chat"
          title: route.params?.title ?? t("chatTitle"),
          headerBackTitle: t("backToChats"),
          animation: "slide_from_right",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 15, padding: 5 }}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          ),
        })}
      />

      {/* Pawlo screen: static localized title */}
      <Stack.Screen
        name="pawlo"
        options={{
          headerShown: true,
          title: t("pawloTitle"),
          headerBackTitle: t("backToChats"),
          animation: "slide_from_right",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 15, padding: 5 }}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
