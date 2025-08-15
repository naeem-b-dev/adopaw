// constants/menuOptions.js
import PawSVG from "../../assets/svg/PawSVG";

export const profileMenuOptions = [
  {
    id: "1",
    titleKey: "profile",
    iconName: "person-outline", // Ionicons icon name
    route: "/(tabs)/profile/user-profile",
  },
  {
    id: "2",
    titleKey: "pets",
    iconSvg: PawSVG, // SVG component
    onPress: () => console.log("Go to My Pets"),
    route: "/(tabs)/profile/user-pets",
  },
  {
    id: "3",
    titleKey: "notifications",
    iconName: "notifications-outline", // Ionicons icon name
    onPress: () => console.log("Go to Notifications"),
    route: "/(tabs)/profile/notifications",
  },
  {
    id: "4",
    titleKey: "appearance",
    iconName: "color-palette-outline", // Ionicons icon name
    onPress: () => console.log("Go to Appearance"),
    route: "/(tabs)/profile/appearance",
  },
  {
    id: "5",
    titleKey: "help",
    iconName: "help-circle-outline", // Ionicons icon name
    onPress: () => console.log("Help Center"),
    route: "/(tabs)/profile/help",
  },
];
