// app/(tabs)/chats/pawlo.jsx
import { useCallback, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

import ChatInput from "@/src/features/chats/components/ChatInput";
import PawloHeader from "@/src/features/chats/components/pawlo/PawloHeader";
import SuggestionChips from "@/src/features/chats/components/pawlo/SuggestionChips";

import { selectJwt } from "@/src/features/auth/store/authSlice";
import ImageMessage from "@/src/features/chats/components/chatIdComponents/ImageMessage";
import MessageBubble from "@/src/features/chats/components/chatIdComponents/MessageBubble";
import { pawloReply } from "@/src/shared/services/chatService";
import { uploadChatImage } from "@/src/shared/services/supabase/upload";

import pawloImage from "@/assets/images/itspawlo.png";

export default function PawloChat() {
  const { t } = useTranslationLoader("pawlo");
  const theme = useTheme();
  const { palette } = theme.colors;
  const insets = useSafeAreaInsets();

  const suggestions = useMemo(() => {
    const raw = t("suggestions", { returnObjects: true });
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  const jwt = useSelector(selectJwt);
  const getToken = useCallback(async () => jwt || "", [jwt]);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Only text messages are included in history sent to Groq
  const toGroqHistory = useCallback((arr) => {
    return (Array.isArray(arr) ? arr : [])
      .filter((m) => m?.type === "text" && m?.content?.text)
      .slice(-10)
      .map((m) => ({
        role: m.senderId === "me" ? "user" : "assistant",
        content: m.content.text,
      }));
  }, []);

  // Accept BOTH: text only OR text + localImages from ChatInput
  const handleSend = useCallback(
    async (text, opts = {}) => {
      const trimmed = String(text || "").trim();
      const localImages = Array.isArray(opts.localImages) ? opts.localImages.filter(Boolean) : [];

      // nothing to send
      if (!trimmed && localImages.length === 0) return;

      setShowSuggestions(false);

      // 1) If there are attached local images, show them immediately as user bubbles
      if (localImages.length) {
        const now = Date.now();
        const newImageMsgs = localImages.map((uri, idx) => ({
          _id: `local-img-${now}-${idx}`,
          type: "image",
          content: { imageUrl: uri }, // local preview (file://…)
          senderId: "me",
          createdAt: new Date().toISOString(),
        }));
        setMessages((prev) => [...prev, ...newImageMsgs]);
      }

      // 2) If there is user text, show it immediately as a user bubble
      let nextMessages = (m) => m;
      if (trimmed) {
        const userMsg = {
          _id: "local-" + Date.now(),
          type: "text",
          content: { text: trimmed },
          senderId: "me",
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);
        nextMessages = (prev) => [...prev, userMsg];
      }

      setLoading(true);

      try {
        // 3) Upload attached images → public URLs
        let publicUrls = [];
        if (localImages.length) {
          const uploads = await Promise.allSettled(
            localImages.map((uri) => uploadChatImage(uri))
          );
          publicUrls = uploads
            .map((r) => (r.status === "fulfilled" ? r.value?.publicUrl : ""))
            .filter((u) => typeof u === "string" && /^https?:\/\//i.test(u));
        }

        // 4) Build history from current text bubbles only
        const history = toGroqHistory(messages);

        // 5) Send to backend in ONE turn (text + imageUrls)
        // Use object-form pawloReply so order is clear
        const replyText = await pawloReply(
          { message: trimmed || "", history, imageUrls: publicUrls },
          async () => "" // keep public dev route; switch to getToken when secured
        );

        const botMsg = {
          _id: "pawlo-" + Date.now(),
          type: "text",
          content: { text: replyText || t("fallbackReply", { defaultValue: "I’m here to help!" }) },
          senderId: "pawlo",
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch (e) {
        const errMsg = {
          _id: "pawlo-err-" + Date.now(),
          type: "text",
          content: { text: t("sendError", { defaultValue: "Sorry, I couldn’t reply. Try again." }) },
          senderId: "pawlo",
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setLoading(false);
      }
    },
    [messages, t, toGroqHistory]
  );

  const onSuggestionPress = useCallback(
    (s) => {
      if (!s) return;
      const text = typeof s === "string" ? s : s?.text || s?.label;
      if (text) handleSend(text);
    },
    [handleSend]
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      style={[styles.root, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 24 + Math.max(insets.bottom, 12) + 56 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {showSuggestions && (
          <>
            <PawloHeader avatar={pawloImage} title={t("title")} description={t("description")} />
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
            <SuggestionChips suggestions={suggestions} onSelect={onSuggestionPress} />
          </>
        )}

        {/* Conversation */}
        <View style={{ marginTop: showSuggestions ? 12 : 8, gap: 8 }}>
          {messages.map((m) =>
            m.type === "image" ? (
              <ImageMessage key={m._id} item={m} currentUserId="me" />
            ) : (
              <MessageBubble key={m._id} item={m} currentUserId="me" />
            )
          )}

          {loading ? (
            <Text
              style={{
                fontFamily: "Alexandria_400Regular",
                fontSize: 12,
                opacity: 0.7,
                marginTop: 4,
              }}
            >
              {t("typing")}
            </Text>
          ) : null}
        </View>

        <View style={{ height: 8 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
        {/* ChatInput already calls onSend(text, { localImages: [...] }) */}
        <ChatInput onSend={handleSend} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingTop: 16, paddingHorizontal: 20 },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(0,0,0,0.06)" },
});
