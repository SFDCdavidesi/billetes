'use client';

import Image from 'next/image';
import { useI18n } from './I18nProvider';

export default function BilleteCard({ billete }) {
  const { t } = useI18n();

  const conditionColors = {
    UNC: 'bg-emerald-100 text-emerald-700',
    AU: 'bg-green-100 text-green-700',
    XF: 'bg-blue-100 text-blue-700',
    VF: 'bg-amber-100 text-amber-700',
    F: 'bg-orange-100 text-orange-700',
  };

  const colorClass = conditionColors[billete.condition] || 'bg-gray-100 text-gray-700';

  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-[3/2] bg-gray-100 overflow-hidden">
        <Image
          src={billete.image}
          alt={billete.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {billete.badge && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow">
            {billete.badge}
          </span>
        )}
        <button
          className="absolute top-3 right-3 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:text-red-500 transition-all shadow"
          title={t('featured.addFavorite')}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 font-medium">{billete.country} · {billete.year}</span>
          {billete.condition && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colorClass}`}>
              {billete.condition}
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-amber-700 transition-colors">
          {billete.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{billete.denomination} {billete.currency}</p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xl font-bold text-amber-700">
            {billete.price ? `€${billete.price}` : t('featured.noPrice')}
          </span>
          <button className="text-sm font-semibold text-amber-600 hover:text-amber-800 flex items-center gap-1 transition-colors">
            {t('featured.viewDetails')}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
