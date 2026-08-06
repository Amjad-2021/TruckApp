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
          trips: 'الرحلات', member: 'عضو منذ', fee: 'عمولة المنصة', version: 'تراك لينك الإصدار 1.0.0',
          roleShipper: '📦 صاحب شحنة', roleDriver: '🚛 سائق',
          feeDesc: `تراك لينك تجمع عمولة ثابتة ${PLATFORM_FEE_PERCENT}% على كل صفقة مكتملة. تُخصم تلقائياً. بدون رسوم خفية.`,
          feeExample: 'مثال: صفقة بـ 5,000 ريال', feeLine1: '← تراك لينك تأخذ 150 ريال', feeLine2: '← يستلم السائق 4,850 ريال',
    },
    en: { settings: 'Settings', notifications: 'Push Notifications', language: 'Language',
          switchRole: 'Switch Role', privacy: 'Privacy', help: 'Help & Support',
          terms: 'Terms of Service', signOut: 'Sign Out', rating: 'Rating',
          trips: 'Total Trips', member: 'Member Since', fee: 'Platform Fee', version: 'TruckLink v1.0.0',
          roleShipper: '📦 Shipper', roleDriver: '🚛 Driver',
          feeDesc: `TruckLink charges a flat ${PLATFORM_FEE_PERCENT}% commission on each completed deal. Automatically deducted. No hidden charges.`,
          feeExample: 'Example: SAR 5,000 deal', feeLine1: '→ TruckLink keeps SAR 150', feeLine2: '→ Driver receives SAR 4,850',
    },
    ur: { settings: 'ترتیبات', notifications: 'اطلاعات', language: 'زبان',
          switchRole: 'کردار بدلیں', privacy: 'رازداری', help: 'مدد',
          terms: 'شرائط', signOut: 'سائن آؤٹ', rating: 'ریٹنگ',
          trips: 'کل سفر', member: 'رکنیت', fee: 'پلیٹ فارم فیس', version: 'TruckLink v1.0.0',
          roleShipper: '📦 شپر', roleDriver: '🚛 ڈرائیور',
          feeDesc: `ٹرک لنک ہر مکمل ڈیل پر ${PLATFORM_FEE_PERCENT}% فلیٹ کمیشن لیتا ہے۔`,
          feeExample: 'مثال: 5,000 SAR ڈیل', feeLine1: '← ٹرک لنک 150 SAR رکھتا ہے', feeLine2: '← ڈرائیور کو 4,850 SAR ملتا ہے',
    },
    fr: { settings: 'Paramètres', notifications: 'Notifications', language: 'Langue',
          switchRole: 'Changer rôle', privacy: 'Confidentialité', help: 'Aide',
          terms: 'Conditions', signOut: 'Déconnexion', rating: 'Note',
          trips: 'Trajets', member: 'Membre', fee: 'Commission', version: 'TruckLink v1.0.0',
          roleShipper: '📦 Expéditeur', roleDriver: '🚛 Chauffeur',
          feeDesc: `TruckLink prend ${PLATFORM_FEE_PERCENT}% sur chaque deal. Déduit automatiquement.`,
          feeExample: 'Exemple: deal 5 000 SAR', feeLine1: '→ TruckLink garde 150 SAR', feeLine2: '→ Chauffeur reçoit 4 850 SAR',
    },
    hi: { settings: 'सेटिंग्स', notifications: 'सूचनाएं', language: 'भाषा',
          switchRole: 'भूमिका बदलें', privacy: 'गोपनीयता', help: 'सहायता',
          terms: 'नियम', signOut: 'साइन आउट', rating: 'रेटिंग',
          trips: 'कुल यात्राएं', member: 'सदस्य', fee: 'प्लेटफॉर्म शुल्क', version: 'TruckLink v1.0.0',
          roleShipper: '📦 शिपर', roleDriver: '🚛 ड्राइवर',
          feeDesc: `TruckLink हर पूरे सौदे पर ${PLATFORM_FEE_PERCENT}% कमीशन लेता है।`,
          feeExample: 'उदाहरण: 5,000 SAR का सौदा', feeLine1: '→ TruckLink 150 SAR रखता है', feeLine2: '→ ड्राइवर को 4,850 SAR मिलता है',
    },
    bn: { settings: 'সেটিংস', notifications: 'বিজ্ঞপ্তি', language: 'ভাষা',
          switchRole: 'ভূমিকা পরিবর্তন', privacy: 'গোপনীয়তা', help: 'সহায়তা',
          terms: 'শর্তাবলী', signOut: 'সাইন আউট', rating: 'রেটিং',
          trips: 'মোট ট্রিপ', member: 'সদস্য', fee: 'প্ল্যাটফর্ম ফি', version: 'TruckLink v1.0.0',
          roleShipper: '📦 শিপার', roleDriver: '🚛 চালক',
          feeDesc: `TruckLink প্রতিটি সম্পন্ন ডিলে ${PLATFORM_FEE_PERCENT}% কমিশন নেয়।`,
          feeExample: 'উদাহরণ: 5,000 SAR ডিল', feeLine1: '→ TruckLink 150 SAR রাখে', feeLine2: '→ চালক 4,850 SAR পান',
    },
    sw: { settings: 'Mipangilio', notifications: 'Arifa', language: 'Lugha',
          switchRole: 'Badilisha jukumu', privacy: 'Faragha', help: 'Msaada',
          terms: 'Masharti', signOut: 'Toka', rating: 'Ukadiriaji',
          trips: 'Safari', member: 'Mwanachama', fee: 'Ada ya Jukwaa', version: 'TruckLink v1.0.0',
          roleShipper: '📦 Mpakiaji', roleDriver: '🚛 Dereva',
          feeDesc: `TruckLink inachukua ${PLATFORM_FEE_PERCENT}% kwa kila deal iliyokamilika.`,
          feeExample: 'Mfano: deal ya SAR 5,000', feeLine1: '→ TruckLink inabaki SAR 150', feeLine2: '→ Dereva anapata SAR 4,850',
    },
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
          <Text style={styles.roleText}>{user.role === 'shipper' ? L.roleShipper : L.roleDriver}</Text>
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
        <Text style={[styles.feeInfoText, isRTL && styles.textRight]}>{L.feeDesc}</Text>
        <View style={styles.feeExample}>
          <Text style={[styles.feeExampleText, isRTL && styles.textRight]}>{L.feeExample}</Text>
          <Text style={[styles.feeExampleDetail, isRTL && styles.textRight]}>{L.feeLine1}</Text>
          <Text style={[styles.feeExampleDetail, isRTL && styles.textRight]}>{L.feeLine2}</Text>
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
