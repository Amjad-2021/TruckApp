import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert, Switch,
} from 'react-native';
import { COLORS, CITIES, TRUCK_TYPES } from '../utils/constants';
import { getMyDriverProfile, updateDriverProfile } from '../utils/api';

export default function DriverAvailabilityScreen({ navigation }) {
  const [form, setForm] = useState({
    from_city:    '',
    to_city:      '',
    truck_type:   '',
    capacity_tons:'',
    plate_number: '',
    price_per_ton:'',
    notes:        '',
  });
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading,     setLoading]     = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [driverId,    setDriverId]    = useState(null);

  // Pre-fill form with existing driver profile on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await getMyDriverProfile();
        if (data?.driver) {
          const d = data.driver;
          setDriverId(d.id);
          setIsAvailable(!!d.is_available);
          setForm({
            from_city:    d.from_city    ?? '',
            to_city:      d.to_city      ?? '',
            truck_type:   d.truck_type   ?? '',
            capacity_tons:String(d.capacity_tons ?? ''),
            plate_number: d.plate_number ?? '',
            price_per_ton:String(d.price_per_ton ?? ''),
            notes:        d.notes        ?? '',
          });
        }
      } catch {
        // No driver profile yet — will be created on POST /api/drivers instead
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    const required = ['from_city', 'to_city', 'truck_type', 'capacity_tons'];
    for (const f of required) {
      if (!form[f]) {
        Alert.alert('Missing Info', `Please fill in ${f.replace(/_/g, ' ')}`);
        return;
      }
    }

    if (!driverId) {
      Alert.alert(
        'Driver Profile Missing',
        'Please complete your driver registration first.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      await updateDriverProfile(driverId, {
        from_city:     form.from_city,
        to_city:       form.to_city,
        truck_type:    form.truck_type,
        capacity_tons: parseFloat(form.capacity_tons) || 0,
        plate_number:  form.plate_number,
        price_per_ton: parseFloat(form.price_per_ton) || 0,
        is_available:  isAvailable ? 1 : 0,
      });

      Alert.alert('✅ Availability Updated!', 'Shippers can now find your truck on the map.', [
        { text: 'View Map', onPress: () => navigation.navigate('Map') },
        { text: 'OK' },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update availability.');
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Set Availability</Text>
      </View>

      {/* Availability toggle */}
      <View style={styles.toggleCard}>
        <View style={styles.toggleLeft}>
          <Text style={styles.toggleIcon}>{isAvailable ? '🟢' : '🔴'}</Text>
          <View>
            <Text style={styles.toggleTitle}>{isAvailable ? 'Available for Loads' : 'Not Available'}</Text>
            <Text style={styles.toggleSub}>
              {isAvailable ? 'Your truck will appear on the map.' : "You're hidden from shippers."}
            </Text>
          </View>
        </View>
        <Switch
          value={isAvailable}
          onValueChange={setIsAvailable}
          trackColor={{ false: COLORS.border, true: COLORS.success }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.card}>
        {/* Route */}
        <Text style={styles.sectionTitle}>🗺️ Your Route</Text>
        <Text style={styles.label}>From (Current / Pickup City)</Text>
        <CityPicker selected={form.from_city} onSelect={v => update('from_city', v)} exclude={form.to_city} />
        <Text style={[styles.label, {marginTop: 14}]}>To (Destination City)</Text>
        <CityPicker selected={form.to_city}   onSelect={v => update('to_city',   v)} exclude={form.from_city} />

        {/* Truck info */}
        <Text style={[styles.sectionTitle, {marginTop: 22}]}>🚛 Truck Details</Text>
        <Text style={styles.label}>Truck Type</Text>
        <View style={styles.chipGrid}>
          {TRUCK_TYPES.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.chip, form.truck_type === t.id && styles.chipActive]}
              onPress={() => update('truck_type', t.id)}
            >
              <Text style={[styles.chipText, form.truck_type === t.id && styles.chipTextActive]}>
                {t.icon} {t.en}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, {marginTop: 14}]}>Capacity (tons)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 20"
          value={form.capacity_tons}
          onChangeText={v => update('capacity_tons', v)}
          keyboardType="numeric"
          placeholderTextColor={COLORS.subtext}
        />

        <Text style={[styles.label, {marginTop: 14}]}>License Plate</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. ABC 1234"
          value={form.plate_number}
          onChangeText={v => update('plate_number', v)}
          autoCapitalize="characters"
          placeholderTextColor={COLORS.subtext}
        />

        {/* Pricing */}
        <Text style={[styles.sectionTitle, {marginTop: 22}]}>💰 Pricing</Text>
        <Text style={styles.label}>Price per Ton (SAR) — optional</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 300 (leave blank to negotiate)"
          value={form.price_per_ton}
          onChangeText={v => update('price_per_ton', v)}
          keyboardType="numeric"
          placeholderTextColor={COLORS.subtext}
        />

        <View style={styles.privacyNote}>
          <Text style={styles.privacyNoteText}>
            🔒 Privacy: Your exact GPS is never shown to shippers. Only city-level location is displayed until a deal is confirmed.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.btnDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>💾  Save & Go Live</Text>
          }
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function CityPicker({ selected, onSelect, exclude }) {
  const [open, setOpen] = useState(false);
  const avail = CITIES.filter(c => c.id !== exclude);
  const selectedCity = CITIES.find(c => c.id === selected);

  return (
    <View style={{ zIndex: open ? 10 : 1 }}>
      <TouchableOpacity style={styles.input} onPress={() => setOpen(!open)}>
        <Text style={selectedCity ? styles.inputText : styles.placeholder}>
          {selectedCity ? selectedCity.en : 'Select city...'}
        </Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdown}>
          {avail.map(c => (
            <TouchableOpacity
              key={c.id}
              style={styles.dropItem}
              onPress={() => { onSelect(c.id); setOpen(false); }}
            >
              <Text style={[styles.dropItemText, selected === c.id && { color: COLORS.primary, fontWeight: '700' }]}>
                📍 {c.en}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flexGrow: 1, backgroundColor: COLORS.bg, padding: 20, paddingTop: 54 },
  header:         { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  back:           { fontSize: 22, color: COLORS.primary, marginRight: 12 },
  title:          { fontSize: 22, fontWeight: '800', color: COLORS.text },
  toggleCard:     { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14,
                    flexDirection: 'row', alignItems: 'center', elevation: 2 },
  toggleLeft:     { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  toggleIcon:     { fontSize: 26 },
  toggleTitle:    { fontSize: 15, fontWeight: '700', color: COLORS.text },
  toggleSub:      { fontSize: 12, color: COLORS.subtext },
  card:           { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 3 },
  sectionTitle:   { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 14 },
  label:          { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  input:          { backgroundColor: COLORS.bg, borderRadius: 10, paddingHorizontal: 14,
                    paddingVertical: 12, fontSize: 14, color: COLORS.text, justifyContent: 'center' },
  inputText:      { fontSize: 14, color: COLORS.text },
  placeholder:    { fontSize: 14, color: COLORS.subtext },
  chipGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:           { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1.5,
                    borderColor: COLORS.border, backgroundColor: COLORS.bg },
  chipActive:     { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText:       { fontSize: 12, fontWeight: '600', color: COLORS.text },
  chipTextActive: { color: '#fff' },
  dropdown:       { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
                    maxHeight: 200, elevation: 8, zIndex: 99 },
  dropItem:       { padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dropItemText:   { fontSize: 13, color: COLORS.text },
  privacyNote:    { backgroundColor: '#E8F4FD', borderRadius: 10, padding: 12, marginTop: 18, marginBottom: 6 },
  privacyNoteText:{ fontSize: 12, color: '#1A3C5E', lineHeight: 17 },
  saveBtn:        { backgroundColor: COLORS.success, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 16 },
  saveBtnText:    { color: '#fff', fontWeight: '800', fontSize: 15 },
  btnDisabled:    { opacity: 0.5 },
});
