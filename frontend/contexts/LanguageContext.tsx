'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type Locale = 'en' | 'ne';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Initialize from localStorage on client side only
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language');
      if (saved === 'en' || saved === 'ne') {
        console.log('[LanguageProvider] Initialized with saved locale:', saved);
        return saved;
      }
    }
    console.log('[LanguageProvider] Initialized with default locale: en');
    return 'en';
  });

  const setLocale = useCallback((newLocale: Locale) => {
    console.log('[LanguageContext] Changing locale to:', newLocale);
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLocale);
      console.log('[LanguageContext] Saved to localStorage:', newLocale);
    }
  }, []);

  const value = { locale, setLocale };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
}
