// src/features/chats/components/chatIdComponents/MessageBubble.jsx
import { selectUserId } from "@/src/features/auth/store/authSlice";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import { useSelector } from "react-redux";

export default function MessageBubble({ item }) {
  const theme = useTheme();
  const me = useSelector(selectUserId);
  const isMine = item?.senderId === me;
  const { palette } = theme.colors;

  const timeLabel = useMemo(() => {
    if (!item?.createdAt) return "";
    try {
      const d = new Date(item.createdAt);
      return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }, [item?.createdAt]);

  const bg = isMine ? theme.colors.primary : theme.colors.surface;
  const fg = isMine ? theme.colors.onPrimary : theme.colors.onSurface;
  const ts = palette?.neutral?.[500] || theme.colors.outline;

  return (
    <View
      style={[
        styles.row,
        { justifyContent: isMine ? "flex-end" : "flex-start" },
      ]}
    >
      <Surface
        elevation={1}
        style={[
          styles.bubble,
          {
            backgroundColor: isMine ? bg : bg, // bg set above
            maxWidth: "85%",
          },
        ]}
      >
        <Text style={[styles.text, { color: fg }]} variant="bodyMedium">
          {item?.content?.text ?? ""}
        </Text>
        {!!timeLabel && (
          <Text style={[styles.time, { color: ts }]}>{timeLabel}</Text>
        )}
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
  },
  bubble: {
    padding: 10,
    borderRadius: 16,
  },
  text: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 14,
  },
  time: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
  },
});
