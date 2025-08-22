import { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

const FALLBACK = {
  latitude: 33.8938,
  longitude: 35.5018,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

function longitudeDeltaToZoom(longitudeDelta) {
  try {
    const clamped = Math.max(0.0005, Math.min(360, longitudeDelta || FALLBACK.longitudeDelta));
    const zoom = Math.log2(360 / clamped);
    return Math.max(1, Math.min(20, Math.round(zoom)));
  } catch {
    return 12;
  }
}

function zoomToLongitudeDelta(zoom) {
  try {
    const z = Math.max(1, Math.min(20, zoom || 12));
    return 360 / Math.pow(2, z);
  } catch {
    return FALLBACK.longitudeDelta;
  }
}

export default function MapCanvas({ region, onRegionChange, markers = [] }) {
  const center = region || FALLBACK;
  const zoom = longitudeDeltaToZoom(center.longitudeDelta);
  const webRef = useRef(null);

  const initData = JSON.stringify({
    center: { latitude: center.latitude, longitude: center.longitude, zoom },
    markers: markers.map(m => ({
      id: m.id ?? String(m.latitude)+","+String(m.longitude),
      latitude: m.latitude,
      longitude: m.longitude,
      name: m.name,
      description: m.description,
      isCurrentLocation: m.isCurrentLocation,
      category: m.category,
    })),
  });

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
    + '      const RNW = window.ReactNativeWebView;\n'
    + '      const INIT = ' + initData + ';\n'
    + '      const map = L.map(\'map\', { zoomControl: false }).setView([INIT.center.latitude, INIT.center.longitude], INIT.center.zoom);\n'
    + '      L.tileLayer(\'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png\', {\n'
    + '        maxZoom: 20,\n'
    + '        minZoom: 1,\n'
    + '        attribution: \'\'\n'
    + '      }).addTo(map);\n'
    + '      const markersLayer = L.layerGroup().addTo(map);\n'
    + '      function getCategoryIcon(category) {\n'
    + '        const iconMap = {\n'
    + '          veterinary: "⚕️",\n'
    + '          petstore: "🏪",\n'
    + '          shelter: "🏠",\n'
    + '          grooming: "✂️",\n'
    + '          emergency: "🚑",\n'
    + '          training: "🎓",\n'
    + '          parks: "🌳"\n'
    + '        };\n'
    + '        return iconMap[category] || "📍";\n'
    + '      }\n'
    + '      function getCategoryColor(category) {\n'
    + '        const colorMap = {\n'
    + '          veterinary: "#e91e63",\n'
    + '          petstore: "#ff9800",\n'
    + '          shelter: "#4caf50",\n'
    + '          grooming: "#9c27b0",\n'
    + '          emergency: "#f44336",\n'
    + '          training: "#3f51b5",\n'
    + '          parks: "#8bc34a"\n'
    + '        };\n'
    + '        return colorMap[category] || "#757575";\n'
    + '      }\n'
    + '      function setMarkers(arr){\n'
    + '        markersLayer.clearLayers();\n'
    + '        (arr || []).forEach(m => {\n'
    + '          let marker;\n'
    + '          if (m.isCurrentLocation) {\n'
    + '            marker = L.circleMarker([m.latitude, m.longitude], {\n'
    + '              radius: 8,\n'
    + '              fillColor: "#2196F3",\n'
    + '              color: "#ffffff",\n'
    + '              weight: 3,\n'
    + '              opacity: 1,\n'
    + '              fillOpacity: 0.8\n'
    + '            }).addTo(markersLayer);\n'
    + '          } else {\n'
    + '            const iconEmoji = getCategoryIcon(m.category);\n'
    + '            const categoryColor = getCategoryColor(m.category);\n'
    + '            const customIcon = L.divIcon({\n'
    + '              className: "",\n'
    + '              html: `<div class="custom-marker" style="background-color: ${categoryColor}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${iconEmoji}</div>`,\n'
    + '              iconSize: [32, 32],\n'
    + '              iconAnchor: [16, 16],\n'
    + '              popupAnchor: [0, -16]\n'
    + '            });\n'
    + '            marker = L.marker([m.latitude, m.longitude], { icon: customIcon }).addTo(markersLayer);\n'
    + '          }\n'
    + '          if (m.name || m.description) {\n'
    + '            const txt = \'<strong>\' + (m.name ?? \'\') + \'</strong><br/>\' + (m.description ?? \'\');\n'
    + '            marker.bindPopup(txt);\n'
    + '          }\n'
    + '        });\n'
    + '      }\n'
    + '      setMarkers(INIT.markers);\n'
    + '      window.__updateCenter = function(lat, lng, zoom){\n'
    + '        try { map.setView([lat, lng], zoom || map.getZoom()); } catch (e) {}\n'
    + '      }\n'
    + '      window.__updateMarkers = function(arr){\n'
    + '        try { setMarkers(arr); } catch (e) {}\n'
    + '      }\n'
    + '      map.on(\'moveend\', () => {\n'
    + '        const c = map.getCenter();\n'
    + '        const z = map.getZoom();\n'
    + '        if (RNW && RNW.postMessage) {\n'
    + '          RNW.postMessage(JSON.stringify({ type: \'regionChange\', payload: { latitude: c.lat, longitude: c.lng, zoom: z } }));\n'
    + '        }\n'
    + '      });\n'
    + '    </script>\n'
    + '  </body>\n'
    + '</html>';

  useEffect(() => {
    if (!region || !webRef.current) return;
    const z = longitudeDeltaToZoom(region.longitudeDelta);
    const js = 'window.__updateCenter(' + region.latitude + ', ' + region.longitude + ', ' + z + '); true;';
    try { webRef.current.injectJavaScript(js); } catch {}
  }, [region?.latitude, region?.longitude, region?.longitudeDelta]);

  useEffect(() => {
    if (!webRef.current) return;
    const payload = JSON.stringify(markers.map(m => ({
      id: m.id ?? String(m.latitude)+","+String(m.longitude),
      latitude: m.latitude,
      longitude: m.longitude,
      name: m.name,
      description: m.description,
      isCurrentLocation: m.isCurrentLocation,
      category: m.category,
    })));
    const js = 'window.__updateMarkers(' + payload + '); true;';
    try { webRef.current.injectJavaScript(js); } catch {}
  }, [JSON.stringify(markers)]);

  const handleMessage = (event) => {
    if (!onRegionChange) return;
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.type === 'regionChange') {
        const { latitude, longitude, zoom } = data.payload || {};
        const longitudeDelta = zoomToLongitudeDelta(zoom);
        const latitudeDelta = longitudeDelta; // simple approximation
        onRegionChange({ latitude, longitude, latitudeDelta, longitudeDelta });
      }
    } catch {}
  };

  return (
    <WebView
      ref={webRef}
      originWhitelist={["*"]}
      style={styles.map}
      source={{ html }}
      onMessage={handleMessage}
      javaScriptEnabled
      domStorageEnabled
      allowFileAccess
      allowUniversalAccessFromFileURLs
    />
  );
}

const styles = StyleSheet.create({ map: { flex: 1 } });
