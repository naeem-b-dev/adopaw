// app/(tabs)/chats/index.jsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, useTheme } from "react-native-paper";

import ChatList from "@/src/features/chats/components/ChatListComponent/ChatList";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import Heading from "@/src/shared/components/ui/Heading/Heading";
import { getUserChats, subscribeToUserChats } from "@/src/shared/services/chatService";
import { getAuthToken } from "@/src/shared/services/supabase/getters";

export default function ChatsScreen() {
  const theme = useTheme();
  const { t } = useTranslationLoader("chatlist");
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [rawChats, setRawChats] = useState([]);
  const [myId, setMyId] = useState("");

  // who am I? (Mongo _id) — used to filter/label
  const loadMe = useCallback(async () => {
    const s = await AsyncStorage.getItem("user-profile");
    const p = s ? JSON.parse(s) : null;
    setMyId(p?._id ? String(p._id) : "");
  }, []);
  useEffect(() => { loadMe(); }, [loadMe]);

  const getToken = useCallback(async () => (await getAuthToken()) || "", []);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUserChats(getToken);
      const arr = Array.isArray(data) ? data : data?.items || [];
      setRawChats(arr);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      await refetch();
      unsub = subscribeToUserChats(() => refetch());
    })();
    return () => unsub && unsub();
  }, [refetch]);

  // ✅ Dedupe (peerId + petId), drop rows where peer === me
  const chats = useMemo(() => {
    const byKey = new Map();
    for (const c of rawChats) {
      const peerId = c?.peer?._id ? String(c.peer._id) : "";
      if (peerId && myId && peerId === myId) {
        // bad historical row; skip
        continue;
      }
      const petId = c?.petId ? String(c.petId) : "none";
      const key = `${peerId}:${petId}`;

      // choose the newest version per key
      const prev = byKey.get(key);
      if (!prev) {
        byKey.set(key, c);
      } else {
        const a = new Date(c?.lastMessageAt || c?.updatedAt || 0).getTime();
        const b = new Date(prev?.lastMessageAt || prev?.updatedAt || 0).getTime();
        if (a >= b) byKey.set(key, c);
      }
    }
    // sort newest → oldest
    return Array.from(byKey.values()).sort(
      (a, b) =>
        new Date(b?.lastMessageAt || b?.updatedAt || 0) -
        new Date(a?.lastMessageAt || a?.updatedAt || 0)
    );
  }, [rawChats, myId]);

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
