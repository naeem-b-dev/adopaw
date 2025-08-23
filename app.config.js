// app.config.js
require("dotenv").config();

module.exports = ({ config }) => {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn(
      "[app.config] Missing EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in .env"
    );
  }

  return {
    ...config,
    android: {
      ...(config.android || {}),

      // ✅ Make Android resize the window when keyboard shows
      softwareKeyboardLayoutMode: "resize",
      windowSoftInputMode: "adjustResize",

      // (Optional) avoid status bar translucency weirdness with resizing
      statusBar: {
        ...(config.android?.statusBar || {}),
        translucent: false,
      },

      config: {
        ...((config.android && config.android.config) || {}),
        googleMaps: { apiKey: apiKey || "" },
      },

      ...(apiKey && {
        buildConfigFields: {
          ...(config.android?.buildConfigFields || {}),
          MAPS_API_KEY: apiKey,
        },
      }),
    },
  };
};
