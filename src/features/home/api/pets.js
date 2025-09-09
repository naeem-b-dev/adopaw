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
export async function fetchPets(
  filters = {},
  page = 1,
  limit = 10,
  signal,
  fetchUrl = null
) {
  try {
    const auth = await getAuthToken();

    // 🟢 If fetchUrl is passed, fetch pets directly from custom endpoint
    if (fetchUrl) {
      console.log("📄 Using custom fetchUrl:", fetchUrl);

      const response = await axios.get(fetchUrl, {
        headers: {
          Authorization: `Bearer ${auth}`,
          "Content-Type": "application/json",
        },
        params: { page, limit },
        signal,
      });

      const pets = response.data.docs || [];

      return {
        items: pets,
        total: response.data.totalDocs || pets.length,
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.page || 1,
        hasNextPage: response.data.hasNextPage || false,
        hasPrevPage: response.data.hasPrevPage || false,
      };
    }

    // 🟡 Otherwise, use regular logic (filtered, paginated fetch)
    // -- keep your full fetchPets code as-is below here --
    // -- don't forget to pass `fetchUrl` to frontend fallback too if needed --

    // (REMAINING EXISTING LOGIC STARTS HERE...)

    // If we have a search term, try to fetch more data for better search results
    if (filters.search && filters.search.trim() !== "") {
      console.log(
        "🔍 Search detected - fetching more data for comprehensive search"
      );

      // Fetch all pets for frontend search
      const allPets = await fetchAllPetsForSearch(auth, signal);

      // Load user profile to calculate distances
      const profileJson = await AsyncStorage.getItem("user-profile");
      const profile = profileJson ? JSON.parse(profileJson) : null;
      const userCoords = profile?.location?.coordinates;

      let petsWithDistance = allPets;

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

      // Apply frontend filters
      petsWithDistance = searchPetsFrontend(petsWithDistance, filters.search);
      petsWithDistance = filterPetsByAge(petsWithDistance, filters.age);
      petsWithDistance = filterPetsByGender(petsWithDistance, filters.gender);
      petsWithDistance = filterPetsBySize(petsWithDistance, filters.size);
      petsWithDistance = filterPetsByActivity(
        petsWithDistance,
        filters.activity
      );
      if (filters.category) {
        petsWithDistance = petsWithDistance.filter(
          (p) => p.species?.toLowerCase() === filters.category.toLowerCase()
        );
      }

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

    // Backend API call
    const params = {
      page,
      limit,
    };

    if (filters.search) params.search = filters.search.trim();
    if (filters.category) params.species = filters.category;
    if (filters.age) {
      params.age = filters.age;
      params.ageGroup = filters.age;
    }
    if (filters.gender) params.gender = filters.gender;
    if (filters.size) params.size = filters.size;
    if (filters.activity) params.activity = filters.activity;
    if (filters.distance) params.distance = filters.distance;
    if (filters.status) params.status = filters.status;
    if (filters.city) params.city = filters.city;

    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_BACKEND_API_URL}/pet/by/`,
      {
        headers: {
          Authorization: `Bearer ${auth}`,
          "Content-Type": "application/json",
        },
        params,
        signal,
      }
    );

    const profileJson = await AsyncStorage.getItem("user-profile");
    const profile = profileJson ? JSON.parse(profileJson) : null;
    const userCoords = profile?.location?.coordinates;

    let petsWithDistance = response.data.docs || [];

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

    petsWithDistance = filterPetsByAge(petsWithDistance, filters.age);
    petsWithDistance = filterPetsByGender(petsWithDistance, filters.gender);
    petsWithDistance = filterPetsBySize(petsWithDistance, filters.size);
    petsWithDistance = filterPetsByActivity(petsWithDistance, filters.activity);

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
    throw error;
  }
}

// Helper function to check if we should load more data
export function shouldLoadMore(currentPage, totalPages, hasNextPage) {
  return currentPage < totalPages && hasNextPage;
}
