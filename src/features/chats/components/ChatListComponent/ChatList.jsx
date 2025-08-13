import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { List, Text } from "react-native-paper";

import AiAssistantCard from "./AiAssistantCard";
import ChatCard from "./ChatCardTemp";

export default function ChatList({ chats = [], onPressChat, emptyTitle, emptySubtitle, photoLabel }) {
  const router = useRouter();
  const { t } = useTranslationLoader("chatlist");

  useEffect(() => {
    // console.log("✅ ChatList mounted");
  }, []);

  const pawloItem = useMemo(() => chats.find((c) => c?.id === "pawlo" || c?._id === "pawlo"), [chats]);

  const otherChats = useMemo(
    () => chats.filter((c) => !(c?.id === "pawlo" || c?._id === "pawlo")),
    [chats]
  );

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
      // Simple readable time; you can swap to relative later
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
    const name = item?.name || t("chatWith", { count: 1 }); // replace with real name when available
    const message = item?.message ?? toPreview(item);
    const timestamp = item?.timestamp ?? toTimestamp(item);
    const unreadCount = item?.unreadCount ?? 0;

    return (
      <ChatCard
        key={chatId}
        avatar={item?.avatar} // your card can decide placeholder if undefined
        name={name}
        message={message}
        timestamp={timestamp}
        unreadCount={unreadCount}
        onPress={() => goToChat(chatId, name)}
      />
    );
  };

  const isEmpty = (!otherChats || otherChats.length === 0) && !pawloItem;

  if (isEmpty) {
    return (
      <View style={styles.emptyWrap}>
        <List.Icon icon="chat-outline" />
        <Text variant="titleMedium">{emptyTitle || t("emptyTitle")}</Text>
        <Text variant="bodyMedium" style={styles.emptySub}>
          {emptySubtitle || t("emptySubtitle")}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.listContent}
      data={otherChats}
      keyExtractor={(item) => String(item?._id || item?.id)}
      renderItem={renderChatItem}
      ListHeaderComponent={
        pawloItem ? (
          <View style={styles.headerWrap}>
            <AiAssistantCard
              avatar={pawloItem.avatar}
              name={t("pawloName")}
              message={t("pawloSubtitle")}
              onPress={() => goToChat(pawloItem._id || pawloItem.id, t("pawloName"))}
            />
          </View>
        ) : null
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
