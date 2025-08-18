require("dotenv").config();

module.exports = ({ config }) => {
  return {
    ...config,
    android: {
      ...(config.android || {}),
      config: {
        ...((config.android && config.android.config) || {}),
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ""
        }
      }
    }
  };
};


