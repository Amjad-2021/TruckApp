/**
 * ProfileScreen.js — no Firebase, real user from UserContext, 8-language support
 */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Switch, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { COLORS, PLATFORM_FEE_PERCENT } from '../utils/constants';
import { useUser }     from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import LanguagePicker  from '../components/LanguagePicker';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, refreshUser } = useUser();
  const { t, isRTL, lang }    = useLanguage();
  const p = t.profile;

  const [notifications,   setNotifications]   = useState(true);
  const [langPickerVisible, setLangPickerVisible] = useState(false);

  const name      = user?.name      || '—';
  const phone     = user?.phone     || '—';
  const role      = user?.role      || 'shipper';
  const rating    = user?.rating    ?? '—';
  const totalTrips = user?.totalTrips ?? 0;

  // ── Sign out ───────────────────────────────────────────────────────────────
  const handleSignOut = () => {
    Alert.alert(p.signOutTitle, p.signOutMsg, [
      { text: p.cancel, style: 'cancel' },
      {
        text: p.signOut, style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['trucklink_token', 'trucklink_user']);
          refreshUser(null);
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  // ── Switch role ────────────────────────────────────────────────────────────
  const handleSwitchRole = () => {
    Alert.alert(p.switchTitle, p.switchMsg, [
      { text: p.cancel, style: 'cancel' },
      {
        text: p.switch,
        onPress: async () => {
          const newRole = role === 'shipper' ? 'driver' : 'shipper';
          try {
            const raw = await AsyncStorage.getItem('trucklink_user');
            if (raw) {
              const u = JSON.parse(raw);
              u.role = newRole;
              await AsyncStorage.setItem('trucklink_user', JSON.stringify(u));
              refreshUser({ role: newRole });
            }
          } catch (_) {}
          Alert.alert(p.switchDone, p.switchDoneMsg);
        },
      },
    ]);
  };

  // ── Initials ──────────────────────────────────────────────────────────────
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w[0].toUpperCase())
    .slice(0, 2)
    .join('') || '?';

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

      {/* ── Profile card ──────────────────────────────────────────────────── */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.phone}>{phone}</Text>
        <View style={[styles.roleBadge, role === 'driver' && styles.roleBadgeDriver]}>
          <Text style={styles.roleText}>
            {role === 'driver' ? p.driver : p.shipper}
          </Text>
        </View>
      </View>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <View style={styles.statsRow}>
        <StatCard icon="⭐" label={p.rating}      value={rating} />
        <StatCard icon="🔄" label={p.totalTrips}  value={totalTrips} />
        <StatCard icon="📅" label={p.memberSince} value="2024" small />
      </View>

      {/* ── Platform fee card ─────────────────────────────────────────────── */}
      <View style={styles.feeCard}>
        <Text style={[styles.feeTitle, isRTL && styles.textRight]}>{p.feeTitle}</Text>
        <Text style={[styles.feeText, isRTL && styles.textRight]}>
          {p.feeText(PLATFORM_FEE_PERCENT)}
        </Text>
        <View style={styles.feeExample}>
          <Text style={[styles.feeExampleTitle, isRTL && styles.textRight]}>{p.feeExample}</Text>
          <Text style={[styles.feeExampleLine,  isRTL && styles.textRight]}>{p.feeTruckLink}</Text>
          <Text style={[styles.feeExampleLine,  isRTL && styles.textRight]}>{p.feeDriver}</Text>
        </View>
      </View>

      {/* ── Settings ──────────────────────────────────────────────────────── */}
      <View style={styles.settingsCard}>
        <Text style={[styles.settingsTitle, isRTL && styles.textRight]}>{p.settings}</Text>

        {/* Notifications toggle */}
        <SettingRow
          icon="🔔"
          label={p.notifications}
          isRTL={isRTL}
          right={
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: COLORS.border, true: COLORS.success }}
              thumbColor="#fff"
            />
          }
        />

        {/* Language picker row */}
        <SettingRow
          icon="🌐"
          label={p.language}
          isRTL={isRTL}
          onPress={() => setLangPickerVisible(true)}
          arrow
          rightLabel={t.profile.langLabel || lang.toUpperCase()}
        />

        <SettingRow
          icon="🔄"
          label={p.switchRole}
          isRTL={isRTL}
          onPress={handleSwitchRole}
          arrow
        />
        <SettingRow
          icon="🔒"
          label={p.privacy}
          isRTL={isRTL}
          onPress={() => Alert.alert(p.privacy, p.privacyMsg)}
          arrow
        />
        <SettingRow
          icon="❓"
          label={p.help}
          isRTL={isRTL}
          onPress={() => Alert.alert(p.help, p.helpMsg)}
          arrow
        />
        <SettingRow
          icon="📄"
          label={p.terms}
          isRTL={isRTL}
          onPress={() => navigation.navigate('Terms')}
          arrow
          noBorder
        />
      </View>

      {/* ── Sign out ──────────────────────────────────────────────────────── */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>{p.signOut}</Text>
      </TouchableOpacity>

      <Text style={styles.version}>{p.version}</Text>

      {/* ── Language picker modal ─────────────────────────────────────────── */}
      <LanguagePicker
        visible={langPickerVisible}
        onClose={() => setLangPickerVisible(false)}
        hideButton
      />
    </ScrollView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, small }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, small && { fontSize: 13 }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SettingRow({ icon, label, right, rightLabel, onPress, arrow, isRTL, noBorder }) {
  const rowStyle = [styles.settingRow, isRTL && styles.settingRowRTL, noBorder && { borderBottomWidth: 0 }];
  const Inner = (
    <View style={rowStyle}>
      <Text style={styles.settingIcon}>{icon}</Text>
      <Text style={[styles.settingLabel, isRTL && styles.textRight]}>{label}</Text>
      {right        ? right                                    : null}
      {rightLabel   ? <Text style={styles.rightLabel}>{rightLabel}</Text> : null}
      {arrow && !right && !rightLabel
                    ? <Text style={styles.settingArrow}>{isRTL ? '‹' : '›'}</Text>
                    : null}
    </View>
  );
  return onPress ? <TouchableOpacity onPress={onPress}>{Inner}</TouchableOpacity> : Inner;
}

