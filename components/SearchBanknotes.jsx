'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from './I18nProvider';
import BanknoteImage from './BanknoteImage';
import { translateCountry, getAllCountriesTranslated, countryToEnglish } from '@/lib/countries';

export default function SearchBanknotes() {
  const { t, locale } = useI18n();
  const [paises, setPaises] = useState([]);
  const [filters, setFilters] = useState({ pais: '', anio_desde: '', anio_hasta: '', denominacion: '', referencia: '' });
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Load countries for dropdown (translated and sorted by current locale)
  useEffect(() => {
    fetch('/api/billetes/paises')
      .then(res => res.json())
      .then(data => {
        const translated = getAllCountriesTranslated(data.paises || [], locale);
        setPaises(translated);
      })
      .catch(() => {});
  }, [locale]);

  const doSearch = (pageNum = 1) => {
    const params = new URLSearchParams();
    if (filters.pais) params.set('pais', countryToEnglish(filters.pais, locale));
    if (filters.anio_desde) params.set('anio_desde', filters.anio_desde);
    if (filters.anio_hasta) params.set('anio_hasta', filters.anio_hasta);
    if (filters.denominacion) params.set('denominacion', filters.denominacion);
    if (filters.referencia) params.set('referencia', filters.referencia);
    params.set('page', pageNum.toString());
    params.set('limit', '12');

    setLoading(true);
    fetch(`/api/billetes/search?${params}`)
      .then(res => res.json())
      .then(data => {
        setResults(data.billetes || []);
        setTotal(data.total || 0);
        setPage(data.page || 1);
        setTotalPages(data.totalPages || 0);
        setSearched(true);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doSearch(1);
  };

  const clearFilters = () => {
    setFilters({ pais: '', anio_desde: '', anio_hasta: '', denominacion: '', referencia: '' });
    setResults([]);
    setSearched(false);
    setTotal(0);
  };

  return (
    <section id="buscador" className="py-16 bg-gray-50 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
            🔍 {t('search.badge')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif">
            {t('search.title')}{' '}
            <span className="text-primary-600">{t('search.titleHighlight')}</span>
          </h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">{t('search.subtitle')}</p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('search.reference')}</label>
              <input
                type="text"
                placeholder={t('search.referencePlaceholder')}
                value={filters.referencia}
                onChange={(e) => setFilters(f => ({ ...f, referencia: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('fields.country')}</label>
              <select
                value={filters.pais}
                onChange={(e) => setFilters(f => ({ ...f, pais: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              >
                <option value="">{t('search.allCountries')}</option>
                {paises.map(p => (
                  <option key={p.en} value={p.translated}>{p.translated}</option>
                ))}
              </select>
            </div>

            {/* Year range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('fields.year')}</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder={t('search.from')}
                  value={filters.anio_desde}
                  onChange={(e) => setFilters(f => ({ ...f, anio_desde: e.target.value }))}
                  className="w-1/2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  min="1800"
                  max="2030"
                />
                <input
                  type="number"
                  placeholder={t('search.to')}
                  value={filters.anio_hasta}
                  onChange={(e) => setFilters(f => ({ ...f, anio_hasta: e.target.value }))}
                  className="w-1/2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  min="1800"
                  max="2030"
                />
              </div>
            </div>

            {/* Denomination / Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('fields.denomination')}</label>
              <input
                type="number"
                placeholder={t('search.denominationPlaceholder')}
                value={filters.denominacion}
                onChange={(e) => setFilters(f => ({ ...f, denominacion: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                min="0"
                step="any"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                )}
                {t('search.searchButton')}
              </button>
              {searched && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-3 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors"
                  title={t('search.clear')}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Results */}
        {searched && (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              {total} {t('search.resultsFound')}
            </p>

            {results.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {results.map(billete => (
                    <Link
                      href={`/billete/${billete.id}`}
                      key={billete.id}
                      className="block bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="relative aspect-[3/2] bg-gray-100 overflow-hidden">
                        <BanknoteImage
                          src={billete.imagen}
                          alt={`${billete.pais} ${billete.unidad_monetaria} ${billete.codigo_catalogo}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                          {billete.codigo_catalogo}
                        </span>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-gray-500 font-medium mb-1">
                          {translateCountry(billete.pais, locale)}{billete.anio ? ` · ${billete.anio}` : ''}
                        </p>
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-1">
                          {billete.denominacion > 0 ? billete.denominacion : ''} {billete.unidad_monetaria}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => doSearch(page - 1)}
                      disabled={page <= 1}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-colors"
                    >
                      ←
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-600">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => doSearch(page + 1)}
                      disabled={page >= totalPages}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-colors"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <p className="text-gray-500">{t('search.noResults')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
