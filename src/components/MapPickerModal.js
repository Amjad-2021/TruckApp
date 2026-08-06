// ─── MapPickerModal — iOS / Android fallback ───────────────────────────────────
//  On native platforms, showing a Leaflet map needs a WebView (expo package
//  react-native-webview). To avoid adding a dependency, this fallback lets the
//  user enter coordinates manually, or tap "Use my GPS" to autofill them.
//
//  Expo resolves MapPickerModal.web.js on web automatically, so this file is
//  only loaded on native builds.

import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { COLORS } from '../utils/constants';
import { useLanguage } from '../context/LanguageContext';

export default function MapPickerModal({
  visible,
  onClose,
  onConfirm,
  title,
  initialLat,
  initialLng,
}) {
  const { lang } = useLanguage();
  const [lat, setLat] = useState(initialLat != null ? String(initialLat) : '');
  const [lng, setLng] = useState(initialLng != null ? String(initialLng) : '');
  const [gpsLoading, setGpsLoading] = useState(false);

  const L = {
    ar: {
      latLabel: 'خط العرض (Latitude)',
      lngLabel: 'خط الطول (Longitude)',
      gps:     '📡 استخدام موقعي الحالي',
      confirm: 'تأكيد الموقع',
      cancel:  'إلغاء',
      gpsErr:  'تعذّر الحصول على الموقع. يرجى المحاولة يدوياً.',
      hint:    'أدخل إحداثيات الموقع، أو اضغط "موقعي الحالي"',
    },
    en: {
      latLabel: 'Latitude',
      lngLabel: 'Longitude',
      gps:     '📡 Use my current location',
      confirm: 'Confirm Location',
      cancel:  'Cancel',
      gpsErr:  'Could not get location. Please enter coordinates manually.',
      hint:    'Enter coordinates manually, or tap "Use my location".',
    },
  }[lang];

  const latNum  = parseFloat(lat);
  const lngNum  = parseFloat(lng);
  const isValid = !isNaN(latNum) && !isNaN(lngNum);

  // ── GPS auto-fill ─────────────────────────────────────────────────────────
  const handleGPS = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      Alert.alert('', L.gpsErr);
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude.toFixed(6)));
        setLng(String(pos.coords.longitude.toFixed(6)));
        setGpsLoading(false);
      },
      () => {
        Alert.alert('', L.gpsErr);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm({ lat: latNum, lng: lngNum });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.cancelWrap} onPress={onClose}>
              <Text style={styles.cancelTxt}>{L.cancel}</Text>
            </TouchableOpacity>
            <Text style={styles.titleTxt}>{title}</Text>
            <View style={styles.cancelWrap} />
          </View>

          <View style={styles.body}>
            <Text style={styles.hint}>{L.hint}</Text>

            {/* GPS button */}
            <TouchableOpacity style={styles.gpsBtn} onPress={handleGPS} disabled={gpsLoading}>
              {gpsLoading
                ? <ActivityIndicator color={COLORS.primary} />
                : <Text style={styles.gpsBtnTxt}>{L.gps}</Text>
              }
            </TouchableOpacity>

            {/* Manual entry */}
            <Text style={styles.label}>{L.latLabel}</Text>
            <TextInput
              style={styles.input}
              value={lat}
              onChangeText={setLat}
              keyboardType="decimal-pad"
              placeholder="e.g. 24.71360"
              placeholderTextColor={COLORS.subtext}
            />

            <Text style={[styles.label, { marginTop: 12 }]}>{L.lngLabel}</Text>
            <TextInput
              style={styles.input}
              value={lng}
              onChangeText={setLng}
              keyboardType="decimal-pad"
              placeholder="e.g. 46.67530"
              placeholderTextColor={COLORS.subtext}
            />

            {/* Confirm */}
            <TouchableOpacity
              style={[styles.confirmBtn, !isValid && styles.confirmDisabled]}
              onPress={handleConfirm}
              disabled={!isValid}
            >
              <Text style={styles.confirmBtnTxt}>{L.confirm}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.52)', justifyContent: 'flex-end' },
  sheet:          { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22,
                    paddingBottom: 30 },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingHorizontal: 16, paddingVertical: 14,
                    borderBottomWidth: 1, borderBottomColor: COLORS.border },
  titleTxt:       { fontSize: 15, fontWeight: '700', color: COLORS.text },
  cancelWrap:     { width: 64 },
  cancelTxt:      { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  body:           { padding: 20 },
  hint:           { fontSize: 13, color: COLORS.subtext, marginBottom: 16,
                    textAlign: 'center', lineHeight: 19 },
  gpsBtn:         { backgroundColor: '#EAF4FB', borderRadius: 10, paddingVertical: 12,
                    alignItems: 'center', marginBottom: 20,
                    borderWidth: 1, borderColor: '#B3D4EC' },
  gpsBtnTxt:      { fontSize: 14, color: '#1A6FA8', fontWeight: '600' },
  label:          { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input:          { backgroundColor: COLORS.bg, borderRadius: 10, paddingHorizontal: 14,
                    paddingVertical: 12, fontSize: 15, color: COLORS.text,
                    borderWidth: 1, borderColor: COLORS.border },
  confirmBtn:     { backgroundColor: COLORS.primary, borderRadius: 12,
                    paddingVertical: 14, alignItems: 'center', marginTop: 22 },
  confirmDisabled:{ backgroundColor: '#C4A882' },
  confirmBtnTxt:  { color: '#fff', fontWeight: '700', fontSize: 15 },
});
