// src/features/chats/components/pawlo/ChatInput.jsx
import { Entypo, Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { sendMessage, setTyping } from "@/src/shared/services/chatService";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

// Redux
import { selectJwt } from "@/src/features/auth/store/authSlice";
import { useSelector } from "react-redux";

export default function ChatInput({ chatId }) {
  const { t } = useTranslationLoader("chatId");
  const [message, setMessage] = useState("");
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Build getToken() the service expects
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

  // Typing debounce
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
    if (!trimmed || !chatId) return;

    // Optimistic clear (screen subscribes to live updates)
    setMessage("");
    try {
      await sendMessage(chatId, { type: "text", content: { text: trimmed } }, getToken);
    } catch {
      // Optional: show a toast/snackbar and reinsert text if you want rollback
      // setMessage(trimmed);
    }
  };

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
          <TouchableOpacity style={styles.leadingIcon}>
            <Ionicons name="happy-outline" size={22} color={iconGray} />
          </TouchableOpacity>

          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={t("inputPlaceholder")}
            placeholderTextColor={inputPlaceholder}
            style={[styles.input, { color: textColor }]}
            multiline
          />

          <TouchableOpacity style={styles.trailingIcon}>
            <Entypo name="attachment" size={20} color={iconGray} />
          </TouchableOpacity>
        </View>

        {/* Send button */}
        <TouchableOpacity
          onPress={handleSend}
          disabled={!isMessageNotEmpty}
          style={[
            styles.sendButton,
            { backgroundColor: isMessageNotEmpty ? sendActiveBg : sendIdleBg },
          ]}
        >
          <Ionicons
            name="send"
            size={18}
            color={isMessageNotEmpty ? sendActiveFg : sendIdleFg}
          />
        </TouchableOpacity>
      </View>
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
});
