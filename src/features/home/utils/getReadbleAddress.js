import * as Location from "expo-location";

export async function getReadableAddress(latitude, longitude) {
  try {
    const addresses = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (addresses.length > 0) {
      const addr = addresses[0];

      const components = [
        addr.country,
        addr.name,
        addr.street,
        addr.city,
        addr.region !== addr.name ? addr.region : null,
      ];

      // Filter out null, undefined, and duplicate consecutive values
      const filtered = components.filter((val, index, self) => {
        return val && (index === 0 || val !== self[index - 1]);
      });

      return filtered.join(", ");
    }

    return "Unknown address";
  } catch (error) {
    console.error("Reverse geocoding failed", error);
    return "Unknown address";
  }
}
