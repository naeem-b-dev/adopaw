// src/features/chats/components/chatIdComponents/MessageBubble.jsx

import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function MessageBubble({ type = "incoming", text, timestamp }) {
  const theme = useTheme();
  const { palette } = theme.colors;

  const isIncoming = type === "incoming";

  return (
    <View
      style={[
        styles.messageBubble,
        isIncoming ? styles.incomingBubble : styles.outgoingBubble,
        {
          backgroundColor: isIncoming ? theme.colors.surface : palette.blue[400],
        },
      ]}
    >
      <Text
        style={[
          styles.messageText,
          { color:  palette.neutral[900]  },
        ]}
      >
        {text}
      </Text>
      <Text style={[styles.timestamp, { color: palette.neutral[500] }]}> 
        {timestamp}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 12,
  },
  incomingBubble: {
    alignSelf: "flex-start",
  },
  outgoingBubble: {
    alignSelf: "flex-end",
  },
  messageText: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 14,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
  },
});
