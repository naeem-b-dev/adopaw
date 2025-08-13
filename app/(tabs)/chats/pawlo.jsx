import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

import ChatInput from "@/src/features/chats/components/ChatInput";
import PawloHeader from "@/src/features/chats/components/pawlo/PawloHeader";
import SuggestionChips from "@/src/features/chats/components/pawlo/SuggestionChips";

import pawloImage from "@/assets/images/itspawlo.png";

export default function PawloChat() {
  const { t } = useTranslationLoader("pawlo");
  const theme = useTheme();
  const { palette } = theme.colors;
  const insets = useSafeAreaInsets();

  // Always an array (avoid .map undefined)
  const suggestions = t("suggestions", { returnObjects: true }) || [];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      style={[styles.root, { backgroundColor: theme.colors.background }]}
    >
      {/* Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: 24 + Math.max(insets.bottom, 12) + 56, // leave room for input bar
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <PawloHeader
          avatar={pawloImage}
          title={t("title")}
          description={t("description")}
        />

        <Text
          style={{
            fontFamily: "Alexandria_500Medium",
            fontSize: 14,
            color: palette.neutral[700],
            marginTop: 20,
            textAlign: "center",
          }}
        >
          {t("suggestionTitle")}
        </Text>

        <SuggestionChips suggestions={suggestions} />

        <View style={{ height: 8 }} />
      </ScrollView>

      {/* Footer (input) — full width, safe-area aware */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        <ChatInput />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 20, // page padding only for the content
  },
  footer: {
    // The ChatInput already has its internal horizontal padding.
    // We keep the footer as a simple container that spans full width.
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.06)", // uses hairline; theme-neutral enough
  },
});
