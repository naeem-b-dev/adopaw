import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { I18nManager, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { supabase } from "../../../../shared/services/supabase/client";

export default function LoginWithGoogleButton({ style, title }) {
  const isRTL = I18nManager.isRTL;
  const { colors } = useTheme();
  // const handleGoogleLogin = async () => {
  //   try {
  //     const authUrl = await signInWithGoogle();

  //     if (authUrl) {
  //       const result = await AuthSession.startAsync({ authUrl });

  //       if (result.type === "success") {
  //         const {
  //           data: { user },
  //         } = await supabase.auth.getUser();

  //         console.log("User logged in:", user);
  //         // Navigate or check profile now
  //       } else {
  //         console.log("Login cancelled or failed");
  //       }
  //     }
  //   } catch (error) {
  //     console.log("Google login error:", error.message);
  //   }
  // };

  WebBrowser.maybeCompleteAuthSession();

  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: false,
  });


  const handleGoogleLogin = async () => {
    try {
      const request = new AuthSession.AuthRequest({
        clientId:
          "241592186871-eenmj8v71n1ukkl9hjrjaldilicndql1.apps.googleusercontent.com", // Get this from Google Cloud Console
        scopes: ["openid", "profile", "email"],
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        extraParams: {},
        additionalParameters: {},
      });

      const result = await request.promptAsync({
        authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
        useProxy: true,
        showInRecents: true,
      });

      if (result.type === "success") {
        const { code } = result.params;

        // Exchange code for tokens using Supabase
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: redirectUri,
            queryParams: {
              code: code,
            },
          },
        });

        if (error) {
          throw error;
        }

        return { success: true, data };
      } else {
        return { success: false, error: "Authentication cancelled" };
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      return { success: false, error: error.message };
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handleGoogleLogin}
    >
      <Image
        source={{
          uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png",
        }}
        style={styles.logo}
      />
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  logo: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
  },
});
