'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';

export default function AdminUsuariosPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [filters, setFilters] = useState({
    nombre: '', email: '', perfil_id: '', activo: '', email_validado: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [resettingId, setResettingId] = useState(null);
  const [message, setMessage] = useState(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // Auth check
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data?.authenticated || data.user.perfil !== 'administrador') {
          router.push('/');
          return;
        }
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => router.push('/'));
  }, [router]);

  // Fetch users (stable function using ref)
  const fetchUsuarios = () => {
    const f = filtersRef.current;
    const params = new URLSearchParams();
    if (f.nombre) params.set('nombre', f.nombre);
    if (f.email) params.set('email', f.email);
    if (f.perfil_id) params.set('perfil_id', f.perfil_id);
    if (f.activo) params.set('activo', f.activo);
    if (f.email_validado) params.set('email_validado', f.email_validado);

    fetch(`/api/admin/usuarios?${params}`)
      .then(res => res.json())
      .then(data => {
        setUsuarios(data.usuarios || []);
        setPerfiles(data.perfiles || []);
      })
      .catch(() => {});
  };

  // Initial load
  useEffect(() => {
    if (!loading && user) fetchUsuarios();
  }, [loading, user]);

  // Debounced search on filter change (300ms for text, immediate for dropdowns)
  useEffect(() => {
    if (loading || !user) return;
    const timer = setTimeout(() => fetchUsuarios(), 300);
    return () => clearTimeout(timer);
  }, [filters.nombre, filters.email, filters.perfil_id, filters.activo, filters.email_validado, loading, user]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // Edit
  const startEdit = (u) => {
    setEditingId(u.id);
    setEditData({
      nombre: u.nombre,
      email: u.email,
      activo: u.activo,
      email_validado: u.email_validado,
      perfil_id: u.perfil_id,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/usuarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...editData }),
      });
      const data = await res.json();
      if (!res.ok) {
        showMessage('error', data.error || t('adminUsers.errorSaving'));
      } else {
        showMessage('success', t('adminUsers.saved'));
        setEditingId(null);
        fetchUsuarios();
      }
    } catch {
      showMessage('error', t('adminUsers.errorSaving'));
    }
    setSaving(false);
  };

  // Reset password
  const resetPassword = async (userId) => {
    if (!confirm(t('adminUsers.confirmReset'))) return;
    setResettingId(userId);
    try {
      const res = await fetch('/api/admin/usuarios/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        showMessage('error', data.error || t('adminUsers.errorReset'));
      } else if (data.emailSent) {
        showMessage('success', t('adminUsers.resetEmailSent'));
      } else {
        showMessage('success', `${t('adminUsers.resetNoEmail')}: ${data.password}`);
      }
    } catch {
      showMessage('error', t('adminUsers.errorReset'));
    }
    setResettingId(null);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1 mb-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              {t('admin.title')}
            </Link>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
              {t('adminUsers.title')}
            </h1>
          </div>
          <span className="text-sm text-gray-500">
            {usuarios.length} {t('adminUsers.total')}
          </span>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('adminUsers.filters')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder={t('adminUsers.filterName')}
              value={filters.nombre}
              onChange={e => setFilters(f => ({ ...f, nombre: e.target.value }))}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <input
              type="text"
              placeholder={t('adminUsers.filterEmail')}
              value={filters.email}
              onChange={e => setFilters(f => ({ ...f, email: e.target.value }))}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <select
              value={filters.perfil_id}
              onChange={e => setFilters(f => ({ ...f, perfil_id: e.target.value }))}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">{t('adminUsers.allProfiles')}</option>
              {perfiles.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
            <select
              value={filters.activo}
              onChange={e => setFilters(f => ({ ...f, activo: e.target.value }))}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">{t('adminUsers.allActive')}</option>
              <option value="true">{t('adminUsers.active')}</option>
              <option value="false">{t('adminUsers.inactive')}</option>
            </select>
            <select
              value={filters.email_validado}
              onChange={e => setFilters(f => ({ ...f, email_validado: e.target.value }))}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">{t('adminUsers.allValidated')}</option>
              <option value="true">{t('adminUsers.validated')}</option>
              <option value="false">{t('adminUsers.notValidated')}</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">{t('adminUsers.colName')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">{t('adminUsers.colEmail')}</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">{t('adminUsers.colProfile')}</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">{t('adminUsers.colActive')}</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">{t('adminUsers.colValidated')}</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">{t('adminUsers.colDate')}</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">{t('adminUsers.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuarios.map(u => (
                  <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${editingId === u.id ? 'bg-amber-50' : ''}`}>
                    {/* Name */}
                    <td className="px-4 py-3">
                      {editingId === u.id ? (
                        <input
                          type="text"
                          value={editData.nombre}
                          onChange={e => setEditData(d => ({ ...d, nombre: e.target.value }))}
                          className="w-full px-2 py-1 border border-amber-300 rounded text-sm focus:ring-1 focus:ring-amber-500"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">{u.nombre}</span>
                      )}
                    </td>
                    {/* Email */}
                    <td className="px-4 py-3">
                      {editingId === u.id ? (
                        <input
                          type="email"
                          value={editData.email}
                          onChange={e => setEditData(d => ({ ...d, email: e.target.value }))}
                          className="w-full px-2 py-1 border border-amber-300 rounded text-sm focus:ring-1 focus:ring-amber-500"
                        />
                      ) : (
                        <span className="text-gray-600">{u.email}</span>
                      )}
                    </td>
                    {/* Profile */}
                    <td className="px-4 py-3 text-center">
                      {editingId === u.id ? (
                        <select
                          value={editData.perfil_id}
                          onChange={e => setEditData(d => ({ ...d, perfil_id: parseInt(e.target.value) }))}
                          className="px-2 py-1 border border-amber-300 rounded text-sm focus:ring-1 focus:ring-amber-500"
                        >
                          {perfiles.map(p => (
                            <option key={p.id} value={p.id}>{p.nombre}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.perfiles?.nombre === 'administrador' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {u.perfiles?.nombre}
                        </span>
                      )}
                    </td>
                    {/* Active */}
                    <td className="px-4 py-3 text-center">
                      {editingId === u.id ? (
                        <button
                          type="button"
                          onClick={() => setEditData(d => ({ ...d, activo: !d.activo }))}
                          className={`w-10 h-5 rounded-full relative transition-colors ${editData.activo ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${editData.activo ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      ) : (
                        <span className={`inline-flex w-2.5 h-2.5 rounded-full ${u.activo ? 'bg-green-500' : 'bg-red-400'}`} title={u.activo ? t('adminUsers.active') : t('adminUsers.inactive')} />
                      )}
                    </td>
                    {/* Email validated */}
                    <td className="px-4 py-3 text-center">
                      {editingId === u.id ? (
                        <button
                          type="button"
                          onClick={() => setEditData(d => ({ ...d, email_validado: !d.email_validado }))}
                          className={`w-10 h-5 rounded-full relative transition-colors ${editData.email_validado ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${editData.email_validado ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      ) : (
                        <span className={`inline-flex w-2.5 h-2.5 rounded-full ${u.email_validado ? 'bg-green-500' : 'bg-red-400'}`} title={u.email_validado ? t('adminUsers.validated') : t('adminUsers.notValidated')} />
                      )}
                    </td>
                    {/* Date */}
                    <td className="px-4 py-3 text-center text-gray-500 text-xs">
                      {u.fecha_creacion ? new Date(u.fecha_creacion).toLocaleDateString() : '—'}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {editingId === u.id ? (
                          <>
                            <button
                              onClick={saveEdit}
                              disabled={saving}
                              className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                              {saving ? '...' : t('adminUsers.save')}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                            >
                              {t('adminUsers.cancel')}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(u)}
                              className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title={t('adminUsers.edit')}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                              </svg>
                            </button>
                            <button
                              onClick={() => resetPassword(u.id)}
                              disabled={resettingId === u.id}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title={t('adminUsers.resetPassword')}
                            >
                              {resettingId === u.id ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                                </svg>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {usuarios.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                      {t('adminUsers.noUsers')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
