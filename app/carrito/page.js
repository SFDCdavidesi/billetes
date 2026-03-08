'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';
import BanknoteImage from '@/components/BanknoteImage';

export default function CarritoPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data?.authenticated) {
          router.push('/login');
          return;
        }
        setUser(data.user);
      })
      .catch(() => router.push('/login'));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/carrito')
      .then(res => res.json())
      .then(data => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const getCurrencySymbol = (code) => {
    if (code === 'USD') return '$';
    if (code === 'GBP') return '£';
    return '€';
  };

  const removeItem = async (itemId) => {
    setRemoving(itemId);
    try {
      const res = await fetch(`/api/carrito?id=${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== itemId));
      }
    } catch {}
    setRemoving(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
              {t('cart.title')}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {items.length} {items.length === 1 ? t('cart.item') : t('cart.items')}
            </p>
          </div>
          <Link href="/" className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            {t('cart.continueShopping')}
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">{t('cart.empty')}</h2>
            <p className="text-gray-500 mb-6">{t('cart.emptyDesc')}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              {t('cart.exploreBanknotes')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <Link href={`/billete/${item.billete?.id}`} className="sm:w-48 h-36 sm:h-auto relative bg-gray-100 flex-shrink-0">
                    {item.billete?.imagen ? (
                      <BanknoteImage
                        src={item.billete.imagen}
                        alt={`${item.billete.pais} ${item.billete.denominacion}`}
                        fill
                        sizes="(max-width: 640px) 100vw, 192px"
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                        </svg>
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <Link href={`/billete/${item.billete?.id}`} className="group">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-gold-600 transition-colors">
                          {item.billete?.pais} — {item.billete?.denominacion} {item.billete?.unidad_monetaria}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.billete?.codigo_catalogo && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.billete.codigo_catalogo}
                          </span>
                        )}
                        {item.estado && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {t(`conditions.${item.estado}`) !== `conditions.${item.estado}` ? t(`conditions.${item.estado}`) : item.estado}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-2xl font-bold text-gold-700">
                        {getCurrencySymbol(item.moneda_precio)}{Number(item.precio).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={removing === item.id}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {removing === item.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        )}
                        {t('cart.remove')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Summary */}
            <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-700">{t('cart.summary')}</span>
                <span className="text-sm text-gray-500">{items.length} {items.length === 1 ? t('cart.item') : t('cart.items')}</span>
              </div>

              {/* Group totals by currency */}
              {(() => {
                const totals = {};
                items.forEach(item => {
                  const currency = item.moneda_precio || 'EUR';
                  totals[currency] = (totals[currency] || 0) + Number(item.precio || 0);
                });
                return Object.entries(totals).map(([currency, total]) => (
                  <div key={currency} className="flex items-center justify-between py-2 border-t border-gray-100">
                    <span className="text-gray-600">{t('cart.total')}</span>
                    <span className="text-2xl font-bold text-gold-700">
                      {getCurrencySymbol(currency)}{total.toFixed(2)}
                    </span>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
