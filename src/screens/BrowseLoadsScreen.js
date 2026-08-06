import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput, RefreshControl,
} from 'react-native';
import { COLORS, CITIES, TRUCK_TYPES } from '../utils/constants';
import { formatSAR, timeAgo } from '../utils/helpers';
import { getLoads } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

// Normalize DB snake_case → camelCase for the UI
function normalizeLoad(l) {
  return {
    id:          l.id,
    fromCity:    l.from_city,
    toCity:      l.to_city,
    cargoType:   l.cargo_type,
    weight:      l.weight_tons,
    budget:      l.offered_price,
    status:      l.status,
    shipperName: l.shipper_name ?? 'Unknown',
    pickupDate:  l.pickup_date,
    description: l.notes,
    truckType:   l.truck_type ?? '',
    createdAt:   l.created_at ? new Date(l.created_at) : new Date(),
  };
}

export default function BrowseLoadsScreen({ navigation }) {
  const { lang } = useLanguage();
  const [loads,      setLoads]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter,   setToFilter]   = useState('');
  const [search,     setSearch]     = useState('');
  const [error,      setError]      = useState(null);

  const fetchLoads = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const filters = { status: 'open' };
      if (fromFilter) filters.from_city = fromFilter;
      if (toFilter)   filters.to_city   = toFilter;
      const data = await getLoads(filters);
      setLoads((data.loads ?? []).map(normalizeLoad));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fromFilter, toFilter]);

  useEffect(() => { fetchLoads(); }, [fetchLoads]);

  const filtered = search
    ? loads.filter(l =>
        l.cargoType.toLowerCase().includes(search.toLowerCase()) ||
        l.fromCity.toLowerCase().includes(search.toLowerCase()) ||
        l.toCity.toLowerCase().includes(search.toLowerCase())
      )
    : loads;

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍  Search cargo, city..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={COLORS.subtext}
        />
      </View>

      {/* Route filter */}
      <View style={styles.filterRow}>
        <CityDropdown label="From" value={fromFilter} onSelect={setFromFilter} lang={lang} />
        <Text style={styles.arrow}>→</Text>
        <CityDropdown label="To"   value={toFilter}   onSelect={setToFilter}   lang={lang} />
        {(fromFilter || toFilter) && (
          <TouchableOpacity onPress={() => { setFromFilter(''); setToFilter(''); }} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>✕ Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>{filtered.length} loads available</Text>
        <Text style={styles.sortLabel}>Newest first</Text>
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity onPress={() => fetchLoads()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading
        ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        : (
          <FlatList
            data={filtered}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <LoadCard load={item} lang={lang} onPress={() => navigation.navigate('Negotiation', { load: item })} />
            )}
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => fetchLoads(true)} colors={[COLORS.primary]} />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={styles.emptyText}>No loads match your filters</Text>
              </View>
            }
          />
        )
      }
    </View>
  );
}

function LoadCard({ load, lang, onPress }) {
  const TRUCK  = TRUCK_TYPES.find(t => t.id === load.truckType);
  const fromC  = CITIES.find(c => c.id === load.fromCity);
  const toC    = CITIES.find(c => c.id === load.toCity);
  const fromName = fromC ? (fromC[lang] ?? fromC.en) : load.fromCity;
  const toName   = toC   ? (toC[lang]   ?? toC.en)   : load.toCity;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <View style={styles.routeBadge}>
          <Text style={styles.routeText}>{fromName}  →  {toName}</Text>
        </View>
        <Text style={styles.budgetText}>{formatSAR(load.budget)}</Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cargoType}>{load.cargoType}</Text>
        {load.description ? <Text style={styles.desc} numberOfLines={1}>{load.description}</Text> : null}
      </View>

      <View style={styles.cardFooter}>
        <Chip icon="⚖️" label={`${load.weight} tons`} />
        {TRUCK && <Chip icon={TRUCK.icon} label={TRUCK[lang] ?? TRUCK.en} />}
        <Chip icon="📅" label={load.pickupDate || 'ASAP'} />
        <Text style={styles.timeAgo}>{timeAgo(load.createdAt)}</Text>
      </View>

      <View style={styles.shipperRow}>
        <Text style={styles.shipperIcon}>👤</Text>
        <Text style={styles.shipperName}>{load.shipperName}</Text>
        <TouchableOpacity style={styles.bidBtn} onPress={onPress}>
          <Text style={styles.bidBtnText}>Place Bid →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function Chip({ icon, label }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipIcon}>{icon}</Text>
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

