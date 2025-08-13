// src/features/chats/components/chatIdComponents/ImageMessage.jsx
import { selectUserId } from "@/src/features/auth/store/authSlice";
import React, { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSelector } from "react-redux";

export default function ImageMessage({ item }) {
  const theme = useTheme();
  const me = useSelector(selectUserId);
  const isMine = item?.senderId === me;

  const uri = item?.content?.imageUrl || "";
  if (!uri) return null;

  const labelColor = theme.colors.onSurface;
  const timestampColor = theme.colors.onSurfaceVariant ?? theme.colors.onSurface;

  const timeLabel = useMemo(() => {
    if (!item?.createdAt) return "";
    try {
      const d = new Date(item.createdAt);
      return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }, [item?.createdAt]);

  const label = item?.content?.label ?? ""; // optional label if your backend provides it

  return (
    <View
      style={[
        styles.imageContainer,
        {
          backgroundColor: theme.colors.surface,
          alignSelf: isMine ? "flex-end" : "flex-start",
        },
      ]}
    >
      <Image source={{ uri }} style={styles.petImage} />
      <View style={styles.labelRow}>
        {!!label && <Text style={[styles.label, { color: labelColor }]}>{label}</Text>}
        {!!timeLabel && (
          <Text style={[styles.timestamp, { color: timestampColor }]}>{timeLabel}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    maxWidth: "85%",
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
