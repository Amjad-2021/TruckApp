import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const LANGUAGES = [
  { code: 'ar', flag: '🇸🇦', label: 'العربية',   nativeLabel: 'Arabic' },
  { code: 'en', flag: '🇬🇧', label: 'English',    nativeLabel: 'English' },
  { code: 'ur', flag: '🇵🇰', label: 'اردو',       nativeLabel: 'Urdu' },
  { code: 'fr', flag: '🇫🇷', label: 'Français',   nativeLabel: 'French' },
  { code: 'hi', flag: '🇮🇳', label: 'हिन्दी',      nativeLabel: 'Hindi' },
  { code: 'bn', flag: '🇧🇩', label: 'বাংলা',      nativeLabel: 'Bengali' },
  { code: 'sw', flag: '🇰🇪', label: 'Kiswahili',  nativeLabel: 'Swahili' },
];

const RTL_LANGS = ['ar', 'ur'];

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('ar');

  const switchLanguage = async (newLang) => {
    setLang(newLang);
    try { await AsyncStorage.setItem('trucklink_lang', newLang); } catch {}
  };

  const toggleLanguage = () => switchLanguage(lang === 'ar' ? 'en' : 'ar');

  // Use the lang's translations, fall back to English, then Arabic
  const t = translations[lang] ?? translations['en'] ?? translations['ar'] ?? {};
  const isRTL = RTL_LANGS.includes(lang);

  return (
    <LanguageContext.Provider value={{ lang, t, isRTL, switchLanguage, toggleLanguage, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