function CityDropdown({ label, value, onSelect, lang }) {
  const [open, setOpen] = useState(false);
  const selected = CITIES.find(c => c.id === value);
  const displayLabel = selected ? (selected[lang] ?? selected.en) : label;

  return (
    <View style={styles.cityDrop}>
      <TouchableOpacity style={styles.cityDropBtn} onPress={() => setOpen(!open)}>
        <Text style={styles.cityDropText}>{displayLabel} ▾</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.cityDropMenu}>
          <TouchableOpacity style={styles.cityDropItem} onPress={() => { onSelect(''); setOpen(false); }}>
            <Text style={styles.cityDropItemText}>Any city</Text>
          </TouchableOpacity>
          {CITIES.map(c => (
            <TouchableOpacity key={c.id} style={styles.cityDropItem} onPress={() => { onSelect(c.id); setOpen(false); }}>
              <Text style={[styles.cityDropItemText, value === c.id && { color: COLORS.primary, fontWeight: '700' }]}>
                {c[lang] ?? c.en}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.bg },
  searchWrap:      { padding: 14, paddingBottom: 0 },
  searchInput:     { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11,
                     fontSize: 14, color: COLORS.text, elevation: 2 },
  filterRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 6 },
  arrow:           { color: COLORS.primary, fontWeight: '700', fontSize: 16 },
  clearBtn:        { backgroundColor: COLORS.danger + '20', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  clearBtnText:    { color: COLORS.danger, fontSize: 12, fontWeight: '700' },
  cityDrop:        { flex: 1, position: 'relative' },
  cityDropBtn:     { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 9, elevation: 1 },
  cityDropText:    { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  cityDropMenu:    { position: 'absolute', top: 38, left: 0, right: 0, backgroundColor: '#fff',
                     borderRadius: 10, elevation: 8, zIndex: 100, maxHeight: 200,
                     borderWidth: 1, borderColor: COLORS.border },
  cityDropItem:    { padding: 11, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  cityDropItemText:{ fontSize: 13, color: COLORS.text },
  resultsHeader:   { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 6 },
  resultsCount:    { fontSize: 13, fontWeight: '700', color: COLORS.text },
  sortLabel:       { fontSize: 12, color: COLORS.subtext },
  errorBanner:     { backgroundColor: COLORS.danger + '15', margin: 12, borderRadius: 10, padding: 12,
                     flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  errorText:       { fontSize: 13, color: COLORS.danger, flex: 1 },
  retryText:       { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  card:            { backgroundColor: '#fff', marginHorizontal: 14, marginBottom: 12, borderRadius: 14,
                     padding: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6 },
  cardHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  routeBadge:      { backgroundColor: COLORS.primary + '15', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  routeText:       { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  budgetText:      { fontSize: 18, fontWeight: '800', color: COLORS.success },
  cardBody:        { marginBottom: 10 },
  cargoType:       { fontSize: 15, fontWeight: '700', color: COLORS.text },
  desc:            { fontSize: 12, color: COLORS.subtext, marginTop: 3 },
  cardFooter:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12, alignItems: 'center' },
  chip:            { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg,
                     borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4 },
  chipIcon:        { fontSize: 12, marginRight: 3 },
  chipLabel:       { fontSize: 11, color: COLORS.text, fontWeight: '600' },
  timeAgo:         { marginLeft: 'auto', fontSize: 11, color: COLORS.subtext },
  shipperRow:      { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1,
                     borderTopColor: COLORS.border, paddingTop: 10 },
  shipperIcon:     { fontSize: 16, marginRight: 6 },
  shipperName:     { flex: 1, fontSize: 13, color: COLORS.subtext, fontWeight: '600' },
  bidBtn:          { backgroundColor: COLORS.secondary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  bidBtnText:      { color: '#fff', fontWeight: '700', fontSize: 12 },
  empty:           { alignItems: 'center', marginTop: 60 },
  emptyIcon:       { fontSize: 48, marginBottom: 12 },
  emptyText:       { fontSize: 15, color: COLORS.subtext },
});
