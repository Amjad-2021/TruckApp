// src/screens/LoginScreen.js  —  calls real OTP backend
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { COLORS }        from '../utils/constants';
import { useLanguage }   from '../context/LanguageContext';
import { sendOtp }       from '../utils/api';

const COUNTRY_CODES = [
  { code: '+966', flag: '🇸🇦', ar: 'السعودية',   en: 'Saudi Arabia' },
  { code: '+971', flag: '🇦🇪', ar: 'الإمارات',   en: 'UAE' },
  { code: '+965', flag: '🇰🇼', ar: 'الكويت',     en: 'Kuwait' },
  { code: '+974', flag: '🇶🇦', ar: 'قطر',        en: 'Qatar' },
  { code: '+973', flag: '🇧🇭', ar: 'البحرين',    en: 'Bahrain' },
  { code: '+968', flag: '🇴🇲', ar: 'عُمان',      en: 'Oman' },
  { code: '+20',  flag: '🇪🇬', ar: 'مصر',        en: 'Egypt' },
  { code: '+92',  flag: '🇵🇰', ar: 'باكستان',    en: 'Pakistan' },
  { code: '+91',  flag: '🇮🇳', ar: 'الهند',      en: 'India' },
  { code: '+977', flag: '🇳🇵', ar: 'نيبال',      en: 'Nepal' },
  { code: '+94',  flag: '🇱🇰', ar: 'سريلانكا',   en: 'Sri Lanka' },
  { code: '+63',  flag: '🇵🇭', ar: 'الفلبين',    en: 'Philippines' },
  { code: '+1',   flag: '🇺🇸', ar: 'أمريكا',     en: 'USA' },
];

