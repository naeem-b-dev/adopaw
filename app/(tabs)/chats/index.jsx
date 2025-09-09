// app/(tabs)/chats/index.jsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, useTheme } from "react-native-paper";

import ChatList from "@/src/features/chats/components/ChatListComponent/ChatList";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import Heading from "@/src/shared/components/ui/Heading/Heading";
import {
  getUserChats,
  initSocket,
  subscribeToUserChatEvents,
} from "@/src/shared/services/chatService";
import { getAuthToken } from "@/src/shared/services/supabase/getters";

export default function ChatsScreen() {
  const theme = useTheme();
  const { t } = useTranslationLoader("chatlist");
  const router = useRouter();

  const [loading, setLoading] = useState(true); // only for the first fetch
  const [rawChats, setRawChats] = useState([]);
  const [myId, setMyId] = useState("");

  // who am I?
  const loadMe = useCallback(async () => {
    const s = await AsyncStorage.getItem("user-profile");
    const p = s ? JSON.parse(s) : null;
    setMyId(p?._id ? String(p._id) : "");
  }, []);
  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const getToken = useCallback(async () => (await getAuthToken()) || "", []);

  // socket
  useEffect(() => {
    initSocket(getToken);
  }, [getToken]);

  // fetch helper — spinner optional
  const refetch = useCallback(
    async ({ showSpinner = false } = {}) => {
      try {
        if (showSpinner) setLoading(true);
        const data = await getUserChats(getToken);
        const arr = Array.isArray(data) ? data : data?.items || [];
        setRawChats(arr);
      } finally {
        if (showSpinner) setLoading(false);
      }
    },
    [getToken]
  );

  // initial load with spinner
  useEffect(() => {
    (async () => {
      await refetch({ showSpinner: true });
    })();
  }, [refetch]);

  // ---- Optimistic update helpers ----
  const reconcileTimer = useRef(null);
  const scheduleReconcile = useCallback(() => {
    if (reconcileTimer.current) clearTimeout(reconcileTimer.current);
    reconcileTimer.current = setTimeout(() => {
      refetch(); /* silent */
    }, 600);
  }, [refetch]);

  // shallow-merge only defined fields
  const mergeDefined = (dst, src) => {
    const out = { ...dst };
    if (src.lastMessageAt != null) out.lastMessageAt = src.lastMessageAt;
    if (src.lastMessage != null) out.lastMessage = src.lastMessage;
    if (typeof src.unreadCount === "number") out.unreadCount = src.unreadCount;
    if (src.updatedAt != null) out.updatedAt = src.updatedAt;
    if (src.petId != null) out.petId = src.petId;
    if (src.peer != null) out.peer = src.peer;
    return out;
  };
  const sortByRecency = (arr) =>
    [...arr].sort(
      (a, b) =>
        new Date(b?.lastMessageAt || b?.updatedAt || 0) -
        new Date(a?.lastMessageAt || a?.updatedAt || 0)
    );

  // Raw event handlers for optimistic UI
  const handleUpdate = useCallback(
    (payload) => {
      const patch = payload?.chat;
      if (!patch?._id) {
        scheduleReconcile();
        return;
      }
      setRawChats((prev) => {
        const idx = prev.findIndex((c) => c._id === patch._id);
        if (idx === -1) {
          scheduleReconcile();
          return prev;
        }
        const next = [...prev];
        next[idx] = mergeDefined(prev[idx], patch);
        return sortByRecency(next);
      });
      scheduleReconcile();
    },
    [scheduleReconcile]
  );

  const handleTouch = useCallback(
    (payload) => {
      const chatId = payload?.chatId;
      if (!chatId) return;
      setRawChats((prev) => {
        const idx = prev.findIndex((c) => c._id === chatId);
        if (idx === -1) {
          scheduleReconcile();
          return prev;
        }
        const next = [...prev];
        next[idx] = mergeDefined(prev[idx], {
          lastMessageAt: payload.lastMessageAt,
        });
        return sortByRecency(next);
      });
      scheduleReconcile();
    },
    [scheduleReconcile]
  );

  const handleNew = useCallback(
    (payload) => {
      const full = payload?.chat;
      const chatId = payload?.chatId || full?._id;
      if (!chatId) return;
      setRawChats((prev) => {
        if (prev.some((c) => c._id === chatId)) return prev;
        if (full && full._id) return sortByRecency([full, ...prev]);
        scheduleReconcile();
        return prev;
      });
      scheduleReconcile();
    },
    [scheduleReconcile]
  );

  // Subscribe to raw socket events for instant UI
  useEffect(() => {
    const unsub = subscribeToUserChatEvents({
      onUpdate: handleUpdate,
      onTouch: handleTouch,
      onNew: handleNew,
    });
    return () => unsub && unsub();
  }, [handleUpdate, handleTouch, handleNew]);

  // ✅ Dedupe (peerId + petId), drop rows where peer === me
  const chats = useMemo(() => {
    const byKey = new Map();
    for (const c of rawChats) {
      const peerId = c?.peer?._id ? String(c.peer._id) : "";
      if (peerId && myId && peerId === myId) continue;
      const petId = c?.petId ? String(c.petId) : "none";
      const key = `${peerId}:${petId}`;

      const prev = byKey.get(key);
      if (!prev) {
        byKey.set(key, c);
      } else {
        const a = new Date(c?.lastMessageAt || c?.updatedAt || 0).getTime();
        const b = new Date(
          prev?.lastMessageAt || prev?.updatedAt || 0
        ).getTime();
        if (a >= b) byKey.set(key, c);
      }
    }
    return Array.from(byKey.values()).sort(
      (a, b) =>
        new Date(b?.lastMessageAt || b?.updatedAt || 0) -
        new Date(a?.lastMessageAt || a?.updatedAt || 0)
    );
  }, [rawChats, myId]);

  // Instant UX: clear the unread badge locally before navigating
  const handleOpenChat = (chatId) => {
    if (!chatId) return;
    setRawChats((prev) =>
      prev.map((c) => (c._id === chatId ? { ...c, unreadCount: 0 } : c))
    );
    router.push(`/chats/${chatId}`);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
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
