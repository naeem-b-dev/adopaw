import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { Alert } from "react-native";

/**
 * Updates the user's location in their profile
 * @param {boolean} showAlert - Whether to show success/error alerts
 * @returns {Promise<boolean>} - Returns true if successful, false otherwise
 */
export const updateUserLocation = async (showAlert = true) => {
  try {
    console.log("📍 Starting location update...");
    
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("📍 Location permission denied");
      if (showAlert) {
        Alert.alert("Location Permission", "Please enable location permission to get accurate results.");
      }
      return false;
    }

    console.log("📍 Getting current position with high accuracy...");
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation, // Highest accuracy
      timeout: 15000, // 15 seconds timeout
      maximumAge: 0, // Don't use cached location
    });

    const coords = [loc.coords.longitude, loc.coords.latitude];
    const geoJson = {
      type: "Point",
      coordinates: coords,
    };

    console.log("📍 Location obtained:", {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      accuracy: loc.coords.accuracy,
      altitude: loc.coords.altitude,
      heading: loc.coords.heading,
      speed: loc.coords.speed,
    });

    // Get current profile
    const profileJson = await AsyncStorage.getItem("user-profile");
    if (profileJson) {
      const profile = JSON.parse(profileJson);
      
      // Update location in profile
      const updatedProfile = {
        ...profile,
        location: geoJson,
      };

      // Save updated profile
      await AsyncStorage.setItem("user-profile", JSON.stringify(updatedProfile));
      console.log("📍 User location updated successfully:", coords);
      
      // Show success message if requested
      if (showAlert) {
        Alert.alert(
          "Location Updated", 
          `Your location has been updated to:\nLatitude: ${loc.coords.latitude.toFixed(6)}\nLongitude: ${loc.coords.longitude.toFixed(6)}\nAccuracy: ${loc.coords.accuracy ? `${loc.coords.accuracy.toFixed(1)}m` : 'Unknown'}`
        );
      }
      
      return true;
    } else {
      console.log("📍 No user profile found");
      if (showAlert) {
        Alert.alert("Error", "No user profile found. Please complete your profile first.");
      }
      return false;
    }
  } catch (error) {
    console.error("📍 Error updating location:", error);
    if (showAlert) {
      Alert.alert("Location Error", `Failed to get location: ${error.message}`);
    }
    return false;
  }
};
