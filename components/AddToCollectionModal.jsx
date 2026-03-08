'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/components/I18nProvider';

export default function AddToCollectionModal({ modeloId, onClose }) {
  const { t } = useI18n();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null);
  const [message, setMessage] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch('/api/colecciones')
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => {
        setCollections(data.colecciones || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAdd = async (coleccionId) => {
    setAdding(coleccionId);
    setMessage(null);
    try {
      const res = await fetch('/api/colecciones/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coleccion_id: coleccionId, modelo_id: modeloId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: t('collection.added') });
      } else if (res.status === 409) {
        setMessage({ type: 'info', text: t('collection.alreadyIn') });
      } else {
        setMessage({ type: 'error', text: data.error || t('collection.error') });
      }
    } catch {
      setMessage({ type: 'error', text: t('collection.error') });
    }
    setAdding(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch('/api/colecciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: newName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setCollections([data.coleccion, ...collections]);
        setNewName('');
        setShowNewForm(false);
        setMessage({ type: 'success', text: t('collection.created') });
      } else {
        setMessage({ type: 'error', text: data.error || t('collection.error') });
      }
    } catch {
      setMessage({ type: 'error', text: t('collection.error') });
    }
    setCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
              </svg>
              {t('collection.addTitle')}
            </h3>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-indigo-100 text-sm mt-1">{t('collection.addSubtitle')}</p>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Message */}
          {message && (
            <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${
              message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' :
              message.type === 'info' ? 'bg-blue-50 border border-blue-200 text-blue-700' :
              'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          {/* Create new collection */}
          {!showNewForm ? (
            <button
              onClick={() => setShowNewForm(true)}
              className="w-full mb-4 px-4 py-3 border-2 border-dashed border-indigo-300 text-indigo-600 font-medium rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {t('collection.createNew')}
            </button>
          ) : (
            <form onSubmit={handleCreate} className="mb-4 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <input
                type="text"
                maxLength={100}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('collection.namePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none mb-3"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowNewForm(false); setNewName(''); }}
                  className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-white transition-colors"
                >
                  {t('collection.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {creating ? t('collection.creating') : t('collection.create')}
                </button>
              </div>
            </form>
          )}

          {/* Collections list */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-xl" />
              ))}
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
              </svg>
              <p className="font-medium">{t('collection.empty')}</p>
              <p className="text-sm mt-1">{t('collection.emptyDesc')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {collections.map((col) => {
                const itemCount = col.colecciones_items?.length || 0;
                const isAdding = adding === col.id;
                return (
                  <div
                    key={col.id}
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{col.nombre}</p>
                      <p className="text-xs text-gray-500">
                        {itemCount} {itemCount === 1 ? t('collection.item') : t('collection.items')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAdd(col.id)}
                      disabled={isAdding}
                      className="ml-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isAdding ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      )}
                      {t('collection.add')}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            {t('collection.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
