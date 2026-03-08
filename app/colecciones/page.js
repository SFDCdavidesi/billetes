'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';
import { translateCountry } from '@/lib/countries';
import BanknoteImage from '@/components/BanknoteImage';

export default function ColeccionesPage() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [user, setUser] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.authenticated) {
          setUser(data.user);
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const fetchCollections = () => {
    fetch('/api/colecciones')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setCollections(data.colecciones || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (user) fetchCollections();
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/colecciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: newName.trim(), descripcion: newDesc.trim() || null }),
      });
      if (res.ok) {
        setNewName('');
        setNewDesc('');
        setShowNewForm(false);
        fetchCollections();
        setMessage({ type: 'success', text: t('collections.created') });
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error });
      }
    } catch {
      setMessage({ type: 'error', text: t('collections.error') });
    }
    setCreating(false);
  };

  const handleEdit = async (id) => {
    try {
      const res = await fetch('/api/colecciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, nombre: editName.trim(), descripcion: editDesc.trim() || null }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchCollections();
        setMessage({ type: 'success', text: t('collections.saved') });
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error });
      }
    } catch {
      setMessage({ type: 'error', text: t('collections.error') });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('collections.confirmDelete'))) return;
    try {
      const res = await fetch(`/api/colecciones?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCollections();
        setMessage({ type: 'success', text: t('collections.deleted') });
      }
    } catch {
      setMessage({ type: 'error', text: t('collections.error') });
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const res = await fetch(`/api/colecciones/items?id=${itemId}`, { method: 'DELETE' });
      if (res.ok) fetchCollections();
    } catch {
      // silent
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
            <div className="space-y-3 mt-8">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-serif">{t('collections.title')}</h1>
            <p className="text-gray-500 mt-1">{t('collections.subtitle')}</p>
          </div>
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t('collections.new')}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-xl text-sm ${
            message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' :
            'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* New collection form */}
        {showNewForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-md border border-indigo-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('collections.createTitle')}</h3>
            <div className="space-y-3">
              <input
                type="text"
                maxLength={100}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('collections.namePlaceholder')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                autoFocus
              />
              <textarea
                maxLength={500}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder={t('collections.descPlaceholder')}
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowNewForm(false); setNewName(''); setNewDesc(''); }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
                >
                  {t('collections.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                >
                  {creating ? t('collections.creating') : t('collections.create')}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Collections list */}
        {collections.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
            </svg>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t('collections.emptyTitle')}</h3>
            <p className="text-gray-500 mb-4">{t('collections.emptyDesc')}</p>
            <button
              onClick={() => setShowNewForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              {t('collections.createFirst')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {collections.map((col) => {
              const items = col.colecciones_items || [];
              const isExpanded = expandedId === col.id;
              const isEditing = editingId === col.id;

              return (
                <div key={col.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Collection header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              maxLength={100}
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg font-bold"
                            />
                            <textarea
                              maxLength={500}
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              placeholder={t('collections.descPlaceholder')}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none text-sm"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => setEditingId(null)} className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm">
                                {t('collections.cancel')}
                              </button>
                              <button
                                onClick={() => handleEdit(col.id)}
                                disabled={!editName.trim()}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                              >
                                {t('collections.save')}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-lg font-bold text-gray-900 truncate">{col.nombre}</h3>
                            {col.descripcion && (
                              <p className="text-sm text-gray-500 mt-0.5">{col.descripcion}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {items.length} {items.length === 1 ? t('collections.banknote') : t('collections.banknotes')}
                              {' · '}
                              {new Date(col.fecha_creacion).toLocaleDateString(locale)}
                            </p>
                          </>
                        )}
                      </div>
                      {!isEditing && (
                        <div className="flex items-center gap-1 ml-3">
                          <button
                            onClick={() => { setEditingId(col.id); setEditName(col.nombre); setEditDesc(col.descripcion || ''); }}
                            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                            title={t('collections.edit')}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(col.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title={t('collections.delete')}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                          {items.length > 0 && (
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : col.id)}
                              className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
                            >
                              <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Preview thumbnails */}
                    {!isExpanded && items.length > 0 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                        {items.slice(0, 6).map((item) => {
                          const img = item.billetes_modelo?.imagenes_modelo?.[0]?.url;
                          return (
                            <div key={item.id} className="flex-shrink-0 w-16 h-10 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                              <BanknoteImage
                                src={img}
                                alt=""
                                width={64}
                                height={40}
                                className="w-full h-full object-cover"
                                iconSize="w-4 h-4"
                              />
                            </div>
                          );
                        })}
                        {items.length > 6 && (
                          <div className="flex-shrink-0 w-16 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500 font-medium border border-gray-200">
                            +{items.length - 6}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Expanded items */}
                  {isExpanded && items.length > 0 && (
                    <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {items.map((item) => {
                          const m = item.billetes_modelo;
                          if (!m) return null;
                          const img = m.imagenes_modelo?.[0]?.url;
                          return (
                            <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                              <Link href={`/billete/${m.id}`} className="block">
                                <div className="relative aspect-[3/2] bg-gray-100">
                                  <BanknoteImage
                                    src={img}
                                    alt={m.codigo_catalogo || ''}
                                    fill
                                    className="object-contain p-2"
                                    sizes="200px"
                                    iconSize="w-8 h-8"
                                  />
                                </div>
                                <div className="p-3">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {translateCountry(m.pais, locale)} — {m.codigo_catalogo}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {m.denominacion > 0 ? `${m.denominacion} ` : ''}{m.unidad_monetaria}
                                  </p>
                                </div>
                              </Link>
                              <div className="px-3 pb-3">
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="w-full text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg py-1.5 transition-colors"
                                >
                                  {t('collections.remove')}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
