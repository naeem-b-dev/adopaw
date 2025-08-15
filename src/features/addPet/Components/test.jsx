import React from "react";
import { View, Image, StyleSheet } from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import { useTheme, Text, Icon } from "react-native-paper";
export default function TestSelect({ value, onChange }) {
  const { colors } = useTheme();
  const emojisWithIcons = [
    { title: "happy", icon: "emoticon-happy-outline" },
    { title: "cool", icon: "emoticon-cool-outline" },
    { title: "lol", icon: "emoticon-lol-outline" },
    { title: "sad", icon: "emoticon-sad-outline" },
    { title: "cry", icon: "emoticon-cry-outline" },
    { title: "angry", icon: "emoticon-angry-outline" },
    { title: "confused", icon: "emoticon-confused-outline" },
    { title: "excited", icon: "emoticon-excited-outline" },
    { title: "kiss", icon: "emoticon-kiss-outline" },
    { title: "devil", icon: "emoticon-devil-outline" },
    { title: "dead", icon: "emoticon-dead-outline" },
    { title: "wink", icon: "emoticon-wink-outline" },
    { title: "sick", icon: "emoticon-sick-outline" },
    { title: "frown", icon: "emoticon-frown-outline" },
  ];
  return (
    <SelectDropdown
      data={emojisWithIcons}
      onSelect={(selectedItem, index) => {
        console.log(selectedItem, index);
      }}
      renderButton={(selectedItem, isOpened) => {
        return (
          <View style={styles.dropdownButtonStyle}>
            {selectedItem && (
              <Icon
                name={selectedItem.icon}
                style={styles.dropdownButtonIconStyle}
              />
            )}
            <Text style={styles.dropdownButtonTxtStyle}>
              {(selectedItem && selectedItem.title) || "Select your mood"}
            </Text>
            <Icon
              name={isOpened ? "chevron-up" : "chevron-down"}
              style={styles.dropdownButtonArrowStyle}
            />
          </View>
        );
      }}
      renderItem={(item, index, isSelected) => {
        return (
          <View
            style={{
              ...styles.dropdownItemStyle,
              ...(isSelected && { backgroundColor: "#D2D9DF" }),
            }}
          >
            <Icon name={item.icon} style={styles.dropdownItemIconStyle} />
            <Text style={styles.dropdownItemTxtStyle}>{item.title}</Text>
          </View>
        );
      }}
      showsVerticalScrollIndicator={false}
      dropdownStyle={styles.dropdownMenuStyle}
    />
  );
}

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  icon: { width: 24, height: 24, marginRight: 8 },
});
