import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { updateDriverProfile } from '../utils/api';
import { COLORS, TRUCK_TYPES } from '../utils/constants';
import { useLanguage } from '../context/LanguageContext';

export default function EditTruckScreen({ route, navigation }) {
  const { driverId, profile: initialProfile } = route.params || {};
  const { isRTL, lang } = useLanguage();
  const textAlign = isRTL ? 'right' : 'left';
  const rowDir    = isRTL ? 'row-reverse' : 'row';

  const [form, setForm] = useState({
    truck_type:    initialProfile?.truck_type    || '',
    plate_number:  initialProfile?.plate_number  || '',
    capacity_tons: initialProfile?.capacity_tons ? String(initialProfile.capacity_tons) : '',
    price_per_ton: initialProfile?.price_per_ton ? String(initialProfile.price_per_ton) : '',
    from_city:     initialProfile?.from_city     || '',
    to_city:       initialProfile?.to_city       || '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [saved,   setSaved]   = useState(false);

  const update = (key, val) => { setError(''); setForm(f => ({ ...f, [key]: val })); };

  const handleSave = async () => {
    setError('');

    if (!form.plate_number.trim()) {
      setError(lang === 'ar' ? '⚠️ يرجى إدخال رقم اللوحة' : '⚠️ Please enter the plate number');
      return;
    }

    if (!driverId) {
      setError(lang === 'ar' ? '⚠️ معرّف السائق مفقود — يرجى الرجوع والمحاولة مجدداً' : '⚠️ Driver ID missing — please go back and try again');
      return;
    }

    setLoading(true);
    try {
      await updateDriverProfile(driverId, {
        truck_type:    form.truck_type    || undefined,
        plate_number:  form.plate_number.trim(),
        capacity_tons: form.capacity_tons ? parseFloat(form.capacity_tons) : undefined,
        price_per_ton: form.price_per_ton ? parseFloat(form.price_per_ton) : undefined,
        from_city:     form.from_city     || undefined,
        to_city:       form.to_city       || undefined,
      });

      setSaved(true);
      setTimeout(() => navigation.goBack(), 800); // brief success flash then go back
    } catch (err) {
      console.error('EditTruck save error:', err);
      setError(
        err?.message
          ? `⚠️ ${err.message}`
          : (lang === 'ar' ? '⚠️ فشل الحفظ. يرجى المحاولة مجدداً.' : '⚠️ Save failed. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

      {/* Header */}
      <View style={[styles.header, { flexDirection: rowDir }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>{isRTL ? '→' : '←'}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { textAlign }]}>
          {lang === 'ar' ? '✏️ تعديل بيانات الشاحنة' : '✏️ Edit Truck Info'}
        </Text>
      </View>

      {/* Success banner */}
      {saved && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>
            {lang === 'ar' ? '✅ تم الحفظ بنجاح' : '✅ Saved successfully'}
          </Text>
        </View>
      )}

      {/* Error banner */}
      {!!error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.card}>

        {/* Truck Type */}
        <Text style={[styles.label, { textAlign }]}>
          {lang === 'ar' ? 'نوع الشاحنة' : 'Truck Type'}
        </Text>
        <View style={styles.typeGrid}>
          {TRUCK_TYPES.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.typeChip, form.truck_type === t.id && styles.typeChipActive]}
              onPress={() => update('truck_type', t.id)}
            >
              <Text style={styles.typeIcon}>{t.icon}</Text>
              <Text style={[styles.typeLabel, form.truck_type === t.id && styles.typeLabelActive]}>
                {lang === 'ar' ? t.ar : t.en}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Plate Number */}
        <Text style={[styles.label, { textAlign, marginTop: 18 }]}>
          {lang === 'ar' ? 'رقم اللوحة *' : 'Plate Number *'}
        </Text>
        <TextInput
          style={[styles.input, { textAlign }]}
          placeholder={lang === 'ar' ? 'مثال: أ ب ج 1234' : 'e.g. ABC 1234'}
          value={form.plate_number}
          onChangeText={v => update('plate_number', v)}
          placeholderTextColor={COLORS.subtext}
          autoCapitalize="characters"
        />

        {/* Capacity */}
        <Text style={[styles.label, { textAlign, marginTop: 14 }]}>
          {lang === 'ar' ? 'سعة الشاحنة (طن) — اختياري' : 'Capacity (tons) — optional'}
        </Text>
        <TextInput
          style={[styles.input, { textAlign }]}
          placeholder={lang === 'ar' ? 'مثال: 20' : 'e.g. 20'}
          value={form.capacity_tons}
          onChangeText={v => update('capacity_tons', v)}
          keyboardType="numeric"
          placeholderTextColor={COLORS.subtext}
        />

        {/* Price per ton */}
        <Text style={[styles.label, { textAlign, marginTop: 14 }]}>
          {lang === 'ar' ? 'السعر بالطن (ريال) — اختياري' : 'Price per Ton (SAR) — optional'}
        </Text>
        <TextInput
          style={[styles.input, { textAlign }]}
          placeholder={lang === 'ar' ? 'مثال: 300' : 'e.g. 300'}
          value={form.price_per_ton}
          onChangeText={v => update('price_per_ton', v)}
          keyboardType="numeric"
          placeholderTextColor={COLORS.subtext}
        />

        {/* Debug: show what driverId was received */}
        <Text style={styles.debugText}>
          {lang === 'ar' ? `معرّف الشاحنة: ${driverId ?? '⚠️ غير محدد'}` : `Truck ID: ${driverId ?? '⚠️ undefined'}`}
        </Text>

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveBtn, (loading || saved) && styles.btnDisabled]}
          onPress={handleSave}
          disabled={loading || saved}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>
                {lang === 'ar' ? '💾  حفظ التغييرات' : '💾  Save Changes'}
              </Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flexGrow: 1, backgroundColor: COLORS.bg, padding: 20, paddingTop: 54 },
  header:          { alignItems: 'center', marginBottom: 20, gap: 12 },
  back:            { fontSize: 22, color: COLORS.primary },
  title:           { fontSize: 20, fontWeight: '800', color: COLORS.text, flex: 1 },

  successBanner:   {
                     backgroundColor: COLORS.success + '20', borderRadius: 10,
                     padding: 12, marginBottom: 12,
                     borderLeftWidth: 4, borderLeftColor: COLORS.success,
                   },
  successText:     { color: COLORS.success, fontWeight: '700', fontSize: 14 },

  errorBanner:     {
                     backgroundColor: COLORS.danger + '15', borderRadius: 10,
                     padding: 12, marginBottom: 12,
                     borderLeftWidth: 4, borderLeftColor: COLORS.danger,
                   },
  errorText:       { color: COLORS.danger, fontWeight: '600', fontSize: 13 },

  card:            { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 3 },
  label:           { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  input:           {
                     backgroundColor: COLORS.bg, borderRadius: 10,
                     paddingHorizontal: 14, paddingVertical: 12,
                     fontSize: 14, color: COLORS.text,
                   },

  typeGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip:        {
                     backgroundColor: COLORS.bg, borderRadius: 10,
                     paddingHorizontal: 12, paddingVertical: 8,
                     alignItems: 'center', minWidth: 80,
                     borderWidth: 1.5, borderColor: COLORS.border,
                   },
  typeChipActive:  { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
  typeIcon:        { fontSize: 20, marginBottom: 4 },
  typeLabel:       { fontSize: 11, color: COLORS.subtext, fontWeight: '600', textAlign: 'center' },
  typeLabelActive: { color: COLORS.primary },

  debugText:       { fontSize: 11, color: COLORS.subtext, marginTop: 14, textAlign: 'center' },

  saveBtn:         {
                     backgroundColor: COLORS.success, borderRadius: 12,
                     paddingVertical: 15, alignItems: 'center', marginTop: 8,
                   },
  saveBtnText:     { color: '#fff', fontWeight: '800', fontSize: 15 },
  btnDisabled:     { opacity: 0.5 },
  cancelBtn:       { paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  cancelText:      { color: COLORS.subtext, fontSize: 14 },
});