export default function LoginScreen({ navigation }) {
  const { isRTL, lang, toggleLanguage } = useLanguage();
  const ar        = lang === 'ar';
  const textAlign = isRTL ? 'right' : 'left';
  const rowDir    = isRTL ? 'row-reverse' : 'row';

  const [phone,       setPhone]       = useState('');
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0]);
  const [showPicker,  setShowPicker]  = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [errMsg,      setErrMsg]      = useState('');

  const verifyPhone = async () => {
    if (phone.replace(/\D/g, '').length < 9) {
      setErrMsg(ar ? 'الرجاء إدخال رقم هاتف صحيح' : 'Please enter a valid phone number');
      return;
    }
    setErrMsg('');
    setLoading(true);

    const fullNumber = `${countryCode.code}${phone.replace(/\s/g, '')}`;

    try {
      // Call backend to send OTP
      const res = await sendOtp(fullNumber);
      // Navigate to OTP screen; pass dev_code if backend returned it
      navigation.navigate('OTP', {
        phoneNumber: fullNumber,
        devCode:     res.dev_code ?? null,
      });
    } catch (err) {
      // Backend unavailable — still navigate (backend will handle verify)
      setErrMsg(ar ? 'تعذر إرسال الرمز. حاول مجدداً.' : 'Could not send code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Language toggle */}
        <TouchableOpacity
          style={[styles.langToggle, { alignSelf: isRTL ? 'flex-start' : 'flex-end' }]}
          onPress={toggleLanguage}
        >
          <Text style={styles.langToggleText}>{ar ? 'EN' : 'عربي'}</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.icon}>🚛</Text>
          <Text style={styles.brand}>TruckLink</Text>
          <Text style={styles.subtitle}>
            {ar ? 'أدخل رقم هاتفك للبدء' : 'Enter your phone number to get started'}
          </Text>
        </View>

        {/* Phone input card */}
        <View style={styles.card}>
          <Text style={[styles.label, { textAlign }]}>
            {ar ? 'رقم الهاتف' : 'Phone Number'}
          </Text>

          <View style={[styles.inputRow, { flexDirection: rowDir }]}>
            {/* Country picker button */}
            <TouchableOpacity
              style={[styles.countryBtn, { flexDirection: rowDir }]}
              onPress={() => setShowPicker(!showPicker)}
            >
              <Text style={styles.flag}>{countryCode.flag}</Text>
              <Text style={styles.countryCodeText}>{countryCode.code}</Text>
              <Text style={styles.chevron}>▾</Text>
            </TouchableOpacity>

            <TextInput
              style={[styles.phoneInput, { textAlign }]}
              placeholder="5X XXX XXXX"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={12}
              placeholderTextColor={COLORS.subtext}
            />
          </View>

          {/* Country dropdown */}
          {showPicker && (
            <View style={styles.picker}>
              {COUNTRY_CODES.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  style={[styles.pickerItem, { flexDirection: rowDir }]}
                  onPress={() => { setCountryCode(c); setShowPicker(false); }}
                >
                  <Text style={styles.pickerFlag}>{c.flag}</Text>
                  <Text style={[styles.pickerName, { textAlign }]}>{c[lang] ?? c.en}</Text>
                  <Text style={styles.pickerCode}>{c.code}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Error */}
          {!!errMsg && (
            <View style={styles.errBanner}>
              <Text style={styles.errText}>{errMsg}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.btn, (loading || phone.length < 9) && styles.btnDisabled]}
            onPress={verifyPhone}
            disabled={loading || phone.length < 9}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>
                  {ar ? 'إرسال رمز التحقق ←' : 'Send Verification Code →'}
                </Text>
            }
          </TouchableOpacity>

          <Text style={styles.terms}>
            {ar
              ? 'بالمتابعة، أنت توافق على شروط الخدمة وسياسة الخصوصية.'
              : "By continuing, you agree to TruckLink's Terms & Privacy Policy."}
          </Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:       { flexGrow: 1, backgroundColor: COLORS.bg, padding: 24, justifyContent: 'center' },
  langToggle:      { backgroundColor: COLORS.primary, borderRadius: 20,
                     paddingHorizontal: 14, paddingVertical: 6, marginBottom: 16 },
  langToggleText:  { color: '#fff', fontWeight: '700', fontSize: 13 },
  header:          { alignItems: 'center', marginBottom: 32 },
  icon:            { fontSize: 56 },
  brand:           { fontSize: 30, fontWeight: '800', color: COLORS.primary, marginTop: 8 },
  subtitle:        { fontSize: 14, color: COLORS.subtext, marginTop: 6, textAlign: 'center' },
  card:            { backgroundColor: COLORS.card, borderRadius: 16, padding: 24, elevation: 3,
                     shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width:0, height:2 } },
  label:           { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  inputRow:        { alignItems: 'center', marginBottom: 8, gap: 8 },
  countryBtn:      { alignItems: 'center', backgroundColor: COLORS.bg, borderRadius: 10,
                     paddingHorizontal: 10, paddingVertical: 12, gap: 4 },
  flag:            { fontSize: 20 },
  countryCodeText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  chevron:         { fontSize: 10, color: COLORS.subtext },
  phoneInput:      { flex: 1, backgroundColor: COLORS.bg, borderRadius: 10,
                     paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: COLORS.text },
  picker:          { backgroundColor: COLORS.card, borderRadius: 10, borderWidth: 1,
                     borderColor: COLORS.border, marginBottom: 12, maxHeight: 240 },
  pickerItem:      { alignItems: 'center', padding: 12,
                     borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 10 },
  pickerFlag:      { fontSize: 18 },
  pickerName:      { flex: 1, fontSize: 14, color: COLORS.text },
  pickerCode:      { fontSize: 13, color: COLORS.subtext },
  errBanner:       { backgroundColor: '#FDECEA', borderRadius: 10, padding: 12, marginTop: 8 },
  errText:         { color: COLORS.danger, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  btn:             { backgroundColor: COLORS.primary, borderRadius: 30, paddingVertical: 16,
                     alignItems: 'center', marginTop: 16 },
  btnDisabled:     { opacity: 0.45 },
  btnText:         { color: '#fff', fontWeight: '700', fontSize: 15 },
  terms:           { fontSize: 11, color: COLORS.subtext, textAlign: 'center', marginTop: 16, lineHeight: 16 },
});
