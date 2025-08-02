import { useFonts } from "expo-font";
import {
  Alexandria_300Light,
  Alexandria_400Regular,
  Alexandria_500Medium,
  Alexandria_600SemiBold,
  Alexandria_700Bold,
} from "@expo-google-fonts/alexandria";

export const useLoadFonts = () => {
  const [loaded] = useFonts({
    Alexandria_300Light,
    Alexandria_400Regular,
    Alexandria_500Medium,
    Alexandria_600SemiBold,
    Alexandria_700Bold,
  });

  return loaded;
};
