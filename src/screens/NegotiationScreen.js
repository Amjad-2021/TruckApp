import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, KeyboardAvoidingView, Platform, Alert, Modal,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, LOAD_STATUS, PLATFORM_FEE_PERCENT } from '../utils/constants';
import { calculateFee, formatSAR, timeAgo } from '../utils/helpers';
import { useLanguage } from '../context/LanguageContext';
import { getMessages, sendMessage, acceptLoad } from '../utils/api';

// Safe SAR formatter
const safeSAR = (amount) => {
  const n = parseFloat(amount);
  if (isNaN(n)) return 'SAR 0';
  try { return formatSAR(n); } catch { return `SAR ${n.toLocaleString()}`; }
};

// Normalize API message → UI message shape
function normalizeApiMsg(m) {
  const msgType = m.msg_type === 'offer' || m.msg_type === 'counter_offer'
    ? 'price'
    : m.msg_type === 'accept' || m.msg_type === 'reject'
    ? 'system'
    : 'text';

  const price = m.offer_amount ? parseFloat(m.offer_amount) : undefined;
  return {
    id:            String(m.id),
    type:          msgType,
    senderId:      String(m.sender_id),
    senderName:    m.sender_name ?? 'User',
    senderRole:    m.sender_role,
    timestamp:     m.created_at ? new Date(m.created_at) : new Date(),
    text:          m.body,
    proposedPrice: price,
    feeBreakdown:  price ? calculateFee(price) : undefined,
  };
}

