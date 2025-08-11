import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Filter from "../../../src/features/home/components/filter";

export default function FilterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  return (
    <>
      <Stack.Screen options={{ title: "Filters" }} />
      <SafeAreaView style={{ flex: 1 }}>
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
        />
      </SafeAreaView>
    </>
  );
}
