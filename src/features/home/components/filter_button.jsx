import React from "react";
import { StyleSheet, View } from "react-native";
import { IconButton } from "react-native-paper";
import { useRouter } from "expo-router";

export default function FilterButton({ style }) {
  const router = useRouter();
  return (
    <View style={style}>
      <IconButton
        icon="filter-variant"
        size={28}
        onPress={() => router.push("/(tabs)/home/filter")}
        style={styles.icon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { margin: 0 },
});