export default function NegotiationScreen({ route, navigation }) {
  const { load, truck } = route.params ?? {};
  const { t, isRTL, lang } = useLanguage();
  const n = t.neg;

  // Determine the load ID — only defined when we came from a real load
  const loadId = load?.id ?? null;

  const [myUserId,     setMyUserId]     = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [loadingMsgs,  setLoadingMsgs]  = useState(!!loadId);
  const [input,        setInput]        = useState('');
  const [priceInput,   setPriceInput]   = useState('');
  const [showPricePad, setShowPricePad] = useState(false);
  const [dealStatus,   setDealStatus]   = useState(load?.status ?? 'negotiating');
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [agreedPrice,  setAgreedPrice]  = useState(load?.agreed_price ?? null);
  const [sending,      setSending]      = useState(false);
  const listRef = useRef(null);
  const pollRef = useRef(null);

  const textAlign = isRTL ? 'right' : 'left';
  const rowDir    = isRTL ? 'row-reverse' : 'row';

  // Get current user ID from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem('trucklink_user').then(json => {
      if (json) {
        const u = JSON.parse(json);
        setMyUserId(String(u.id ?? u.uid ?? ''));
      }
    });
  }, []);

  // Load messages from API (only when we have a real loadId)
  const fetchMessages = useCallback(async () => {
    if (!loadId) return;
    try {
      const data = await getMessages(loadId);
      setMessages((data.messages ?? []).map(normalizeApiMsg));
    } catch {
      // silently fail on poll
    } finally {
      setLoadingMsgs(false);
    }
  }, [loadId]);

  useEffect(() => {
    if (!loadId) {
      setLoadingMsgs(false);
      return;
    }
    fetchMessages();
    // Poll every 5 seconds for new messages
    pollRef.current = setInterval(fetchMessages, 5000);
    return () => clearInterval(pollRef.current);
  }, [fetchMessages, loadId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const addLocalMsg = (msg) => {
    setMessages(prev => [...prev, { ...msg, id: `local_${Date.now()}` }]);
  };

  const sendText = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');

    if (!loadId) {
      // No real load — just show locally
      addLocalMsg({ type: 'text', senderId: myUserId ?? 'me', senderName: 'You', timestamp: new Date(), text });
      return;
    }

    setSending(true);
    try {
      const data = await sendMessage(loadId, { body: text, msg_type: 'text' });
      // Message returned from API — add it
      if (data.message) {
        setMessages(prev => [...prev, normalizeApiMsg(data.message)]);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to send message.');
      setInput(text); // restore input on failure
    } finally {
      setSending(false);
    }
  };

  const sendPriceProposal = async () => {
    const price = parseFloat(priceInput);
    if (!price || price <= 0) { Alert.alert(n.invalidPrice, n.invalidPriceMsg); return; }
    const fee = calculateFee(price);
    setPriceInput(''); setShowPricePad(false);

    if (!loadId) {
      // Demo mode — show locally only
      addLocalMsg({
        type: 'price', text: n.proposeMsg(safeSAR(price)),
        proposedPrice: price, feeBreakdown: fee,
        senderId: myUserId ?? 'me', senderName: 'You', timestamp: new Date(),
      });
      return;
    }

    setSending(true);
    try {
      const data = await sendMessage(loadId, {
        body:         n.proposeMsg(safeSAR(price)),
        msg_type:     'offer',
        offer_amount: price,
      });
      if (data.message) {
        setMessages(prev => [...prev, normalizeApiMsg(data.message)]);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to send offer.');
    } finally {
      setSending(false);
    }
  };

  const acceptPrice = (price) => {
    Alert.alert(
      n.acceptTitle,
      n.confirmText(safeSAR(price), safeSAR(price * 0.03), safeSAR(price * 0.97)),
      [
        { text: n.cancel, style: 'cancel' },
        {
          text: n.acceptDeal,
          onPress: async () => {
            setAgreedPrice(price);
            setDealStatus('confirmed');
            setShowFeeModal(true);
            const sysMsg = {
              type: 'system', text: n.sysConfirmed(safeSAR(price)),
              timestamp: new Date(), senderId: 'system', senderName: 'TruckLink',
            };
            addLocalMsg(sysMsg);

            if (!loadId) return;

            try {
              // Get driver ID from truck param or load
              const driverId = truck?.id ?? load?.driver_id;
              if (driverId) {
                await acceptLoad(loadId, driverId, price);
              }
              // Notify server via message too
              await sendMessage(loadId, {
                body:     n.sysConfirmed(safeSAR(price)),
                msg_type: 'accept',
              });
            } catch {
              // Optimistic — deal already shown as confirmed locally
            }
          }
        }
      ]
    );
  };

  const renderMessage = ({ item: msg }) => {
    const isMe     = msg.senderId === myUserId || msg.senderName === 'You';
    const isSystem = msg.senderId === 'system' || msg.type === 'system';

    if (isSystem) return (
      <View style={styles.systemMsg}><Text style={styles.systemMsgText}>{msg.text}</Text></View>
    );

    return (
      <View style={[styles.msgRow, isMe
        ? { flexDirection: isRTL ? 'row' : 'row-reverse' }
        : { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {!isMe && <Text style={styles.avatar}>{msg.senderName?.[0] ?? '?'}</Text>}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          {!isMe && <Text style={[styles.senderName, { textAlign }]}>{msg.senderName}</Text>}

          {msg.type === 'price' ? (
            <View>
              <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe, { textAlign }]}>{msg.text}</Text>
              <View style={[styles.priceCard, isMe && styles.priceCardMe]}>
                <Text style={styles.priceCardAmount}>{safeSAR(msg.proposedPrice)}</Text>
                {msg.feeBreakdown && (
                  <>
                    <Text style={styles.priceCardFee}>{n.platformFee} {safeSAR(msg.feeBreakdown.platformFee)}</Text>
                    <Text style={styles.priceCardNet}>{n.driverGetsLabel} {safeSAR(msg.feeBreakdown.driverReceives)}</Text>
                  </>
                )}
                {!isMe && dealStatus !== 'confirmed' && (
                  <View style={[styles.priceActions, { flexDirection: rowDir }]}>
                    <TouchableOpacity style={styles.acceptBtn} onPress={() => acceptPrice(msg.proposedPrice)}>
                      <Text style={styles.acceptBtnText}>{n.accept}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.counterBtn} onPress={() => { setPriceInput(String(msg.proposedPrice)); setShowPricePad(true); }}>
                      <Text style={styles.counterBtnText}>{n.counter}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe, { textAlign }]}>{msg.text}</Text>
          )}
          <Text style={[styles.timestamp, isMe && styles.timestampMe]}>{timeAgo(msg.timestamp)}</Text>
        </View>
      </View>
    );
  };

  // Header info
  const otherName  = load ? (load.shipperName || load.shipper_name || n.shipper) : (truck?.driverName || n.driver);
  const routeLabel = load
    ? `${load.fromCity ?? load.from_city}  →  ${load.toCity ?? load.to_city}`
    : truck
    ? `${truck.fromCity}  →  ${truck.toCity}`
    : null;

  const budget = load?.budget ?? load?.offered_price;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: rowDir }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
          <Text style={styles.headerBackText}>{isRTL ? '→' : '←'}</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { textAlign }]}>{otherName}</Text>
          {routeLabel && (
            <Text style={[styles.headerSub, { textAlign }]}>
              {routeLabel}  ·  {budget ? safeSAR(budget) : (truck?.pricePerTon ? `SAR ${truck.pricePerTon}/${n.ton}` : '')}
            </Text>
          )}
        </View>
        <View style={[styles.statusBadge, dealStatus === 'confirmed' && styles.statusBadgeConfirmed]}>
          <Text style={styles.statusBadgeText}>
            {dealStatus === 'confirmed' ? n.confirmed : n.negotiating}
          </Text>
        </View>
      </View>

      {/* Load context banner */}
      {load && (
        <View style={styles.contextBanner}>
          <Text style={[styles.contextText, { textAlign }]}>
            📦 {load.cargoType ?? load.cargo_type}  ·  {load.weight ?? load.weight_tons} {n.ton}  ·  {n.budgetLabel}: {safeSAR(budget)}
          </Text>
        </View>
      )}

      {/* No-load banner (came from MapScreen with truck only) */}
      {!load && truck && (
        <View style={styles.noLoadBanner}>
          <Text style={styles.noLoadText}>
            💡 Post a load to start chatting with this driver and negotiate a price.
          </Text>
          <TouchableOpacity
            style={styles.postLoadBtn}
            onPress={() => navigation.navigate('PostLoad')}
          >
            <Text style={styles.postLoadBtnText}>Post a Load →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Messages */}
      {loadingMsgs
        ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              loadId ? (
                <View style={styles.emptyChat}>
                  <Text style={styles.emptyChatIcon}>💬</Text>
                  <Text style={styles.emptyChatText}>No messages yet. Start the negotiation!</Text>
                </View>
              ) : null
            }
          />
        )
      }

      {/* Input bar */}
      {dealStatus !== 'confirmed' && loadId ? (
        <View style={[styles.inputBar, { flexDirection: rowDir }]}>
          <TouchableOpacity style={styles.priceBtn} onPress={() => setShowPricePad(true)}>
            <Text style={styles.priceBtnText}>💰</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder={n.typeMsg}
            value={input}
            onChangeText={setInput}
            placeholderTextColor={COLORS.subtext}
            multiline maxLength={500}
            textAlign={textAlign}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
            onPress={sendText}
            disabled={!input.trim() || sending}
          >
            {sending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.sendBtnText}>➤</Text>
            }
          </TouchableOpacity>
        </View>
      ) : dealStatus === 'confirmed' ? (
        <View style={styles.dealConfirmedBar}>
          <Text style={styles.dealConfirmedText}>{n.dealBar(safeSAR(agreedPrice))}</Text>
        </View>
      ) : null}

      {/* ── Price Proposal Modal ─────────────────────────────── */}
      <Modal visible={showPricePad} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowPricePad(false)} activeOpacity={1}>
          <View style={styles.priceModal} onStartShouldSetResponder={() => true}>
            {routeLabel && (
              <View style={[styles.modalRouteRow, { flexDirection: rowDir }]}>
                <Text style={styles.modalRouteIcon}>📍</Text>
                <Text style={[styles.modalRouteText, { textAlign }]}>{routeLabel}</Text>
                {budget ? (
                  <View style={styles.modalBudgetBadge}>
                    <Text style={styles.modalBudgetText}>{n.budgetLabel}: {safeSAR(budget)}</Text>
                  </View>
                ) : null}
              </View>
            )}
            <Text style={[styles.priceModalTitle, { textAlign }]}>{n.proposeTitle}</Text>
            <TextInput
              style={styles.priceModalInput}
              placeholder={n.enterAmount}
              value={priceInput}
              onChangeText={setPriceInput}
              keyboardType="numeric" autoFocus
              placeholderTextColor={COLORS.subtext}
              textAlign="center"
            />
            {priceInput ? (
              <View style={styles.feePreview}>
                <Text style={[styles.feePreviewTitle, { textAlign }]}>{n.breakdownIf}</Text>
                <FeeRow label={n.proposedPrice}                value={safeSAR(priceInput)}                             rowDir={rowDir} />
                <FeeRow label={n.feeLine(PLATFORM_FEE_PERCENT)} value={safeSAR(parseFloat(priceInput) * 0.03)}         color={COLORS.danger}   rowDir={rowDir} />
                <FeeRow label={n.driverGets}                   value={safeSAR(parseFloat(priceInput) * 0.97)}          color={COLORS.success}  bold rowDir={rowDir} />
              </View>
            ) : null}
            <TouchableOpacity
              style={[styles.sendPriceBtn, !priceInput && { opacity: 0.4 }]}
              onPress={sendPriceProposal}
              disabled={!priceInput}
            >
              <Text style={styles.sendPriceBtnText}>{n.sendOffer}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Deal Confirmed Modal ─────────────────────────────── */}
      <Modal visible={showFeeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.feeModal}>
            <Text style={styles.feeModalTitle}>🎉 {n.dealDone}</Text>
            <Text style={styles.feeModalSub}>{n.dealDoneSub}</Text>
            <View style={styles.feeModalRows}>
              <FeeModalRow label={n.agreedPrice}   value={safeSAR(agreedPrice)} />
              <FeeModalRow label={n.platformFee}   value={safeSAR((agreedPrice ?? 0) * 0.03)} color={COLORS.danger} />
              <FeeModalRow label={n.driverGetsLabel} value={safeSAR((agreedPrice ?? 0) * 0.97)} color={COLORS.success} bold />
            </View>
            <TouchableOpacity style={styles.feeModalBtn} onPress={() => setShowFeeModal(false)}>
              <Text style={styles.feeModalBtnText}>{n.viewOrders}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function FeeRow({ label, value, color, bold, rowDir }) {
  return (
    <View style={[styles.feePreviewRow, { flexDirection: rowDir }]}>
      <Text style={[styles.feePreviewLabel, color && { color }]}>{label}</Text>
      <Text style={[styles.feePreviewValue, color && { color }, bold && { fontWeight: '800' }]}>{value}</Text>
    </View>
  );
}

