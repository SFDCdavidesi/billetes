'use client';

import { useState } from 'react';
import { useI18n } from '@/components/I18nProvider';

const CONDITION_KEYS = ['UNC', 'AU', 'XF', 'VF', 'F', 'VG', 'G', 'FR', 'P'];

const CURRENCIES = [
  { value: 'EUR', label: 'Euros (€)' },
  { value: 'USD', label: 'US Dollars ($)' },
  { value: 'GBP', label: 'UK GBP (£)' },
];

export default function IHaveThisModal({ modeloId, onClose, onSuccess }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    numero_serie: '',
    estado_conservacion: 'VF',
    en_venta: false,
    precio: '',
    moneda_precio: 'EUR',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (form.en_venta && (!form.precio || parseFloat(form.precio) <= 0)) {
      setError(t('ihave.priceRequired'));
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/ejemplares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelo_id: modeloId,
          numero_serie: form.numero_serie || null,
          estado_conservacion: form.estado_conservacion,
          en_venta: form.en_venta,
          precio: form.en_venta ? parseFloat(form.precio) : null,
          moneda_precio: form.en_venta ? form.moneda_precio : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t('ihave.error'));
        setSaving(false);
        return;
      }

      onSuccess?.();
      onClose();
    } catch {
      setError(t('ihave.error'));
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {t('ihave.title')}
            </h3>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-amber-100 text-sm mt-1">{t('ihave.subtitle')}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Serial number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('ihave.serialNumber')}</label>
            <input
              type="text"
              maxLength={50}
              value={form.numero_serie}
              onChange={(e) => setForm({ ...form, numero_serie: e.target.value })}
              placeholder={t('ihave.serialPlaceholder')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            />
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('ihave.condition')}</label>
            <select
              value={form.estado_conservacion}
              onChange={(e) => setForm({ ...form, estado_conservacion: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-white"
            >
              {CONDITION_KEYS.map((key) => (
                <option key={key} value={key}>{t(`conditions.${key}`)} ({key})</option>
              ))}
            </select>
          </div>

          {/* For sale toggle */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <label className="text-sm font-medium text-gray-700 flex-1">{t('ihave.forSale')}</label>
            <button
              type="button"
              onClick={() => setForm({ ...form, en_venta: !form.en_venta })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.en_venta ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  form.en_venta ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Price + Currency (visible only if for sale) */}
          {form.en_venta && (
            <div className="space-y-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm font-medium text-emerald-700">{t('ihave.saleDetails')}</p>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">{t('ihave.price')}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="99999999999.99"
                    value={form.precio}
                    onChange={(e) => setForm({ ...form, precio: e.target.value })}
                    placeholder="10.50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="w-40">
                  <label className="block text-xs text-gray-600 mb-1">{t('ihave.currency')}</label>
                  <select
                    value={form.moneda_precio}
                    onChange={(e) => setForm({ ...form, moneda_precio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              {t('ihave.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : null}
              {t('ihave.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
