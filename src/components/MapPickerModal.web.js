// ─── MapPickerModal — Expo Web / Safari ───────────────────────────────────────
//  Uses a Leaflet.js iframe (OpenStreetMap, no API key needed).
//  The iframe sends { type:'pin', lat, lng } via window.postMessage when the
//  user taps the map; this component listens and surfaces a "Confirm" button.
//
//  Platform note: Expo resolves the *.web.js suffix on web automatically.
//  On native (iOS/Android) MapPickerModal.js (without .web.js) is used instead.

import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { COLORS } from '../utils/constants';
import { useLanguage } from '../context/LanguageContext';

// ── Build the Leaflet HTML to inject into the iframe ──────────────────────────
function buildLeafletHtml({ centerLat, centerLng, hasPin, tapLabel }) {
  return [
    '<!DOCTYPE html>',
    '<html>',
    '<head>',
    '  <meta charset="utf-8"/>',
    '  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>',
    '  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>',
    '  <style>',
    '    *{box-sizing:border-box;margin:0;padding:0}',
    '    html,body{width:100%;height:100%;overflow:hidden;font-family:-apple-system,sans-serif}',
    '    #map{position:absolute;top:0;left:0;right:0;bottom:50px}',
    '    #hint{position:absolute;top:10px;left:50%;transform:translateX(-50%);',
    '          background:rgba(255,255,255,.92);padding:7px 16px;border-radius:20px;',
    '          font-size:13px;z-index:1000;box-shadow:0 2px 8px rgba(0,0,0,.15);',
    '          white-space:nowrap;pointer-events:none}',
    '    #bar{position:absolute;bottom:0;left:0;right:0;height:50px;',
    '         background:#FBF7F0;display:flex;align-items:center;',
    '         justify-content:center;font-size:13px;color:#3D2410;',
    '         border-top:1px solid #E8DDD0;font-weight:600}',
    '  </style>',
    '</head>',
    '<body>',
    '  <div id="hint">' + tapLabel + '</div>',
    '  <div id="map"></div>',
    '  <div id="bar">—</div>',
    '  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>',
    '  <script>',
    '    var lat0=' + centerLat + ',lng0=' + centerLng + ';',
    '    var map=L.map("map",{zoomControl:true}).setView([lat0,lng0],6);',
    '    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{',
    '      attribution:"&copy; OpenStreetMap contributors",maxZoom:18',
    '    }).addTo(map);',
    '    var marker=null;',
    '    if(' + (hasPin ? 'true' : 'false') + '){',
    '      marker=L.marker([lat0,lng0]).addTo(map);',
    '      document.getElementById("bar").textContent=lat0.toFixed(5)+", "+lng0.toFixed(5);',
    '    }',
    '    map.on("click",function(e){',
    '      var la=e.latlng.lat,lo=e.latlng.lng;',
    '      if(marker){marker.setLatLng([la,lo]);}',
    '      else{marker=L.marker([la,lo]).addTo(map);}',
    '      document.getElementById("bar").textContent=la.toFixed(5)+", "+lo.toFixed(5);',
    '      parent.postMessage(JSON.stringify({type:"pin",lat:la,lng:lo}),"*");',
    '    });',
    '  </script>',
    '</body>',
    '</html>',
  ].join('\n');
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function MapPickerModal({
  visible,
  onClose,
  onConfirm,
  title,
  initialLat,
  initialLng,
}) {
  const { lang } = useLanguage();
  const [pin, setPin] = useState(null);

  // Center map on existing pin, or on Saudi Arabia
  const centerLat = initialLat ?? 24.7136;
  const centerLng = initialLng ?? 46.6753;
  const hasPin    = initialLat != null;

  const L = {
    ar: {
      tap:     'اضغط على الخريطة لتحديد الموقع',
      confirm: 'تأكيد الموقع',
      cancel:  'إلغاء',
      noPin:   'اضغط على الخريطة أولاً',
    },
    en: {
      tap:     'Tap the map to drop a pin',
      confirm: 'Confirm Location',
      cancel:  'Cancel',
      noPin:   'Tap the map first',
    },
  }[lang];

  // Reset pin state when modal opens/closes
  useEffect(() => {
    if (!visible) {
      setPin(null);
    } else if (initialLat != null) {
      // Pre-populate with the existing pin so user can move it
      setPin({ lat: initialLat, lng: initialLng });
    }
  }, [visible]);

  // Listen for postMessage from the iframe
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = (event) => {
      try {
        const data = typeof event.data === 'string'
          ? JSON.parse(event.data)
          : event.data;
        if (data?.type === 'pin' && typeof data.lat === 'number') {
          setPin({ lat: data.lat, lng: data.lng });
        }
      } catch {
        // ignore non-JSON messages from other sources
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  if (!visible) return null;

  const html     = buildLeafletHtml({ centerLat, centerLng, hasPin, tapLabel: L.tap });
  const coordTxt = pin
    ? `${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}`
    : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>

          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.cancelWrap} onPress={onClose}>
              <Text style={styles.cancelTxt}>{L.cancel}</Text>
            </TouchableOpacity>
            <Text style={styles.titleTxt}>{title}</Text>
            <View style={styles.cancelWrap} />
          </View>

          {/* ── Leaflet map in an iframe ── */}
          {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
          <iframe
            srcDoc={html}
            title={title}
            style={{
              width: '100%',
              height: 340,
              border: 'none',
              display: 'block',
            }}
          />

          {/* ── Current pin coordinates ── */}
          {coordTxt && (
            <View style={styles.coordsRow}>
              <Text style={styles.coordsTxt}>📍 {coordTxt}</Text>
            </View>
          )}

          {/* ── Confirm button ── */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.confirmBtn, !pin && styles.confirmDisabled]}
              onPress={() => pin && onConfirm(pin)}
              disabled={!pin}
            >
              <Text style={styles.confirmBtnTxt}>
                {pin ? L.confirm : L.noPin}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.52)', justifyContent: 'flex-end' },
  sheet:          { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22,
                    overflow: 'hidden' },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingHorizontal: 16, paddingVertical: 14,
                    borderBottomWidth: 1, borderBottomColor: COLORS.border },
  titleTxt:       { fontSize: 15, fontWeight: '700', color: COLORS.text },
  cancelWrap:     { width: 64 },
  cancelTxt:      { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  coordsRow:      { backgroundColor: '#F0F7F0', paddingVertical: 10, paddingHorizontal: 16,
                    borderTopWidth: 1, borderTopColor: '#D0E8D0', alignItems: 'center' },
  coordsTxt:      { fontSize: 13, color: '#2E6B2E', fontWeight: '600' },
  footer:         { padding: 16, paddingBottom: 30 },
  confirmBtn:     { backgroundColor: COLORS.primary, borderRadius: 12,
                    paddingVertical: 14, alignItems: 'center' },
  confirmDisabled:{ backgroundColor: '#C4A882' },
  confirmBtnTxt:  { color: '#fff', fontWeight: '700', fontSize: 15 },
});
