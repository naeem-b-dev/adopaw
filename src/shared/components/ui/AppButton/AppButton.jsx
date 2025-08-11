import { StyleSheet } from "react-native";
import { Button, useTheme } from "react-native-paper";

export default function AppButton({
  text,
  onPress,
  variant = "primary",
  loading,
  style,
}) {
  const { colors, fonts } = useTheme();

  const isPrimary = variant === "primary";

  const backgroundColor = isPrimary
    ? colors.palette.coral[500]
    : colors.palette.blue[100];

  const borderColor = isPrimary ? "transparent" : colors.palette.blue[500];
  const textColor = isPrimary ? "#fff" : colors.palette.blue[500];

  return (
    <Button
      mode="contained"
      onPress={onPress}
      loading={loading}
      disabled={loading}
      contentStyle={styles.buttonContent}
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor,
          borderWidth: isPrimary ? 0 : 1,
        },
        style,
      ]}
      labelStyle={{
        fontFamily: fonts.labelLarge.fontFamily,
        fontSize: fonts.labelLarge.fontSize,
        lineHeight: fonts.labelLarge.lineHeight,
        color: textColor,
      }}
      uppercase={false}
    >
      {text}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
  },
  buttonContent: {
    height: 50,
  },
});
