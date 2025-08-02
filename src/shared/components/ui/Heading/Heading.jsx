import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

export default function Heading({ title, description, align = "left" }) {
  const { colors, fonts } = useTheme();

  const alignment =
    align === "center"
      ? "center"
      : align === "right"
        ? "flex-end"
        : "flex-start";

  return (
    <View style={[styles.container, { alignItems: alignment }]}>
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
            fontFamily: fonts.displayLarge.fontFamily,
            fontSize: fonts.displayLarge.fontSize,
            lineHeight: fonts.displayLarge.lineHeight,
            textAlign: align,
          },
        ]}
      >
        {title}
      </Text>

      {description ? (
        <Text
          style={[
            styles.description,
            {
              color: title.includes("Get Started")
                ? colors.palette.neutral[100]
                : colors.palette.neutral[500],
              fontFamily: fonts.bodyMedium.fontFamily,
              fontSize: fonts.bodyMedium.fontSize,
              lineHeight: fonts.bodyMedium.lineHeight,
              textAlign: align,
            },
          ]}
        >
          {description}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  description: {},
});
