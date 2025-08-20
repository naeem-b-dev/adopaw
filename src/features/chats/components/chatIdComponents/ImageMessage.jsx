// src/features/chats/components/chatIdComponents/ImageMessage.jsx
import { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function ImageMessage({ item, currentUserId, imageSource, label, timestamp }) {
  const theme = useTheme();
  const { palette } = theme.colors;

  // Support both old props (imageSource/label/timestamp) and new `item`
  const isFromItem = !!item;
  const senderId = isFromItem ? item?.senderId : currentUserId; // default to current user if not provided
  const isMine = isFromItem ? item?.senderId === currentUserId : true;

  const uri =
    isFromItem ? item?.content?.imageUrl : imageSource;
  const name =
    isFromItem ? item?.content?.label || label : label;
  const createdAt =
    isFromItem ? item?.createdAt : timestamp;

  const timeLabel = useMemo(() => {
    if (!createdAt) return "";
    try {
      const d = new Date(createdAt);
      return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }, [createdAt]);

  const bubbleBg = isMine ? palette.blue[400] : theme.colors.surface;
  const textColor = isMine ? theme.colors.onPrimary : theme.colors.onSurface;
  const tsColor = isMine ? theme.colors.onPrimary : theme.colors.onSurfaceVariant || theme.colors.onSurface;

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
      {/* Keep old UI: image + label row */}
      {uri ? (
        <Image source={typeof uri === "string" ? { uri } : uri} style={styles.petImage} />
      ) : null}

      <View style={styles.labelRow}>
        {!!name && <Text style={[styles.label, { color: textColor }]}>{name}</Text>}
        {!!timeLabel && <Text style={[styles.timestamp, { color: tsColor }]}>{timeLabel}</Text>}
      </View>
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
    width: 140,
    height: 140,
    borderRadius: 12,
  },
  labelRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontFamily: "Alexandria_700Bold",
    fontSize: 14,
  },
  timestamp: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 11,
  },
});
