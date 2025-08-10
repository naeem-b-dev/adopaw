import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import { useLocalSearchParams, useRouter } from "expo-router";

import ChatInput from "@/src/features/chats/components/pawlo/ChatInput";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";



import maxImg from "@/assets/images/max.jpg";
import ImageMessage from "@/src/features/chats/components/chatIdComponents/ImageMessage.jsx";
import MessageBubble from "@/src/features/chats/components/chatIdComponents/MessageBubble.jsx";

const messages = [
  {
    id: "img-1",
    type: "image",
    image: maxImg,
    label: "Max",
    timestamp: "22:09",
  },
  {
    id: "user-msg-1",
    type: "incoming",
    text: "Hi, Please I’m interested in The dog Max.",
    timestamp: "22:09",
  },
  {
    id: "you-msg-1",
    type: "outgoing",
    text: "Hi, how is going, yes please tell me what do you want to know more about Max, feel free to ask whatever you want.",
    timestamp: "23:39",
  },
];

export default function ChatDetailScreen() {
  const { t } = useTranslationLoader("chatId");
  const { chatId } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const { palette } = theme.colors;
  const insets = useSafeAreaInsets();

  const renderItem = ({ item }) => {
    if (item.type === "image") {
      return (
        <ImageMessage
          imageSource={item.image}
          label={item.label}
          timestamp={item.timestamp}
        />
      );
    }

    if (item.type === "incoming" || item.type === "outgoing") {
      return (
        <MessageBubble
          type={item.type}
          text={item.text}
          timestamp={item.timestamp}
        />
      );
    }

    return null;
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background, paddingBottom: insets.bottom },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Date Label */}
      <Text
        style={[
          styles.todayLabel,
          {
            backgroundColor: palette.blue[400],
            color: palette.neutral[800],
          },
        ]}
      >
        {t("today")}
      </Text>

      {/* Messages List */}
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />
      <ChatInput />


    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    gap: 12,
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Alexandria_400Regular",
  },
});
