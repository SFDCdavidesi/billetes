'use client';

import Link from 'next/link';
import { useI18n } from './I18nProvider';

export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white">{t('footer.newsletter')}</h3>
              <p className="text-gray-400 mt-1">{t('footer.newsletterDesc')}</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder={t('footer.newsletterPlaceholder')}
                className="flex-1 md:w-72 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <button className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors whitespace-nowrap">
                {t('footer.newsletterButton')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="text-2xl font-bold text-white font-serif">
              Billetes<span className="text-amber-500">Antiguos</span>
            </Link>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              {t('footer.description')}
            </p>
            <p className="mt-4 text-sm text-gray-500">{t('footer.social')}</p>
            <div className="flex gap-3 mt-2">
              {['twitter', 'instagram', 'facebook'].map((s) => (
                <span key={s} className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-amber-600 flex items-center justify-center transition-colors cursor-pointer">
                  <span className="text-sm">{s === 'twitter' ? '𝕏' : s === 'instagram' ? '📷' : '📘'}</span>
                </span>
              ))}
            </div>
          </div>

          {/* About */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.aboutTitle')}</h4>
            <ul className="space-y-2 text-sm">
              {['aboutUs', 'howItWorks', 'team', 'careers'].map((k) => (
                <li key={k}>
                  <Link href="#" className="hover:text-amber-400 transition-colors">{t(`footer.${k}`)}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.contactTitle')}</h4>
            <ul className="space-y-2 text-sm">
              {['help', 'contact', 'faq', 'blog'].map((k) => (
                <li key={k}>
                  <Link href="#" className="hover:text-amber-400 transition-colors">{t(`footer.${k}`)}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.legalTitle')}</h4>
            <ul className="space-y-2 text-sm">
              {['terms', 'privacy', 'cookies'].map((k) => (
                <li key={k}>
                  <Link href="#" className="hover:text-amber-400 transition-colors">{t(`footer.${k}`)}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
          © {year} BilletesAntiguos. {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
}
