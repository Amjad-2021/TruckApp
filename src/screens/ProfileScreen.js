import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Switch, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, PLATFORM_FEE_PERCENT } from '../utils/constants';
import { useLanguage } from '../context/LanguageContext';

export default function ProfileScreen({ navigation }) {
  const { lang, isRTL } = useLanguage();
  const [notifications, setNotifications] = useState(true);
  const [user, setUser] = useState({ name: '', phone: '', role: 'shipper', rating: 0, totalTrips: 0 });

  useEffect(() => {
    AsyncStorage.getItem('trucklink_user').then(json => {
      if (json) {
        const u = JSON.parse(json);
        setUser({
          name:       u.full_name ?? u.name ?? '',
          phone:      u.phone ?? '',
          role:       u.role ?? 'shipper',
          rating:     u.rating ?? 0,
          totalTrips: u.total_trips ?? u.totalTrips ?? 0,
        });
      }
    });
  }, []);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['trucklink_token', 'trucklink_user', 'trucklink_driver_id']);
          navigation.replace('Login');
        }
      }
    ]);
  };

  const switchRole = () => {
    Alert.alert('Switch Role', 'Switch between Shipper and Driver?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Switch', onPress: () => Alert.alert('Done', 'Role updated! Restart the app to apply.') }
    ]);
  };

  const labels = {
    ar: { settings: 'الإعدادات', notifications: 'الإشعارات', language: 'اللغة',
          switchRole: 'تغيير الدور', privacy: 'الخصوصية', help: 'المساعدة والدعم',
          terms: 'شروط الاستخدام', signOut: 'تسجيل الخروج', rating: 'التقييم',
          trips: 'الرحلات', member: 'عضو منذ', fee: 'عمولة المنصة', version: 'تراك لينك الإصدار 1.0.0' },
    en: { settings: 'Settings', notifications: 'Push Notifications', language: 'Language',
          switchRole: 'Switch Role', privacy: 'Privacy', help: 'Help & Support',
          terms: 'Terms of Service', signOut: 'Sign Out', rating: 'Rating',
          trips: 'Total Trips', member: 'Member Since', fee: 'Platform Fee', version: 'TruckLink v1.0.0' },
  };
  const L = labels[lang] ?? labels.en;

  return (
    <ScrollView contentContainerStyle={[styles.container, isRTL && styles.rtl]}>
      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user.name || '—'}</Text>
        <Text style={styles.phone}>{user.phone}</Text>
        <View style={[styles.roleBadge, user.role === 'driver' && styles.roleBadgeDriver]}>
          <Text style={styles.roleText}>{user.role === 'shipper' ? '📦 Shipper' : '🚛 Driver'}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard icon="⭐" label={L.rating}  value={user.rating || '—'} />
        <StatCard icon="🔄" label={L.trips}   value={user.totalTrips || 0} />
      </View>

      {/* Platform fee info */}
      <View style={styles.feeInfoCard}>
        <Text style={[styles.feeInfoTitle, isRTL && styles.textRight]}>💰 {L.fee}</Text>
        <Text style={[styles.feeInfoText, isRTL && styles.textRight]}>
          TruckLink charges a flat <Text style={styles.feeHighlight}>{PLATFORM_FEE_PERCENT}% commission</Text> on each completed deal.
          Automatically deducted. No hidden charges.
        </Text>
        <View style={styles.feeExample}>
          <Text style={[styles.feeExampleText, isRTL && styles.textRight]}>Example: SAR 5,000 deal</Text>
          <Text style={[styles.feeExampleDetail, isRTL && styles.textRight]}>→ TruckLink keeps SAR 150</Text>
          <Text style={[styles.feeExampleDetail, isRTL && styles.textRight]}>→ Driver receives SAR 4,850</Text>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.settingsCard}>
        <Text style={[styles.settingsTitle, isRTL && styles.textRight]}>{L.settings}</Text>

        <SettingRow
          icon="🔔"
          label={L.notifications}
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
        <SettingRow icon="🔄" label={L.switchRole} onPress={switchRole}                          isRTL={isRTL} arrow />
        <SettingRow icon="🔒" label={L.privacy}    onPress={() => navigation.navigate('Privacy')} isRTL={isRTL} arrow />
        <SettingRow icon="❓" label={L.help}        onPress={() => Alert.alert('Support', 'Email: support@trucklink.sa')} isRTL={isRTL} arrow />
        <SettingRow icon="📄" label={L.terms}       onPress={() => navigation.navigate('Terms')}  isRTL={isRTL} arrow />
      </View>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>{L.signOut}</Text>
      </TouchableOpacity>

      <Text style={styles.version}>{L.version}</Text>
    </ScrollView>
  );
}

