import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect } from "@react-navigation/native";

import ImageMessage from "@/src/features/chats/components/chatIdComponents/ImageMessage.jsx";
import MessageBubble from "@/src/features/chats/components/chatIdComponents/MessageBubble.jsx";
import ChatInput from "@/src/features/chats/components/ChatInput";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

import {
  getMessages,
  markAsRead,
  subscribeToMessages,
  subscribeToTyping,
  sendReadSocket,
} from "@/src/shared/services/chatService";
import { getAuthToken } from "@/src/shared/services/supabase/getters";

// Lightweight hook to get keyboard height (Android) / ignored on iOS here
function useKeyboardHeightAndroid() {
  const [h, setH] = useState(0);
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const onShow = (e) => setH(e?.endCoordinates?.height ?? 0);
    const onHide = () => setH(0);
    const s1 = Keyboard.addListener("keyboardDidShow", onShow);
    const s2 = Keyboard.addListener("keyboardDidHide", onHide);
    return () => {
      s1.remove();
      s2.remove();
    };
  }, []);
  return Platform.OS === "android" ? h : 0;
}

export default function ChatDetailScreen() {
  const { t } = useTranslationLoader("chatId");
  const { chatId } = useLocalSearchParams();
  const theme = useTheme();
  const { palette } = theme.colors;
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const getToken = useCallback(async () => (await getAuthToken()) || "", []);

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
  const [isPeerTyping, setIsPeerTyping] = useState(false);

  const [inputHeight, setInputHeight] = useState(56); // will be measured
  const listRef = useRef(null);

  const kbHeight = useKeyboardHeightAndroid();

  const scrollToEnd = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd?.({ animated });
    });
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMessages(String(chatId), 30, null, getToken);
      const items = Array.isArray(res.items) ? res.items : [];
      setMessages(items);
      setNextCursor(res.nextCursor || null);

      const latest = items[items.length - 1];
      if (latest?._id) {
        sendReadSocket(String(chatId), latest._id);
        markAsRead(String(chatId), latest._id, getToken).catch(() => {});
      }

      setTimeout(() => scrollToEnd(false), 0);
    } finally {
      setLoading(false);
    }
  }, [chatId, getToken, scrollToEnd]);

  const refetchNow = useCallback(async () => {
    const res = await getMessages(String(chatId), 30, null, getToken);
    setMessages(res.items);
    setNextCursor(res.nextCursor || null);
    setTimeout(() => scrollToEnd(true), 0);
  }, [chatId, getToken, scrollToEnd]);

  // Keep pinned to bottom when keyboard changes size (helps iOS too)
  useEffect(() => {
    const s1 = Keyboard.addListener("keyboardDidShow", () => scrollToEnd(true));
    const s2 = Keyboard.addListener("keyboardDidChangeFrame", () =>
      scrollToEnd(true)
    );
    return () => {
      s1.remove();
      s2.remove();
    };
  }, [scrollToEnd]);

  useEffect(() => {
    if (!chatId) return;
    let unsubscribe = () => {};
    let unTyping = () => {};

    loadInitial();

    unsubscribe = subscribeToMessages(String(chatId), (evt) => {
      if (evt.type === "new" && evt.message) {
        setMessages((prev) => [...prev, evt.message]);
        scrollToEnd(true);
        if (
          evt.message.senderId &&
          String(evt.message.senderId) !== String(currentUserId)
        ) {
          sendReadSocket(String(chatId), evt.message._id);
          markAsRead(String(chatId), evt.message._id, getToken).catch(() => {});
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
  }, [chatId, loadInitial, currentUserId, getToken, scrollToEnd]);

  useFocusEffect(
    useCallback(() => {
      if (!messages.length) return;
      const latest = messages[messages.length - 1];
      if (latest?._id) {
        sendReadSocket(String(chatId), latest._id);
        markAsRead(String(chatId), latest._id, getToken).catch(() => {});
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
    ({ item }) =>
      item.type === "image" ? (
        <ImageMessage item={item} currentUserId={currentUserId} />
      ) : (
        <MessageBubble item={item} currentUserId={currentUserId} />
      ),
    [currentUserId]
  );

  useEffect(() => {
    scrollToEnd(true);
  }, [messages.length, scrollToEnd]);

  if (loading && !messages.length) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator style={{ marginTop: 24 }} />
      </View>
    );
  }

  // extra space below list = input + safe-area + typing + small pad + (Android keyboard height)
  const typingLine = isPeerTyping ? 18 : 0;
  const bottomGap = inputHeight + insets.bottom + typingLine + 8 + kbHeight;

  // iOS uses KeyboardAvoidingView; Android uses plain View (we lift via kbHeight)
  const IOSContainer = KeyboardAvoidingView;
  const ANDContainer = View;
  const Container = Platform.OS === "ios" ? IOSContainer : ANDContainer;

  return (
    <Container
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      {...(Platform.OS === "ios"
        ? { behavior: "padding", keyboardVerticalOffset: headerHeight }
        : {})}
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
        contentContainerStyle={[
          styles.messagesList,
          { paddingBottom: bottomGap },
        ]}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.05}
        onEndReached={loadOlder}
        initialNumToRender={20}
        windowSize={10}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={false}
        onContentSizeChange={() => scrollToEnd(true)}
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

      {/* Input: measured height + Android marginBottom = keyboard height */}
      <View
        onLayout={(e) => setInputHeight(e.nativeEvent.layout.height)}
        style={Platform.OS === "android" ? { marginBottom: kbHeight, paddingBottom: 16 } : null}
      >
        <ChatInput chatId={String(chatId)} onSend={refetchNow} />
      </View>
    </Container>
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
