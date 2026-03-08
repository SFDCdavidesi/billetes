'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/components/I18nProvider';

export default function EstadisticasPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/estadisticas')
      .then(res => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        if (!res.ok) throw new Error('Error');
        return res.json();
      })
      .then(data => {
        if (data) setStats(data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-red-500">{t('stats.error')}</p>
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { key: 'countries', value: stats.totalPaises, icon: '🌍', color: 'from-blue-500 to-blue-600' },
    { key: 'banknotes', value: stats.totalBilletes, icon: '💵', color: 'from-green-500 to-green-600' },
    { key: 'images', value: stats.totalImagenes, icon: '📷', color: 'from-purple-500 to-purple-600' },
    { key: 'users', value: stats.totalUsuarios, icon: '👥', color: 'from-gold-500 to-gold-600' },
    { key: 'copies', value: stats.totalEjemplares, icon: '🏷️', color: 'from-red-500 to-red-600' },
    { key: 'collections', value: stats.totalColecciones, icon: '📚', color: 'from-teal-500 to-teal-600' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
            {t('stats.title')}
          </h1>
          <p className="mt-3 text-lg text-gray-600">{t('stats.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(card => (
            <div
              key={card.key}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 flex items-center gap-5"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-2xl shadow-md`}>
                {card.icon}
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {card.value.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 font-medium">
                  {t(`stats.${card.key}`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
