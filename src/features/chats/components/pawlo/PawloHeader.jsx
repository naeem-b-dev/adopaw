import { Image, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function PawloHeader({ avatar, title, description }) {
  const theme = useTheme();
  const { palette } = theme.colors;

  return (
    <View style={styles.container}>
      <Image source={avatar} style={styles.avatar} />
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.description, { color: palette.neutral[500] }]}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 24,
  },
  avatar: {
    width: 300, // you can increase this later if needed
    height: 300,
    resizeMode: "contain",
  },
  title: {
    fontFamily: "Alexandria_700Bold",
    fontSize: 20,
    marginTop: 12,
    textAlign: "center",
  },
  description: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 12,
    textAlign: "center",
    marginHorizontal: 20,
    marginTop: 8,
  },
});
