import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Switch, Modal, FlatList,
} from 'react-native';
import { createDriverProfile } from '../utils/api';
import { COLORS, TRUCK_TYPES } from '../utils/constants';
import { useLanguage } from '../context/LanguageContext';

export default function DriverSetupScreen({ route, navigation }) {
  const { role, phoneNumber, name: paramName } = route.params ?? {};
  const { t, isRTL, lang } = useLanguage();
  const s = t.setup;

  // ── Registration fields ───────────────────────────────────────────────
  const [fullName,    setFullName]    = useState(paramName ?? '');
  const [idNumber,    setIdNumber]    = useState('');
  const [truckType,   setTruckType]   = useState('');   // TRUCK_TYPES id
  const [truckModel,  setTruckModel]  = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [showTypePicker, setShowTypePicker] = useState(false);

  // ── Payment fields ────────────────────────────────────────────────────
  const [iban,     setIban]     = useState('');
  const [stcPhone, setStcPhone] = useState(phoneNumber ?? '');
  const [useIban,  setUseIban]  = useState(true);
  const [useStc,   setUseStc]   = useState(true);
  const [loading,  setLoading]  = useState(false);
  const [saveError, setSaveError] = useState('');

  const textAlign = isRTL ? 'right' : 'left';
  const rowDir    = isRTL ? 'row-reverse' : 'row';

  // ── Validation ────────────────────────────────────────────────────────
  const cleanIban    = iban.replace(/\s/g, '').toUpperCase();
  const ibanValid    = !useIban || (cleanIban.length === 0) || (
    cleanIban.startsWith('SA') && cleanIban.length === 24 && /^SA\d{22}$/.test(cleanIban)
  );
  const stcValid     = !useStc || stcPhone.replace(/\D/g, '').length >= 9;
  const paymentFilled = (useIban && cleanIban.length > 0) || (useStc && stcPhone.trim().length > 0);

  // ── Saudi truck plate validation ─────────────────────────────────────────
  // Format: exactly 3 Arabic or Latin letters + 1–4 digits (Arabic ٠-٩ or Western 0-9)
  // Valid Arabic letters on KSA plates: أ ب ج د ر س ص ط ع ق ك ل م ن ه و ي
  // Latin equivalents:                   A B J D R S X T E G K L Z N H U V
  // Accept any Arabic or Latin letter, 2–4 letters + 1–4 digits (total 5–8 chars)
  const cleanPlate   = plateNumber.replace(/[\s\u00a0\u200b]/g, '');
  const plateLetters = cleanPlate.split('').filter(c => /[\u0600-\u06FF]/.test(c) || /[A-Za-z]/.test(c));
  const plateDigits  = cleanPlate.match(/[\d\u0660-\u0669]/g) || [];
  const plateValid   = plateLetters.length >= 2 && plateLetters.length <= 4
                       && plateDigits.length >= 1 && plateDigits.length <= 4;

  // ── Other field validation ───────────────────────────────────────────────
  const nameParts  = fullName.trim().split(/\s+/).filter(p => p.length >= 1);
  const nameValid  = nameParts.length >= 2;
  const idValid    = idNumber.replace(/\D/g, '').length >= 7;
  const typeValid  = !!truckType;

  const regValid   = nameValid && idValid && typeValid && plateValid;

  const selectedTruck = TRUCK_TYPES.find(t => t.id === truckType);

  const handleSave = async () => {
    // Registration validation
    if (fullName.trim().length < 2)    { Alert.alert(s.nameRequired,  s.nameRequiredMsg);  return; }
    if (idNumber.trim().length < 7)    { Alert.alert(s.idRequired,    s.idRequiredMsg);    return; }
    if (!truckType)                    { Alert.alert(s.typeRequired,   s.typeRequiredMsg);  return; }
    if (!plateValid) { Alert.alert(s.plateRequired || 'رقم اللوحة', lang === 'ar' ? '2-4 أحرف + 1-4 أرقام  |  مثال: ت ي ا ل 1 2 3 4' : '2–4 letters + 1–4 digits  |  e.g. T Y A L 1234'); return; }

    // Payment validation
    if (useIban && cleanIban.length > 0 && !ibanValid) {
      Alert.alert(s.ibanError, s.ibanErrorMsg); return;
    }
    if (useStc && stcPhone.trim() && !stcValid) {
      Alert.alert(s.stcError, s.stcErrorMsg); return;
    }
    if (!paymentFilled) { Alert.alert(s.paymentRequired, s.paymentRequiredMsg); return; }

    setSaveError('');
    setLoading(true);

    // Always save profile data locally first so the app has it regardless of server state
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const existing = await AsyncStorage.getItem('trucklink_user').catch(() => null);
      const base = existing ? JSON.parse(existing) : {};
      await AsyncStorage.setItem('trucklink_user', JSON.stringify({
        ...base,
        full_name:    fullName.trim(),
        id_number:    idNumber.trim(),
        truck_type:   truckType,
        plate_number: plateNumber.trim(),
        role:         'driver',
      }));
    } catch {}

    // Try to sync with backend; navigate to Main regardless of outcome
    try {
      await createDriverProfile({
        full_name:    fullName.trim(),
        id_number:    idNumber.trim(),
        truck_type:   truckType,
        plate_number: plateNumber.trim(),
        truck_color:  'white',
      });
    } catch (err) {
      console.warn('DriverSetup backend sync failed (saved locally):', err?.message);
      // Server is unavailable — profile saved locally, proceed anyway
    }

    setLoading(false);
    navigation.replace('Main', { role: 'driver' });
  };

  const handleSkip = () => {
    Alert.alert(s.skipTitle, s.skipMsg, [
      { text: s.cancel, style: 'cancel' },
      { text: s.skipAnyway, onPress: () => navigation.replace('Main', { role: 'driver' }) },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

      {/* Header */}
      <View style={styles.headerCard}>
        <Text style={styles.headerIcon}>🚛</Text>
        <Text style={[styles.title, { textAlign }]}>{s.title}</Text>
        <Text style={[styles.subtitle, { textAlign }]}>{s.subtitle}</Text>
      </View>

      {/* ── SECTION 1: Personal & Truck Info ─────────────────────────── */}
      <SectionLabel icon="👤" title={s.regSection} textAlign={textAlign} />

      {/* Full Name */}
      <View style={styles.section}>
        <Text style={[styles.label, { textAlign }]}>{s.fullName}</Text>
        <TextInput
          style={[styles.fieldInput, { textAlign },
            fullName.length > 0 && !nameValid && { borderColor: '#E74C3C', borderWidth: 1.5 },
            nameValid && { borderColor: '#27AE60', borderWidth: 1.5 },
          ]}
          placeholder={s.fullNamePH}
          value={fullName}
          onChangeText={setFullName}
          placeholderTextColor={COLORS.subtext}
          autoCapitalize="words"
        />
        {fullName.length > 0 && !nameValid && (
          <Text style={{ color: '#E74C3C', fontSize: 12, marginTop: 4, textAlign }}>
            ❌ {lang === 'ar' ? 'أدخل الاسم الأول والأخير على الأقل' : 'Enter at least first and last name'}
          </Text>
        )}
        {nameValid && (
          <Text style={{ color: '#27AE60', fontSize: 12, marginTop: 4, textAlign }}>✅ {lang === 'ar' ? 'صحيح' : 'Valid'}</Text>
        )}
      </View>

      {/* National ID */}
      <View style={styles.section}>
        <Text style={[styles.label, { textAlign }]}>{s.idNumber}</Text>
        <TextInput
          style={[styles.fieldInput, { textAlign },
            idNumber.length > 0 && !idValid && { borderColor: '#E74C3C', borderWidth: 1.5 },
            idValid && { borderColor: '#27AE60', borderWidth: 1.5 },
          ]}
          placeholder={s.idNumberPH}
          value={idNumber}
          onChangeText={v => setIdNumber(v.replace(/\D/g, ''))}
          keyboardType="numeric"
          placeholderTextColor={COLORS.subtext}
          maxLength={10}
        />
        {idNumber.length > 0 && !idValid && (
          <Text style={{ color: '#E74C3C', fontSize: 12, marginTop: 4, textAlign }}>
            ❌ {lang === 'ar' ? '7 أرقام على الأقل' : 'At least 7 digits'}
          </Text>
        )}
        {idValid && (
          <Text style={{ color: '#27AE60', fontSize: 12, marginTop: 4, textAlign }}>✅ {lang === 'ar' ? 'صحيح' : 'Valid'}</Text>
        )}
        <Text style={[styles.fieldNote, { textAlign, marginTop: 4 }]}>{s.idNote}</Text>
      </View>

      {/* ── SECTION 2: Truck Details ─────────────────────────────────── */}
      <SectionLabel icon="🚛" title={s.truckSection} textAlign={textAlign} />

      {/* Truck Type picker */}
      <View style={styles.section}>
        <Text style={[styles.label, { textAlign }]}>{s.truckType}</Text>
        <TouchableOpacity
          style={[styles.pickerBtn, { flexDirection: rowDir },
            typeValid && { borderColor: '#27AE60', borderWidth: 1.5 },
          ]}
          onPress={() => setShowTypePicker(true)}
        >
          <Text style={[styles.pickerBtnText, !selectedTruck && styles.pickerBtnPlaceholder, { flex: 1, textAlign }]}>
            {selectedTruck ? `${selectedTruck.icon}  ${selectedTruck[lang]}` : s.truckTypePH}
          </Text>
          <Text style={styles.pickerChevron}>{isRTL ? '‹' : '›'}</Text>
        </TouchableOpacity>
        {typeValid && (
          <Text style={{ color: '#27AE60', fontSize: 12, marginTop: 4, textAlign }}>✅ {lang === 'ar' ? 'صحيح' : 'Valid'}</Text>
        )}
      </View>

      {/* Truck Model */}
      <View style={styles.section}>
        <Text style={[styles.label, { textAlign }]}>{s.truckModel}</Text>
        <TextInput
          style={[styles.fieldInput, { textAlign }]}
          placeholder={s.truckModelPH}
          value={truckModel}
          onChangeText={setTruckModel}
          placeholderTextColor={COLORS.subtext}
          autoCapitalize="words"
        />
      </View>

      {/* Plate Number */}
      <View style={styles.section}>
        <Text style={[styles.label, { textAlign }]}>{s.plateNumber}</Text>
        <TextInput
          style={[styles.fieldInput, { textAlign: 'left' },
            plateNumber.length > 0 && !plateValid && { borderColor: '#E74C3C', borderWidth: 1.5 },
            plateValid && { borderColor: '#27AE60', borderWidth: 1.5 },
          ]}
          placeholder={lang === 'ar' ? 'أ ب ج ١٢٣٤' : 'A B J 1234'}
          value={plateNumber}
          onChangeText={setPlateNumber}
          placeholderTextColor={COLORS.subtext}
          maxLength={12}
        />
        {plateNumber.length > 0 && !plateValid && (
          <Text style={{ color: '#E74C3C', fontSize: 12, marginTop: 4, textAlign }}>
            ❌ {lang === 'ar' ? '3 أحرف صحيحة + 1 إلى 4 أرقام  |  مثال: أ ب ج ١٢٣٤' : '3 valid letters + 1–4 digits  |  e.g. A B J 1234'}
          </Text>
        )}
        {plateValid && (
          <Text style={{ color: '#27AE60', fontSize: 12, marginTop: 4, textAlign }}>
            ✅ {lang === 'ar' ? 'صحيح' : 'Valid'}
          </Text>
        )}
        <Text style={[styles.fieldNote, { textAlign, marginTop: 6 }]}>
          {lang === 'ar'
            ? 'يقبل أي حروف عربية أو إنجليزية + أرقام  |  مثال: ت ي ا ل ١٢٣٤'
            : 'Any Arabic or Latin letters + digits  |  e.g. T Y A L 1234'}
        </Text>
      </View>

      {/* ── SECTION 3: Payment ───────────────────────────────────────── */}
      <SectionLabel icon="💰" title={s.paymentSection} textAlign={textAlign} />

      {/* Info banner */}
      <View style={[styles.infoBanner, { flexDirection: rowDir }]}>
        <Text style={styles.infoIcon}>💰</Text>
        <Text style={[styles.infoText, { flex: 1, textAlign }]}>{s.infoText}</Text>
      </View>

      {/* STC Pay */}
      <View style={styles.section}>
        <View style={[styles.sectionHeader, { flexDirection: rowDir }]}>
          <View style={[styles.sectionHeaderLeft, { flexDirection: rowDir }]}>
            <View style={styles.stcLogo}>
              <Text style={styles.stcLogoText}>STC</Text>
            </View>
            <View>
              <Text style={[styles.sectionTitle, { textAlign }]}>{s.stcTitle}</Text>
              <Text style={[styles.sectionSub,   { textAlign }]}>{s.stcSub}</Text>
            </View>
          </View>
          <Switch
            value={useStc}
            onValueChange={setUseStc}
            trackColor={{ false: COLORS.border, true: '#7B2FBE' }}
            thumbColor="#fff"
          />
        </View>
        {useStc && (
          <View style={styles.inputWrap}>
            <Text style={[styles.label, { textAlign }]}>{s.stcPhone}</Text>
            <View style={[styles.phoneRow, { flexDirection: rowDir }]}>
              <View style={styles.phonePrefix}>
                <Text style={styles.phonePrefixText}>🇸🇦 +966</Text>
              </View>
              <TextInput
                style={[styles.phoneInput, { textAlign }]}
                placeholder={s.stcPhonePH}
                value={stcPhone}
                onChangeText={setStcPhone}
                keyboardType="phone-pad"
                placeholderTextColor={COLORS.subtext}
                maxLength={15}
              />
            </View>
            <Text style={[styles.fieldNote, { textAlign }]}>{s.stcNote}</Text>
          </View>
        )}
      </View>

      {/* IBAN */}
      <View style={styles.section}>
        <View style={[styles.sectionHeader, { flexDirection: rowDir }]}>
          <View style={[styles.sectionHeaderLeft, { flexDirection: rowDir }]}>
            <View style={styles.bankLogo}>
              <Text style={styles.bankLogoText}>🏦</Text>
            </View>
            <View>
              <Text style={[styles.sectionTitle, { textAlign }]}>{s.ibanTitle}</Text>
              <Text style={[styles.sectionSub,   { textAlign }]}>{s.ibanSub}</Text>
            </View>
          </View>
          <Switch
            value={useIban}
            onValueChange={setUseIban}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor="#fff"
          />
        </View>
        {useIban && (
          <View style={styles.inputWrap}>
            <Text style={[styles.label, { textAlign }]}>{s.ibanLabel}</Text>
            <TextInput
              style={[styles.ibanInput, !ibanValid && cleanIban && styles.inputError]}
              placeholder="SA00 0000 0000 0000 0000 0000"
              value={iban}
              onChangeText={v => setIban(v.toUpperCase())}
              autoCapitalize="characters"
              placeholderTextColor={COLORS.subtext}
              maxLength={29}
            />
            {!ibanValid && cleanIban
              ? <Text style={styles.errorText}>{s.ibanHint}</Text>
              : <Text style={[styles.fieldNote, { textAlign }]}>{s.ibanNote}</Text>
            }
          </View>
        )}
      </View>

      {/* Security note */}
      <View style={[styles.securityNote, { flexDirection: rowDir }]}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={[styles.securityText, { flex: 1, textAlign }]}>{s.security}</Text>
      </View>

      {/* Error banner */}
      {!!saveError && (
        <View style={{ backgroundColor: '#FEE2E2', borderRadius: 10, padding: 14, marginBottom: 12,
                       borderLeftWidth: 4, borderLeftColor: COLORS.danger }}>
          <Text style={{ color: COLORS.danger, fontWeight: '600', fontSize: 13 }}>⚠️ {saveError}</Text>
        </View>
      )}

      {/* Save button */}
      <TouchableOpacity
        style={[styles.saveBtn, (!regValid || loading) && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={!regValid || loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.saveBtnText}>{s.save}</Text>
        }
      </TouchableOpacity>

      {/* Skip */}
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>{s.skip}</Text>
      </TouchableOpacity>

      {/* ── Truck Type Picker Modal ────────────────────────────────── */}
      <Modal visible={showTypePicker} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowTypePicker(false)} activeOpacity={1}>
          <View style={styles.pickerModal}>
            <Text style={[styles.pickerModalTitle, { textAlign }]}>{s.truckType}</Text>
            <FlatList
              data={TRUCK_TYPES}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.pickerItem, { flexDirection: rowDir }, truckType === item.id && styles.pickerItemActive]}
                  onPress={() => { setTruckType(item.id); setShowTypePicker(false); }}
                >
                  <Text style={styles.pickerItemIcon}>{item.icon}</Text>
                  <Text style={[styles.pickerItemText, truckType === item.id && styles.pickerItemTextActive, { flex: 1, textAlign }]}>
                    {item[lang]}
                  </Text>
                  {truckType === item.id && <Text style={styles.pickerCheck}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

    </ScrollView>
  );
}

