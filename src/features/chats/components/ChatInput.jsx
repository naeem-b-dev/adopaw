import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  I18nManager,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import EmojiSelector, { Categories } from "react-native-emoji-selector";

import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { selectJwt } from "@/src/features/auth/store/authSlice";
import { sendMessage, setTyping } from "@/src/shared/services/chatService";
import { useSelector } from "react-redux";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
export default function ChatInput({ chatId, onSend, onSendImage }) {
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);

  const { t } = useTranslationLoader("chatId");
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const jwt = useSelector(selectJwt);
  const getToken = useCallback(async () => jwt || "", [jwt]);

  const palette = theme.colors?.palette || {};
  const isDark = !!theme.dark;

  const inputBg =
    (!isDark && (palette.neutral?.[100] || theme.colors.surfaceVariant)) ||
    (isDark && theme.colors.surface) ||
    theme.colors.surface;

  const inputPlaceholder = theme.colors.outline;
  const textColor = theme.colors.onSurface;
  const iconGray = palette.neutral?.[600] || theme.colors.outline;

  const sendIdleBg = palette.neutral?.[200] || theme.colors.surfaceVariant;
  const sendActiveBg = theme.colors.primary;
  const sendActiveFg = theme.colors.onPrimary;
  const sendIdleFg = iconGray;

  const isMessageNotEmpty = message.trim().length > 0;
  const typingTimerRef = useRef(null);

  // Typing (only for DM rooms)
  useEffect(() => {
    if (!chatId) return;
    if (isMessageNotEmpty) {
      setTyping(chatId, true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => setTyping(chatId, false), 1200);
    } else {
      setTyping(chatId, false);
    }
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [chatId, isMessageNotEmpty, message]);

  const handleSend = async () => {
    const trimmed = message.trim();
    const hasImage = !!pendingImage;
    if (!trimmed && !hasImage) return;

    setShowEmoji(false);

    try {
      if (chatId) {
        // DM room: send to your backend as before
        if (hasImage) {
          await sendMessage(
            chatId,
            { type: "image", content: { imageUrl: pendingImage } },
            getToken
          );
        }
        if (trimmed) {
          await sendMessage(
            chatId,
            { type: "text", content: { text: trimmed } },
            getToken
          );
        }
      } else if (onSend) {
        // Pawlo flow: send BOTH in one call
        await onSend(trimmed, { localImages: hasImage ? [pendingImage] : [] });
      }
    } catch (err) {
      console.warn("Send failed:", err?.message || err);
    } finally {
      setMessage("");
      setPendingImage(null);
    }
  };

  const toggleEmoji = () => {
    if (!showEmoji) Keyboard.dismiss();
    setShowEmoji((v) => !v);
  };

  const onEmojiSelected = (emoji) => setMessage((prev) => `${prev}${emoji}`);

  const handlePickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;

      // ✅ Compatible with old/new expo-image-picker
      const imageEnum =
        ImagePicker?.MediaType?.Images ?? ImagePicker?.MediaTypeOptions?.Images;

      const options = {
        allowsMultipleSelection: false,
        quality: 0.8,
        ...(imageEnum ? { mediaTypes: imageEnum } : {}), // omit if enum missing
      };

      const result = await ImagePicker.launchImageLibraryAsync(options);
      if (result.canceled) return;

      const uri = result.assets?.[0]?.uri;
      if (!uri) return;

      setShowEmoji(false);
      setPendingImage(uri); // attach only; send happens when user taps Send
    } catch (err) {
      console.warn("Pick image failed:", err?.message || err);
    }
  };

  const removePendingImage = () => setPendingImage(null);

  const canSend = isMessageNotEmpty || !!pendingImage;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <View
        style={[
          styles.bar,
          {
            backgroundColor: theme.colors.surface,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        {/* Input pill */}
        <View style={[styles.inputPill, { backgroundColor: inputBg }]}>
          {/* Emoji toggle */}
          <TouchableOpacity style={styles.leadingIcon} onPress={toggleEmoji}>
            <Ionicons name="happy-outline" size={22} color={iconGray} />
          </TouchableOpacity>

          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={t("placeholder")}
            placeholderTextColor={inputPlaceholder}
            style={[styles.input, { color: textColor }]}
            multiline
            onFocus={() => setShowEmoji(false)}
          />

          {/* Attached image preview (chip) */}
          {pendingImage ? (
            <View style={styles.thumbWrap}>
              <Image source={{ uri: pendingImage }} style={styles.thumb} />
              <TouchableOpacity
                style={styles.thumbRemove}
                onPress={removePendingImage}
              >
                <Ionicons name="close" size={14} color={sendIdleFg} />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Image picker */}
          <TouchableOpacity
            style={styles.trailingIcon}
            onPress={handlePickImage}
          >
            <Ionicons name="image-outline" size={22} color={iconGray} />
          </TouchableOpacity>
        </View>

        {/* Send button */}
        <TouchableOpacity
          onPress={handleSend}
          disabled={!canSend}
          style={[
            styles.sendButton,
            { backgroundColor: canSend ? sendActiveBg : sendIdleBg },
          ]}
        >
          <Ionicons
            name="send"
            size={18}
            color={canSend ? sendActiveFg : sendIdleFg}
            style={
              I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined
            }
          />
        </TouchableOpacity>
      </View>

      {/* Emoji panel */}
      {showEmoji ? (
        <View style={{ height: 280 }}>
          <EmojiSelector
            onEmojiSelected={onEmojiSelected}
            showSearchBar={false}
            showTabs
            showHistory
            category={Categories.all}
            columns={8}
          />
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 12,
  },
  inputPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    paddingHorizontal: 14,
    minHeight: 44,
  },
  leadingIcon: { paddingRight: 8, paddingVertical: 6 },
  trailingIcon: { paddingLeft: 8, paddingVertical: 6 },
  input: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    paddingBottom: 2,
    fontFamily: "Alexandria_400Regular",
  },
  sendButton: {
    width: 44,
    height: 44,
    marginLeft: 8,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbWrap: {
    marginLeft: 8,
    width: 34,
    height: 34,
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
  },
  thumb: { width: "100%", height: "100%" },
  thumbRemove: {
    position: "absolute",
    top: -4,
    right: -4,
    padding: 6,
  },
});
