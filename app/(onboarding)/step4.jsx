import React from "react";
import { useRouter } from "expo-router";
import OnboardingScreen from "../../src/features/onboarding/components/OnboardingScreen";

export default function OnboardingStep4() {
  const router = useRouter();

  const goNext = () => {
    router.push("/get-started");
  };

  return (
     <OnboardingScreen step="step4" namespace="onboarding" onNext={goNext} />
  );
}
