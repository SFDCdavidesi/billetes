import es from '@/locales/es.json';
import en from '@/locales/en.json';
import de from '@/locales/de.json';

const dictionaries = { es, en, de };

export const defaultLocale = 'es';
export const locales = ['es', 'en', 'de'];

export function getDictionary(locale) {
  return dictionaries[locale] || dictionaries[defaultLocale];
}

export function getLocaleLabel(locale) {
  const labels = { es: 'Español', en: 'English', de: 'Deutsch' };
  return labels[locale] || locale;
}

export function getLocaleFlagCode(locale) {
  const codes = { es: 'ES', en: 'GB', de: 'DE' };
  return codes[locale] || 'ES';
}
