'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useI18n } from './I18nProvider';
import BilleteCard from './BilleteCard';

const sampleBanknotes = [
  {
    id: 1,
    title: '1 Rupee 1919',
    country: 'Afghanistan',
    year: 1919,
    denomination: '1',
    currency: 'Rupee',
    condition: 'VF',
    price: 285,
    image: '/images/billetes/afghanistan-1-rupee-sh-1298-1299-1919-1920--p1_1.jpg',
    badge: null,
    region: 'asia',
  },
  {
    id: 2,
    title: '10 Afghanis 1928',
    country: 'Afghanistan',
    year: 1928,
    denomination: '10',
    currency: 'Afghanis',
    condition: 'XF',
    price: 120,
    image: '/images/billetes/afghanistan-10-afghanis-nd-1926-1928--p8_1.jpg',
    badge: null,
    region: 'asia',
  },
  {
    id: 3,
    title: '1 Afghani SH1381',
    country: 'Afghanistan',
    year: 2002,
    denomination: '1',
    currency: 'Afghani',
    condition: 'UNC',
    price: 15,
    image: '/images/billetes/afghanistan-1-afghani-sh-1381--p64_1.jpg',
    badge: null,
    region: 'asia',
  },
  {
    id: 4,
    title: '1 Caboulies Rupee 1928',
    country: 'Afghanistan',
    year: 1928,
    denomination: '1',
    currency: 'Caboulies Rupee',
    condition: 'F',
    price: 350,
    image: '/images/billetes/afghanistan-1-caboulies-rupee-nd-1928--p14_1.jpg',
    badge: null,
    region: 'asia',
  },
  {
    id: 5,
    title: '10 Afghanis SH1307',
    country: 'Afghanistan',
    year: 1928,
    denomination: '10',
    currency: 'Afghanis',
    condition: 'VF',
    price: 195,
    image: '/images/billetes/afghanistan-10-afghanis-sh-1307-1928--p9_1.jpg',
    badge: null,
    region: 'asia',
  },
  {
    id: 6,
    title: '10 Afghanis SH1307 P12',
    country: 'Afghanistan',
    year: 1928,
    denomination: '10',
    currency: 'Afghanis',
    condition: 'AU',
    price: 220,
    image: '/images/billetes/afghanistan-10-afghanis-sh-1307-1928--p12_1.jpg',
    badge: null,
    region: 'asia',
  },
];

const filterKeys = ['filterAll', 'filterEurope', 'filterAmerica', 'filterAsia'];
const filterRegions = [null, 'europe', 'america', 'asia'];

export default function FeaturedCollections() {
  const { t } = useI18n();
  const [activeFilter, setActiveFilter] = useState(0);

  const filtered = activeFilter === 0
    ? sampleBanknotes
    : sampleBanknotes.filter((b) => b.region === filterRegions[activeFilter]);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 text-sm font-semibold rounded-full mb-4">
            ✨ {t('featured.badge')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif">
            {t('featured.title')}{' '}
            <span className="text-amber-600">{t('featured.titleHighlight')}</span>
          </h2>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">{t('featured.subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {filterKeys.map((key, i) => (
            <button
              key={key}
              onClick={() => setActiveFilter(i)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === i
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-200'
                  : 'bg-white text-gray-600 hover:bg-amber-50 border border-gray-200'
              }`}
            >
              {t(`featured.${key}`)}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((billete) => (
            <BilleteCard key={billete.id} billete={billete} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors"
          >
            {t('featured.viewCatalog')}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
