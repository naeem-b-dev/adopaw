import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import { useRouter } from "expo-router";

export default function Otp() {
  const router = useRouter();

  const goNext = () => {
    router.replace("/home");
  };


  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.text}>
        Get Started With Adopaw
      </Text>
      <Button mode="contained" onPress={goNext} style={styles.button}>
        Create
      </Button>
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
