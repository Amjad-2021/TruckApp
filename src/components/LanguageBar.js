/**
 * LanguageBar.js — 7 flag icons in header, tap to switch language instantly
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

const LANGS = [
  { code: 'ar', flag: '🇸🇦' },
  { code: 'en', flag: '🇬🇧' },
  { code: 'ur', flag: '🇵🇰' },
  { code: 'fr', flag: '🇫🇷' },
  { code: 'hi', flag: '🇮🇳' },
  { code: 'bn', flag: '🇧🇩' },
  { code: 'sw', flag: '🇰🇪' },
];

export default function LanguageBar() {
  const { lang, switchLanguage } = useLanguage();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {LANGS.map(({ code, flag }) => {
        const active = code === lang;
        return (
          <TouchableOpacity
            key={code}
            onPress={() => switchLanguage(code)}
            style={[styles.btn, active && styles.activeBtn]}
            hitSlop={{ top: 8, bottom: 8, left: 2, right: 2 }}
          >
            <Text style={styles.flag}>{flag}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
    gap: 3,
  },
  btn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  activeBtn: {
    borderColor: '#C49A45',
    backgroundColor: '#FBF3EA',
  },
  flag: {
    fontSize: 16,
  },
});
