import { MaterialCommunityIcons as MDI } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";


const ORDER = ["home", "map", "chats", "profile"];
const FAB_SIZE = 52;           // size in the mock
const FAB_ICON = 45;           // plus size in the mock
const SPACER = FAB_SIZE + 16;  // gap in bar for FAB

function iconFor(name, focused) {
  switch (name) {
    case "home":    return focused ? "home" : "home-outline";
    case "map":     return focused ? "map-marker" : "map-marker-outline";
    case "chats":   return focused ? "chat-processing" : "chat-processing-outline"; // bubble with dots
    case "profile": return focused ? "account" : "account-outline";
    default:        return "circle-outline";
  }
}

export default function CustomTabBar({ state, descriptors, navigation }) {
  const theme = useTheme();
  const router = useRouter();

  // fixed order; ignore hidden routes like addPet
  const routes = ORDER.map(n => state.routes.find(r => r.name === n)).filter(Boolean);
  const left = routes.slice(0, 2);
  const right = routes.slice(2);
  const isFocused = (route) => state.index === state.routes.findIndex(r => r.key === route.key);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outlineVariant,
            shadowColor: theme.colors.shadow,
          },
        ]}
      >
        {/* left */}
        <View style={styles.side}>
          {left.map(route => {
            const focused = isFocused(route);
            const label = descriptors[route.key]?.options?.title ?? route.name;
            return (
              <TouchableOpacity key={route.key} style={styles.tab} activeOpacity={0.85}
                onPress={() => navigation.navigate(route.name)}>
                <MDI name={iconFor(route.name, focused)} size={30}
                     color={focused ? theme.colors.primary : theme.colors.onSurfaceDisabled}/>
                <Text style={[styles.label, { color: focused ? theme.colors.primary : theme.colors.onSurfaceDisabled }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* center spacer (under FAB) */}
        <View style={{ width: SPACER }} />

        {/* right */}
        <View style={styles.side}>
          {right.map(route => {
            const focused = isFocused(route);
            const label = descriptors[route.key]?.options?.title ?? route.name;
            return (
              <TouchableOpacity key={route.key} style={styles.tab} activeOpacity={0.85}
                onPress={() => navigation.navigate(route.name)}>
                <MDI name={iconFor(route.name, focused)} size={30}
                     color={focused ? theme.colors.primary : theme.colors.onSurfaceDisabled}/>
                <Text style={[styles.label, { color: focused ? theme.colors.primary : theme.colors.onSurfaceDisabled }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* perfectly centered FAB */}
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => router.push("/(tabs)/addPet")}
          style={[
            styles.fab,
            {
              backgroundColor: theme.colors.primary,
              top: -FAB_SIZE / 4,        // half above the bar
              left: "55%",
              transform: [{ translateX: -FAB_SIZE / 2 }],
              shadowColor: theme.colors.shadow,
            },
          ]}
        >
          <MDI name="plus" size= {FAB_ICON} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", left: 0, right: 0, bottom: 0 },
  bar: {
    marginHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 6,       // thinner like mock
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Platform.select({
      ios: { shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 6 },
    }),
  },
  side: { flexDirection: "row", alignItems: "center" },
  tab: { width: 64, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 11, marginTop: 3 },
  fab: {
    position: "absolute",
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: { shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 10 },
    }),
  },
});
