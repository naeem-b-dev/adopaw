import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { getAuthToken } from "../../../shared/services/supabase/getters";
import { getDistanceKm } from "../utils/getDistanceKm";

// Temporary frontend search function
const searchPetsFrontend = (pets, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === "") return pets;
  
  const term = searchTerm.toLowerCase().trim();
  
  return pets.filter(pet => {
    // Search in name
    if (pet.name && pet.name.toLowerCase().includes(term)) return true;
    
    // Search in breed
    if (pet.breed && pet.breed.toLowerCase().includes(term)) return true;
    
    // Search in species
    if (pet.species && pet.species.toLowerCase().includes(term)) return true;
    
    // Search in description (if available)
    if (pet.description && pet.description.toLowerCase().includes(term)) return true;
    
    return false;
  });
};

// Function to fetch all pets for frontend search (when backend doesn't support search)
const fetchAllPetsForSearch = async (auth, signal) => {
  try {
    // Fetch a larger number of pets for frontend search
    const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_API_URL}/pet/by/`, {
      headers: {
        Authorization: `Bearer ${auth}`,
        "Content-Type": "application/json",
      },
      params: {
        page: 1,
        limit: 100, // Fetch more pets for better search results
      },
      signal,
    });

    return response.data.docs || [];
  } catch (error) {
    console.error("❌ Error fetching all pets for search:", error);
    return [];
  }
};

// Real backend API service
export async function fetchPets(filters = {}, page = 1, limit = 10, signal) {
  try {
    const auth = await getAuthToken();
    
    // If we have a search term, try to fetch more data for better search results
    if (filters.search && filters.search.trim() !== "") {
      console.log("🔍 Search detected - fetching more data for comprehensive search");
      
      // Fetch all pets for frontend search
      const allPets = await fetchAllPetsForSearch(auth, signal);
      
      // Load user profile to calculate distances
      const profileJson = await AsyncStorage.getItem("user-profile");
      const profile = profileJson ? JSON.parse(profileJson) : null;
      const userCoords = profile?.location?.coordinates;

      let petsWithDistance = allPets;

      // Calculate distances for each pet
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

      // Apply frontend search
      const originalCount = petsWithDistance.length;
      petsWithDistance = searchPetsFrontend(petsWithDistance, filters.search);
      console.log("🔍 Frontend search applied:", {
        originalCount,
        filteredCount: petsWithDistance.length,
        searchTerm: filters.search
      });

      // Apply category filter if selected
      if (filters.category && filters.category !== null && filters.category !== "") {
        const beforeCategoryFilter = petsWithDistance.length;
        petsWithDistance = petsWithDistance.filter(pet => 
          pet.species?.toLowerCase() === filters.category.toLowerCase()
        );
        console.log("🐾 Category filter applied:", {
          beforeFilter: beforeCategoryFilter,
          afterFilter: petsWithDistance.length,
          category: filters.category
        });
      }

      // Apply pagination for frontend results
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPets = petsWithDistance.slice(startIndex, endIndex);

      return {
        items: paginatedPets,
        total: petsWithDistance.length,
        totalPages: Math.ceil(petsWithDistance.length / limit),
        currentPage: page,
        hasNextPage: endIndex < petsWithDistance.length,
        hasPrevPage: page > 1,
      };
    }

    // Regular API call for non-search requests
    const params = {
      page,
      limit,
    };

    // SEARCH IS THE PRIMARY FILTER - it should search across ALL categories
    // Only add category filter if it's explicitly selected (not selecting any means all categories)
    if (filters.search && filters.search !== null && filters.search !== "") {
      params.search = filters.search.trim();
      console.log("🔍 Search query being sent (PRIMARY FILTER):", filters.search.trim());
    }
    
    // CATEGORY IS THE SECONDARY FILTER - only apply if explicitly selected
    if (filters.category && filters.category !== null && filters.category !== "") {
      params.species = filters.category;
      console.log("🐾 Category filter applied (SECONDARY):", filters.category);
    }
    
    // Other filters
    if (filters.status && filters.status !== null && filters.status !== "") {
      params.status = filters.status;
    }
    
    if (filters.city && filters.city !== null && filters.city !== "") {
      params.city = filters.city;
    }
    
    if (filters.gender && filters.gender !== null && filters.gender !== "") {
      params.gender = filters.gender;
    }
    
    if (filters.size && filters.size !== null && filters.size !== "") {
      params.size = filters.size;
    }
    
    if (filters.activity && filters.activity !== null && filters.activity !== "") {
      params.activity = filters.activity;
    }
    
    if (filters.age && filters.age !== null && filters.age !== "") {
      params.age = filters.age;
    }
    
    if (filters.distance && filters.distance !== null && filters.distance !== "") {
      params.distance = filters.distance;
    }

    console.log("📡 Fetching pets with params:", params);
    console.log("🔗 Full URL:", `${process.env.EXPO_PUBLIC_BACKEND_API_URL}/pet/by/`);

    const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_API_URL}/pet/by/`, {
      headers: {
        Authorization: `Bearer ${auth}`,
        "Content-Type": "application/json",
      },
      params,
      signal,
    });

    console.log("📦 Response received:", {
      totalDocs: response.data.totalDocs,
      currentPage: response.data.page,
      itemsCount: response.data.docs?.length || 0,
      hasNextPage: response.data.hasNextPage
    });

    // Load user profile to calculate distances
    const profileJson = await AsyncStorage.getItem("user-profile");
    const profile = profileJson ? JSON.parse(profileJson) : null;
    const userCoords = profile?.location?.coordinates;

    let petsWithDistance = response.data.docs || [];

    // Calculate distances for each pet
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

    // Return paginated data structure
    return {
      items: petsWithDistance,
      total: response.data.totalDocs || 0,
      totalPages: response.data.totalPages || 1,
      currentPage: response.data.page || 1,
      hasNextPage: response.data.hasNextPage || false,
      hasPrevPage: response.data.hasPrevPage || false,
    };
  } catch (error) {
    console.error("❌ Error fetching pets:", error);
    console.error("❌ Error details:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
}

// Helper function to check if we should load more data
export function shouldLoadMore(currentPage, totalPages, hasNextPage) {
  return currentPage < totalPages && hasNextPage;
}
