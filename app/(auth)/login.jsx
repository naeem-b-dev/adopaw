import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Keyboard, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import LoginWithGoogleButton from "../../src/features/auth/components/LoginWithGoogle/LoginWithGoogle";
import OrDivider from "../../src/features/auth/components/OrDivider/OrDivider";
import {
  validateEmail,
  validatePassword,
} from "../../src/features/auth/utils/validation";
import { useTranslationLoader } from "../../src/localization/hooks/useTranslationLoader";
import AppButton from "../../src/shared/components/ui/AppButton/AppButton";
import AppInput from "../../src/shared/components/ui/AppInput/AppInput";
import Heading from "../../src/shared/components/ui/Heading/Heading";
import LoadingModal from "../../src/shared/components/ui/LoadingModal/LoadingModal";
import AppSnackbar from "../../src/shared/components/ui/Snackbar/AppSnackbar";
import CustomTextButton from "../../src/shared/components/ui/TextButton/TextButton";
import { signInWithEmail } from "../../src/shared/services/supabase/auth";
import { mapSupabaseErrorToTranslationKey } from "../../src/shared/utils/supabaseErrorMessage";

export default function Login() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslationLoader(["auth", "supabase"]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleEmailBlur = () => {
    const error = validateEmail(email, t);
    setErrors((prev) => ({ ...prev, email: error }));
  };

  const handlePasswordBlur = () => {
    const error = validatePassword(password, t);
    setErrors((prev) => ({ ...prev, password: error }));
  };

  const handleLogin = async () => {
    const emailError = validateEmail(email, t);
    const passwordError = validatePassword(password, t);

    const newErrors = {
      email: emailError,
      password: passwordError,
    };

    setErrors(newErrors);

    if (emailError || passwordError) return;
    
    setLoading(true);
    Keyboard.dismiss();

    const { data, error } = await signInWithEmail(email, password);

    if (error) {
      setLoading(false);

      const key = mapSupabaseErrorToTranslationKey(error.message);
      const [ns, ...rest] = key.split(".");
      const actualKey = rest.join(".");
      const translated = t(actualKey, { ns });
      const fallbackMessage = error.message;

      setSnackbarMessage(translated || fallbackMessage);
      setSnackbarVisible(true);
      return;
    }

    if (data) {

      const supaId = data.user.id;
      const accessToken = data.session.access_token;
      try {
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_BACKEND_API_URL}/profile/${supaId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const profileData = response.data;

        if (profileData) {
          try {
            await AsyncStorage.setItem(
              "user_profile",
              JSON.stringify(profileData)
            );
          } catch (e) {
            // console.log("Failed to save profile:", e);
          }
          router.replace("/home");
        }
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          router.replace("/profile-complete");
        } else {
          // console.log("Error fetching profile:", err);
          setSnackbarMessage("Error fetching profile: " + err.message);
          setSnackbarVisible(true);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLoginWithGoogle = () => {
    Alert.prompt("Login With Google", "Button Clicked");
  };

  const goSignup = () => {
    router.push("/signup");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <LoadingModal loading={loading} />

      {loading === false && (
        <AppSnackbar
          visible={snackbarVisible}
          message={snackbarMessage}
          onDismiss={() => setSnackbarVisible(false)}
        />
      )}

      <Heading
        title={t("login.title")}
        description={t("login.description")}
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
          placeholder={t("login.email.placeholder")}
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
          placeholder={t("login.password.placeholder")}
          icon="lock-closed-outline"
          error={!!errors.password}
          errorMessage={errors.password}
        />

        <AppButton
          text={t("login.buttons.default")}
          onPress={handleLogin}
          loading={loading}
        />
        <OrDivider />
        <LoginWithGoogleButton
          title={t("login.buttons.google")}
          onPress={handleLoginWithGoogle}
        />
        <CustomTextButton
          label={t("login.buttons.register.text")}
          buttonText={t("login.buttons.register.button")}
          onPress={goSignup}
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
