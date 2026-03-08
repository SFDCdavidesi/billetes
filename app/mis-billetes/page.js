'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';
import { translateCountry } from '@/lib/countries';

const CONDITION_KEYS = ['UNC', 'AU', 'XF', 'VF', 'F', 'VG', 'G', 'FR', 'P'];
const CURRENCIES = [
  { value: 'EUR', label: '€' },
  { value: 'USD', label: '$' },
  { value: 'GBP', label: '£' },
];

const condicionColors = {
  UNC: 'bg-emerald-100 text-emerald-800',
  AU: 'bg-green-100 text-green-800',
  XF: 'bg-lime-100 text-lime-800',
  VF: 'bg-yellow-100 text-yellow-800',
  F: 'bg-amber-100 text-amber-800',
  VG: 'bg-orange-100 text-orange-800',
  G: 'bg-red-100 text-red-800',
  FR: 'bg-red-200 text-red-900',
  P: 'bg-gray-200 text-gray-800',
};

export default function MisBilletesPage() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [user, setUser] = useState(null);
  const [ejemplares, setEjemplares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterVenta, setFilterVenta] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterPais, setFilterPais] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.authenticated) setUser(data.user);
        else router.push('/login');
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const fetchEjemplares = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (filterVenta) params.set('en_venta', filterVenta);
    if (filterEstado) params.set('estado', filterEstado);
    if (filterPais) params.set('pais', filterPais);

    setLoading(true);
    fetch(`/api/ejemplares/mis-billetes?${params}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setEjemplares(data.ejemplares || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, filterVenta, filterEstado, filterPais]);

  useEffect(() => {
    if (user) fetchEjemplares();
  }, [user, fetchEjemplares]);

  const startEdit = (ej) => {
    setEditingId(ej.id);
    setEditForm({
      numero_serie: ej.numero_serie || '',
      estado_conservacion: ej.estado_conservacion || 'VF',
      en_venta: ej.en_venta || false,
      precio: ej.precio ? String(ej.precio) : '',
      moneda_precio: ej.moneda_precio || 'EUR',
    });
  };

  const handleSave = async () => {
    if (editForm.en_venta && (!editForm.precio || parseFloat(editForm.precio) <= 0)) {
      setMessage({ type: 'error', text: t('ihave.priceRequired') });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/ejemplares', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          numero_serie: editForm.numero_serie || null,
          estado_conservacion: editForm.estado_conservacion,
          en_venta: editForm.en_venta,
          precio: editForm.en_venta ? parseFloat(editForm.precio) : null,
          moneda_precio: editForm.en_venta ? editForm.moneda_precio : null,
        }),
      });

      if (res.ok) {
        setEditingId(null);
        fetchEjemplares();
        setMessage({ type: 'success', text: t('myBanknotes.saved') });
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error });
      }
    } catch {
      setMessage({ type: 'error', text: t('myBanknotes.error') });
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm(t('myBanknotes.confirmDelete'))) return;
    try {
      const res = await fetch(`/api/ejemplares?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchEjemplares();
        setMessage({ type: 'success', text: t('myBanknotes.deleted') });
      }
    } catch {
      setMessage({ type: 'error', text: t('myBanknotes.error') });
    }
  };

  const clearFilters = () => {
    setFilterVenta('');
    setFilterEstado('');
    setFilterPais('');
    setPage(1);
  };

  if (!user || (loading && ejemplares.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
            <div className="space-y-3 mt-8">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl"></div>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-serif">{t('myBanknotes.title')}</h1>
          <p className="text-gray-500 mt-1">
            {t('myBanknotes.subtitle')} · {total} {total === 1 ? t('myBanknotes.banknote') : t('myBanknotes.banknotes')}
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-xl text-sm flex items-center justify-between ${
            message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' :
            'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-2 text-current opacity-50 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={filterVenta}
              onChange={(e) => { setFilterVenta(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            >
              <option value="">{t('myBanknotes.allSaleStatus')}</option>
              <option value="true">{t('myBanknotes.forSale')}</option>
              <option value="false">{t('myBanknotes.notForSale')}</option>
            </select>

            <select
              value={filterEstado}
              onChange={(e) => { setFilterEstado(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            >
              <option value="">{t('myBanknotes.allConditions')}</option>
              {CONDITION_KEYS.map(k => (
                <option key={k} value={k}>{k} — {t(`conditions.${k}`)}</option>
              ))}
            </select>

            <input
              type="text"
              value={filterPais}
              onChange={(e) => { setFilterPais(e.target.value); setPage(1); }}
              placeholder={t('myBanknotes.filterCountry')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none w-44"
            />

            {(filterVenta || filterEstado || filterPais) && (
              <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-amber-600 underline">
                {t('search.clear')}
              </button>
            )}
          </div>
        </div>

        {/* List */}
        {ejemplares.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
            </svg>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t('myBanknotes.emptyTitle')}</h3>
            <p className="text-gray-500 mb-4">{t('myBanknotes.emptyDesc')}</p>
            <Link
              href="/#buscador"
              className="inline-block px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              {t('myBanknotes.exploreCatalog')}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {ejemplares.map((ej) => {
              const m = ej.modelo;
              const isEditing = editingId === ej.id;

              return (
                <div key={ej.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <Link href={m ? `/billete/${m.id}` : '#'} className="flex-shrink-0 w-full sm:w-36 h-24 sm:h-auto relative bg-gray-100">
                      {m?.imagen ? (
                        <Image
                          src={m.imagen}
                          alt={m.codigo_catalogo || ''}
                          fill
                          className="object-contain p-2"
                          sizes="144px"
                        />
                      ) : (
                        <div className="w-full h-full min-h-[6rem] flex items-center justify-center text-gray-300">
                          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                          </svg>
                        </div>
                      )}
                    </Link>

                    {/* Content */}
                    <div className="flex-1 p-4">
                      {isEditing ? (
                        /* Edit form */
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-sm font-bold text-gray-900">
                              {m ? `${translateCountry(m.pais, locale)} — ${m.codigo_catalogo}` : `#${ej.id}`}
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">{t('ihave.serialNumber')}</label>
                              <input
                                type="text"
                                maxLength={50}
                                value={editForm.numero_serie}
                                onChange={(e) => setEditForm({ ...editForm, numero_serie: e.target.value })}
                                placeholder={t('ihave.serialPlaceholder')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">{t('ihave.condition')}</label>
                              <select
                                value={editForm.estado_conservacion}
                                onChange={(e) => setEditForm({ ...editForm, estado_conservacion: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                              >
                                {CONDITION_KEYS.map(k => (
                                  <option key={k} value={k}>{k} — {t(`conditions.${k}`)}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editForm.en_venta}
                                onChange={(e) => setEditForm({ ...editForm, en_venta: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                              />
                              <span className="text-sm font-medium text-gray-700">{t('ihave.forSale')}</span>
                            </label>
                          </div>

                          {editForm.en_venta && (
                            <div className="flex gap-3">
                              <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-600 mb-1">{t('ihave.price')}</label>
                                <input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={editForm.precio}
                                  onChange={(e) => setEditForm({ ...editForm, precio: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">{t('ihave.currency')}</label>
                                <select
                                  value={editForm.moneda_precio}
                                  onChange={(e) => setEditForm({ ...editForm, moneda_precio: e.target.value })}
                                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                >
                                  {CURRENCIES.map(c => (
                                    <option key={c.value} value={c.value}>{c.value} ({c.label})</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                            >
                              {t('myBanknotes.cancel')}
                            </button>
                            <button
                              onClick={handleSave}
                              disabled={saving}
                              className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700 disabled:opacity-50"
                            >
                              {saving ? t('myBanknotes.saving') : t('myBanknotes.save')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Display */
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <Link href={m ? `/billete/${m.id}` : '#'} className="hover:text-amber-600 transition-colors">
                              <h3 className="text-base font-bold text-gray-900 truncate">
                                {m ? `${translateCountry(m.pais, locale)} — ${m.denominacion > 0 ? `${m.denominacion} ` : ''}${m.unidad_monetaria}` : `#${ej.id}`}
                              </h3>
                            </Link>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {m?.codigo_catalogo && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{m.codigo_catalogo}</span>
                              )}
                              {m?.a_o_emision && (
                                <span className="text-xs text-gray-500">{m.a_o_emision}</span>
                              )}
                              {ej.estado_conservacion && (
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${condicionColors[ej.estado_conservacion] || 'bg-gray-100 text-gray-700'}`}>
                                  {ej.estado_conservacion} — {t(`conditions.${ej.estado_conservacion}`)}
                                </span>
                              )}
                              {ej.numero_serie && (
                                <span className="text-xs text-gray-400">S/N: {ej.numero_serie}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              {ej.en_venta ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                  </svg>
                                  {t('myBanknotes.forSale')} — {ej.precio} {ej.moneda_precio}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                                  {t('myBanknotes.notForSale')}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => startEdit(ej)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 hover:border-amber-300 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                              </svg>
                              {t('myBanknotes.edit')}
                            </button>
                            <button
                              onClick={() => handleDelete(ej.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                              </svg>
                              {t('myBanknotes.delete')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← {t('myBanknotes.prev')}
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('myBanknotes.next')} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
