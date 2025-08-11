import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, I18nManager, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import LoginWithGoogleButton from "../../src/features/auth/components/LoginWithGoogle/LoginWithGoogle";
import OrDivider from "../../src/features/auth/components/OrDivider/OrDivider";
import {
  validateConfirmPassword,
  validateEmail,
  validatePassword,
} from "../../src/features/auth/utils/validation";
import { useTranslationLoader } from "../../src/localization/hooks/useTranslationLoader";
import AppButton from "../../src/shared/components/ui/AppButton/AppButton";
import AppInput from "../../src/shared/components/ui/AppInput/AppInput";
import Heading from "../../src/shared/components/ui/Heading/Heading";
import CustomTextButton from "../../src/shared/components/ui/TextButton/TextButton";
import { signUpWithEmail } from "../../src/shared/services/supabase/auth";

export default function Signup() {
  const router = useRouter();

  const { colors } = useTheme();
  const isRTL = I18nManager.isRTL;

  const goNext = () => {
    router.replace("/home");
  };
  const goBack = () => {
    router.back();
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleEmailChange = (email) => {
    setEmail(email);
  };

  const handlePasswordChange = (pass) => {
    setPassword(pass);
  };

  const handleEmailBlur = () => {
    const errorMsg = validateEmail(email, t);
    setErrors((prev) => ({ ...prev, email: errorMsg }));
  };

  const handlePasswordBlur = () => {
    const errorMsg = validatePassword(password, t);
    setErrors((prev) => ({ ...prev, password: errorMsg }));
  };

  const handleConfirmPasswordBlur = () => {
    const errorMsg = validateConfirmPassword(password, confirmPassword, t);
    setErrors((prev) => ({ ...prev, confirmPassword: errorMsg }));
  };

  const handleSignup = async () => {
    let newErrors = { email: "", password: "", confirmPassword: "" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let hasError = false;

    if (!email) {
      newErrors.email = t("errors.required");
      hasError = true;
    } else if (!emailRegex.test(email)) {
      newErrors.email = t("errors.invalidEmail");
      hasError = true;
    }

    if (!password) {
      newErrors.password = t("errors.required");
      hasError = true;
    } else if (password.length < 6) {
      newErrors.password = t("errors.weakPassword"); // e.g. "Must be at least 6 characters"
      hasError = true;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t("errors.required");
      hasError = true;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t("errors.passwordMismatch");
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    const { data, error } = await signUpWithEmail(email, password);
    if (data) {
      router.push("/profile-complete");
    }
    if (error) {
      Alert.alert(t("errors.general"), error.message);
      return;
    }

    Alert.alert(t("success"), t("confirmationEmail"));
  };

  const handleLoginWithGoogle = () => {
    Alert.prompt("Login With google", "Button Clicked");
  };
  // console.log(isRTL);
  const { t } = useTranslationLoader("auth");
  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Heading
        title={t("signup.title")}
        description={t("signup.description")}
        align="start"
      />
      <View style={{ flexDirection: "column", gap: 10 }}>
        <AppInput
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrors((prev) => ({ ...prev, email: "" }));
          }}
          onBlur={handleEmailBlur}
          placeholder={t("signup.email.placeholder")}
          icon="mail-outline"
          error={!!errors.email}
          errorMessage={errors.email}
        />

        <AppInput
          value={password}
          isPassword
          onChangeText={(text) => {
            setPassword(text);
            setErrors((prev) => ({ ...prev, password: "" }));
          }}
          onBlur={handlePasswordBlur}
          placeholder={t("signup.password.placeholder")}
          icon="lock-closed-outline"
          error={!!errors.password}
          errorMessage={errors.password}
        />

        <AppInput
          value={confirmPassword}
          isPassword
          onChangeText={(text) => {
            setConfirmPassword(text);
            setErrors((prev) => ({ ...prev, confirmPassword: "" }));
          }}
          onBlur={handleConfirmPasswordBlur}
          placeholder={t("signup.confirmPassword.placeholder")}
          icon="lock-closed-outline"
          error={!!errors.confirmPassword}
          errorMessage={errors.confirmPassword}
        />
        <AppButton text={t("signup.buttons.default")} onPress={handleSignup} />
        <OrDivider />
        <LoginWithGoogleButton
          title={t("signup.buttons.google")}
          onPress={handleLoginWithGoogle}
        />
        <CustomTextButton
          label={t("signup.buttons.register.text")}
          buttonText={t("signup.buttons.register.button")}
          onPress={goBack}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 60,
    paddingHorizontal: 28,
    paddingTop: 100,
    height: "100%",
  },
  text: { marginBottom: 24, textAlign: "center" },
  button: { width: 150 },
});
