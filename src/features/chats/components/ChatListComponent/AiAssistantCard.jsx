import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

import aiPawlo from "@/assets/images/ai-pawlo.png";

export default function AiAssistantCard() {
  const router = useRouter();
  const theme = useTheme();
  const { palette, surface, text } = theme.colors;
  const { t } = useTranslationLoader("chatlist"); 

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: surface }]}
      onPress={() => router.push("/chats/pawlo")}
    >
      <View style={[styles.avatarContainer, { borderColor: palette.blue[400] }]}>
        <Image source={aiPawlo} style={styles.avatar} />
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.name, { color: text }]}>
          {t("pawloName")}{" "}
          <Text style={[styles.assistant, { color: palette.blue[500] }]}>
            • {t("pawloRole")}
          </Text>
        </Text>
        <Text style={[styles.subtitle, { color: palette.neutral[600] }]}>
          {t("pawloSubtitle")}
        </Text>
      </View>

      <Text style={[styles.arrow, { color: palette.neutral[600] }]}>›</Text>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 10,
    marginHorizontal: 12,
    elevation: 2,
  },
  avatarContainer: {
    borderWidth: 2,
    borderRadius: 32,
    padding: 2,
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontFamily: "Alexandria_700Bold",
    fontSize: 15,
  },
  assistant: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 13,
  },
  subtitle: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 12,
    marginTop: 1,
  },
  arrow: {
    fontSize: 20,
    marginLeft: 10,
  },
});