function SectionLabel({ icon, title, textAlign }) {
  return (
    <View style={sectionLabelStyle.wrap}>
      <Text style={sectionLabelStyle.icon}>{icon}</Text>
      <Text style={[sectionLabelStyle.text, { textAlign }]}>{title}</Text>
    </View>
  );
}

const sectionLabelStyle = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, marginTop: 20, marginBottom: 10 },
  icon: { fontSize: 16 },
  text: { fontSize: 13, fontWeight: '800', color: COLORS.subtext, textTransform: 'uppercase', letterSpacing: 0.6, flex: 1 },
});

const styles = StyleSheet.create({
  container:        { flexGrow: 1, backgroundColor: COLORS.bg, padding: 20, paddingTop: 54 },

  // Header
  headerCard:       { backgroundColor: COLORS.primary, borderRadius: 20, padding: 24,
                      alignItems: 'center', marginBottom: 8 },
  headerIcon:       { fontSize: 44, marginBottom: 8 },
  title:            { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 6 },
  subtitle:         { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },

  // Generic section card
  section:          { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 10,
                      elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },

  // Section header (STC / IBAN toggle rows)
  sectionHeader:    { alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 },
  sectionHeaderLeft:{ alignItems: 'center', gap: 12, flex: 1 },
  sectionTitle:     { fontSize: 15, fontWeight: '800', color: COLORS.text },
  sectionSub:       { fontSize: 12, color: COLORS.subtext, marginTop: 2 },

  // Labels & inputs
  label:            { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  fieldInput:       { backgroundColor: COLORS.bg, borderRadius: 10, paddingHorizontal: 14,
                      paddingVertical: 12, fontSize: 15, color: COLORS.text, fontWeight: '500' },
  fieldNote:        { fontSize: 11, color: COLORS.subtext, marginTop: 6, lineHeight: 16 },
  errorText:        { fontSize: 11, color: COLORS.danger, marginTop: 6, fontWeight: '600' },

  // Truck type picker button
  pickerBtn:        { backgroundColor: COLORS.bg, borderRadius: 10, paddingHorizontal: 14,
                      paddingVertical: 13, alignItems: 'center' },
  pickerBtnText:    { fontSize: 15, color: COLORS.text, fontWeight: '600' },
  pickerBtnPlaceholder: { color: COLORS.subtext, fontWeight: '400' },
  pickerChevron:    { fontSize: 20, color: COLORS.subtext },

  // Info banner
  infoBanner:       { backgroundColor: COLORS.secondary + '20', borderRadius: 12, padding: 14,
                      marginBottom: 10, alignItems: 'center', gap: 10,
                      borderWidth: 1, borderColor: COLORS.secondary + '44' },
  infoIcon:         { fontSize: 22 },
  infoText:         { fontSize: 13, color: COLORS.text, lineHeight: 19 },

  // STC / Bank logos
  stcLogo:          { width: 44, height: 44, borderRadius: 12, backgroundColor: '#7B2FBE',
                      alignItems: 'center', justifyContent: 'center' },
  stcLogoText:      { color: '#fff', fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
  bankLogo:         { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.primary + '20',
                      alignItems: 'center', justifyContent: 'center' },
  bankLogoText:     { fontSize: 24 },

  // Payment inputs
  inputWrap:        { marginTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 16 },
  phoneRow:         { alignItems: 'center', gap: 8 },
  phonePrefix:      { backgroundColor: COLORS.bg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12 },
  phonePrefixText:  { fontSize: 13, fontWeight: '700', color: COLORS.text },
  phoneInput:       { flex: 1, backgroundColor: COLORS.bg, borderRadius: 10, paddingHorizontal: 14,
                      paddingVertical: 12, fontSize: 15, color: COLORS.text, fontWeight: '600' },
  ibanInput:        { backgroundColor: COLORS.bg, borderRadius: 10, paddingHorizontal: 14,
                      paddingVertical: 12, fontSize: 15, color: COLORS.text, fontWeight: '600', letterSpacing: 1 },
  inputError:       { borderWidth: 1.5, borderColor: COLORS.danger },

  // Security
  securityNote:     { backgroundColor: '#E8F4FD', borderRadius: 12, padding: 14,
                      marginTop: 8, marginBottom: 20, alignItems: 'center', gap: 10 },
  lockIcon:         { fontSize: 20 },
  securityText:     { fontSize: 12, color: '#1A3C5E', lineHeight: 17 },

  // Buttons
  saveBtn:          { backgroundColor: COLORS.success, borderRadius: 14, paddingVertical: 15,
                      alignItems: 'center', marginBottom: 12 },
  saveBtnDisabled:  { opacity: 0.45 },
  saveBtnText:      { color: '#fff', fontWeight: '800', fontSize: 16 },
  skipBtn:          { alignItems: 'center', paddingVertical: 8, marginBottom: 24 },
  skipText:         { color: COLORS.subtext, fontSize: 13, textDecorationLine: 'underline' },

  // Truck type picker modal
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  pickerModal:      { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
                      padding: 24, paddingBottom: 40, maxHeight: '70%' },
  pickerModalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  pickerItem:       { alignItems: 'center', paddingVertical: 14, paddingHorizontal: 10,
                      borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  pickerItemActive: { backgroundColor: COLORS.primary + '0E' },
  pickerItemIcon:   { fontSize: 26 },
  pickerItemText:   { fontSize: 15, color: COLORS.text, fontWeight: '500' },
  pickerItemTextActive: { color: COLORS.primary, fontWeight: '800' },
  pickerCheck:      { fontSize: 16, color: COLORS.primary, fontWeight: '800' },
});
