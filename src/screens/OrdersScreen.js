import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { COLORS, LOAD_STATUS, CITIES } from '../utils/constants';
import { formatSAR, timeAgo, calculateFee } from '../utils/helpers';
import { getMyOrders } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

// Normalize DB row → camelCase for UI
function normalizeOrder(o) {
  const fromCity = CITIES.find(c => c.id === o.from_city);
  const toCity   = CITIES.find(c => c.id === o.to_city);
  return {
    id:           o.id,
    fromCity:     o.from_city,
    toCity:       o.to_city,
    fromCityName: fromCity?.en ?? o.from_city,
    toCityName:   toCity?.en   ?? o.to_city,
    cargoType:    o.cargo_type,
    weight:       o.weight_tons,
    agreedPrice:  o.agreed_price,
    offeredPrice: o.offered_price,
    status:       o.status,
    driverName:   o.driver_name ?? null,
    shipperName:  o.shipper_name ?? null,
    truckType:    o.truck_type ?? null,
    plateNumber:  o.plate_number ?? null,
    createdAt:    o.created_at ? new Date(o.created_at) : new Date(),
    updatedAt:    o.updated_at ? new Date(o.updated_at) : new Date(),
  };
}

const STATUS_CONFIG = {
  [LOAD_STATUS.OPEN]:        { label: 'Open',        color: COLORS.primary,   icon: '📋' },
  [LOAD_STATUS.NEGOTIATING]: { label: 'Negotiating', color: COLORS.warning,   icon: '🤝' },
  [LOAD_STATUS.CONFIRMED]:   { label: 'Confirmed',   color: COLORS.secondary, icon: '✅' },
  [LOAD_STATUS.IN_TRANSIT]:  { label: 'In Transit',  color: COLORS.success,   icon: '🚛' },
  [LOAD_STATUS.DELIVERED]:   { label: 'Delivered',   color: '#27AE60',        icon: '📦' },
  [LOAD_STATUS.CANCELLED]:   { label: 'Cancelled',   color: COLORS.danger,    icon: '❌' },
};

export default function OrdersScreen({ navigation }) {
  const { lang } = useLanguage();
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab,        setTab]        = useState('active');
  const [error,      setError]      = useState(null);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const data = await getMyOrders();
      setOrders((data.orders ?? []).map(normalizeOrder));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const activeOrders    = orders.filter(o => ![LOAD_STATUS.DELIVERED, LOAD_STATUS.CANCELLED].includes(o.status));
  const completedOrders = orders.filter(o =>  [LOAD_STATUS.DELIVERED, LOAD_STATUS.CANCELLED].includes(o.status));
  const displayed       = tab === 'active' ? activeOrders : completedOrders;

  const totalValue = completedOrders
    .filter(o => o.status === LOAD_STATUS.DELIVERED && o.agreedPrice)
    .reduce((sum, o) => sum + parseFloat(o.agreedPrice), 0);

  return (
    <View style={styles.container}>
      {/* Stats bar */}
      <View style={styles.statsBar}>
        <StatTile icon="📦" label="Total Orders"  value={orders.length} />
        <StatTile icon="🚛" label="Active"        value={activeOrders.length} color={COLORS.secondary} />
        <StatTile icon="✅" label="Completed"     value={completedOrders.filter(o => o.status === LOAD_STATUS.DELIVERED).length} color="#27AE60" />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'active'    && styles.tabActive]} onPress={() => setTab('active')}>
          <Text style={[styles.tabText, tab === 'active'    && styles.tabTextActive]}>Active ({activeOrders.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'completed' && styles.tabActive]} onPress={() => setTab('completed')}>
          <Text style={[styles.tabText, tab === 'completed' && styles.tabTextActive]}>Completed ({completedOrders.length})</Text>
        </TouchableOpacity>
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity onPress={() => fetchOrders()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading
        ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        : (
          <FlatList
            data={displayed}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <OrderCard
                order={item}
                lang={lang}
                onPress={() => navigation.navigate('Negotiation', { load: item })}
              />
            )}
            contentContainerStyle={{ padding: 14 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => fetchOrders(true)} colors={[COLORS.primary]} />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>{tab === 'active' ? '📭' : '📦'}</Text>
                <Text style={styles.emptyText}>
                  {tab === 'active' ? 'No active orders yet.' : 'No completed orders yet.'}
                </Text>
              </View>
            }
          />
        )
      }
    </View>
  );
}

