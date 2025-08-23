import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Filter from "../../../src/features/home/components/filter";

export default function FilterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const theme = useTheme();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Filter
          onClose={() => router.back()}
          onApply={(f) =>
            router.push({
              pathname: "/(tabs)/home",
              params: {
                ...params,
                ...f,
                distance: String(f.distance ?? ""),
              },
            })
          }
          // Pass all current filter values from home page to sync
          initialCategory={params.category}
          initialAge={params.age}
          initialSize={params.size}
          initialGender={params.gender}
          initialActivity={params.activity}
          initialDistance={params.distance ? Number(params.distance) : 150}
        />
      </SafeAreaView>
    </>
  );
}
