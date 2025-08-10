import { useTranslationLoader } from '@/src/localization/hooks/useTranslationLoader';
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";


import AiAssistantCard from "./AiAssistantCard";
import ChatCard from "./ChatCardTemp";

export default function ChatList({ chats }) {
  const router = useRouter();
  const { t } = useTranslationLoader("chatlist");

  useEffect(() => {
    console.log("✅ ChatList mounted");
  }, []);


  const goToChat = (id, name) => {
    router.push({
      pathname: "/chats/[chatId]",
      params: { chatId: id, title: name },
    });
  };

  const pawlo = chats.find((c) => c.id === "pawlo");
  const others = chats.filter((c) => c.id !== "pawlo");

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.wrapper}>
        {/* AI Assistant Card */}
        {pawlo && (
          <AiAssistantCard
            avatar={pawlo.avatar}
            name={t("pawloName")}
            message={t("pawloSubtitle")}
            onPress={() => goToChat(pawlo.id)}
          />
        )}

        {/* Other user chats */}
        {others.map((chat) => (
          <ChatCard
            key={chat.id}
            avatar={chat.avatar}
            name={chat.name}
            message={chat.message}
            timestamp={chat.timestamp}
            unreadCount={chat.unreadCount}
            onPress={() => goToChat(chat.id, chat.name)} 
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 80,
  },
  wrapper: {
    paddingTop: 8,
  },
});
