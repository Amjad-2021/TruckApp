// PaymentWebViewScreen.js
// Opens Moyasar payment page in the device's browser via Linking.openURL,
// then polls the backend every 4 seconds to detect when payment completes.
// No react-native-webview dependency — works on iOS, Android, and web.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS }          from '../utils/constants';
import { useLanguage }     from '../context/LanguageContext';
import { getPaymentStatus } from '../utils/api';

export default function PaymentWebViewScreen({ route, navigation }) {
  const { paymentUrl, loadId, agreedPrice } = route.params ?? {};
  const { lang, isRTL } = useLanguage();
  const textAlign = isRTL ? 'right' : 'left';

  // 'idle' | 'waiting' | 'paid' | 'failed'
  const [phase,       setPhase]       = useState('idle');
  const [errMsg,      setErrMsg]      = useState('');
  const pollRef  = useRef(null);
  const pollCount = useRef(0);
  const MAX_POLLS = 75;   // ~5 minutes at 4s intervals

  const platformFee    = agreedPrice ? Math.round(agreedPrice * 0.03 * 100) / 100 : 0;
  const driverReceives = agreedPrice ? Math.round(agreedPrice * 0.97 * 100) / 100 : 0;

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function startPolling() {
    stopPolling();
    pollCount.current = 0;
    pollRef.current = setInterval(async () => {
      pollCount.current += 1;
      if (pollCount.current > MAX_POLLS) {
        stopPolling();
        setPhase('failed');
        setErrMsg(lang === 'ar'
          ? 'انتهت مهلة انتظار الدفع. يمكنك المحاولة مجدداً.'
          : 'Payment timed out. You can try again.');
        return;
      }
      try {
        const res = await getPaymentStatus(loadId);
        const status = res?.payment?.status;
        if (status === 'paid' || status === 'released') {
          stopPolling();
          setPhase('paid');
        } else if (status === 'failed' || status === 'refunded') {
          stopPolling();
          setPhase('failed');
          setErrMsg(lang === 'ar' ? 'فشلت عملية الدفع' : 'Payment failed');
        }
        // 'pending' → keep polling
      } catch {
        // network blip — keep polling
      }
    }, 4000);
  }

  // Stop polling when screen unmounts or loses focus
  useFocusEffect(
    useCallback(() => {
      return () => stopPolling();
    }, [])
  );

  async function openPayment() {
    if (!paymentUrl) {
      setPhase('failed');
      setErrMsg(lang === 'ar' ? 'رابط الدفع غير متوفر' : 'Payment URL not available');
      return;
    }
    try {
      await Linking.openURL(paymentUrl);
      setPhase('waiting');
      startPolling();
    } catch {
      setPhase('failed');
      setErrMsg(lang === 'ar' ? 'تعذر فتح صفحة الدفع' : 'Could not open payment page');
    }
  }

  // ── IDLE — show Pay button ──────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <View style={styles.center}>
        <Text style={styles.bigIcon}>💳</Text>
        <Text style={[styles.heading, { textAlign }]}>
          {lang === 'ar' ? 'إتمام الدفع' : 'Complete Payment'}
        </Text>

        {agreedPrice > 0 && (
          <View style={styles.breakdown}>
            <BreakRow
              label={lang === 'ar' ? 'السعر المتفق'      : 'Agreed price'}
              value={`${agreedPrice.toLocaleString()} SAR`}
              isRTL={isRTL}
            />
            <BreakRow
              label={lang === 'ar' ? 'رسوم المنصة (3%)' : 'Platform fee (3%)'}
              value={`${platformFee.toLocaleString()} SAR`}
              highlight isRTL={isRTL}
            />
            <BreakRow
              label={lang === 'ar' ? 'يستلم السائق'     : 'Driver receives'}
              value={`${driverReceives.toLocaleString()} SAR`}
              isRTL={isRTL}
            />
          </View>
        )}

        <Text style={[styles.note, { textAlign }]}>
          {lang === 'ar'
            ? 'سيتم فتح بوابة الدفع في المتصفح. عد إلى التطبيق بعد إتمام الدفع.'
            : 'The payment gateway will open in your browser. Return to the app once payment is complete.'}
        </Text>

        <TouchableOpacity style={styles.payBtn} onPress={openPayment}>
          <Text style={styles.payBtnText}>
            {lang === 'ar' ? '💳 فتح صفحة الدفع' : '💳 Open Payment Page'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={styles.cancelLink}>
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── WAITING — polling ───────────────────────────────────────────────────────
  if (phase === 'waiting') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginBottom: 20 }} />
        <Text style={[styles.heading, { textAlign }]}>
          {lang === 'ar' ? 'في انتظار تأكيد الدفع…' : 'Waiting for payment confirmation…'}
        </Text>
        <Text style={[styles.subtext, { textAlign }]}>
          {lang === 'ar'
            ? 'أكمل الدفع في المتصفح ثم عد إلى هنا تلقائياً'
            : 'Complete payment in your browser — this screen updates automatically'}
        </Text>

        {/* Manual "I already paid" check */}
        <TouchableOpacity
          style={[styles.payBtn, { marginTop: 32, backgroundColor: COLORS.secondary }]}
          onPress={async () => {
            try {
              const res = await getPaymentStatus(loadId);
              const s = res?.payment?.status;
              if (s === 'paid' || s === 'released') {
                stopPolling(); setPhase('paid');
              } else {
                setErrMsg(lang === 'ar' ? 'لم يتأكد الدفع بعد' : 'Payment not confirmed yet');
              }
            } catch {}
          }}
        >
          <Text style={styles.payBtnText}>
            {lang === 'ar' ? '🔄 تحقق الآن' : '🔄 Check Now'}
          </Text>
        </TouchableOpacity>
        {!!errMsg && <Text style={styles.errText}>{errMsg}</Text>}

        <TouchableOpacity onPress={() => { stopPolling(); navigation.goBack(); }} style={{ marginTop: 16 }}>
          <Text style={styles.cancelLink}>
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── PAID — success ─────────────────────────────────────────────────────────
  if (phase === 'paid') {
    return (
      <View style={styles.center}>
        <Text style={styles.successIcon}>🎉</Text>
        <Text style={[styles.heading, { textAlign }]}>
          {lang === 'ar' ? 'تم الدفع بنجاح!' : 'Payment Successful!'}
        </Text>
        <Text style={[styles.subtext, { textAlign }]}>
          {lang === 'ar'
            ? 'تم استلام دفعتك. سيتم إيداع مبلغ السائق عند تأكيد التسليم.'
            : 'Your payment was received. Driver funds will be released upon delivery confirmation.'}
        </Text>

        {agreedPrice > 0 && (
          <View style={styles.breakdown}>
            <BreakRow
              label={lang === 'ar' ? 'إجمالي الدفع'     : 'Total paid'}
              value={`${agreedPrice.toLocaleString()} SAR`}
              isRTL={isRTL}
            />
            <BreakRow
              label={lang === 'ar' ? 'رسوم المنصة (3%)' : 'Platform fee (3%)'}
              value={`${platformFee.toLocaleString()} SAR`}
              highlight isRTL={isRTL}
            />
            <BreakRow
              label={lang === 'ar' ? 'محجوز للسائق'     : 'Held for driver'}
              value={`${driverReceives.toLocaleString()} SAR`}
              isRTL={isRTL}
            />
          </View>
        )}

        <TouchableOpacity
          style={styles.payBtn}
          onPress={() => navigation.navigate('Orders')}
        >
          <Text style={styles.payBtnText}>
            {lang === 'ar' ? '📋 عرض الطلبات' : '📋 View Orders'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── FAILED ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.center}>
      <Text style={styles.failIcon}>😞</Text>
      <Text style={[styles.heading, { textAlign }]}>
        {lang === 'ar' ? 'فشل الدفع' : 'Payment Failed'}
      </Text>
      <Text style={[styles.subtext, { textAlign }]}>
        {errMsg || (lang === 'ar' ? 'حدث خطأ أثناء الدفع' : 'Something went wrong with your payment.')}
      </Text>

      <TouchableOpacity
        style={[styles.payBtn, { marginTop: 24 }]}
        onPress={() => { setPhase('idle'); setErrMsg(''); }}
      >
        <Text style={styles.payBtnText}>
          {lang === 'ar' ? '🔄 المحاولة مجدداً' : '🔄 Try Again'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
        <Text style={styles.cancelLink}>
          {lang === 'ar' ? 'العودة' : 'Go Back'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function BreakRow({ label, value, highlight, isRTL }) {
  return (
    <View style={[bStyles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <Text style={[bStyles.label, highlight && { color: COLORS.secondary }]}>{label}</Text>
      <Text style={[bStyles.value, highlight && { color: COLORS.secondary, fontWeight: '800' }]}>{value}</Text>
    </View>
  );
}

const bStyles = StyleSheet.create({
  row:   { justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 13, color: COLORS.subtext },
  value: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
});

const styles = StyleSheet.create({
  center:      { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center',
                 justifyContent: 'center', padding: 28 },
  bigIcon:     { fontSize: 56, marginBottom: 14 },
  successIcon: { fontSize: 64, marginBottom: 14 },
  failIcon:    { fontSize: 56, marginBottom: 14 },
  heading:     { fontSize: 22, fontWeight: '800', color: COLORS.text,
                 marginBottom: 10, textAlign: 'center' },
  subtext:     { fontSize: 14, color: COLORS.subtext, textAlign: 'center',
                 lineHeight: 21, marginBottom: 22 },
  note:        { fontSize: 13, color: COLORS.subtext, textAlign: 'center',
                 lineHeight: 19, marginBottom: 24 },
  breakdown:   { width: '100%', backgroundColor: '#fff', borderRadius: 14,
                 padding: 16, marginBottom: 24,
                 elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 5 },
  payBtn:      { backgroundColor: COLORS.primary, borderRadius: 12,
                 paddingVertical: 14, paddingHorizontal: 32,
                 alignItems: 'center', width: '100%' },
  payBtnText:  { color: '#fff', fontSize: 16, fontWeight: '800' },
  cancelLink:  { fontSize: 14, color: COLORS.subtext, textDecorationLine: 'underline' },
  errText:     { color: COLORS.danger, fontSize: 13, marginTop: 10, textAlign: 'center' },
});
