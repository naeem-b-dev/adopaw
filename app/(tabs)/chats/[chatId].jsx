import { useLocalSearchParams } from "expo-router";
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

// 🔁 Redux auth
import { selectJwt, selectUserId } from "@/src/features/auth/store/authSlice";
import { useSelector } from "react-redux";

// 💬 chat service
import {
  getMessages, // keep if you use typing indicator
  markAsRead,
  subscribeToMessages,
  subscribeToTyping, // keep if you use typing indicator
} from "@/src/shared/services/chatService";

export default function ChatDetailScreen() {
  const { t } = useTranslationLoader("chatId");
  const { chatId } = useLocalSearchParams();
  const theme = useTheme();
  const { palette } = theme.colors;
  const insets = useSafeAreaInsets();

  // Redux → build getToken the service expects
  const jwt = useSelector(selectJwt);
  const currentUserId = useSelector(selectUserId);
  const getToken = useCallback(async () => jwt || "", [jwt]);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const listRef = useRef(null);
  const [isPeerTyping, setIsPeerTyping] = useState(false);

  // Initial load
  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMessages(String(chatId), 30, null, getToken);
      const items = Array.isArray(res.items) ? res.items : [];
      setMessages(items);
      setNextCursor(res.nextCursor || null);
      setInitialLoaded(true);

      // Mark most recent as read
      const latest = items[items.length - 1];
      if (latest?._id) {
        markAsRead(String(chatId), latest._id, getToken).catch(() => {});
      }
    } finally {
      setLoading(false);
    }
  }, [chatId, getToken]);

  // Subscribe to live events
  useEffect(() => {
    if (!chatId) return;
    let unsubscribe = () => {};
    let unTyping = () => {};
    loadInitial();

    unsubscribe = subscribeToMessages(String(chatId), (evt) => {
      if (evt.type === "new" && evt.message) {
        setMessages((prev) => [...prev, evt.message]);

        // If message is from the other user, mark as read (you're viewing this chat)
        if (evt.message.senderId && evt.message.senderId !== currentUserId) {
          markAsRead(String(chatId), evt.message._id, getToken).catch(() => {});
        }
      } else if (evt.type === "edit" && evt.message) {
        setMessages((prev) => prev.map((m) => (m._id === evt.message._id ? evt.message : m)));
      } else if (evt.type === "delete" && evt.messageId) {
        setMessages((prev) => prev.filter((m) => m._id !== evt.messageId));
      }
    });

    // typing
    unTyping = subscribeToTyping(String(chatId), (evt) => {
      if (!evt) return;
      // show typing only if the event is from the *other* user
      if (evt.userId && evt.userId !== currentUserId) {
        setIsPeerTyping(!!evt.isTyping);
      }
    });

    return () => {
      unsubscribe && unsubscribe();
      unTyping && unTyping();
    };
  }, [chatId, loadInitial, currentUserId, getToken]);

  // Load older pages
  const loadOlder = useCallback(async () => {
    if (!nextCursor) return;
    const res = await getMessages(String(chatId), 30, nextCursor, getToken);
    const older = Array.isArray(res.items) ? res.items : [];
    if (older.length) {
      // Prepend older messages
      setMessages((prev) => [...older, ...prev]);
    }
    setNextCursor(res.nextCursor || null);
  }, [chatId, nextCursor, getToken]);

  const renderItem = useCallback(({ item }) => {
    // Backend shape: { _id, chatId, senderId, type, content:{...}, createdAt }
    if (item.type === "image") {
      return <ImageMessage item={item} />;
    }
    return <MessageBubble item={item} />;
  }, []);

  if (loading && !initialLoaded) {
    return <ActivityIndicator style={{ marginTop: 24 }} />;
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
      {/* Date Label (simple "Today" chip; optional) */}
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
        <ChatInput chatId={String(chatId)} />
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
