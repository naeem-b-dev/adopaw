import aiPawlo from "@/assets/images/ai-pawlo.png";
import Emmy from "@/assets/images/Emmy.png";
import Hisham from "@/assets/images/hisham.png";
import Iman from "@/assets/images/iman.png";
import ChatList from "@/src/features/chats/components/ChatListComponent/ChatList";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import Heading from "@/src/shared/components/ui/Heading/Heading";
import { StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";

export default function ChatsScreen() {
  const { t } = useTranslationLoader("chatlist");
  const theme = useTheme(); 

  const chatData = [
    {
      id: "pawlo",
      name: "Pawlo",
      avatar: aiPawlo,
      message: "Here to help with all your pet needs!",
      timestamp: "",
      unreadCount: 0,
    },
    {
      id: "1",
      name: "Iman Omar",
      avatar: Iman,
      message: "Hi. Please I’m interested in The dog Max.",
      timestamp: "22:09",
      unreadCount: 1,
    },
    {
      id: "2",
      name: "Hisham Zein",
      avatar: Hisham,
      message: "Maybe a cat with my dog will be a good...",
      timestamp: "Yesterday",
      unreadCount: 1,
    },
    {
      id: "3",
      name: "Emmy Kaliku",
      avatar: Emmy,
      message: "Thank you. I received Caramel.",
      timestamp: "Jul, 28",
      unreadCount: 0,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headingWrapper}>
        <Heading title={t("chatsListTitle")} />
      </View>
      <ChatList chats={chatData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headingWrapper: {
    paddingHorizontal: 20,
    paddingTop: 78,
  },
});
