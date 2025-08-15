import axios from "axios";

export async function fetchProfile(supaId, token) {
  try {
    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_BACKEND_API_URL}/profile/${supaId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
}
