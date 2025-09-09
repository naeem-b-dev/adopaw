// app/(tabs)/chats/pawlo.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSelector } from "react-redux";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import { selectJwt } from "@/src/features/auth/store/authSlice";

import ChatInput from "@/src/features/chats/components/ChatInput";
import PawloHeader from "@/src/features/chats/components/pawlo/PawloHeader";
import SuggestionChips from "@/src/features/chats/components/pawlo/SuggestionChips";
import ImageMessage from "@/src/features/chats/components/chatIdComponents/ImageMessage";
import MessageBubble from "@/src/features/chats/components/chatIdComponents/MessageBubble";

import { pawloReply } from "@/src/shared/services/chatService";
import { uploadChatImage } from "@/src/shared/services/supabase/upload";

import pawloImage from "@/assets/images/itspawlo.png";

// Android (Expo Go) keyboard height helper
function useKeyboardHeightAndroid() {
  const [h, setH] = useState(0);
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const onShow = (e) => setH(e?.endCoordinates?.height ?? 0);
    const onHide = () => setH(0);
    const s1 = Keyboard.addListener("keyboardDidShow", onShow);
    const s2 = Keyboard.addListener("keyboardDidHide", onHide);
    return () => {
      s1.remove();
      s2.remove();
    };
  }, []);
  return Platform.OS === "android" ? h : 0;
}

export default function PawloChat() {
  const { t } = useTranslationLoader("pawlo");
  const theme = useTheme();
  const { palette } = theme.colors;
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const suggestions = useMemo(() => {
    const raw = t("suggestions", { returnObjects: true });
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  const jwt = useSelector(selectJwt);
  const getToken = useCallback(async () => jwt || "", [jwt]);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // measured height of the input wrapper
  const [inputHeight, setInputHeight] = useState(56);
  const kbHeight = useKeyboardHeightAndroid();
  const scrollRef = useRef(null);

  const scrollToBottom = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd?.({ animated });
    });
  }, []);

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
      const localImages = Array.isArray(opts.localImages)
        ? opts.localImages.filter(Boolean)
        : [];

      if (!trimmed && localImages.length === 0) return;

      setShowSuggestions(false);

      // 1) Show attached images immediately
      if (localImages.length) {
        const now = Date.now();
        const newImageMsgs = localImages.map((uri, idx) => ({
          _id: `local-img-${now}-${idx}`,
          type: "image",
          content: { imageUrl: uri }, // local preview
          senderId: "me",
          createdAt: new Date().toISOString(),
        }));
        setMessages((prev) => [...prev, ...newImageMsgs]);
        setTimeout(() => scrollToBottom(true), 0);
      }

      // 2) Show user text immediately
      if (trimmed) {
        const userMsg = {
          _id: "local-" + Date.now(),
          type: "text",
          content: { text: trimmed },
          senderId: "me",
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setTimeout(() => scrollToBottom(true), 0);
      }

      setLoading(true);

      try {
        // 3) Upload images → public URLs
        let publicUrls = [];
        if (localImages.length) {
          const uploads = await Promise.allSettled(
            localImages.map(uploadChatImage)
          );
          publicUrls = uploads
            .map((r) => (r.status === "fulfilled" ? r.value?.publicUrl : ""))
            .filter((u) => typeof u === "string" && /^https?:\/\//i.test(u));
        }

        // 4) Build history from current text bubbles only
        const history = toGroqHistory(messages);

        // 5) Send to backend (text + imageUrls)
        const replyText = await pawloReply(
          { message: trimmed || "", history, imageUrls: publicUrls },
          async () => "" // switch to getToken when you secure the route
        );

        const botMsg = {
          _id: "pawlo-" + Date.now(),
          type: "text",
          content: {
            text:
              replyText ||
              t("fallbackReply", { defaultValue: "I’m here to help!" }),
          },
          senderId: "pawlo",
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setTimeout(() => scrollToBottom(true), 0);
      } catch (e) {
        const errMsg = {
          _id: "pawlo-err-" + Date.now(),
          type: "text",
          content: {
            text: t("sendError", {
              defaultValue: "Sorry, I couldn’t reply. Try again.",
            }),
          },
          senderId: "pawlo",
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errMsg]);
        setTimeout(() => scrollToBottom(true), 0);
      } finally {
        setLoading(false);
      }
    },
    [messages, t, toGroqHistory, scrollToBottom]
  );

  const onSuggestionPress = useCallback(
    (s) => {
      if (!s) return;
      const text = typeof s === "string" ? s : s?.text || s?.label;
      if (text) handleSend(text);
    },
    [handleSend]
  );

  // iOS uses KeyboardAvoidingView; Android uses plain View (we lift only the input via kbHeight)
  const IOSContainer = KeyboardAvoidingView;
  const ANDContainer = View;
  const Container = Platform.OS === "ios" ? IOSContainer : ANDContainer;

  // Bottom padding for the ScrollView content so messages never hide behind input.
  // IMPORTANT: do NOT add kbHeight here (we don't want to push content up).
  const contentBottomPad = 24 + Math.max(insets.bottom, 12) + inputHeight + 8;

  return (
    <Container
      style={[styles.root, { backgroundColor: theme.colors.background }]}
      {...(Platform.OS === "ios"
        ? { behavior: "padding", keyboardVerticalOffset: headerHeight }
        : {})}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: contentBottomPad },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {showSuggestions && (
          <>
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
            <SuggestionChips
              suggestions={suggestions}
              onSelect={onSuggestionPress}
            />
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

      {/* Input bar: measure height; on Android, lift ONLY the input by kbHeight */}
      <View
        onLayout={(e) => setInputHeight(e.nativeEvent.layout.height)}
        style={
          Platform.OS === "android"
            ? { marginBottom: kbHeight, paddingBottom: 16 }
            : null
        }
      >
        {/* ChatInput calls onSend(text, { localImages: [...] }) */}
        <ChatInput onSend={handleSend} />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingTop: 16, paddingHorizontal: 20 },
});
