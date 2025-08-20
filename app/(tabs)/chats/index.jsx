// app/(tabs)/chats/index.jsx
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, useTheme } from "react-native-paper";

import ChatList from "@/src/features/chats/components/ChatListComponent/ChatList";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import Heading from "@/src/shared/components/ui/Heading/Heading";

import { getUserChats, subscribeToUserChats } from "@/src/shared/services/chatService";

// ✅ Redux auth (selectors only; NO store here)
import { useSelector } from "react-redux";
import { selectJwt } from "@/src/features/auth/store/authSlice";

export default function ChatsScreen() {
  const theme = useTheme();
  const { t } = useTranslationLoader("chatlist");
  const router = useRouter();

  const jwt = useSelector(selectJwt);
  const getToken = useCallback(async () => jwt || "", [jwt]);

  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUserChats(getToken);
      const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        : [];
      setChats(sorted);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    refetch();
    const unsub = subscribeToUserChats(() => refetch());
    return () => unsub();
  }, [refetch]);

  const handleOpenChat = (chatId) => chatId && router.push(`/chats/${chatId}`);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headingWrapper}>
        <Heading title={t("chatsListTitle")} align="start" />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : (
        <ChatList
          chats={chats}
          onPressChat={handleOpenChat}
          emptyTitle={t("emptyTitle")}
          emptySubtitle={t("emptySubtitle")}
          photoLabel={t("photoLabel")}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headingWrapper: { paddingHorizontal: 20, paddingTop: 78 },
});
