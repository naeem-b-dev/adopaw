import React from "react";
import { useRouter } from "expo-router";
import OnboardingScreen from "../../src/features/onboarding/components/OnboardingScreen";

export default function OnboardingStep3() {
  const router = useRouter();

  const goNext = () => {
    router.push("/step4");
  };

  return (
     <OnboardingScreen step="step3" namespace="onboarding" onNext={goNext} />
  );
}