function StatCard({ icon, label, value, small }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, small && { fontSize: 13 }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SettingRow({ icon, label, right, onPress, arrow, isRTL }) {
  const Inner = (
    <View style={[styles.settingRow, isRTL && styles.rowRTL]}>
      <Text style={styles.settingIcon}>{icon}</Text>
      <Text style={styles.settingLabel}>{label}</Text>
      {right ?? (arrow && <Text style={styles.settingArrow}>{isRTL ? '‹' : '›'}</Text>)}
    </View>
  );
  return onPress
    ? <TouchableOpacity onPress={onPress}>{Inner}</TouchableOpacity>
    : Inner;
}

const styles = StyleSheet.create({
  container:        { flexGrow: 1, backgroundColor: COLORS.bg, padding: 20, paddingTop: 20 },
  rtl:              { direction: 'rtl' },
  textRight:        { textAlign: 'right' },
  profileCard:      { backgroundColor: COLORS.primary, borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16 },
  avatarCircle:     { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.secondary,
                      alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText:       { fontSize: 26, fontWeight: '800', color: '#fff' },
  name:             { fontSize: 20, fontWeight: '800', color: '#fff' },
  phone:            { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  roleBadge:        { backgroundColor: COLORS.secondary, borderRadius: 20, paddingHorizontal: 16,
                      paddingVertical: 5, marginTop: 10 },
  roleBadgeDriver:  { backgroundColor: COLORS.success },
  roleText:         { color: '#fff', fontWeight: '700', fontSize: 13 },
  statsRow:         { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard:         { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', elevation: 2 },
  statIcon:         { fontSize: 22, marginBottom: 4 },
  statValue:        { fontSize: 18, fontWeight: '800', color: COLORS.text },
  statLabel:        { fontSize: 11, color: COLORS.subtext, marginTop: 2, textAlign: 'center' },
  feeInfoCard:      { backgroundColor: '#FFF9E6', borderRadius: 14, padding: 16, marginBottom: 14,
                      borderWidth: 1.5, borderColor: COLORS.secondary + '66' },
  feeInfoTitle:     { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  feeInfoText:      { fontSize: 13, color: COLORS.subtext, lineHeight: 19 },
  feeHighlight:     { color: COLORS.secondary, fontWeight: '700' },
  feeExample:       { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginTop: 10 },
  feeExampleText:   { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  feeExampleDetail: { fontSize: 12, color: COLORS.subtext },
  settingsCard:     { backgroundColor: '#fff', borderRadius: 16, padding: 8, marginBottom: 14, elevation: 2 },
  settingsTitle:    { fontSize: 12, fontWeight: '700', color: COLORS.subtext, paddingHorizontal: 14,
                      paddingTop: 8, paddingBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  settingRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13,
                      borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowRTL:           { flexDirection: 'row-reverse' },
  settingIcon:      { fontSize: 18, width: 28 },
  settingLabel:     { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: '500' },
  settingArrow:     { fontSize: 20, color: COLORS.subtext },
  signOutBtn:       { backgroundColor: COLORS.danger + '15', borderRadius: 12, paddingVertical: 14,
                      alignItems: 'center', marginBottom: 12, borderWidth: 1.5, borderColor: COLORS.danger + '44' },
  signOutText:      { color: COLORS.danger, fontWeight: '700', fontSize: 14 },
  version:          { textAlign: 'center', color: COLORS.subtext, fontSize: 11, marginBottom: 20 },
});
