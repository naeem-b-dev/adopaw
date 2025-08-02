import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import { useRouter } from "expo-router";

export default function Login() {
  const router = useRouter();

  const goNext = () => {
    router.replace("/home");
  };
  const goSignup = () => {
    router.push("/signup");
  };


  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.text}>
        Login Page
      </Text>
      <View style={{ flexDirection: "column", gap: 10 }}>
        <Button mode="contained" onPress={goNext} style={styles.button}>
          Login
        </Button>
        <Button mode="contained" onPress={goSignup} style={styles.button}>
          signup
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  text: { marginBottom: 24, textAlign: "center" },
  button: { width: 150 },
});
