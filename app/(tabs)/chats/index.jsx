import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function Chats() {
  const router = useRouter();

  const goChat = (id) => {
    if (id === "pawlo") {
      router.push("/chats/pawlo");
    } else {
      router.push({
        pathname: "/chats/[chatId]",
        params: { chatId: id }, // Replace "123" with the actual user ID
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.text}>
        Chat List
      </Text>
      <View style={{ flexDirection: "column", gap: 10 }}>
        <Button
          mode="contained"
          onPress={() => goChat("dummy chat")}
          style={styles.button}
        >
          Go to chat details
        </Button>
        <Button
          mode="contained"
          onPress={() => goChat("pawlo")}
          style={styles.button}
        >
          Go to Pawlo
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
