import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { COLORS, CITIES, CARGO_TYPES, TRUCK_TYPES } from '../utils/constants';
import { formatSAR } from '../utils/helpers';
import { createLoad } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

export default function PostLoadScreen({ navigation }) {
  const { lang } = useLanguage();
  const [form, setForm] = useState({
    from_city:    '',
    to_city:      '',
    cargo_type:   '',
    weight_tons:  '',
    notes:        '',
    offered_price:'',
    truck_type:   '',
    pickup_date:  '',
  });
  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handlePost = async () => {
    if (!form.offered_price) {
      Alert.alert('Missing Info', 'Please enter your budget.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        cargo_type:    form.cargo_type,
        weight_tons:   parseFloat(form.weight_tons),
        from_city:     form.from_city,
        to_city:       form.to_city,
        offered_price: parseFloat(form.offered_price),
        pickup_date:   form.pickup_date || null,
        notes:         form.notes || '',
      };
      if (form.truck_type) payload.truck_type = form.truck_type;

      await createLoad(payload);

      Alert.alert('🎉 Load Posted!', "Drivers will see your load. You'll get offers soon.", [
        { text: 'View My Orders', onPress: () => navigation.navigate('Orders') },
        {
          text: 'Post Another',
          onPress: () => {
            setForm({ from_city:'', to_city:'', cargo_type:'', weight_tons:'', notes:'', offered_price:'', truck_type:'', pickup_date:'' });
            setStep(1);
          }
        },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to post load. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Display helpers
  const fromCity = CITIES.find(c => c.id === form.from_city);
  const toCity   = CITIES.find(c => c.id === form.to_city);
  const fromName = fromCity ? (fromCity[lang] ?? fromCity.en) : '';
  const toName   = toCity   ? (toCity[lang]   ?? toCity.en)   : '';

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Post a Load</Text>
      </View>

      {/* Step indicator */}
      <View style={styles.stepBar}>
        {[1, 2, 3].map(s => (
          <View key={s} style={[styles.stepDot, step >= s && styles.stepDotActive]}>
            <Text style={[styles.stepNum, step >= s && styles.stepNumActive]}>{s}</Text>
          </View>
        ))}
        <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
        <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
      </View>
      <View style={styles.stepLabelRow}>
        {['Route', 'Cargo', 'Budget'].map((l, i) => (
          <Text key={l} style={[styles.stepLabel, step === i+1 && styles.stepLabelActive]}>{l}</Text>
        ))}
      </View>

      {/* ── STEP 1: Route ─────────────────────────────── */}
      {step === 1 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📍 Route Details</Text>

          <Text style={styles.label}>From (Origin City)</Text>
          <CityPicker lang={lang} selected={form.from_city} onSelect={v => update('from_city', v)} exclude={form.to_city} />

          <Text style={[styles.label, {marginTop: 16}]}>To (Destination City)</Text>
          <CityPicker lang={lang} selected={form.to_city}   onSelect={v => update('to_city',   v)} exclude={form.from_city} />

          <Text style={[styles.label, {marginTop: 16}]}>Pickup Date</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 2024-08-15"
            value={form.pickup_date}
            onChangeText={v => update('pickup_date', v)}
            placeholderTextColor={COLORS.subtext}
          />

          {fromName && toName && (
            <View style={styles.routePreview}>
              <Text style={styles.routePreviewText}>
                🚛  {fromName}  →  {toName}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.nextBtn, (!form.from_city || !form.to_city) && styles.btnDisabled]}
            onPress={() => setStep(2)}
            disabled={!form.from_city || !form.to_city}
          >
            <Text style={styles.nextBtnText}>Next: Cargo Info →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── STEP 2: Cargo ─────────────────────────────── */}
      {step === 2 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📦 Cargo Details</Text>

          <Text style={styles.label}>Cargo Type</Text>
          <View style={styles.chipGrid}>
            {CARGO_TYPES.map(ct => (
              <TouchableOpacity
                key={ct}
                style={[styles.chip, form.cargo_type === ct && styles.chipActive]}
                onPress={() => update('cargo_type', ct)}
              >
                <Text style={[styles.chipText, form.cargo_type === ct && styles.chipTextActive]}>{ct}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, {marginTop: 16}]}>Weight (tons)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 15"
            value={form.weight_tons}
            onChangeText={v => update('weight_tons', v)}
            keyboardType="numeric"
            placeholderTextColor={COLORS.subtext}
          />

          <Text style={[styles.label, {marginTop: 16}]}>Preferred Truck Type (optional)</Text>
          <View style={styles.chipGrid}>
            {TRUCK_TYPES.map(t => (
              <TouchableOpacity
                key={t.id}
                style={[styles.chip, form.truck_type === t.id && styles.chipActive]}
                onPress={() => update('truck_type', form.truck_type === t.id ? '' : t.id)}
              >
                <Text style={[styles.chipText, form.truck_type === t.id && styles.chipTextActive]}>
                  {t.icon} {t[lang] ?? t.en}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, {marginTop: 16}]}>Description (optional)</Text>
          <TextInput
            style={[styles.input, {height: 80, textAlignVertical: 'top'}]}
            placeholder="Fragile, hazmat requirements, special handling..."
            value={form.notes}
            onChangeText={v => update('notes', v)}
            multiline
            placeholderTextColor={COLORS.subtext}
          />

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.backStepBtn} onPress={() => setStep(1)}>
              <Text style={styles.backStepText}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextBtn, {flex: 1}, (!form.cargo_type || !form.weight_tons) && styles.btnDisabled]}
              onPress={() => setStep(3)}
              disabled={!form.cargo_type || !form.weight_tons}
            >
              <Text style={styles.nextBtnText}>Next: Budget →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── STEP 3: Budget & Submit ──────────────────── */}
      {step === 3 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>💰 Budget</Text>

          <Text style={styles.label}>Your Budget (SAR)</Text>
          <TextInput
            style={[styles.input, styles.budgetInput]}
            placeholder="e.g. 5000"
            value={form.offered_price}
            onChangeText={v => update('offered_price', v)}
            keyboardType="numeric"
            placeholderTextColor={COLORS.subtext}
          />

          {form.offered_price ? (
            <View style={styles.feeCard}>
              <Text style={styles.feeTitle}>💡 Price Breakdown</Text>
              <FeeRow label="Your budget"        value={formatSAR(form.offered_price)} />
              <FeeRow label="Platform fee (3%)"  value={formatSAR(parseFloat(form.offered_price) * 0.03)} highlight />
              <FeeRow label="Driver receives"    value={formatSAR(parseFloat(form.offered_price) * 0.97)} />
            </View>
          ) : null}

          {/* Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>📋 Load Summary</Text>
            <SummaryRow label="Route"   value={`${fromName} → ${toName}`} />
            <SummaryRow label="Cargo"   value={form.cargo_type} />
            <SummaryRow label="Weight"  value={`${form.weight_tons} tons`} />
            {form.pickup_date && <SummaryRow label="Pickup" value={form.pickup_date} />}
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.backStepBtn} onPress={() => setStep(2)}>
              <Text style={styles.backStepText}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, (!form.offered_price || loading) && styles.btnDisabled]}
              onPress={handlePost}
              disabled={!form.offered_price || loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitBtnText}>🚛 Post Load</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CityPicker({ lang, selected, onSelect, exclude }) {
  const [open, setOpen] = useState(false);
  const avail = CITIES.filter(c => c.id !== exclude);
  const selectedCity = CITIES.find(c => c.id === selected);
  const displayName = selectedCity ? (selectedCity[lang] ?? selectedCity.en) : null;

  return (
    <View>
      <TouchableOpacity style={styles.input} onPress={() => setOpen(!open)}>
        <Text style={displayName ? styles.inputText : styles.placeholder}>
          {displayName || 'Select city...'}
        </Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdown}>
          {avail.map(c => (
            <TouchableOpacity
              key={c.id}
              style={styles.dropdownItem}
              onPress={() => { onSelect(c.id); setOpen(false); }}
            >
              <Text style={[styles.dropdownItemText, selected === c.id && { color: COLORS.primary, fontWeight: '700' }]}>
                📍 {c[lang] ?? c.en}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function FeeRow({ label, value, highlight }) {
  return (
    <View style={styles.feeRow}>
      <Text style={[styles.feeLabel, highlight && { color: COLORS.danger }]}>{label}</Text>
      <Text style={[styles.feeValue, highlight && { color: COLORS.danger, fontWeight: '700' }]}>{value}</Text>
    </View>
  );
}

function SummaryRow({ label, value }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flexGrow: 1, backgroundColor: COLORS.bg, padding: 20, paddingTop: 54 },
  header:          { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn:         { marginRight: 12 },
  backText:        { fontSize: 22, color: COLORS.primary },
  title:           { fontSize: 22, fontWeight: '800', color: COLORS.text },
  stepBar:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 6, gap: 0 },
  stepDot:         { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  stepDotActive:   { backgroundColor: COLORS.primary },
  stepNum:         { color: COLORS.subtext, fontWeight: '700', fontSize: 13 },
  stepNumActive:   { color: '#fff' },
  stepLine:        { flex: 1, height: 2, backgroundColor: COLORS.border, marginHorizontal: -4 },
  stepLineActive:  { backgroundColor: COLORS.primary },
  stepLabelRow:    { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 18 },
  stepLabel:       { fontSize: 11, color: COLORS.subtext, fontWeight: '600' },
  stepLabelActive: { color: COLORS.primary },
  card:            { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 3,
                     shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8 },
  sectionTitle:    { fontSize: 17, fontWeight: '800', color: COLORS.text, marginBottom: 18 },
  label:           { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  input:           { backgroundColor: COLORS.bg, borderRadius: 10, paddingHorizontal: 14,
                     paddingVertical: 13, fontSize: 15, color: COLORS.text, justifyContent: 'center' },
  inputText:       { fontSize: 15, color: COLORS.text },
  placeholder:     { fontSize: 15, color: COLORS.subtext },
  budgetInput:     { fontSize: 22, fontWeight: '700', color: COLORS.primary },
  dropdown:        { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
                     maxHeight: 200, marginTop: 4, elevation: 4 },
  dropdownItem:    { padding: 13, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dropdownItemText:{ fontSize: 14, color: COLORS.text },
  chipGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:            { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1.5,
                     borderColor: COLORS.border, backgroundColor: COLORS.bg },
  chipActive:      { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText:        { fontSize: 12, fontWeight: '600', color: COLORS.text },
  chipTextActive:  { color: '#fff' },
  routePreview:    { backgroundColor: '#E8F4FD', borderRadius: 10, padding: 12, marginTop: 14, alignItems: 'center' },
  routePreviewText:{ fontSize: 15, fontWeight: '700', color: COLORS.primary },
  nextBtn:         { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14,
                     alignItems: 'center', marginTop: 20 },
  nextBtnText:     { color: '#fff', fontWeight: '700', fontSize: 14 },
  btnRow:          { flexDirection: 'row', gap: 10, marginTop: 20 },
  backStepBtn:     { backgroundColor: COLORS.bg, borderRadius: 12, paddingVertical: 14,
                     paddingHorizontal: 18, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border },
  backStepText:    { color: COLORS.text, fontWeight: '700', fontSize: 14 },
  submitBtn:       { flex: 1, backgroundColor: COLORS.secondary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  submitBtnText:   { color: '#fff', fontWeight: '800', fontSize: 15 },
  btnDisabled:     { opacity: 0.45 },
  feeCard:         { backgroundColor: '#FFF9E6', borderRadius: 12, padding: 14, marginTop: 12 },
  feeTitle:        { fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  feeRow:          { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  feeLabel:        { fontSize: 13, color: COLORS.subtext },
  feeValue:        { fontSize: 13, color: COLORS.text },
  summaryCard:     { backgroundColor: COLORS.bg, borderRadius: 12, padding: 14, marginTop: 12 },
  summaryTitle:    { fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  summaryRow:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel:    { fontSize: 13, color: COLORS.subtext },
  summaryValue:    { fontSize: 13, color: COLORS.text, fontWeight: '600', maxWidth: '55%', textAlign: 'right' },
});
