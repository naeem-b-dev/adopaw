require("dotenv").config();

module.exports = ({ config }) => {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    // Leave a visible hint in console during prebuild, so we don't ship an empty key
     
    console.warn("[app.config] Missing EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in .env");
  }

  return {
    ...config,
    android: {
      ...(config.android || {}),
      config: {
        ...((config.android && config.android.config) || {}),
        googleMaps: {
          apiKey: apiKey || ""
        }
      },
      // Pass API key to build process for manifest injection
      ...(apiKey && {
        buildConfigFields: {
          MAPS_API_KEY: apiKey
        }
      })
    }
  };
};


