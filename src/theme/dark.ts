import { blue, coral, error, neutral, success, warning } from "./colors";

export const darkTheme = {
  background: "#121417",
  backgroundHover: "#1A1E23",
  backgroundPress: "#0E1114",
  backgroundFocus: "#24282D",
  backgroundStrong: "#24282D",
  backgroundTransparent: "rgba(36, 40, 45, 0.1)",

  color: neutral[100],
  colorHover: neutral[200],
  colorPress: neutral[300],
  colorFocus: neutral[200],
  colorTransparent: "rgba(245, 245, 245, 0.8)",

  borderColor: neutral[700],
  borderColorHover: neutral[600],
  borderColorPress: neutral[500],
  borderColorFocus: blue[500],

  placeholderColor: neutral[500],

  // Semantic colors
  blue: blue[500],
  blueHover: blue[400],
  bluePress: blue[600],
  blueFocus: blue[500],

  coral: coral[500],
  coralHover: coral[400],
  coralPress: coral[600],
  coralFocus: coral[500],

  success: success[400],
  successHover: success[300],
  successPress: success[500],
  successFocus: success[400],

  warning: warning[400],
  warningHover: warning[300],
  warningPress: warning[500],
  warningFocus: warning[400],

  error: error[400],
  errorHover: error[300],
  errorPress: error[500],
  errorFocus: error[400],

  // Shadow color
  shadowColor: "rgba(0, 0, 0, 0.3)",
  shadowColorHover: "rgba(0, 0, 0, 0.4)",
  shadowColorPress: "rgba(0, 0, 0, 0.5)",
  shadowColorFocus: "rgba(0, 0, 0, 0.4)",
};

// theme/dark.ts
import { MD3DarkTheme } from "react-native-paper";
import { fonts, fontSizes } from "./fonts";
import { radii } from "./radii";
import { spacing } from "./spacing";
import { customTypography } from "./typograhpy";

export const CustomDarkTheme = {
  ...MD3DarkTheme,
  dark: true,
  roundness: radii.md,
  colors: {
    ...MD3DarkTheme.colors,
    // Base colors
    primary: blue[500],
    accent: coral[500],
    background: "#121417",
    surface: "#24282D",
    text: neutral[100],
    disabled: neutral[600],
    placeholder: neutral[400],
    onSurface: neutral[100],
    backdrop: "rgba(255, 255, 255, 0.3)",
    notification: coral[400],

    // Semantic base colors
    success: success[400],
    warning: warning[400],
    error: error[400],

    // Full palette
    palette: {
      blue,
      coral,
      neutral,
      success,
      warning,
      error,
    },
  },
  fonts: customTypography,
  animation: {
    scale: 1,
  },
  custom: {
    fontSizes,
    spacing,
    radii,
    semantic: {
      success: {
        bg: success[900],
        text: success[100],
        border: success[500],
      },
      warning: {
        bg: warning[900],
        text: warning[100],
        border: warning[500],
      },
      error: {
        bg: error[900],
        text: error[100],
        border: error[500],
      },
    },
  },
};
