import AsyncStorage from "@react-native-async-storage/async-storage";

export const clearAllKeys = async () => {
  try {
    await AsyncStorage.clear();
    console.log("All keys cleared!");
  } catch (error) {
    console.error("Error clearing keys from AsyncStorage: ", error);
  }
};
