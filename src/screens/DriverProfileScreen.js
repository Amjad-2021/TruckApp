import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { COLORS, TRUCK_TYPES, CITIES } from '../utils/constants';
import { useLanguage } from '../context/LanguageContext';

export default function DriverProfileScreen({ route, navigation }) {
  const { truck } = route.params;
  const { lang, isRTL } = useLanguage();

  const ar = lang === 'ar';
  const textAlign  = isRTL ? 'right' : 'left';
  const rowDir     = isRTL ? 'row-reverse' : 'row';

  const type     = TRUCK_TYPES.find(t => t.id === truck.truckType);
  const icon     = type?.icon ?? '🚛';
  const typeName = type ? type[lang] : truck.truckType;
  const fromCity = CITIES.find(c => c.id === truck.fromCity);
  const toCity   = CITIES.find(c => c.id === truck.toCity);
  const fromName = fromCity ? fromCity[lang] : truck.fromCity;
  const toName   = toCity   ? toCity[lang]   : truck.toCity;

  // Star bar helper
  const rating = parseFloat(truck.rating) || 0;
  const stars  = Math.round(rating);

  return (
    <View style={styles.container}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>{isRTL ? 'رجوع ←' : '← Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{ar ? 'ملف السائق' : 'Driver Profile'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Avatar + name ──────────────────────────────────────────────────── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarIcon}>{icon}</Text>
          </View>
          <Text style={[styles.driverName, { textAlign }]}>{truck.driverName}</Text>
          <Text style={[styles.truckTypeBadge]}>{typeName}</Text>

          {/* Stars */}
          <View style={[styles.starsRow, { flexDirection: rowDir }]}>
            {[1,2,3,4,5].map(i => (
              <Text key={i} style={[styles.star, i <= stars && styles.starFilled]}>★</Text>
            ))}
            <Text style={styles.ratingNum}>{rating.toFixed(1)}</Text>
          </View>
        </View>

        {/* ── Stats row ──────────────────────────────────────────────────────── */}
        <View style={[styles.statsRow, { flexDirection: rowDir }]}>
          <StatBox
            icon="🚚"
            value={parseInt(truck.trips) || 0}
            label={ar ? 'رحلة مكتملة' : 'Trips Done'}
          />
          <StatBox
            icon="⚖️"
            value={`${truck.capacity || '—'}T`}
            label={ar ? 'السعة' : 'Capacity'}
          />
          {parseFloat(truck.pricePerTon) > 0 && (
            <StatBox
              icon="💰"
              value={`${parseFloat(truck.pricePerTon)}`}
              label={ar ? 'ريال/طن' : 'SAR/ton'}
            />
          )}
        </View>

        {/* ── Route card ─────────────────────────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { textAlign }]}>
            {ar ? '🗺️ المسار' : '🗺️ Route'}
          </Text>
          <View style={[styles.routeRow, { flexDirection: rowDir }]}>
            <View style={styles.cityBlock}>
              <Text style={styles.cityLabel}>{ar ? 'من' : 'From'}</Text>
              <Text style={[styles.cityValue, { textAlign }]}>📍 {fromName}</Text>
            </View>
            <Text style={styles.arrow}>{isRTL ? '←' : '→'}</Text>
            <View style={styles.cityBlock}>
              <Text style={styles.cityLabel}>{ar ? 'إلى' : 'To'}</Text>
              <Text style={[styles.cityValue, { textAlign }]}>📍 {toName}</Text>
            </View>
          </View>
        </View>

        {/* ── Truck details ──────────────────────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { textAlign }]}>
            {ar ? '🚛 بيانات الشاحنة' : '🚛 Truck Details'}
          </Text>
          <InfoRow
            label={ar ? 'نوع الشاحنة' : 'Truck Type'}
            value={`${icon} ${typeName}`}
            textAlign={textAlign}
          />
          <InfoRow
            label={ar ? 'السعة' : 'Capacity'}
            value={`${truck.capacity} ${ar ? 'طن' : 'tons'}`}
            textAlign={textAlign}
          />
          {truck.pricePerTon > 0 && (
            <InfoRow
              label={ar ? 'السعر لكل طن' : 'Price per Ton'}
              value={`${truck.pricePerTon} ${ar ? 'ريال' : 'SAR'}`}
              textAlign={textAlign}
              highlight
            />
          )}
        </View>

        {/* ── Privacy note ───────────────────────────────────────────────────── */}
        <View style={styles.privacyNote}>
          <Text style={[styles.privacyText, { textAlign }]}>
            🔒 {ar
              ? 'الموقع الدقيق للسائق لا يُشارك إلا بعد إبرام الصفقة.'
              : "The driver's exact location is only shared after a deal is confirmed."}
          </Text>
        </View>

        {/* ── Request button ─────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.requestBtn}
          onPress={() => navigation.navigate('Negotiation', { truck })}
          activeOpacity={0.85}
        >
          <Text style={styles.requestBtnText}>
            {ar ? '💬 طلب الشاحنة والتفاوض' : '💬 Request & Negotiate'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.hint, { textAlign: 'center' }]}>
          {ar
            ? 'ستتمكن من التفاوض على السعر قبل تأكيد الصفقة.'
            : 'You can negotiate the price before confirming the deal.'}
        </Text>

      </ScrollView>
    </View>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatBox({ icon, value, label }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({ label, value, textAlign, highlight }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { textAlign }]}>{label}</Text>
      <Text style={[styles.infoValue, highlight && styles.infoValueHL, { textAlign }]}>{value}</Text>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 18,
  },
  backBtn:   { marginBottom: 10 },
  backText:  { color: 'rgba(255,255,255,0.85)', fontWeight: '600', fontSize: 14 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center' },

  content: { padding: 18, paddingBottom: 40 },

  // Avatar
  avatarSection: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: COLORS.primary + '18',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.primary + '30',
    marginBottom: 12,
  },
  avatarIcon:    { fontSize: 44 },
  driverName:    { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  truckTypeBadge:{ fontSize: 13, color: COLORS.subtext, fontWeight: '600', marginBottom: 10 },

  starsRow:   { alignItems: 'center', gap: 2, marginTop: 4 },
  star:       { fontSize: 22, color: COLORS.border },
  starFilled: { color: '#F5A623' },
  ratingNum:  { fontSize: 15, fontWeight: '700', color: COLORS.text, marginLeft: 6, marginRight: 6 },

  // Stats
  statsRow:  {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
    justifyContent: 'space-around',
  },
  statBox:   { alignItems: 'center', flex: 1 },
  statIcon:  { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 11, color: COLORS.subtext, fontWeight: '600', marginTop: 2 },

  // Section card
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginBottom: 14 },

  // Route
  routeRow:  { alignItems: 'center', gap: 10 },
  cityBlock: { flex: 1 },
  cityLabel: { fontSize: 10, fontWeight: '700', color: COLORS.subtext, letterSpacing: 0.5, marginBottom: 4 },
  cityValue: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  arrow:     { fontSize: 20, color: COLORS.secondary, fontWeight: '800' },

  // Info rows
  infoRow:    { flexDirection: 'row', justifyContent: 'space-between',
                paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoLabel:  { fontSize: 13, color: COLORS.subtext, fontWeight: '600' },
  infoValue:  { fontSize: 13, color: COLORS.text, fontWeight: '700' },
  infoValueHL:{ color: COLORS.success },

  // Privacy
  privacyNote: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  privacyText: { fontSize: 12, color: COLORS.primary, fontWeight: '600', lineHeight: 18 },

  // Request button
  requestBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    paddingVertical: 17,
    alignItems: 'center',
    marginBottom: 14,
    elevation: 3,
    shadowColor: COLORS.primary, shadowOpacity: 0.35, shadowRadius: 8,
  },
  requestBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  hint: { fontSize: 12, color: COLORS.subtext, lineHeight: 18 },
});
