'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { getDictionary, defaultLocale } from '@/lib/i18n';

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('locale') || defaultLocale;
    }
    return defaultLocale;
  });

  const dict = getDictionary(locale);

  const setLocale = useCallback((newLocale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
      document.documentElement.lang = newLocale;
    }
  }, []);

  function t(key) {
    const keys = key.split('.');
    let value = dict;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}
