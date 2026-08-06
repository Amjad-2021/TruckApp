/**
 * LanguageContext.js — 8-language support
 * Languages: ar, en, tr, ur, hi, fil, si, ne
 * RTL: ar, ur
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../utils/translations';

const LANG_KEY = 'trucklink_lang';

// Language metadata shown in the picker
export const LANGUAGES = [
  { code: 'ar',  label: 'العربية',    nativeLabel: 'Arabic',    flag: '🇸🇦', rtl: true  },
  { code: 'en',  label: 'English',    nativeLabel: 'English',   flag: '🇬🇧', rtl: false },
  { code: 'tr',  label: 'Türkçe',     nativeLabel: 'Turkish',   flag: '🇹🇷', rtl: false },
  { code: 'ur',  label: 'اردو',        nativeLabel: 'Urdu',      flag: '🇵🇰', rtl: true  },
  { code: 'hi',  label: 'हिंदी',       nativeLabel: 'Hindi',     flag: '🇮🇳', rtl: false },
  { code: 'fil', label: 'Filipino',   nativeLabel: 'Filipino',  flag: '🇵🇭', rtl: false },
  { code: 'si',  label: 'සිංහල',      nativeLabel: 'Sinhala',   flag: '🇱🇰', rtl: false },
  { code: 'ne',  label: 'नेपाली',      nativeLabel: 'Nepali',    flag: '🇳🇵', rtl: false },
];

const DEFAULT_LANG = 'ar';
const RTL_LANGS = new Set(['ar', 'ur']);

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(DEFAULT_LANG);

  // Load saved language on mount
  React.useEffect(() => {
    AsyncStorage.getItem(LANG_KEY)
      .then(saved => { if (saved && translations[saved]) setLang(saved); })
      .catch(() => {});
  }, []);

  const switchLanguage = useCallback(async (code) => {
    if (!translations[code]) return;
    setLang(code);
    try { await AsyncStorage.setItem(LANG_KEY, code); } catch (_) {}
  }, []);

  // Cycle through all 8 languages (used by the globe toggle button)
  const toggleLanguage = useCallback(() => {
    const codes = LANGUAGES.map(l => l.code);
    const next = codes[(codes.indexOf(lang) + 1) % codes.length];
    switchLanguage(next);
  }, [lang, switchLanguage]);

  const isRTL = RTL_LANGS.has(lang);
  const t = translations[lang] || translations[DEFAULT_LANG];

  return (
    <LanguageContext.Provider value={{ lang, t, isRTL, switchLanguage, toggleLanguage, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be inside <LanguageProvider>');
  return ctx;
}
