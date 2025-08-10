import { Entypo, Ionicons } from "@expo/vector-icons";
import { useState } from "react";
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

export default function ChatInput() {
  const [message, setMessage] = useState("");
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const palette = theme.colors?.palette || {};
  const isDark = !!theme.dark;

  const inputBg =
    (!isDark && (palette.neutral?.[100] || theme.colors.surface)) ||
    (isDark && theme.colors.surface) ||
    theme.colors.surface;

  const inputPlaceholder =
    palette.neutral?.[500] || theme.colors.onSurface;

  const textColor = theme.colors.onSurface;

  const iconGray = palette.neutral?.[600] || "#A0A0A0";

  const sendIdleBg =
    palette.neutral?.[200] || "rgba(0,0,0,0.06)";
  const sendActiveBg = theme.colors.primary;

  const isMessageNotEmpty = message.trim().length > 0;

  const handleSend = () => {
    if (!isMessageNotEmpty) return;
    console.log("Sending message:", message);
    setMessage("");
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
            placeholder="Message..."
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
            color={isMessageNotEmpty ? "#fff" : iconGray}
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
    paddingHorizontal: 12, // small padding for full-width fill
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
