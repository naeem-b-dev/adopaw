import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { FlatList, Text } from "react-native";
import { useTheme } from "react-native-paper";
import { fetchPets } from "../../../../features/home/api/pets";
import PetCard from "../../../../features/home/components/pet_card";
import { useTranslationLoader } from "../../../../localization/hooks/useTranslationLoader";

export default function PetsList({ fetchUrl, filters = {}, style }) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useTranslationLoader("home");

  // Create a stable key for the query that changes when filters change
  const queryKey = ["pets", "infinite", JSON.stringify(filters)];

  // Infinite query for pagination
  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      return await fetchPets(filters, pageParam, 10);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNextPage) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    keepPreviousData: false, // Don't keep previous data when filters change
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Flatten all pages into a single array
  const allPets = data?.pages?.flatMap(page => page.items) || [];

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const renderPetCard = ({ item }) => (
    <PetCard
      pet={item}
      onPress={() => {
        queryClient.setQueryData(["pet", item._id], item);
        router.push(`/home/${item._id}`);
      }}
    />
  );

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <Text style={{ 
          textAlign: "center", 
          marginVertical: 12,
          color: theme.colors.onSurface 
        }}>
          {t("loadingMorePets")}
        </Text>
      );
    }
    return null;
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <Text style={{ 
          textAlign: "center", 
          marginTop: 24,
          color: theme.colors.onSurface 
        }}>
          {t("loadingPets")}
        </Text>
      );
    }
    
    if (error) {
      return (
        <Text style={{ 
          textAlign: "center", 
          marginTop: 24,
          color: theme.colors.error 
        }}>
          {t("errorLoadingPets")}
        </Text>
      );
    }

    // Show different message for search results
    const searchMessage = filters.search 
      ? t("noPetsFoundForSearch", "No pets found matching your search")
      : t("noPetsFound");

    return (
      <Text style={{ 
        textAlign: "center", 
        marginTop: 24,
        color: theme.colors.onSurface 
      }}>
        {searchMessage}
      </Text>
    );
  };

  return (
    <FlatList
      data={allPets}
      keyExtractor={(item, index) => String(item._id ?? item.id ?? index)}
      numColumns={2}
      columnWrapperStyle={{
        justifyContent: "space-between",
        marginBottom: 12,
      }}
      renderItem={renderPetCard}
      refreshing={isFetching && !isFetchingNextPage}
      onRefresh={handleRefresh}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.1}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 110,
        flexGrow: 1,
      }}
      style={style}
    />
  );
}
