import { useTranslationLoader } from '@/src/localization/hooks/useTranslationLoader';
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Badge, Text, useTheme } from "react-native-paper";

export default function ChatCardTemp({
  name,
  message,
  timestamp,
  avatar,
  unreadCount,
  onPress,
}) {
  const theme = useTheme();
  const { palette, text, surface } = theme.colors;
  const { t } = useTranslationLoader("chatlist");

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: surface }]}
      onPress={onPress}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={typeof avatar === "string" ? { uri: avatar } : avatar}
          style={styles.avatar}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: text }]} numberOfLines={1}>
            {t(name, { defaultValue: name })}
          </Text>
          <Text style={[styles.timestamp, { color: palette.neutral[500] }]}>
            {timestamp}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text
            style={[styles.message, { color: palette.neutral[600] }]}
            numberOfLines={1}
          >
            {t(message, { defaultValue: message })}
          </Text>
          {unreadCount > 0 && (
            <Badge style={[styles.badge, { backgroundColor: palette.blue[500] }]}>
              {unreadCount}
            </Badge>
          )}
        </View>
      </View>
    </TouchableOpacity>
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
    elevation: 2,
  },
  avatarContainer: {
    padding: 2,
    marginRight: 12,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  },
  badge: {
    fontSize: 10,
    height: 20,
    minWidth: 20,
    alignSelf: "flex-start",
  },
});
