// app/(tabs)/home/[petId].jsx
import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

export const unstable_settings = {
  tabBarStyle: { display: "none" }, // hides tab bar on this screen (expo-router specific)
};

export default function PetDetailScreen() {
  const { petId } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text>Pet Detail: {petId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
