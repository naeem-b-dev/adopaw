import { selectUserId } from "@/src/features/auth/store/authSlice";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import { useSelector } from "react-redux";

export default function MessageBubble({ item, currentUserId }) {
  const theme = useTheme();
  const reduxUserId = useSelector(selectUserId);
  const myId = currentUserId ?? reduxUserId;
  const isMine = item?.senderId === myId;

  const { palette } = theme.colors;
  const bgMine = palette?.blue?.[400] ?? theme.colors.primary;
  const bgOther = theme.colors.surface;
  const fgMine = theme.colors.onPrimary;
  const fgOther = theme.colors.onSurface;
  const tsColor = palette?.neutral?.[500] ?? theme.colors.outline;

  const timeLabel = useMemo(() => {
    const ts = item?.createdAt || item?.timestamp;
    if (!ts) return "";
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }, [item?.createdAt, item?.timestamp]);

  return (
    <View style={[styles.row, { justifyContent: isMine ? "flex-end" : "flex-start" }]}>
      <Surface
        elevation={0} // flatter look; prevents “double” visual
        style={[
          styles.bubble,
          isMine ? styles.bubbleMine : styles.bubbleOther,
          { backgroundColor: isMine ? bgMine : bgOther },
        ]}
      >
        {!!item?.content?.text && (
          <Text style={[styles.text, { color: isMine ? fgMine : fgOther }]} variant="bodyMedium">
            {item.content.text}
          </Text>
        )}
        {!!timeLabel && (
          <Text style={[styles.time, { color: isMine ? fgMine : tsColor }]}>{timeLabel}</Text>
        )}
      </Surface>
    </View>
  );
}

const R = 16; // base radius
const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexDirection: "row",
  },
  bubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    maxWidth: "85%",
  },
  bubbleMine: {
    borderTopLeftRadius: R,
    borderTopRightRadius: R,
    borderBottomLeftRadius: R,
    borderBottomRightRadius: 6, // slightly sharper tail side
  },
  bubbleOther: {
    borderTopLeftRadius: R,
    borderTopRightRadius: R,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: R,
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
