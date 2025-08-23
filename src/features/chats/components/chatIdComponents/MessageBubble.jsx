// src/features/chats/components/chatIdComponents/MessageBubble.jsx
import { selectUserId, selectJwt } from "@/src/features/auth/store/authSlice";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import { useSelector } from "react-redux";

function extractLikelyChatUserIdFromJWT(jwt) {
  try {
    const [, b64] = (jwt || "").split(".");
    if (!b64) return "";
    const json = JSON.parse(
      global.atob ? atob(b64) : Buffer.from(b64, "base64").toString("utf8")
    );

    const candidates = [
      json?.mongoId,
      json?.userId,
      json?.user_id,
      json?.uid,
      json?.id,
      json?.sub,
      json?.app_metadata?.mongoId,
      json?.app_metadata?.userId,
      json?.user_metadata?.mongoId,
      json?.["https://hasura.io/jwt/claims"]?.["x-hasura-user-id"],
    ]
      .filter(Boolean)
      .map(String);

    // Prefer a 24-hex Mongo id if available
    const hex24 = candidates.find((x) => /^[a-f0-9]{24}$/i.test(x));
    return hex24 || candidates[0] || "";
  } catch {
    return "";
  }
}

export default function MessageBubble({ item, currentUserId }) {
  const theme = useTheme();
  const reduxUserId = useSelector(selectUserId);
  const jwt = useSelector(selectJwt);
  const jwtId = useMemo(() => extractLikelyChatUserIdFromJWT(jwt), [jwt]);

  const myId = String(currentUserId ?? reduxUserId ?? jwtId ?? "");
  const senderId = String(item?.senderId ?? "");

  const isMine = !!myId && !!senderId && myId === senderId;

  const { palette } = theme.colors || {};
  const blue400 = (palette?.blue && palette.blue[400]) || "#60A5FA"; // hard fallback

  const bgMine = blue400;
  const bgOther = theme.colors.surface;
  const fgMine = theme.colors.onPrimary || "#ffffff";
  const fgOther = theme.colors.onSurface;
  const tsColor =
    (palette?.neutral && palette.neutral[500]) || theme.colors.outline;

  const timeLabel = useMemo(() => {
    const ts = item?.createdAt || item?.timestamp;
    if (!ts) return "";
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }, [item?.createdAt, item?.timestamp]);

  return (
    <View
      style={[
        styles.row,
        { justifyContent: isMine ? "flex-end" : "flex-start" },
      ]}
    >
      <Surface
        elevation={0}
        style={[
          styles.bubble,
          isMine ? styles.bubbleMine : styles.bubbleOther,
          { backgroundColor: isMine ? bgMine : bgOther },
        ]}
      >
        {!!item?.content?.text && (
          <Text
            style={[styles.text, { color: isMine ? fgMine : fgOther }]}
            variant="bodyMedium"
          >
            {item.content.text}
          </Text>
        )}
        {!!timeLabel && (
          <Text style={[styles.time, { color: isMine ? fgMine : tsColor }]}>
            {timeLabel}
          </Text>
        )}
      </Surface>
    </View>
  );
}

const R = 16;
const styles = StyleSheet.create({
  row: { paddingHorizontal: 12, paddingVertical: 4, flexDirection: "row" },
  bubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    maxWidth: "85%",
    minWidth: 100,
  },
  bubbleMine: {
    borderTopLeftRadius: R,
    borderTopRightRadius: R,
    borderBottomLeftRadius: R,
    borderBottomRightRadius: 6,
  },
  bubbleOther: {
    borderTopLeftRadius: R,
    borderTopRightRadius: R,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: R,
  },
  text: { fontFamily: "Alexandria_400Regular", fontSize: 14 },
  time: { fontSize: 11, marginTop: 4, alignSelf: "flex-end" },
});
