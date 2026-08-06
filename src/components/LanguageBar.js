/**
 * LanguageBar.js
 * Horizontal row of 7 flag icons shown at the top of every screen.
 * Tapping a flag switches the app language instantly.
 *
 * Usage in AppNavigator header:
 *   headerRight: () => <LanguageBar />
 *   headerTitle: () => <LanguageBar />   ← centered in header
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      {LANGS.map(({ code, flag }) => {
        const active = code === lang;
        return (
          <TouchableOpacity
            key={code}
            onPress={() => switchLanguage(code)}
            style={[styles.btn, active && styles.activeBtn]}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            accessibilityLabel={code}
          >
            <Text style={[styles.flag, active && styles.activeFlag]}>{flag}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 2,
  },
  btn: {
    padding: 4,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  activeBtn: {
    borderColor: '#C49A45',
    backgroundColor: '#FBF3EA',
  },
  flag: {
    fontSize: 18,
    opacity: 0.55,
  },
  activeFlag: {
    opacity: 1,
  },
});
