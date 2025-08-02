import React from "react";
import { Stack } from "expo-router";

export default function OnboardingStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "simple_push",
      }}
    />
  );
}
