import { Tabs, useSegments } from "expo-router";
import React from "react";
import CustomTabBar from "../../src/shared/components/ui/CustomTabBar";

export default function TabsLayout() {
  const segments = useSegments();
  const shouldHideTabBar =
    segments[1] === "addPet" ||
    (segments[1] === "home" && segments[2]) ||
    (segments[1] === "chats" && segments[2] && segments[2] !== "index") ||
    (segments[1] === "profile" && segments[2] && segments[2] !== "index");

  return (
    <Tabs
      screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}
      tabBar={(props) =>
        shouldHideTabBar ? null : <CustomTabBar {...props} />
      }
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="map" options={{ title: "Map" }} />
      <Tabs.Screen name="chats" options={{ title: "Chats" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen name="addPet" options={{ href: null }} />
    </Tabs>
  );
}
