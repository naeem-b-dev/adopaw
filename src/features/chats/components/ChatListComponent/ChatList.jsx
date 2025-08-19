// src/features/chats/components/ChatListComponent/ChatList.jsx
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import { useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { List, Text } from "react-native-paper";

import AiAssistantCard from "./AiAssistantCard";
import ChatCard from "./ChatCardTemp";

// Optional avatar image for Pawlo (remove if your AiAssistantCard has a default)
import pawloImage from "@/assets/images/itspawlo.png";

export default function ChatList({
  chats = [],
  onPressChat,
  emptyTitle,
  emptySubtitle,
  photoLabel,
}) {
  const router = useRouter();
  const { t } = useTranslationLoader("chatlist");

  useEffect(() => {
    // console.log("✅ ChatList mounted");
  }, []);

  const toPreview = useCallback(
    (chat) => {
      const last = chat?.lastMessage;
      if (!last) return "";
      if (last.type === "text") return last?.content?.text ?? "";
      if (last.type === "image") return photoLabel || t("photoLabel");
      return "";
    },
    [photoLabel, t]
  );

  const toTimestamp = useCallback((chat) => {
    const iso = chat?.lastMessage?.createdAt || chat?.updatedAt;
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return "";
    }
  }, []);

  const goToChat = useCallback(
    (chatId, name) => {
      if (onPressChat) {
        onPressChat(chatId);
        return;
      }
      router.push({ pathname: "/chats/[chatId]", params: { chatId, title: name } });
    },
    [onPressChat, router]
  );

  const renderChatItem = ({ item }) => {
    const chatId = item?._id || item?.id;
    const name = item?.name || t("chatWith", { count: 1 });
    const message = item?.message ?? toPreview(item);
    const timestamp = item?.timestamp ?? toTimestamp(item);
    const unreadCount = item?.unreadCount ?? 0;

    return (
      <ChatCard
        key={chatId}
        avatar={item?.avatar}
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
      data={chats}
      keyExtractor={(item) => String(item?._id || item?.id)}
      renderItem={renderChatItem}
      // Always show Pawlo at the top
      ListHeaderComponent={
        <View style={styles.headerWrap}>
          <AiAssistantCard
            avatar={pawloImage}
            name={t("pawloName")}
            message={t("pawloSubtitle")}
            onPress={() => router.push("/chats/pawlo")}
          />
        </View>
      }
      // Empty state still shows (under the Pawlo card)
      ListEmptyComponent={
        <View style={styles.emptyWrap}>
          <List.Icon icon="chat-outline" />
          <Text variant="titleMedium">{emptyTitle || t("emptyTitle")}</Text>
          <Text variant="bodyMedium" style={styles.emptySub}>
            {emptySubtitle || t("emptySubtitle")}
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
  listContent: {
    paddingBottom: 80,
    paddingTop: 8,
  },
  headerWrap: {
    marginBottom: 4,
  },
  emptyWrap: {
    paddingTop: 24,
    paddingHorizontal: 20,
    gap: 6,
  },
  emptySub: {
    opacity: 0.7,
  },
});
