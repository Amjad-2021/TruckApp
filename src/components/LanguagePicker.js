/**
 * LanguagePicker.js
 * A modal that lists all 8 languages. Drop it anywhere — tap the globe button.
 *
 * Usage:
 *   import LanguagePicker from '../components/LanguagePicker';
 *   <LanguagePicker />   ← renders globe button + modal
 *
 * Or to control externally:
 *   <LanguagePicker visible={show} onClose={() => setShow(false)} hideButton />
 */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, FlatList,
  StyleSheet, SafeAreaView, Platform,
} from 'react-native';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { COLORS } from '../utils/constants';

export default function LanguagePicker({ visible, onClose, hideButton = false }) {
  const { lang, switchLanguage, isRTL } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);

  const isOpen = visible !== undefined ? visible : modalVisible;
  const close  = onClose ?? (() => setModalVisible(false));

  const handleSelect = async (code) => {
    await switchLanguage(code);
    close();
  };

  return (
    <>
      {/* Globe trigger button — rendered unless hideButton=true */}
      {!hideButton && (
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.globeBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Change language"
        >
          <Text style={styles.globeIcon}>🌐</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent
        onRequestClose={close}
      >
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={close}>
          <SafeAreaView style={styles.sheet}>
            {/* Header */}
            <View style={styles.handle} />
            <View style={[styles.header, isRTL && styles.row_rtl]}>
              <Text style={styles.title}>🌐 Language / اللغة</Text>
              <TouchableOpacity onPress={close} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={LANGUAGES}
              keyExtractor={item => item.code}
              ItemSeparatorComponent={() => <View style={styles.sep} />}
              renderItem={({ item }) => {
                const selected = item.code === lang;
                return (
                  <TouchableOpacity
                    style={[styles.row, selected && styles.selectedRow]}
                    onPress={() => handleSelect(item.code)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.flag}>{item.flag}</Text>
                    <View style={styles.labelBlock}>
                      <Text style={[styles.nativeLabel, selected && styles.selectedText]}>
                        {item.label}
                      </Text>
                      <Text style={styles.engLabel}>{item.nativeLabel}</Text>
                    </View>
                    {selected && <Text style={styles.check}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Globe button (fixed position — parent sets absolute if needed)
  globeBtn: {
    padding: 6,
  },
  globeIcon: {
    fontSize: 22,
  },

  // Modal overlay
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  row_rtl: { flexDirection: 'row-reverse' },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeBtn: {
    fontSize: 18,
    color: COLORS.subtext,
    fontWeight: '600',
  },

  // Language rows
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  selectedRow: {
    backgroundColor: '#FBF3EA',
  },
  flag: {
    fontSize: 26,
    marginRight: 14,
    width: 32,
    textAlign: 'center',
  },
  labelBlock: {
    flex: 1,
  },
  nativeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  engLabel: {
    fontSize: 13,
    color: COLORS.subtext,
    marginTop: 1,
  },
  selectedText: {
    color: COLORS.primary,
  },
  check: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '700',
    marginLeft: 8,
  },
  sep: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 20,
  },
});