function FeeModalRow({ label, value, color, bold }) {
  return (
    <View style={styles.feeModalRow}>
      <Text style={[styles.feeModalLabel, color && { color }]}>{label}</Text>
      <Text style={[styles.feeModalValue, color && { color }, bold && { fontWeight: '800' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header:              { backgroundColor: COLORS.primary, paddingTop: 54, paddingBottom: 14, paddingHorizontal: 14,
                         alignItems: 'center', gap: 10 },
  headerBack:          { padding: 4 },
  headerBackText:      { fontSize: 22, color: '#fff', fontWeight: '700' },
  headerInfo:          { flex: 1 },
  headerName:          { fontSize: 16, fontWeight: '800', color: '#fff' },
  headerSub:           { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  statusBadge:         { backgroundColor: COLORS.secondary, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusBadgeConfirmed:{ backgroundColor: COLORS.success },
  statusBadgeText:     { color: '#fff', fontSize: 11, fontWeight: '700' },
  contextBanner:       { backgroundColor: COLORS.primary + '22', paddingVertical: 8, paddingHorizontal: 16 },
  contextText:         { fontSize: 12, color: COLORS.text, fontWeight: '500' },
  noLoadBanner:        { backgroundColor: '#FFF9E6', padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  noLoadText:          { fontSize: 13, color: COLORS.text, marginBottom: 8 },
  postLoadBtn:         { backgroundColor: COLORS.secondary, borderRadius: 10, paddingVertical: 8,
                         paddingHorizontal: 16, alignSelf: 'flex-start' },
  postLoadBtnText:     { color: '#fff', fontWeight: '700', fontSize: 13 },
  messageList:         { padding: 14, paddingBottom: 20 },
  emptyChat:           { alignItems: 'center', marginTop: 60 },
  emptyChatIcon:       { fontSize: 40, marginBottom: 10 },
  emptyChatText:       { fontSize: 14, color: COLORS.subtext },
  msgRow:              { marginBottom: 10, alignItems: 'flex-end', gap: 8 },
  avatar:              { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary + '30',
                         textAlign: 'center', lineHeight: 32, fontSize: 16, overflow: 'hidden' },
  bubble:              { maxWidth: '75%', borderRadius: 16, padding: 12 },
  bubbleThem:          { backgroundColor: '#fff', borderBottomLeftRadius: 4,
                         elevation: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3 },
  bubbleMe:            { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  senderName:          { fontSize: 11, fontWeight: '700', color: COLORS.subtext, marginBottom: 4 },
  bubbleText:          { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  bubbleTextMe:        { color: '#fff' },
  timestamp:           { fontSize: 10, color: COLORS.subtext, marginTop: 4, textAlign: 'right' },
  timestampMe:         { color: 'rgba(255,255,255,0.65)' },
  priceCard:           { backgroundColor: '#FFF9E6', borderRadius: 12, padding: 10, marginTop: 8,
                         borderWidth: 1.5, borderColor: COLORS.secondary + '66' },
  priceCardMe:         { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)' },
  priceCardAmount:     { fontSize: 20, fontWeight: '800', color: COLORS.secondary, textAlign: 'center', marginBottom: 4 },
  priceCardFee:        { fontSize: 11, color: COLORS.danger, textAlign: 'center' },
  priceCardNet:        { fontSize: 12, fontWeight: '700', color: COLORS.success, textAlign: 'center' },
  priceActions:        { marginTop: 10, gap: 8 },
  acceptBtn:           { flex: 1, backgroundColor: COLORS.success, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  acceptBtnText:       { color: '#fff', fontWeight: '700', fontSize: 13 },
  counterBtn:          { flex: 1, backgroundColor: COLORS.secondary + '20', borderRadius: 10, paddingVertical: 8,
                         alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.secondary },
  counterBtnText:      { color: COLORS.secondary, fontWeight: '700', fontSize: 13 },
  systemMsg:           { alignItems: 'center', marginVertical: 8 },
  systemMsgText:       { fontSize: 12, color: COLORS.subtext, backgroundColor: COLORS.bg,
                         paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, fontStyle: 'italic' },
  inputBar:            { backgroundColor: '#fff', padding: 10, paddingHorizontal: 14, gap: 8, alignItems: 'center',
                         borderTopWidth: 1, borderTopColor: COLORS.border },
  priceBtn:            { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.secondary + '20',
                         alignItems: 'center', justifyContent: 'center' },
  priceBtnText:        { fontSize: 18 },
  textInput:           { flex: 1, backgroundColor: COLORS.bg, borderRadius: 20, paddingHorizontal: 14,
                         paddingVertical: 10, fontSize: 14, color: COLORS.text, maxHeight: 100 },
  sendBtn:             { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary,
                         alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled:     { backgroundColor: COLORS.border },
  sendBtnText:         { color: '#fff', fontWeight: '700', fontSize: 16 },
  dealConfirmedBar:    { backgroundColor: COLORS.success, padding: 14, alignItems: 'center' },
  dealConfirmedText:   { color: '#fff', fontWeight: '700', fontSize: 14 },
  modalOverlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  priceModal:          { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
                         padding: 24, paddingBottom: 40 },
  modalRouteRow:       { alignItems: 'center', gap: 8, marginBottom: 16, backgroundColor: COLORS.bg,
                         borderRadius: 12, padding: 12 },
  modalRouteIcon:      { fontSize: 16 },
  modalRouteText:      { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.text },
  modalBudgetBadge:    { backgroundColor: COLORS.success + '22', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  modalBudgetText:     { fontSize: 11, color: COLORS.success, fontWeight: '700' },
  priceModalTitle:     { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  priceModalInput:     { backgroundColor: COLORS.bg, borderRadius: 14, paddingVertical: 16,
                         fontSize: 28, fontWeight: '800', color: COLORS.primary, textAlign: 'center', marginBottom: 12 },
  feePreview:          { backgroundColor: '#FFF9E6', borderRadius: 12, padding: 14, marginBottom: 16 },
  feePreviewTitle:     { fontSize: 12, fontWeight: '700', color: COLORS.subtext, marginBottom: 8, textTransform: 'uppercase' },
  feePreviewRow:       { justifyContent: 'space-between', marginBottom: 4 },
  feePreviewLabel:     { fontSize: 13, color: COLORS.subtext },
  feePreviewValue:     { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  sendPriceBtn:        { backgroundColor: COLORS.secondary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  sendPriceBtnText:    { color: '#fff', fontWeight: '800', fontSize: 16 },
  feeModal:            { backgroundColor: '#fff', margin: 24, borderRadius: 20, padding: 24, alignItems: 'center' },
  feeModalTitle:       { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  feeModalSub:         { fontSize: 13, color: COLORS.subtext, marginBottom: 20, textAlign: 'center' },
  feeModalRows:        { width: '100%', marginBottom: 20 },
  feeModalRow:         { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6,
                         borderBottomWidth: 1, borderBottomColor: COLORS.border },
  feeModalLabel:       { fontSize: 14, color: COLORS.subtext },
  feeModalValue:       { fontSize: 14, color: COLORS.text },
  feeModalBtn:         { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14,
                         paddingHorizontal: 32, alignItems: 'center' },
  feeModalBtnText:     { color: '#fff', fontWeight: '800', fontSize: 15 },
});
