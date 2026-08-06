// src/screens/OTPScreen.js  —  Real backend OTP (no Firebase)
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage          from '@react-native-async-storage/async-storage';
import { COLORS }            from '../utils/constants';
import { useLanguage }       from '../context/LanguageContext';
import { useUser }           from '../context/UserContext';
import { sendOtp, verifyOtp } from '../utils/api';

const OTP_LENGTH = 6;

function notify(title, msg) {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${msg}`);
  else Alert.alert(title, msg);
}

export default function OTPScreen({ route, navigation }) {
  const { phoneNumber, devCode: initialDevCode } = route.params ?? {};
  const { t, isRTL }  = useLanguage();
  const { reloadUser } = useUser();
  const p              = t.otp;

  const [otp,      setOtp]      = useState(Array(OTP_LENGTH).fill(''));
  const [loading,  setLoading]  = useState(false);
  const [resendIn, setResendIn] = useState(60);
  const [devCode,  setDevCode]  = useState(initialDevCode ?? null);
  const inputs = useRef([]);

  const rtl = isRTL ? { textAlign: 'right' } : {};

  // Countdown timer
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  // Auto-fill dev code if we got it from the backend
  useEffect(() => {
    if (devCode && devCode.length === OTP_LENGTH) {
      setOtp(devCode.split(''));
    }
  }, [devCode]);

  const handleDigit = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1);
    setOtp(newOtp);
    if (text && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
    if (!text && index > 0)             inputs.current[index - 1]?.focus();
  };

  const handleKeyPress = ({ nativeEvent: { key } }, index) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      notify(p.incomplete, p.incompleteMsg);
      return;
    }
    setLoading(true);
    try {
      const data = await verifyOtp(phoneNumber, code);
      await reloadUser();

      // If user already has a role → go to Main; otherwise → RoleSelection
      if (data.user?.role && data.user?.full_name) {
        navigation.replace('Main', { role: data.user.role });
      } else {
        navigation.replace('RoleSelection', { phoneNumber });
      }
    } catch (err) {
      notify(p.wrongCode, p.wrongMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendIn(60);
    setOtp(Array(OTP_LENGTH).fill(''));
    try {
      const res = await sendOtp(phoneNumber);
      if (res.dev_code) setDevCode(res.dev_code);
    } catch { /* silent — user can still enter manually */ }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>

        {/* Back */}
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{p.back}</Text>
        </TouchableOpacity>

        <Text style={[styles.title, rtl]}>{p.title}</Text>
        <Text style={[styles.sub, rtl]}>
          {p.sentTo}{'\n'}
          <Text style={styles.phone}>{phoneNumber}</Text>
        </Text>

        {/* Dev hint banner */}
        {!!devCode && (
          <View style={styles.devBanner}>
            <Text style={styles.devText}>🧪 Dev code: <Text style={styles.devCode}>{devCode}</Text>  (auto-filled)</Text>
          </View>
        )}

        {/* OTP boxes */}
        <View style={[styles.otpRow, isRTL && { flexDirection: 'row-reverse' }]}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={r => (inputs.current[i] = r)}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              value={digit}
              onChangeText={t => handleDigit(t, i)}
              onKeyPress={e => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>{p.verify}</Text>}
        </TouchableOpacity>

        {/* Resend */}
        <View style={[styles.resendRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <Text style={styles.resendLabel}>{p.noCode}  </Text>
          {resendIn > 0
            ? <Text style={styles.resendTimer}>{p.resendIn(resendIn + 's')}</Text>
            : <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendBtn}>{p.resend}</Text>
              </TouchableOpacity>
          }
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const BOX = 48;
const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bg, padding: 28, paddingTop: 60 },
  back:         { marginBottom: 32 },
  backText:     { color: COLORS.primary, fontWeight: '600', fontSize: 15 },
  title:        { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  sub:          { fontSize: 14, color: COLORS.subtext, lineHeight: 22, marginBottom: 24 },
  phone:        { color: COLORS.primary, fontWeight: '700' },

  devBanner:    { backgroundColor: '#EFF8FF', borderRadius: 10, padding: 12,
                  marginBottom: 20, borderWidth: 1, borderColor: '#B3D9FF' },
  devText:      { fontSize: 13, color: '#1A6FB0', textAlign: 'center' },
  devCode:      { fontWeight: '800', letterSpacing: 2 },

  otpRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  otpBox:       { width: BOX, height: BOX + 8, borderRadius: 10, borderWidth: 2,
                  borderColor: COLORS.border, backgroundColor: COLORS.card,
                  fontSize: 22, fontWeight: '700', color: COLORS.text },
  otpBoxFilled: { borderColor: COLORS.primary },

  btn:          { backgroundColor: COLORS.primary, borderRadius: 12,
                  paddingVertical: 15, alignItems: 'center' },
  btnDisabled:  { opacity: 0.6 },
  btnText:      { color: '#fff', fontWeight: '700', fontSize: 15 },

  resendRow:    { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  resendLabel:  { color: COLORS.subtext, fontSize: 14 },
  resendTimer:  { color: COLORS.subtext, fontSize: 14 },
  resendBtn:    { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
});
