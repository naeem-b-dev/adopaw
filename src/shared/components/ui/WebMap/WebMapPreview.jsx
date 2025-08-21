import React from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

export default function WebMapPreview({ latitude, longitude, title, description, style }) {
  const lat = typeof latitude === "number" ? latitude : 0;
  const lng = typeof longitude === "number" ? longitude : 0;
  const titleJson = JSON.stringify(title || "");
  const descJson = JSON.stringify(description || "");
  const html = '<!DOCTYPE html>\n'
    + '<html>\n'
    + '  <head>\n'
    + '    <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width" />\n'
    + '    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />\n'
    + '    <style>\n'
    + '      html, body, #map { height: 100%; margin: 0; padding: 0; }\n'
    + '      .leaflet-control-attribution { display: none; }\n'
    + '    </style>\n'
    + '  </head>\n'
    + '  <body>\n'
    + '    <div id="map"></div>\n'
    + '    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>\n'
    + '    <script>\n'
    + "      const map = L.map('map', {\n"
    + '        zoomControl: false,\n'
    + '        dragging: false,\n'
    + '        touchZoom: false,\n'
    + '        scrollWheelZoom: false,\n'
    + '        doubleClickZoom: false,\n'
    + '        boxZoom: false,\n'
    + '        keyboard: false,\n'
    + '      }).setView([' + lat + ', ' + lng + '], 15);\n'
    + "      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {\n"
    + '        maxZoom: 20,\n'
    + '        minZoom: 1,\n'
    + "        attribution: ''\n"
    + '      }).addTo(map);\n'
    + '      const marker = L.marker([' + lat + ', ' + lng + ']).addTo(map);\n'
    + '      const title = ' + titleJson + ';\n'
    + '      const desc = ' + descJson + ';\n'
    + "      if (title || desc) {\n"
    + "        marker.bindPopup('<strong>' + title + '</strong><br/>' + desc);\n"
    + '      }\n'
    + '    </script>\n'
    + '  </body>\n'
    + '</html>';

  return (
    <View style={[styles.container, style]}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        style={StyleSheet.absoluteFill}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", height: 200, borderRadius: 12, overflow: "hidden" },
});