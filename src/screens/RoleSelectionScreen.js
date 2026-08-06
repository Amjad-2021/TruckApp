import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Alert, ScrollView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../utils/constants';
import { useLanguage } from '../context/LanguageContext';
import { useUser }     from '../context/UserContext';

const API = 'https://truckapp-production-2be0.up.railway.app';

function notify(title, msg) {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${msg}`);
  else Alert.alert(title, msg);
}

export default function RoleSelectionScreen({ route, navigation }) {
  const { phoneNumber } = route.params ?? {};
  const { t, isRTL, toggleLanguage, lang } = useLanguage();
  const { reloadUser } = useUser();
  const r = t.role;

  const [role,           setRole]           = useState(null);
  const [name,           setName]           = useState('');
  const [loading,        setLoading]        = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isExistingUser, setIsExistingUser] = useState(false);

  const textAlign = isRTL ? 'right' : 'left';

  // ── On mount: check AsyncStorage for existing profile ─────────────────────
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const raw = await AsyncStorage.getItem('trucklink_user');
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved.name) {
            setName(saved.name);
            if (saved.role) setRole(saved.role);
            setIsExistingUser(true);
          }
        }
      } catch { /* ignore */ }
      finally { setProfileLoading(false); }
    };
    checkProfile();
  }, []);

  const ROLES = [
    { id: 'shipper', icon: '📦', title: r.shipperTitle, desc: r.shipperDesc, color: '#1A3C5E' },
    { id: 'driver',  icon: '🚛', title: r.driverTitle,  desc: r.driverDesc,  color: '#27AE60' },
  ];

  // ── Save & navigate ────────────────────────────────────────────────────────
  const handleContinue = async () => {
    if (!role) { notify(r.selectRole, r.selectRoleMsg); return; }
    if (!isExistingUser && name.trim().length < 2) {
      notify(r.nameRequired, r.nameRequiredMsg); return;
    }
    setLoading(true);

    const finalName = name.trim();
    const phone     = phoneNumber ?? '';

    try {
      // ── 1. Try to persist to Railway backend ────────────────────────────
      let token = null;
      let backendUser = null;
      try {
        const token0 = await AsyncStorage.getItem('trucklink_token');
        const res = await fetch(`${API}/api/users/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token0 ? { Authorization: `Bearer ${token0}` } : {}),
          },
          body: JSON.stringify({ name: finalName, role, phone }),
        });
        if (res.ok) {
          const data = await res.json();
          token       = data.token  ?? token0;
          backendUser = data.user   ?? data;
        }
      } catch { /* backend unavailable — continue with local save */ }

      // ── 2. Build local user object ──────────────────────────────────────
      const existingToken = await AsyncStorage.getItem('trucklink_token');
      const userData = {
        id:         backendUser?.id         ?? phone.replace(/\D/g, ''),
        name:       backendUser?.name       ?? finalName,
        role:       backendUser?.role       ?? role,
        phone:      backendUser?.phone      ?? phone,
        rating:     backendUser?.rating     ?? 0,
        totalTrips: backendUser?.totalTrips ?? 0,
        createdAt:  backendUser?.createdAt  ?? new Date().toISOString(),
      };

      // ── 3. Save to AsyncStorage ─────────────────────────────────────────
      await AsyncStorage.multiSet([
        ['trucklink_token', token ?? existingToken ?? `local_${Date.now()}`],
        ['trucklink_user',  JSON.stringify(userData)],
      ]);

      // ── 4. Refresh UserContext in memory ────────────────────────────────
      await reloadUser();

      // ── 5. Navigate ─────────────────────────────────────────────────────
      if (role === 'driver') {
        navigation.replace('DriverSetup', { role, phoneNumber: phone, name: finalName });
      } else {
        navigation.replace('Main', { role });
      }
    } catch (err) {
      // Last-resort fallback: save minimal data and navigate anyway
      try {
        const existingToken = await AsyncStorage.getItem('trucklink_token');
        await AsyncStorage.multiSet([
          ['trucklink_token', existingToken ?? `local_${Date.now()}`],
          ['trucklink_user',  JSON.stringify({
            id: phone.replace(/\D/g, ''), name: finalName,
            role, phone, rating: 0, totalTrips: 0,
          })],
        ]);
        await reloadUser();
      } catch {}
      if (role === 'driver') {
        navigation.replace('DriverSetup', { role, phoneNumber: phone, name: finalName });
      } else {
        navigation.replace('Main', { role });
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Loading spinner ────────────────────────────────────────────────────────
  if (profileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Language toggle */}
      <TouchableOpacity style={styles.langToggle} onPress={toggleLanguage}>
        <Text style={styles.langToggleText}>{lang === 'ar' ? 'EN' : 'عربي'}</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { textAlign }]}>{r.welcome}</Text>
      <Text style={[styles.sub,   { textAlign }]}>{r.question}</Text>

      <View style={styles.rolesRow}>
        {ROLES.map(ro => (
          <TouchableOpacity
            key={ro.id}
            style={[styles.card, role === ro.id && { borderColor: ro.color, borderWidth: 2.5 }]}
            onPress={() => setRole(ro.id)}
            activeOpacity={0.85}
          >
            <Text style={styles.cardIcon}>{ro.icon}</Text>
            <Text style={[styles.cardTitle, { textAlign }, role === ro.id && { color: ro.color }]}>
              {ro.title}
            </Text>
            <Text style={[styles.cardDesc, { textAlign }]}>{ro.desc}</Text>
            {role === ro.id && (
              <View style={[styles.badge, { backgroundColor: ro.color },
                            isRTL && { alignSelf: 'flex-end' }]}>
                <Text style={styles.badgeText}>{r.selected}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Name input — new users */}
      {!isExistingUser && (
        <View style={styles.inputCard}>
          <Text style={[styles.label, { textAlign }]}>{r.nameLabel}</Text>
          <TextInput
            style={[styles.input, { textAlign }]}
            placeholder={r.namePlaceholder}
            value={name}
            onChangeText={setName}
            placeholderTextColor={COLORS.subtext}
          />
        </View>
      )}

      {/* Returning user greeting */}
      {isExistingUser && (
        <View style={[styles.returningCard,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={styles.returningIcon}>👋</Text>
          <Text style={[styles.returningText, { textAlign }]}>{r.welcomeBack(name)}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.btn, (!role || loading) && styles.btnDisabled]}
        onPress={handleContinue}
        disabled={!role || loading}
        activeOpacity={0.85}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>{r.getStarted}</Text>}
      </TouchableOpacity>

      <Text style={styles.hint}>{r.hint}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  container:   { flexGrow: 1, backgroundColor: COLORS.bg, padding: 24, paddingTop: 50 },
  langToggle:  { alignSelf: 'flex-end', backgroundColor: COLORS.primary, borderRadius: 20,
                 paddingHorizontal: 14, paddingVertical: 6, marginBottom: 16 },
  langToggleText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  title:       { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  sub:         { fontSize: 15, color: COLORS.subtext, marginBottom: 28 },
  rolesRow:    { flexDirection: 'row', gap: 14, marginBottom: 24 },
  card:        { flex: 1, backgroundColor: COLORS.card, borderRadius: 16, padding: 18,
                 borderWidth: 2, borderColor: COLORS.border,
                 elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  cardIcon:    { fontSize: 38, marginBottom: 10 },
  cardTitle:   { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  cardDesc:    { fontSize: 12, color: COLORS.subtext, lineHeight: 17 },
  badge:       { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
                 marginTop: 10, alignSelf: 'flex-start' },
  badgeText:   { color: '#fff', fontSize: 11, fontWeight: '700' },
  inputCard:   { backgroundColor: COLORS.card, borderRadius: 14, padding: 18, marginBottom: 24,
                 elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  label:       { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  input:       { backgroundColor: COLORS.bg, borderRadius: 10, paddingHorizontal: 14,
                 paddingVertical: 12, fontSize: 15, color: COLORS.text },
  btn:         { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 15,
                 alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText:     { color: '#fff', fontWeight: '700', fontSize: 15 },
  hint:        { textAlign: 'center', color: COLORS.subtext, fontSize: 12, marginTop: 16 },
  returningCard: { backgroundColor: COLORS.primary + '12', borderRadius: 14, padding: 16,
                   marginBottom: 24, alignItems: 'center', gap: 10,
                   borderWidth: 1, borderColor: COLORS.primary + '22' },
  returningIcon: { fontSize: 22 },
  returningText: { flex: 1, fontSize: 14, fontWeight: '600',
                   color: COLORS.primary, lineHeight: 20 },
});
