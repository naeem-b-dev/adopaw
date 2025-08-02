import React from "react";
import { useRouter } from "expo-router";
import OnboardingScreen from "../../src/features/onboarding/components/OnboardingScreen";

export default function GetStarted() {
  const router = useRouter();

  const goNext = () => {
    router.push("/login");
  };

  return (
    <OnboardingScreen step="getStarted" namespace="onboarding" onNext={goNext} buttonTextKey="finish" />
  );
}
