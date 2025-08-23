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

// Temporary frontend age filter function
const filterPetsByAge = (pets, ageFilter) => {
  if (!ageFilter || ageFilter.trim() === "") return pets;
  
  return pets.filter(pet => {
    if (!pet.age || !pet.age.value || !pet.age.unit) return false;
    
    const ageValue = pet.age.value;
    const ageUnit = pet.age.unit.toLowerCase();
    
    // Convert to years for comparison
    let ageInYears = ageValue;
    if (ageUnit.includes('month')) {
      ageInYears = ageValue / 12;
    }
    
    // Apply age filter based on the selected age group
    switch (ageFilter) {
      case 'baby':
        return ageInYears >= 0 && ageInYears <= 1;
      case 'young':
        return ageInYears > 1 && ageInYears <= 3;
      case 'adult':
        return ageInYears > 3 && ageInYears <= 7;
      case 'senior':
        return ageInYears > 7;
      default:
        return true;
    }
  });
};

// Temporary frontend gender filter function
const filterPetsByGender = (pets, genderFilter) => {
  if (!genderFilter || genderFilter.trim() === "") return pets;
  
  return pets.filter(pet => {
    if (!pet.gender) return false;
    
    const petGender = pet.gender.toLowerCase();
    const filterGender = genderFilter.toLowerCase();
    
    // Handle different gender formats
    switch (filterGender) {
      case 'male':
        return petGender === 'male' || petGender === 'm';
      case 'female':
        return petGender === 'female' || petGender === 'f';
      default:
        return true;
    }
  });
};

// Temporary frontend size filter function
const filterPetsBySize = (pets, sizeFilter) => {
  if (!sizeFilter || sizeFilter.trim() === "") return pets;
  
  return pets.filter(pet => {
    if (!pet.size) return false;
    
    const petSize = pet.size.toLowerCase();
    const filterSize = sizeFilter.toLowerCase();
    
    // Handle different size formats
    switch (filterSize) {
      case 'small':
        return petSize === 'small' || petSize === 's';
      case 'medium':
        return petSize === 'medium' || petSize === 'm';
      case 'large':
        return petSize === 'large' || petSize === 'l';
      default:
        return true;
    }
  });
};

