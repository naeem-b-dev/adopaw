import React from "react";
import { useRouter } from "expo-router";
import OnboardingScreen from "../../src/features/onboarding/components/OnboardingScreen";

export default function OnboardingStep2() {
  const router = useRouter();

  const goNext = () => {
    router.push("/step3");
  };

  return (
      <OnboardingScreen step="step2" namespace="onboarding" onNext={goNext} />
  );
}
