'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useLanguageContext } from '@/contexts/LanguageContext';

export default function LanguageSelector() {
  const { locale, setLocale } = useLanguageContext();
  const [open, setOpen] = useState(false);

  const languages = [
    { code: 'en' as const, name: 'English', flag: '🇬🇧' },
    { code: 'ne' as const, name: 'नेपाली', flag: '🇳🇵' },
  ];

  const handleLanguageChange = (newLocale: 'en' | 'ne') => {
    console.log('[LanguageSelector] Changing language to:', newLocale);
    setLocale(newLocale);
    setOpen(false);
  };

  const currentLanguage = languages.find(l => l.code === locale) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
        title="Change language / भाषा परिवर्तन गर्नुहोस्"
        aria-label="Language selector"
      >
        <Globe size={18} />
        <span className="text-sm font-semibold">{currentLanguage?.flag}</span>
        <span className="hidden sm:inline text-xs">{currentLanguage?.name}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition flex items-center gap-3 ${
                locale === lang.code ? 'bg-blue-50 border-l-4 border-blue-600' : ''
              }`}
              aria-label={`Select ${lang.name}`}
            >
              <span className="text-xl">{lang.flag}</span>
              <div>
                <p className="font-semibold text-gray-900">{lang.name}</p>
                <p className="text-xs text-gray-500">
                  {lang.code === 'en' ? 'English' : 'नेपाली'}
                </p>
              </div>
              {locale === lang.code && (
                <span className="ml-auto text-blue-600 font-bold">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

