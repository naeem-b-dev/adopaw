import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ImageMessage from "@/src/features/chats/components/chatIdComponents/ImageMessage.jsx";
import MessageBubble from "@/src/features/chats/components/chatIdComponents/MessageBubble.jsx";
import ChatInput from "@/src/features/chats/components/ChatInput";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import { useFocusEffect } from '@react-navigation/native';


import {
  getMessages,
  markAsRead,
  subscribeToMessages,
  subscribeToTyping,
} from "@/src/shared/services/chatService";
import { getAuthToken } from "@/src/shared/services/supabase/getters";

export default function ChatDetailScreen() {
  const { t } = useTranslationLoader("chatId");
  const { chatId } = useLocalSearchParams();
  const theme = useTheme();
  const { palette } = theme.colors;
  const insets = useSafeAreaInsets();

  // 🔑 Build token getter
  const getToken = useCallback(async () => (await getAuthToken()) || "", []);

  // 👤 Use Profile._id saved in AsyncStorage ("user-profile")
  const [currentUserId, setCurrentUserId] = useState("");
  useEffect(() => {
    AsyncStorage.getItem("user-profile").then((s) => {
      const p = s ? JSON.parse(s) : null;
      setCurrentUserId(p?._id ? String(p._id) : "");
    });
  }, []);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);
  const listRef = useRef(null);
  const [isPeerTyping, setIsPeerTyping] = useState(false);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMessages(String(chatId), 30, null, getToken);
      const items = Array.isArray(res.items) ? res.items : [];
      setMessages(items);
      setNextCursor(res.nextCursor || null);

      const latest = items[items.length - 1];
      if (latest?._id) {
        markAsRead(String(chatId), latest._id, getToken).catch(() => { });
      }
    } finally {
      setLoading(false);
    }
  }, [chatId, getToken]);

  const refetchNow = useCallback(async () => {
    const res = await getMessages(String(chatId), 30, null, getToken);
    setMessages(res.items);
    setNextCursor(res.nextCursor || null);
  }, [chatId, getToken]);

  useEffect(() => {
    if (!chatId) return;
    let unsubscribe = () => { };
    let unTyping = () => { };

    loadInitial();

    unsubscribe = subscribeToMessages(String(chatId), (evt) => {
      if (evt.type === "new" && evt.message) {
        setMessages((prev) => [...prev, evt.message]);

        if (evt.message.senderId && String(evt.message.senderId) !== String(currentUserId)) {
          markAsRead(String(chatId), evt.message._id, getToken).catch(() => { });
        }
      } else if (evt.type === "edit" && evt.message) {
        setMessages((prev) =>
          prev.map((m) => (m._id === evt.message._id ? evt.message : m))
        );
      } else if (evt.type === "delete" && evt.messageId) {
        setMessages((prev) => prev.filter((m) => m._id !== evt.messageId));
      }
    });

    unTyping = subscribeToTyping(String(chatId), (evt) => {
      if (!evt) return;
      if (evt.userId && String(evt.userId) !== String(currentUserId)) {
        setIsPeerTyping(!!evt.isTyping);
      }
    });

    return () => {
      unsubscribe && unsubscribe();
      unTyping && unTyping();
    };
  }, [chatId, loadInitial, currentUserId, getToken]);

  // Mark as read when the screen gains focus and also on blur (best effort)
  useFocusEffect(
    useCallback(() => {
      if (!messages.length) return;
      const latest = messages[messages.length - 1];
      if (latest?._id) {
        markAsRead(String(chatId), latest._id, getToken).catch(() => { });
      }
    }, [chatId, messages.length, getToken])
  );

  const loadOlder = useCallback(async () => {
    if (!nextCursor) return;
    const res = await getMessages(String(chatId), 30, nextCursor, getToken);
    const older = Array.isArray(res.items) ? res.items : [];
    if (older.length) setMessages((prev) => [...older, ...prev]);
    setNextCursor(res.nextCursor || null);
  }, [chatId, nextCursor, getToken]);

  const renderItem = useCallback(
    ({ item }) => {
      if (item.type === "image") {
        return <ImageMessage item={item} currentUserId={currentUserId} />;
      }
      return <MessageBubble item={item} currentUserId={currentUserId} />;
    },
    [currentUserId]
  );

  if (loading && !messages.length) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background, paddingBottom: insets.bottom },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <Text
        style={[
          styles.todayLabel,
          { backgroundColor: palette.blue[400], color: palette.neutral[800] },
        ]}
      >
        {t("today")}
      </Text>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => String(item._id)}
        renderItem={renderItem}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.05}
        onEndReached={loadOlder}
        initialNumToRender={20}
        windowSize={10}
        removeClippedSubviews
      />

      {isPeerTyping ? (
        <Text
          style={{
            alignSelf: "flex-start",
            marginLeft: 20,
            marginBottom: 4,
            opacity: 0.7,
            fontFamily: "Alexandria_400Regular",
            fontSize: 12,
          }}
        >
          {t("typing")}
        </Text>
      ) : null}

      <View style={{ paddingBottom: Math.max(insets.bottom, 0) }}>
        <ChatInput chatId={String(chatId)} onSend={refetchNow} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  todayLabel: {
    alignSelf: "center",
    marginVertical: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 100,
    fontFamily: "Alexandria_400Regular",
    fontSize: 12,
  },
  messagesList: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
});
