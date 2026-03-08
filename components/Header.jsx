'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from './I18nProvider';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { t } = useI18n();

  const handleLogout = () => {
    fetch('/api/auth/logout', { method: 'POST' })
      .then(() => { setUser(null); window.location.href = '/'; })
      .catch(() => {});
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.authenticated) setUser(data.user); })
      .catch(() => {});
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-gold-500 to-gold-700 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl md:text-2xl font-serif font-bold text-gray-900">
                Billetes<span className="text-gold-600">Antiguos</span>
              </h1>
              <p className="text-xs text-gray-500 -mt-1">{t('header.subtitle')}</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/catalogo" className="text-gray-700 hover:text-gold-600 font-medium transition-colors">
              {t('header.catalog')}
            </Link>
            <a href="/#buscador" className="text-gray-700 hover:text-gold-600 font-medium transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              {t('header.search')}
            </a>
            <Link href="/subastas" className="text-gray-700 hover:text-gold-600 font-medium transition-colors">
              {t('header.auctions')}
            </Link>
            <Link href="/comunidad" className="text-gray-700 hover:text-gold-600 font-medium transition-colors">
              {t('header.community')}
            </Link>
            {user && (
              <Link href="/mis-billetes" className="text-gray-700 hover:text-gold-600 font-medium transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                </svg>
                {t('header.myBanknotes')}
              </Link>
            )}
            {user && (
              <Link href="/colecciones" className="text-gray-700 hover:text-gold-600 font-medium transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                </svg>
                {t('header.collections')}
              </Link>
            )}
            {user && (
              <Link href="/estadisticas" className="text-gray-700 hover:text-gold-600 font-medium transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
                {t('header.stats')}
              </Link>
            )}
            {user && user.perfil === 'administrador' && (
              <Link href="/admin" className="text-gray-700 hover:text-gold-600 font-medium transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                {t('header.admin')}
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-700 font-medium">
                  {user.nombre}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-500 hover:text-red-600 font-medium transition-colors text-sm"
                >
                  {t('header.logout')}
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-gold-600 font-medium transition-colors">
                  {t('header.login')}
                </Link>
                <Link href="/registro" className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                  {t('header.signup')}
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-gold-600 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-3">
            <Link href="/catalogo" className="block px-4 py-2 text-gray-700 hover:bg-gold-50 hover:text-gold-600 rounded-lg transition-colors">
              {t('header.catalog')}
            </Link>
            <a href="/#buscador" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-gold-50 hover:text-gold-600 rounded-lg transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              {t('header.search')}
            </a>
            <Link href="/subastas" className="block px-4 py-2 text-gray-700 hover:bg-gold-50 hover:text-gold-600 rounded-lg transition-colors">
              {t('header.auctions')}
            </Link>
            <Link href="/comunidad" className="block px-4 py-2 text-gray-700 hover:bg-gold-50 hover:text-gold-600 rounded-lg transition-colors">
              {t('header.community')}
            </Link>
            {user && (
              <Link href="/mis-billetes" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-gold-50 hover:text-gold-600 rounded-lg transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                </svg>
                {t('header.myBanknotes')}
              </Link>
            )}
            {user && (
              <Link href="/colecciones" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-gold-50 hover:text-gold-600 rounded-lg transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                </svg>
                {t('header.collections')}
              </Link>
            )}
            {user && (
              <Link href="/estadisticas" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-gold-50 hover:text-gold-600 rounded-lg transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
                {t('header.stats')}
              </Link>
            )}
            {user && user.perfil === 'administrador' && (
              <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-gold-50 hover:text-gold-600 rounded-lg transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                {t('header.admin')}
              </Link>
            )}
            <div className="px-4 py-2">
              <LanguageSwitcher />
            </div>
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              {user ? (
                <>
                  <span className="px-4 py-2 text-center text-gray-700 font-medium">
                    {user.nombre}
                  </span>
                  <button
                    onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                    className="px-4 py-2 text-center text-gray-500 hover:text-red-600 font-medium transition-colors"
                  >
                    {t('header.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 text-center text-gray-700 hover:text-gold-600 font-medium transition-colors">
                    {t('header.login')}
                  </Link>
                  <Link href="/registro" className="mx-4 px-4 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-white font-semibold rounded-lg text-center shadow-md">
                    {t('header.signup')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
