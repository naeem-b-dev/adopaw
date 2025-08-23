// src/features/chats/components/ChatListComponent/ChatList.jsx
import { useRouter } from "expo-router";
import { useMemo, useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { List, Text, useTheme } from "react-native-paper";
import AiAssistantCard from "./AiAssistantCard";
import ChatCard from "./ChatCardTemp";
import pawloImage from "@/assets/images/itspawlo.png";

export default function ChatList({ chats = [], onPressChat, emptyTitle, emptySubtitle, photoLabel }) {
  const theme = useTheme();
  const router = useRouter();

  // ✅ Dedupe & sort
  const data = useMemo(() => {
    const map = new Map();
    for (const c of chats) {
      const id = String(c?._id || c?.chatId || "");
      if (!id) continue;
      map.set(id, c);
    }
    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(b?.lastMessageAt || b?.updatedAt || 0) -
        new Date(a?.lastMessageAt || a?.updatedAt || 0)
    );
  }, [chats]);

  const toPreview = useCallback(
    (chat) => {
      const last = chat?.lastMessage;
      if (!last) return "";
      if (last.type === "text") return last?.content?.text ?? "";
      if (last.type === "image") return photoLabel || "Photo";
      return "";
    },
    [photoLabel]
  );

  const toTimestamp = useCallback((chat) => {
    const iso = chat?.lastMessage?.createdAt || chat?.lastMessageAt || chat?.updatedAt;
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString();
  }, []);

  const goToChat = useCallback(
    (chatId, name) => {
      if (onPressChat) return onPressChat(chatId);
      router.push({ pathname: "/chats/[chatId]", params: { chatId, title: name } });
    },
    [onPressChat, router]
  );

  const renderChatItem = ({ item }) => {
    const chatId = String(item?._id || item?.chatId);
    // ✅ pull from server-provided peer object
    const name = item?.peer?.name || item?.peer?.email || "User";
    const avatar = item?.peer?.avatarUrl || undefined;
    const message = toPreview(item);
    const timestamp = toTimestamp(item);
    const unreadCount = item?.unreadCount ?? 0;

    return (
      <ChatCard
        key={chatId}
        avatar={avatar}
        name={name}
        message={message}
        timestamp={timestamp}
        unreadCount={unreadCount}
        onPress={() => goToChat(chatId, name)}
      />
    );
  };

  return (
    <FlatList
      contentContainerStyle={styles.listContent}
      data={data}
      keyExtractor={(item) => String(item?._id || item?.chatId)}
      renderItem={renderChatItem}
      ListHeaderComponent={
        <View style={styles.headerWrap}>
          <AiAssistantCard
            avatar={pawloImage}
            name="Pawlo"
            message="Ask me anything about adoption"
            onPress={() => router.push("/chats/pawlo")}
          />
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyWrap}>
          <List.Icon icon="chat-outline" color={theme.colors.onSurfaceVariant} />
          <Text variant="titleMedium">{emptyTitle || "No messages yet"}</Text>
          <Text variant="bodyMedium" style={styles.emptySub}>
            {emptySubtitle || "Start a conversation from a pet page"}
          </Text>
        </View>
      }
      initialNumToRender={12}
      windowSize={10}
      removeClippedSubviews
    />
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: 80, paddingTop: 8 },
  headerWrap: { marginBottom: 4 },
  emptyWrap: { paddingTop: 24, paddingHorizontal: 20, gap: 6 },
  emptySub: { opacity: 0.7 },
});