function OrderCard({ order, lang, onPress }) {
  const cfg  = STATUS_CONFIG[order.status] ?? STATUS_CONFIG[LOAD_STATUS.OPEN];
  const price = order.agreedPrice ?? order.offeredPrice;
  const fee  = price ? calculateFee(parseFloat(price)) : null;

  // City display
  const fromCity = CITIES.find(c => c.id === order.fromCity);
  const toCity   = CITIES.find(c => c.id === order.toCity);
  const fromName = fromCity ? (fromCity[lang] ?? fromCity.en) : order.fromCity;
  const toName   = toCity   ? (toCity[lang]   ?? toCity.en)   : order.toCity;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Status */}
      <View style={[styles.statusBadge, { backgroundColor: cfg.color + '20', borderColor: cfg.color }]}>
        <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.icon}  {cfg.label}</Text>
      </View>

      {/* Route */}
      <Text style={styles.route}>{fromName}  →  {toName}</Text>
      <Text style={styles.cargo}>{order.cargoType}  ·  {order.weight} tons</Text>

      {/* Driver or Shipper */}
      {order.driverName && (
        <View style={styles.personRow}>
          <Text style={styles.personIcon}>🚛</Text>
          <Text style={styles.personName}>{order.driverName}</Text>
          {order.plateNumber && <Text style={styles.plateBadge}>{order.plateNumber}</Text>}
        </View>
      )}

      {/* Price breakdown */}
      {fee && (
        <View style={styles.priceBox}>
          <PriceRow label="Agreed price"      value={formatSAR(price)} />
          <PriceRow label="Platform fee (3%)" value={formatSAR(fee.platformFee)}    highlight />
          <PriceRow label="Driver receives"   value={formatSAR(fee.driverReceives)} />
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerTime}>{timeAgo(order.updatedAt)}</Text>
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.viewChat}>View Chat →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function StatTile({ icon, label, value, color }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, color && { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function PriceRow({ label, value, highlight }) {
  return (
    <View style={styles.priceRow}>
      <Text style={[styles.priceLabel, highlight && { color: COLORS.secondary }]}>{label}</Text>
      <Text style={[styles.priceValue, highlight && { color: COLORS.secondary, fontWeight: '800' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bg },
  statsBar:     { flexDirection: 'row', backgroundColor: COLORS.primary, paddingVertical: 16, paddingHorizontal: 12 },
  statTile:     { flex: 1, alignItems: 'center' },
  statIcon:     { fontSize: 20, marginBottom: 2 },
  statValue:    { fontSize: 16, fontWeight: '800', color: '#fff' },
  statLabel:    { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  tabs:         { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab:          { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:    { borderBottomColor: COLORS.primary },
  tabText:      { fontSize: 13, fontWeight: '600', color: COLORS.subtext },
  tabTextActive:{ color: COLORS.primary },
  errorBanner:  { backgroundColor: COLORS.danger + '15', margin: 12, borderRadius: 10, padding: 12,
                  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  errorText:    { fontSize: 13, color: COLORS.danger, flex: 1 },
  retryText:    { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  card:         { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12,
                  elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 5 },
  statusBadge:  { alignSelf: 'flex-start', borderRadius: 20, borderWidth: 1.5,
                  paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10 },
  statusText:   { fontSize: 12, fontWeight: '700' },
  route:        { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  cargo:        { fontSize: 13, color: COLORS.subtext, marginBottom: 10 },
  personRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 6 },
  personIcon:   { fontSize: 16 },
  personName:   { fontSize: 13, color: COLORS.text, fontWeight: '600', flex: 1 },
  plateBadge:   { backgroundColor: COLORS.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  priceBox:     { backgroundColor: COLORS.bg, borderRadius: 10, padding: 12, marginBottom: 10 },
  priceRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  priceLabel:   { fontSize: 12, color: COLORS.subtext },
  priceValue:   { fontSize: 12, color: COLORS.text, fontWeight: '600' },
  footer:       { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1,
                  borderTopColor: COLORS.border, paddingTop: 10 },
  footerTime:   { fontSize: 11, color: COLORS.subtext },
  viewChat:     { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  empty:        { alignItems: 'center', marginTop: 60 },
  emptyIcon:    { fontSize: 48, marginBottom: 12 },
  emptyText:    { fontSize: 15, color: COLORS.subtext },
});
