import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function Chats() {
  const router = useRouter();

  const goPet = (id) => {
    console.log("Navigating to pet with id:", id);
   router.push({
     pathname: "/home/[petId]",
     params: { petId: id }, // Replace "123" with the actual user ID
   });

  };
  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.text}>
        Home page
      </Text>
      <Button
        mode="contained"
        onPress={() => goPet("dummy-pet")}
        style={styles.button}
      >
        Go to Pet detail
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
