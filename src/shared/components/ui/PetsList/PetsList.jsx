import { FlatList, Text } from "react-native";
import { useTheme } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "../../../services/supabase/getters";
import { getDistanceKm } from "../../../../features/home/utils/getDistanceKm";
import PetCard from "../../../../features/home/components/pet_card";
import { useRouter } from "expo-router";

export default function PetsList({ fetchUrl, filters = {}, style }) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const router = useRouter();

  // fetcher for pets
  const fetchPets = async () => {
    const auth = await getAuthToken();

    const filteredParams = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== null && v !== "")
    );

    const res = await axios.get(fetchUrl, {
      headers: {
        Authorization: `Bearer ${auth}`,
        "Content-Type": "application/json",
      },
      params: filteredParams,
    });

    // Load user profile to calculate distances
    const profileJson = await AsyncStorage.getItem("user-profile");
    const profile = profileJson ? JSON.parse(profileJson) : null;
    const userCoords = profile?.location?.coordinates;

    let petsWithDistance = res.data;

    if (Array.isArray(petsWithDistance) && Array.isArray(userCoords)) {
      petsWithDistance = petsWithDistance.map((pet) => {
        const petCoords = pet.location?.coordinates;
        if (!Array.isArray(petCoords)) return pet;

        const distanceKm = getDistanceKm(userCoords, petCoords);
        const formattedDistance =
          distanceKm < 1
            ? `${Math.round(distanceKm * 1000)} m`
            : `${Math.round(distanceKm * 10) / 10} km`;

        return { ...pet, distanceKm, distanceText: formattedDistance };
      });
    }

    return petsWithDistance ?? [];
  };

  // ✅ useQuery instead of manual useEffect + useState
  const {
    data: pets = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["pets", filters], // unique key includes filters
    queryFn: fetchPets,
    keepPreviousData: true, // keeps old data during refetch
  });

  return (
    <FlatList
      data={pets}
      keyExtractor={(item, index) => String(item.id ?? item._id ?? index)}
      numColumns={2}
      columnWrapperStyle={{
        justifyContent: "space-between",
        marginBottom: 12,
      }}
      renderItem={({ item }) => (
        <PetCard
          pet={item}
          onPress={() => {
            queryClient.setQueryData(["pet", item._id], item); // ✅ update cache for detail page
            router.push(`/home/${item._id}`);
          }}
        />
      )}
      refreshing={isFetching}
      onRefresh={refetch}
      ListEmptyComponent={
        !isLoading && !error ? (
          <Text style={{ textAlign: "center", marginTop: 24 }}>
            No pets found
          </Text>
        ) : null
      }
      ListFooterComponent={
        isLoading ? (
          <Text style={{ textAlign: "center", marginVertical: 12 }}>
            Loading…
          </Text>
        ) : null
      }
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 110,
      }}
    />
  );
}
