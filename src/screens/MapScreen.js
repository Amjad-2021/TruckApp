/**
 * MapScreen — Available Trucks (real backend data)
 *
 * NOTE: react-native-maps requires a native build (not Expo Go).
 * This screen uses a card list for Expo Go / web testing.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, TextInput, RefreshControl,
} from 'react-native';
import { COLORS, TRUCK_TYPES, CITIES } from '../utils/constants';
import { useLanguage } from '../context/LanguageContext';
import { getDrivers } from '../utils/api';

// Normalize API driver → shape TruckCard and NegotiationScreen expect
function normalizeDriver(d) {
  return {
    id:          d.id,
    driverName:  d.full_name,
    truckType:   d.truck_type,
    plateNumber: d.plate_number,
    truckColor:  d.truck_color,
    capacity:    String(d.capacity_tons ?? 0),
    pricePerTon: d.price_per_ton ?? 0,
    fromCity:    d.from_city,
    toCity:      d.to_city,
    rating:      d.rating ?? 0,
    trips:       d.total_trips ?? 0,
    isAvailable: d.is_available,
  };
}

export default function MapScreen({ navigation }) {
  const { t, isRTL, lang } = useLanguage();
  const m = t.map;

  const [trucks,         setTrucks]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [refreshing,     setRefreshing]     = useState(false);
  const [filterType,     setFilterType]     = useState('all');
  const [fromCityFilter, setFromCityFilter] = useState('');
  const [toCityFilter,   setToCityFilter]   = useState('');
  const [search,         setSearch]         = useState('');
  const [error,          setError]          = useState(null);

  const textAlign = isRTL ? 'right' : 'left';

  const fetchDrivers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (filterType !== 'all') filters.truck_type = filterType;
      if (fromCityFilter)       filters.from_city  = fromCityFilter;
      if (toCityFilter)         filters.to_city    = toCityFilter;
      if (search.trim())        filters.search     = search.trim();

      const data = await getDrivers(filters);
      setTrucks((data.drivers ?? []).map(normalizeDriver));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterType, fromCityFilter, toCityFilter, search]);

  // Reload whenever filters change (with small debounce for search)
  useEffect(() => {
    const timer = setTimeout(() => fetchDrivers(), search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchDrivers]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚛 {m.title}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{m.online(trucks.length)}</Text>
        </View>
      </View>

      {/* Privacy notice */}
      <View style={styles.privacyBanner}>
        <Text style={styles.privacyText}>{m.privacy}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder={m.search}
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={COLORS.subtext}
          textAlign={textAlign}
        />
      </View>

      {/* From city filter */}
      <View style={styles.destRow}>
        <Text style={[styles.destLabel, { textAlign }]}>{m.from}:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.destChips}>
          <DestChip label={m.anyCity} active={!fromCityFilter} onPress={() => setFromCityFilter('')} />
          {CITIES.map(c => (
            <DestChip
              key={c.id}
              label={c[lang] ?? c.en}
              active={fromCityFilter === c.id}
              onPress={() => setFromCityFilter(fromCityFilter === c.id ? '' : c.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* To city filter */}
      <View style={styles.destRow}>
        <Text style={[styles.destLabel, { textAlign }]}>{m.to}:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.destChips}>
          <DestChip label={m.anyCity} active={!toCityFilter} onPress={() => setToCityFilter('')} />
          {CITIES.map(c => (
            <DestChip
              key={c.id}
              label={c[lang] ?? c.en}
              active={toCityFilter === c.id}
              onPress={() => setToCityFilter(toCityFilter === c.id ? '' : c.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Truck type filter chips */}
      <View style={styles.filtersWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <FilterChip label={m.all} value="all" active={filterType === 'all'} onPress={setFilterType} />
          {TRUCK_TYPES.map(type => (
            <FilterChip
              key={type.id}
              label={`${type.icon} ${type[lang] ?? type.en}`}
              value={type.id}
              active={filterType === type.id}
              onPress={setFilterType}
            />
          ))}
        </ScrollView>
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity onPress={() => fetchDrivers()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Truck list */}
      {loading
        ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        : (
          <FlatList
            data={trucks}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <TruckCard
                truck={item}
                lang={lang}
                isRTL={isRTL}
                m={m}
                onPress={() => navigation.navigate('Negotiation', { truck: item })}
              />
            )}
            contentContainerStyle={{ padding: 14, paddingBottom: 30 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => fetchDrivers(true)} colors={[COLORS.primary]} />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyText}>{m.noTrucks}</Text>
              </View>
            }
          />
        )
      }
    </View>
  );
}

function TruckCard({ truck, lang, isRTL, m, onPress }) {
  const type     = TRUCK_TYPES.find(t => t.id === truck.truckType);
  const icon     = type?.icon ?? '🚛';
  const typeName = type ? (type[lang] ?? type.en) : truck.truckType;
  const fromCity = CITIES.find(c => c.id === truck.fromCity);
  const toCity   = CITIES.find(c => c.id === truck.toCity);
  const fromName = fromCity ? (fromCity[lang] ?? fromCity.en) : truck.fromCity;
  const toName   = toCity   ? (toCity[lang]   ?? toCity.en)   : truck.toCity;
  const rowDir   = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Top row */}
      <View style={[styles.cardTop, { flexDirection: rowDir }]}>
        <View style={styles.iconWrap}>
          <Text style={styles.truckIcon}>{icon}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.driverName, { textAlign }]}>{truck.driverName}</Text>
          <Text style={[styles.truckType, { textAlign }]}>{typeName}</Text>
        </View>
        <View style={styles.ratingWrap}>
          <Text style={styles.ratingText}>⭐ {truck.rating}</Text>
          <Text style={styles.tripsText}>{truck.trips} {m.trips}</Text>
        </View>
      </View>

      {/* Route */}
      <View style={[styles.routeRow, { flexDirection: rowDir }]}>
        <View style={styles.cityBox}>
          <Text style={[styles.cityLabel, { textAlign }]}>{m.from}</Text>
          <Text style={[styles.cityName, { textAlign }]}>📍 {fromName}</Text>
        </View>
        <Text style={styles.routeArrow}>{isRTL ? '←' : '→'}</Text>
        <View style={styles.cityBox}>
          <Text style={[styles.cityLabel, { textAlign }]}>{m.to}</Text>
          <Text style={[styles.cityName, { textAlign }]}>📍 {toName}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={[styles.cardFooter, { flexDirection: rowDir }]}>
        <View style={[styles.footerLeft, { flexDirection: rowDir }]}>
          <Text style={styles.capacity}>⚖️ {truck.capacity}T</Text>
          {truck.pricePerTon > 0 && (
            <Text style={styles.price}>{truck.pricePerTon} {m.perTon}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.requestBtn} onPress={onPress}>
          <Text style={styles.requestBtnText}>{m.request}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function FilterChip({ label, value, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={() => onPress(value)}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function DestChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.destChip, active && styles.destChipActive]}
      onPress={onPress}
    >
      <Text style={[styles.destChipText, active && styles.destChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.bg },
  header:         { backgroundColor: COLORS.primary, paddingTop: 54, paddingBottom: 16,
                    paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle:    { fontSize: 20, fontWeight: '800', color: '#fff' },
  countBadge:     { backgroundColor: COLORS.secondary, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  countText:      { color: '#fff', fontSize: 12, fontWeight: '700' },
  privacyBanner:  { backgroundColor: COLORS.primary + 'DD', paddingVertical: 7, paddingHorizontal: 16 },
  privacyText:    { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '500' },
  searchWrap:     { padding: 12, paddingBottom: 6 },
  searchInput:    { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16,
                    paddingVertical: 11, fontSize: 14, color: COLORS.text, elevation: 2,
                    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
  destRow:        { flexDirection: 'row', alignItems: 'center', paddingLeft: 14, paddingBottom: 6 },
  destLabel:      { fontSize: 12, fontWeight: '700', color: COLORS.subtext, marginRight: 6, minWidth: 24 },
  destChips:      { paddingRight: 14, gap: 6 },
  destChip:       { backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 5,
                    borderWidth: 1.5, borderColor: COLORS.border },
  destChipActive: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  destChipText:   { fontSize: 12, fontWeight: '600', color: COLORS.text },
  destChipTextActive: { color: '#fff' },
  filtersWrap:    { paddingBottom: 8 },
  filters:        { paddingHorizontal: 12, gap: 8 },
  chip:           { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
                    borderWidth: 1.5, borderColor: COLORS.border, elevation: 1 },
  chipActive:     { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText:       { fontSize: 12, fontWeight: '600', color: COLORS.text },
  chipTextActive: { color: '#fff' },
  errorBanner:    { backgroundColor: COLORS.danger + '15', margin: 12, borderRadius: 10, padding: 12,
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  errorText:      { fontSize: 13, color: COLORS.danger, flex: 1 },
  retryText:      { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  card:           { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
                    elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6 },
  cardTop:        { alignItems: 'center', marginBottom: 14, gap: 10 },
  iconWrap:       { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.primary + '15',
                    alignItems: 'center', justifyContent: 'center' },
  truckIcon:      { fontSize: 26 },
  cardInfo:       { flex: 1 },
  driverName:     { fontSize: 15, fontWeight: '800', color: COLORS.text },
  truckType:      { fontSize: 12, color: COLORS.subtext, marginTop: 2 },
  ratingWrap:     { alignItems: 'flex-end' },
  ratingText:     { fontSize: 13, fontWeight: '700', color: COLORS.text },
  tripsText:      { fontSize: 11, color: COLORS.subtext, marginTop: 2 },
  routeRow:       { alignItems: 'center', backgroundColor: COLORS.bg,
                    borderRadius: 12, padding: 12, marginBottom: 12, gap: 10 },
  cityBox:        { flex: 1 },
  cityLabel:      { fontSize: 10, fontWeight: '700', color: COLORS.subtext, letterSpacing: 0.5 },
  cityName:       { fontSize: 13, fontWeight: '700', color: COLORS.primary, marginTop: 2 },
  routeArrow:     { fontSize: 18, color: COLORS.secondary, fontWeight: '800' },
  cardFooter:     { alignItems: 'center', justifyContent: 'space-between',
                    borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  footerLeft:     { alignItems: 'center', gap: 12 },
  capacity:       { fontSize: 12, color: COLORS.subtext, fontWeight: '600' },
  price:          { fontSize: 13, color: COLORS.success, fontWeight: '700' },
  requestBtn:     { backgroundColor: COLORS.primary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  requestBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  empty:          { alignItems: 'center', marginTop: 60 },
  emptyIcon:      { fontSize: 48, marginBottom: 12 },
  emptyText:      { fontSize: 15, color: COLORS.subtext },
});
