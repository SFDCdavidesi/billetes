'use client';

import { useState, useRef, useEffect } from 'react';
import { useI18n } from './I18nProvider';
import { locales, getLocaleLabel, getLocaleFlagCode } from '@/lib/i18n';

const flags = {
  ES: (
    <svg className="w-5 h-4 rounded-sm" viewBox="0 0 640 480">
      <rect width="640" height="480" fill="#c60b1e"/>
      <rect width="640" height="160" y="160" fill="#ffc400"/>
    </svg>
  ),
  GB: (
    <svg className="w-5 h-4 rounded-sm" viewBox="0 0 640 480">
      <rect width="640" height="480" fill="#012169"/>
      <path d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z" fill="#fff"/>
      <path d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z" fill="#c8102e"/>
      <path d="M241 0v480h160V0H241zM0 160v160h640V160H0z" fill="#fff"/>
      <path d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" fill="#c8102e"/>
    </svg>
  ),
  DE: (
    <svg className="w-5 h-4 rounded-sm" viewBox="0 0 640 480">
      <rect width="640" height="160" fill="#000"/>
      <rect width="640" height="160" y="160" fill="#d00"/>
      <rect width="640" height="160" y="320" fill="#ffce00"/>
    </svg>
  ),
};

function FlagIcon({ code }) {
  return flags[code] || null;
}

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gold-600 border border-gray-200 rounded-lg hover:border-gold-300 transition-colors"
      >
        <FlagIcon code={getLocaleFlagCode(locale)} />
        <span className="hidden sm:inline">{getLocaleLabel(locale)}</span>
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => { setLocale(loc); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                loc === locale
                  ? 'bg-gold-50 text-gold-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FlagIcon code={getLocaleFlagCode(loc)} />
              <span>{getLocaleLabel(loc)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
