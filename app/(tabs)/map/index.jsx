import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import { useRouter } from "expo-router";

export default function Chats() {
  const router = useRouter();

  const goPet = (name) => {
    router.push(`/${name}`);
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.text}>
        Map Page
      </Text>
      
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
