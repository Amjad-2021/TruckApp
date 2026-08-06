/**
 * HomeScreen.js
 * Role-aware home dashboard.
 * Shipper sees: Post Load + View Orders quick actions
 * Driver sees:  Find Loads + Update Availability quick actions
 */
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser }     from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { COLORS }      from '../utils/constants';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user }   = useUser();
  const { t, isRTL } = useLanguage();

  const role = user?.role ?? 'shipper';
  const name = user?.name || '—';
  const h = t.home;

  // ── Stats row ──────────────────────────────────────────────────────────────
  const stats = [
    { label: role === 'shipper' ? h.shipper.stat1 : h.driver.stat1, value: user?.activeCount  ?? 0 },
    { label: role === 'shipper' ? h.shipper.stat2 : h.driver.stat2, value: user?.negCount     ?? 0 },
    { label: role === 'shipper' ? h.shipper.stat3 : h.driver.stat3, value: user?.totalTrips   ?? 0 },
  ];

  // ── Quick-action cards ─────────────────────────────────────────────────────
  const actions = role === 'shipper'
    ? [
        {
          icon: '📦',
          title: h.shipper.action1,
          color: COLORS.primary,
          onPress: () => navigation.navigate('Post'),
        },
        {
          icon: '🧾',
          title: h.shipper.action2,
          color: COLORS.secondary,
          onPress: () => navigation.navigate('Orders'),
        },
        {
          icon: '🗺️',
          title: h.mapCard,
          color: '#5A8A5A',
          onPress: () => navigation.navigate('Map'),
        },
      ]
    : [
        {
          icon: '📋',
          title: h.driver.action1,
          color: COLORS.primary,
          onPress: () => navigation.navigate('Loads'),
        },
        {
          icon: '🚛',
          title: h.driver.action2,
          color: COLORS.secondary,
          onPress: () => navigation.navigate('Avail'),
        },
        {
          icon: '🗺️',
          title: h.mapCard,
          color: '#5A8A5A',
          onPress: () => navigation.navigate('Map'),
        },
      ];

  const tip = role === 'shipper' ? h.shipper.tip : h.driver.tip;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={[styles.header, isRTL && styles.rtl]}>
          <View>
            <Text style={[styles.greeting, isRTL && styles.textRight]}>
              {h.greeting(name)}
            </Text>
            <Text style={[styles.subtitle, isRTL && styles.textRight]}>
              {h.subtitle}
            </Text>
          </View>

          {/* Avatar / initials */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.initials || name[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        </View>

        {/* ── Role badge ──────────────────────────────────────────────────── */}
        <View style={[styles.roleBadge, { backgroundColor: role === 'driver' ? '#E8F0E8' : '#F0E8D8' }]}>
          <Text style={[styles.roleText, { color: role === 'driver' ? '#3A6A3A' : COLORS.primary }]}>
            {role === 'driver' ? '🚛 Driver' : '📦 Shipper'}
          </Text>
        </View>

        {/* ── Stats row ───────────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={[styles.statLabel, isRTL && styles.textRight]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Quick actions ───────────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>
          {h.actionsTitle}
        </Text>

        <View style={styles.actionsGrid}>
          {actions.map((a, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.actionCard, { borderLeftColor: a.color }]}
              onPress={a.onPress}
              activeOpacity={0.75}
            >
              <Text style={styles.actionIcon}>{a.icon}</Text>
              <Text style={[styles.actionTitle, isRTL && styles.textRight]}>
                {a.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Tip banner ──────────────────────────────────────────────────── */}
        <View style={styles.tipBanner}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={[styles.tipText, isRTL && styles.textRight]}>
            {tip}
          </Text>
        </View>

        {/* ── Recent activity placeholder ─────────────────────────────────── */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>
          {h.activityTitle}
        </Text>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{h.noActivity}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.bg },
  scroll:  { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  rtl: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.subtext,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  // Role badge
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 20,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.subtext,
    textAlign: 'center',
  },

  // Section titles
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },

  // Actions grid
  actionsGrid: {
    gap: 10,
    marginBottom: 20,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 14,
  },
  actionIcon: {
    fontSize: 26,
    width: 34,
    textAlign: 'center',
  },
  actionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },

  // Tip
  tipBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF8EC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
    gap: 10,
    alignItems: 'flex-start',
  },
  tipIcon: { fontSize: 18, marginTop: 1 },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 19,
  },

  // Empty state
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.subtext,
  },
});
