// src/features/chats/components/ChatListComponent/ChatCardTemp.jsx
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Avatar, Text, useTheme } from "react-native-paper";

export default function ChatCardTemp({
  name,
  message,
  timestamp,
  avatar,       // string (uri) | number (require) | undefined
  unreadCount = 0,
  onPress,
}) {
  const theme = useTheme();
  const { palette } = theme.colors || {};
  const { t } = useTranslationLoader("chatlist");

  const avatarNode = useMemo(() => {
    if (avatar && typeof avatar === "number") {
      return <Avatar.Image size={52} source={avatar} />;
    }
    if (avatar && typeof avatar === "string") {
      return <Avatar.Image size={52} source={{ uri: avatar }} />;
    }
    // Fallback initials
    const initials =
      typeof name === "string" && name.length
        ? name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
        : "?";
    return (
      <Avatar.Text
        size={52}
        label={initials}
        style={{ backgroundColor: palette?.blue?.[100] || theme.colors.surfaceVariant }}
        color={palette?.neutral?.[800] || theme.colors.onSurface}
      />
    );
  }, [avatar, name, palette, theme.colors]);

  // format preview safely for RTL/i18n; don't try to translate names/messages literally
  const displayName = String(name || "");
  const preview = String(message || "");
  const time = String(timestamp || "");

  // unread pill (custom view so the background is always visible)
  const UnreadPill = unreadCount > 0 ? (
    <View
      style={[
        styles.badge,
        { backgroundColor: theme.colors.primary }
      ]}
    >
      <Text style={[styles.badgeText, { color: theme.colors.onPrimary }]}>
        {unreadCount > 99 ? "99+" : unreadCount}
      </Text>
    </View>
  ) : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.colors.surface },
        pressed && { opacity: 0.9 },
      ]}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>{avatarNode}</View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[styles.name, { color: theme.colors.onSurface }]}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          {!!time && (
            <Text
              style={[styles.timestamp, { color: palette?.neutral?.[500] || theme.colors.outline }]}
              numberOfLines={1}
            >
              {time}
            </Text>
          )}
        </View>

        <View style={styles.footer}>
          <Text
            style={[styles.message, { color: palette?.neutral?.[600] || theme.colors.onSurface }]}
            numberOfLines={1}
          >
            {preview}
          </Text>

          {UnreadPill}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 10,
    marginHorizontal: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    minHeight: 56,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    fontFamily: "Alexandria_700Bold",
    fontSize: 15,
    flex: 1,
    marginRight: 6,
  },
  timestamp: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 12,
    marginLeft: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  message: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 13,
    flex: 1,
    marginRight: 10,
    opacity: 0.9,
  },
  // custom unread pill (always a blue circle/pill)
  badge: {
    marginLeft: 8,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontFamily: "Alexandria_700Bold",
    fontSize: 12,
    lineHeight: 14,
  },
});
