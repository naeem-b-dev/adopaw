import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { TextInput, useTheme } from "react-native-paper";

export default function SearchBar({ value, onChangeText, style, onSubmitEditing }) {
  const theme = useTheme();
  const { t } = useTranslation("home");

  const blue = theme.colors.palette.blue;
  const neutral = theme.colors.palette.neutral;
  const radius = theme.custom?.radii?.xl ?? 20;

  return (
    <View style={style}>
      <TextInput
        mode="outlined"
        value={value}
        onChangeText={onChangeText}
        placeholder={t("search.placeholder", "Search for Pet")}
        left={<TextInput.Icon icon="magnify" color={blue[500]} />}
        style={styles.input}
        theme={{ colors: { background: "#FFFFFF" } }}        // white fill
        outlineStyle={{ borderRadius: radius, borderWidth: 1, borderColor: neutral[300] }}
        activeOutlineColor={blue[500]}
        placeholderTextColor={blue[500]}                     // blue placeholder
        cursorColor={blue[500]}
        selectionColor={blue[200]}
        textColor={theme.colors.onSurface}
        underlineColor="transparent"
        contentStyle={{
          fontFamily: theme.fonts.bodyLarge.fontFamily,
          fontSize: theme.fonts.bodyLarge.fontSize,
          lineHeight: theme.fonts.bodyLarge.lineHeight,
        }}
        returnKeyType="search"
        onSubmitEditing={onSubmitEditing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 52, // pill height per figma
  },
});
