'use client';

import Link from 'next/link';
import { useI18n } from './I18nProvider';

const featureIcons = [
  // Authenticity
  <svg key="auth" className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>,
  // Search
  <svg key="search" className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>,
  // Community
  <svg key="community" className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>,
  // Valuation
  <svg key="valuation" className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>,
];

const featureKeys = ['authenticity', 'search', 'community', 'valuation'];
const featureColors = [
  'from-emerald-500 to-emerald-600',
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-amber-500 to-amber-600',
];

export default function FeaturesSection() {
  const { t } = useI18n();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 text-sm font-semibold rounded-full mb-4">
            🛡️ {t('features.badge')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif">
            {t('features.title')}{' '}
            <span className="text-amber-600">{t('features.titleHighlight')}</span>
          </h2>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">{t('features.subtitle')}</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {featureKeys.map((key, i) => (
            <div key={key} className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors group">
              <div className={`w-14 h-14 mx-auto mb-5 rounded-xl bg-gradient-to-br ${featureColors[i]} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                {featureIcons[i]}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t(`features.${key}`)}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{t(`features.${key}Desc`)}</p>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white font-serif mb-3">
            {t('features.ctaTitle')}
          </h3>
          <p className="text-gray-400 max-w-xl mx-auto mb-8">{t('features.ctaDescription')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/registro"
              className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg transition-colors"
            >
              {t('features.ctaButton')}
            </Link>
            <Link
              href="#"
              className="px-8 py-3 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 font-semibold rounded-xl transition-colors"
            >
              {t('features.ctaTour')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
