import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";

export default function HomeLayout() {
  const theme = useTheme();
  const router = useRouter();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false, // Keep tab layout for main screen
        }}
      />
      <Stack.Screen
        name="[petId]"
        options={{
          headerShown: true, // Show header with back button
          title: "Pet Details",
          headerBackTitle: "Home",
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
