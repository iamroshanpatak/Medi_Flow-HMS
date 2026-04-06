'use client';

import { useLanguageContext } from '@/contexts/LanguageContext';
import en from '@/messages/en.json';
import ne from '@/messages/ne.json';

type Locale = 'en' | 'ne';
type TranslationMessages = typeof en;

const messages: Record<Locale, TranslationMessages> = {
  en,
  ne,
};

export function useTranslation() {
  const { locale } = useLanguageContext();

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = messages[locale];

    // Navigate through the nested keys
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        // Key not found, fallback to English
        console.warn(`[Translation] Key not found for locale '${locale}': ${key}, falling back to English`);
        value = messages.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = (value as Record<string, unknown>)[fallbackKey];
          } else {
            console.error(`[Translation] Key not found in English either: ${key}`);
            return key;
          }
        }
        break;
      }
    }

    const result = typeof value === 'string' ? value : key;
    if (typeof value === 'string') {
      console.log(`[Translation] ${locale} > ${key} = "${result}"`);
    }
    return result;
  };

  return { t, locale };
}

