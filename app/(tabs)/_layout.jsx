import { Tabs, useRouter, useSegments } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { FAB, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  const theme = useTheme();
  const router = useRouter();
  const segments = useSegments();

  // Check if we're on a screen that should hide the tab bar
  const shouldHideTabBar =
    segments[1] === "addPet" ||
    (segments[1] === "home" && segments[2]) || // [petId] route
    (segments[1] === "chats" && segments[2] && segments[2] !== "index"); // [chatId] route

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: shouldHideTabBar
            ? { display: "none" }
            : {
                backgroundColor: theme.colors.surface,
                height: 60,
                paddingBottom: 5,
              },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: "Map",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="chats"
          options={{
            title: "Chat",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubble" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="addPet"
          options={{
            href: null, // This hides the tab from the tab bar
          }}
        />
      </Tabs>

      {/* Only show FAB if not on screens that hide tab bar */}
      {!shouldHideTabBar && (
        <View style={styles.fabContainer}>
          <FAB
            icon="plus"
            color="white"
            onPress={() => {
              router.push("/(tabs)/addPet");
            }}
            style={{ backgroundColor: theme.colors.primary }}
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    bottom: 30,
    left: "50%",
    marginLeft: -28, // half of FAB size (56)
    zIndex: 10,
  },
});
