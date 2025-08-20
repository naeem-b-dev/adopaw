import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  I18nManager as RNI18nManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TextInput, Text, useTheme } from "react-native-paper";
import * as Location from "expo-location";

import { useTranslationLoader } from "../../../../localization/hooks/useTranslationLoader";

export default function MapPicker({ onPress, error, errorMessage }) {
  const [displayAddress, setDisplayAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const isRTL = RNI18nManager.isRTL;
  const { t } = useTranslationLoader("common");

  return (
    <View style={styles.inputWrapper}>
      <TouchableWithoutFeedback onPress={onPress}>
        <View>
          <Ionicons
            name="map-outline"
            size={20}
            color={colors.text}
            style={styles.iconStart}
          />

          <TextInput
            value={t("location.specific")}
            placeholder="Tap to get current location"
            editable={false}
            mode="outlined"
            pointerEvents="none"
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                textAlign: isRTL ? "right" : "left",
                paddingStart: 40,
                paddingEnd: 20,
              },
            ]}
            outlineColor={error ? colors.error : "rgba(169, 169, 169, 0.5)"}
            error={error}
          />
        </View>
      </TouchableWithoutFeedback>

      {error && (
        <Text style={{ color: colors.error, marginTop: 4, marginStart: 8 }}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    position: "relative",
    marginVertical: 6,
  },
  input: {
    borderRadius: 100,
  },
  iconStart: {
    position: "absolute",
    start: 20,
    top: 18,
    zIndex: 1,
  },
});
