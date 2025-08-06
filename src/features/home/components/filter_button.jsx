import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Modal from "react-native-modal";
import { IconButton, useTheme } from "react-native-paper";
import Filter from "./filter";

export default function FilterButton({ style }) {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();


  return (
    <View style={style}>
      <IconButton
        icon="filter-variant"
        size={28}
        onPress={() => setVisible(true)}
        style={styles.icon}
      />

      <Modal
        isVisible={visible}
        onBackdropPress={() => setVisible(false)}
        backdropOpacity={0.4}
        animationIn="zoomIn"
        animationOut="zoomOut"
        useNativeDriver
        hideModalContentWhileAnimating
      >
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Filter onClose={() => setVisible(false)} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    margin: 0,
  },
  bottomModal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  dragHandle: {
    width: 50,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginBottom: 10,
  },
});