const styles = StyleSheet.create({
  container:       { flexGrow: 1, backgroundColor: COLORS.bg, padding: 20, paddingTop: 60 },
  textRight:       { textAlign: 'right' },

  // Profile card
  profileCard:     { backgroundColor: COLORS.primary, borderRadius: 20, padding: 24,
                     alignItems: 'center', marginBottom: 16 },
  avatarCircle:    { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.secondary,
                     alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText:      { fontSize: 26, fontWeight: '800', color: '#fff' },
  name:            { fontSize: 20, fontWeight: '800', color: '#fff' },
  phone:           { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  roleBadge:       { backgroundColor: COLORS.secondary, borderRadius: 20,
                     paddingHorizontal: 16, paddingVertical: 5, marginTop: 10 },
  roleBadgeDriver: { backgroundColor: COLORS.success },
  roleText:        { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Stats
  statsRow:        { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard:        { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14,
                     alignItems: 'center', elevation: 2 },
  statIcon:        { fontSize: 22, marginBottom: 4 },
  statValue:       { fontSize: 18, fontWeight: '800', color: COLORS.text },
  statLabel:       { fontSize: 11, color: COLORS.subtext, marginTop: 2, textAlign: 'center' },

  // Fee card
  feeCard:         { backgroundColor: '#FFF9E6', borderRadius: 14, padding: 16, marginBottom: 14,
                     borderWidth: 1.5, borderColor: COLORS.secondary + '66' },
  feeTitle:        { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  feeText:         { fontSize: 13, color: COLORS.subtext, lineHeight: 19 },
  feeExample:      { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginTop: 10 },
  feeExampleTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  feeExampleLine:  { fontSize: 12, color: COLORS.subtext },

  // Settings
  settingsCard:    { backgroundColor: '#fff', borderRadius: 16, padding: 8, marginBottom: 14, elevation: 2 },
  settingsTitle:   { fontSize: 12, fontWeight: '700', color: COLORS.subtext,
                     paddingHorizontal: 14, paddingTop: 8, paddingBottom: 4,
                     textTransform: 'uppercase', letterSpacing: 0.5 },
  settingRow:      { flexDirection: 'row', alignItems: 'center',
                     paddingHorizontal: 14, paddingVertical: 13,
                     borderBottomWidth: 1, borderBottomColor: COLORS.border },
  settingRowRTL:   { flexDirection: 'row-reverse' },
  settingIcon:     { fontSize: 18, width: 28 },
  settingLabel:    { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: '500' },
  settingArrow:    { fontSize: 20, color: COLORS.subtext },
  rightLabel:      { fontSize: 13, color: COLORS.subtext, marginRight: 4 },

  // Sign out
  signOutBtn:      { backgroundColor: COLORS.danger + '15', borderRadius: 12, paddingVertical: 14,
                     alignItems: 'center', marginBottom: 12,
                     borderWidth: 1.5, borderColor: COLORS.danger + '44' },
  signOutText:     { color: COLORS.danger, fontWeight: '700', fontSize: 14 },
  version:         { textAlign: 'center', color: COLORS.subtext, fontSize: 11, marginBottom: 20 },
});
