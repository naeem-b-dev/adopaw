import { View, Text, StyleSheet } from "react-native";

export default function UserPetPreferencesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pet Prefs</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // centers vertically
    alignItems: "center", // centers horizontally
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 20,
    fontWeight: "500",
  },
});
