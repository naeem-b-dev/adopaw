// app/(tabs)/chats/_layout.jsx
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

export default function ChatsLayout() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslationLoader("chatId");

  const goToList = () => router.replace("/chats");

  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      {/* Chats list */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* Chat detail */}
      <Stack.Screen
        name="[chatId]"
        options={({ route }) => ({
          headerShown: true,
          title: route.params?.title ?? t("chatTitle"),
          // Make sure leaving the chat resets it so the tab won't reopen it later
          unmountOnBlur: true,
          // Force back to list (not the pet page)
          headerLeft: () => (
            <TouchableOpacity onPress={goToList} style={{ marginLeft: 15, padding: 5 }}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          ),
        })}
      />

      {/* Pawlo assistant */}
      <Stack.Screen
        name="pawlo"
        options={{
          headerShown: true,
          title: t("pawloTitle"),
          unmountOnBlur: true,
          headerLeft: () => (
            <TouchableOpacity onPress={goToList} style={{ marginLeft: 15, padding: 5 }}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
