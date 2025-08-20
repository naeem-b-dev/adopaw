import axios from "axios";
import { getAuthToken } from "@/src/shared/services/supabase/getters";

// Fetch a single pet by ID
export const fetchPetById = async (id) => {
  const auth = await getAuthToken();
  const response = await axios.get(
    `${process.env.EXPO_PUBLIC_BACKEND_API_URL}/pet/${id}`,
    {
      headers: {
        Authorization: `Bearer ${auth}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Create a new pet
export const createPet = async (petData) => {
  const auth = await getAuthToken();
  const response = await axios.post(
    `${process.env.EXPO_PUBLIC_BACKEND_API_URL}/pet`,
    petData,
    {
      headers: {
        Authorization: `Bearer ${auth}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Update an existing pet
export const updatePet = async (petId, updatedData) => {
  const auth = await getAuthToken();
  const response = await axios.put(
    `${process.env.EXPO_PUBLIC_BACKEND_API_URL}/pet/${petId}`,
    updatedData,
    {
      headers: {
        Authorization: `Bearer ${auth}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const setAdopted = async (petId) => {
  const auth = await getAuthToken();
  const response = await axios.put(
    `${process.env.EXPO_PUBLIC_BACKEND_API_URL}/pet/${petId}`,
    { status: "adopted" },
    {
      headers: {
        Authorization: `Bearer ${auth}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};
// Delete a pet
export const deletePet = async (petId) => {
  const auth = await getAuthToken();
  const response = await axios.delete(
    `${process.env.EXPO_PUBLIC_BACKEND_API_URL}/pet/${petId}`,
    {
      headers: {
        Authorization: `Bearer ${auth}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};
