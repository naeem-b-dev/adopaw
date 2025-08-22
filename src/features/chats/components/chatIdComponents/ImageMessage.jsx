// src/features/chats/components/chatIdComponents/ImageMessage.jsx
import { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";


export default function ImageMessage({
  item,
  currentUserId,
  imageSource,
  label,
  timestamp,
}) {
  const theme = useTheme();
  const palette = theme.colors?.palette || {};

  const isFromItem = !!item;

  const myId = String(currentUserId ?? "");
  const senderId = isFromItem ? String(item?.senderId ?? "") : myId;
  const isMine = isFromItem ? senderId === myId : true;

  const uri = isFromItem ? item?.content?.imageUrl : imageSource;

  // ✅ caption fallback: label → text → prop label
  const caption = isFromItem
    ? (item?.content?.label ?? item?.content?.text ?? "")
    : (label ?? "");

  const createdAt = isFromItem ? item?.createdAt : timestamp;

  const timeLabel = useMemo(() => {
    if (!createdAt) return "";
    try {
      const d = new Date(createdAt);
      return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }, [createdAt]);

  // ✅ safe color fallbacks
  const blue400 = (palette.blue && palette.blue[400]) || theme.colors.primary;
  const bubbleBg = isMine ? blue400 : theme.colors.surface;
  const textColor = isMine ? theme.colors.onPrimary : theme.colors.onSurface;
  const tsColor = isMine ? theme.colors.onPrimary : (theme.colors.onSurfaceVariant || theme.colors.onSurface);

  return (
    <View
      style={[
        styles.imageContainer,
        {
          backgroundColor: bubbleBg,
          alignSelf: isMine ? "flex-end" : "flex-start",
        },
      ]}
    >
      {uri ? (
        <Image
          source={typeof uri === "string" ? { uri } : uri}
          style={styles.petImage}
        />
      ) : null}

      {(caption || timeLabel) ? (
        <View style={styles.labelRow}>
          {!!caption && (
            <Text style={[styles.label, { color: textColor }]} numberOfLines={2}>
              {caption}
            </Text>
          )}
          {!!timeLabel && (
            <Text style={[styles.timestamp, { color: tsColor }]}>{timeLabel}</Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    maxWidth: "80%",
  },
  petImage: {
    width: 160,
    height: 160,
    borderRadius: 12,
  },
  labelRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  label: {
    flex: 1,
    fontFamily: "Alexandria_700Bold",
    fontSize: 14,
  },
  timestamp: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 11,
  },
});