// Temporary frontend activity filter function
const filterPetsByActivity = (pets, activityFilter) => {
  if (!activityFilter || activityFilter.trim() === "") return pets;
  
  return pets.filter(pet => {
    if (!pet.activity) return false;
    
    const petActivity = pet.activity.toLowerCase();
    const filterActivity = activityFilter.toLowerCase();
    
    // Handle different activity formats
    switch (filterActivity) {
      case 'low':
        return petActivity === 'low' || petActivity === 'l';
      case 'medium':
        return petActivity === 'medium' || petActivity === 'm';
      case 'high':
        return petActivity === 'high' || petActivity === 'h';
      default:
  return true;
    }
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

      // Apply age filter if selected (frontend fallback)
      if (filters.age && filters.age !== null && filters.age !== "") {
        const beforeAgeFilter = petsWithDistance.length;
        petsWithDistance = filterPetsByAge(petsWithDistance, filters.age);
        console.log("📅 Frontend age filter applied:", {
          beforeFilter: beforeAgeFilter,
          afterFilter: petsWithDistance.length,
          ageFilter: filters.age
        });
      }

      // Apply gender filter if selected (frontend fallback)
      if (filters.gender && filters.gender !== null && filters.gender !== "") {
        const beforeGenderFilter = petsWithDistance.length;
        petsWithDistance = filterPetsByGender(petsWithDistance, filters.gender);
        console.log("👤 Frontend gender filter applied:", {
          beforeFilter: beforeGenderFilter,
          afterFilter: petsWithDistance.length,
          genderFilter: filters.gender
        });
      }

      // Apply size filter if selected (frontend fallback)
      if (filters.size && filters.size !== null && filters.size !== "") {
        const beforeSizeFilter = petsWithDistance.length;
        petsWithDistance = filterPetsBySize(petsWithDistance, filters.size);
        console.log("📏 Frontend size filter applied:", {
          beforeFilter: beforeSizeFilter,
          afterFilter: petsWithDistance.length,
          sizeFilter: filters.size
        });
      }

      // Apply activity filter if selected (frontend fallback)
      if (filters.activity && filters.activity !== null && filters.activity !== "") {
        const beforeActivityFilter = petsWithDistance.length;
        petsWithDistance = filterPetsByActivity(petsWithDistance, filters.activity);
        console.log("🏃 Frontend activity filter applied:", {
          beforeFilter: beforeActivityFilter,
          afterFilter: petsWithDistance.length,
          activityFilter: filters.activity
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
    if (filters.search && filters.search !== null && filters.search !== "") {
      params.search = filters.search.trim();
      console.log("🔍 Search query being sent (PRIMARY FILTER):", filters.search.trim());
    }
    
    // CATEGORY IS THE SECONDARY FILTER - only apply if explicitly selected
    if (filters.category && filters.category !== null && filters.category !== "") {
      params.species = filters.category;
      console.log("🐾 Category filter applied (SECONDARY):", filters.category);
    }
    
    // ALL OTHER FILTERS
    if (filters.age && filters.age !== null && filters.age !== "") {
      // Try both 'age' and 'ageGroup' parameters for backend compatibility
      params.age = filters.age;
      params.ageGroup = filters.age; // Some backends use ageGroup instead of age
      console.log("📅 Age filter applied:", filters.age);
      console.log("📅 Age filter details:", {
        value: filters.age,
        params: { age: filters.age, ageGroup: filters.age }
      });
    } else {
      console.log("📅 No age filter applied - filters.age:", filters.age);
    }
    
    if (filters.size && filters.size !== null && filters.size !== "") {
      params.size = filters.size;
      console.log("📏 Size filter applied:", filters.size);
      console.log("📏 Size filter details:", {
        value: filters.size,
        params: { size: filters.size }
      });
    } else {
      console.log("📏 No size filter applied - filters.size:", filters.size);
    }
    
    if (filters.gender && filters.gender !== null && filters.gender !== "") {
      params.gender = filters.gender;
      console.log("👤 Gender filter applied:", filters.gender);
      console.log("👤 Gender filter details:", {
        value: filters.gender,
        params: { gender: filters.gender }
      });
    } else {
      console.log("👤 No gender filter applied - filters.gender:", filters.gender);
    }
    
    if (filters.activity && filters.activity !== null && filters.activity !== "") {
      params.activity = filters.activity;
      console.log("🏃 Activity filter applied:", filters.activity);
      console.log("🏃 Activity filter details:", {
        value: filters.activity,
        params: { activity: filters.activity }
      });
    } else {
      console.log("🏃 No activity filter applied - filters.activity:", filters.activity);
    }
    
    if (filters.distance && filters.distance !== null && filters.distance !== "") {
      params.distance = filters.distance;
      console.log("📍 Distance filter applied:", filters.distance);
    }
    
    if (filters.status && filters.status !== null && filters.status !== "") {
      params.status = filters.status;
      console.log("📊 Status filter applied:", filters.status);
    }
    
    if (filters.city && filters.city !== null && filters.city !== "") {
      params.city = filters.city;
      console.log("🏙️ City filter applied:", filters.city);
    }

    console.log("📡 Fetching pets with params:", params);
    console.log("🔗 Full URL:", `${process.env.EXPO_PUBLIC_BACKEND_API_URL}/pet/by/`);
    console.log("🔍 All filters being sent:", {
      search: filters.search,
      category: filters.category,
      age: filters.age,
      size: filters.size,
      gender: filters.gender,
      activity: filters.activity,
      distance: filters.distance
    });

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

    // Apply frontend age filter if backend doesn't support it
    if (filters.age && filters.age !== null && filters.age !== "") {
      const beforeAgeFilter = petsWithDistance.length;
      petsWithDistance = filterPetsByAge(petsWithDistance, filters.age);
      console.log("📅 Frontend age filter applied to API results:", {
        beforeFilter: beforeAgeFilter,
        afterFilter: petsWithDistance.length,
        ageFilter: filters.age
      });
    }

    // Apply frontend gender filter if backend doesn't support it
    if (filters.gender && filters.gender !== null && filters.gender !== "") {
      const beforeGenderFilter = petsWithDistance.length;
      petsWithDistance = filterPetsByGender(petsWithDistance, filters.gender);
      console.log("👤 Frontend gender filter applied to API results:", {
        beforeFilter: beforeGenderFilter,
        afterFilter: petsWithDistance.length,
        genderFilter: filters.gender
      });
    }

    // Apply frontend size filter if backend doesn't support it
    if (filters.size && filters.size !== null && filters.size !== "") {
      const beforeSizeFilter = petsWithDistance.length;
      petsWithDistance = filterPetsBySize(petsWithDistance, filters.size);
      console.log("📏 Frontend size filter applied to API results:", {
        beforeFilter: beforeSizeFilter,
        afterFilter: petsWithDistance.length,
        sizeFilter: filters.size
      });
    }

    // Apply frontend activity filter if backend doesn't support it
    if (filters.activity && filters.activity !== null && filters.activity !== "") {
      const beforeActivityFilter = petsWithDistance.length;
      petsWithDistance = filterPetsByActivity(petsWithDistance, filters.activity);
      console.log("🏃 Frontend activity filter applied to API results:", {
        beforeFilter: beforeActivityFilter,
        afterFilter: petsWithDistance.length,
        activityFilter: filters.activity
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
