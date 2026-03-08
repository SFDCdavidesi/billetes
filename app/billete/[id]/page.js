'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';

const condicionLabels = {
  UNC: { label: 'Uncirculated', color: 'bg-emerald-100 text-emerald-800' },
  AU: { label: 'About Uncirculated', color: 'bg-green-100 text-green-800' },
  XF: { label: 'Extremely Fine', color: 'bg-lime-100 text-lime-800' },
  VF: { label: 'Very Fine', color: 'bg-yellow-100 text-yellow-800' },
  F: { label: 'Fine', color: 'bg-amber-100 text-amber-800' },
  VG: { label: 'Very Good', color: 'bg-orange-100 text-orange-800' },
  G: { label: 'Good', color: 'bg-red-100 text-red-800' },
  FR: { label: 'Fair', color: 'bg-red-200 text-red-900' },
  P: { label: 'Poor', color: 'bg-gray-200 text-gray-800' },
};

export default function BilleteDetalle() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const [billete, setBillete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(null);
  const [cartMessage, setCartMessage] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/billetes/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('not_found');
        return res.json();
      })
      .then(data => {
        setBillete(data.billete);
        setLoading(false);
      })
      .catch(() => {
        setError('not_found');
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = async (ejemplarId) => {
    setAddingToCart(ejemplarId);
    setCartMessage(null);
    try {
      const res = await fetch('/api/carrito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ejemplar_id: ejemplarId }),
      });
      if (res.ok) {
        setCartMessage({ type: 'success', ejemplarId });
      } else if (res.status === 401) {
        setCartMessage({ type: 'login', ejemplarId });
      } else {
        const data = await res.json();
        setCartMessage({ type: 'error', ejemplarId, msg: data.error });
      }
    } catch {
      setCartMessage({ type: 'error', ejemplarId, msg: 'Error de conexión' });
    }
    setAddingToCart(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-[4/3] bg-gray-200 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !billete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('detail.notFound')}</h2>
          <p className="text-gray-500 mb-6">{t('detail.notFoundDesc')}</p>
          <Link href="/#carrousel" className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors">
            {t('detail.backToCatalog')}
          </Link>
        </div>
      </div>
    );
  }

  const imagenes = billete.imagenes || [];
  const currentImage = imagenes[selectedImage] || imagenes[0];
  const enVenta = billete.ejemplares_en_venta || [];
  const precioMin = enVenta.length > 0 ? Math.min(...enVenta.map(e => parseFloat(e.precio))) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-amber-600 transition-colors">{t('detail.home')}</Link>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
          <Link href="/#buscador" className="hover:text-amber-600 transition-colors">{t('detail.catalog')}</Link>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-gray-900 font-medium">{billete.codigo_catalogo}</span>
        </nav>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Image gallery */}
          <div>
            {/* Main image */}
            <div className="relative aspect-[4/3] bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 mb-4">
              {currentImage ? (
                <Image
                  src={currentImage.url}
                  alt={`${billete.pais} ${billete.denominacion} ${billete.unidad_monetaria} ${billete.codigo_catalogo}`}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                  </svg>
                </div>
              )}

              {/* For sale badge */}
              {enVenta.length > 0 && (
                <div className="absolute top-4 right-4 px-3 py-1.5 bg-emerald-500 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                  </svg>
                  {t('detail.forSale')}
                </div>
              )}

              {/* Catalog code */}
              <span className="absolute top-4 left-4 px-3 py-1 bg-black/60 text-white text-sm font-medium rounded-full backdrop-blur-sm">
                {billete.codigo_catalogo}
              </span>
            </div>

            {/* Thumbnail row */}
            {imagenes.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {imagenes.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === i
                        ? 'border-amber-500 shadow-md'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`Vista ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div>
            {/* Country flag and name */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                {billete.pais}
              </span>
              {billete.anio && (
                <span className="px-3 py-1 bg-amber-50 text-amber-700 text-sm font-medium rounded-full">
                  {billete.anio}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif mb-2">
              {billete.denominacion > 0 ? `${billete.denominacion} ` : ''}
              {billete.unidad_monetaria}
            </h1>

            {/* Catalog reference */}
            <p className="text-lg text-gray-500 mb-6">
              {t('detail.catalogRef')}: <span className="font-semibold text-gray-700">{billete.codigo_catalogo}</span>
            </p>

            {/* Price highlight */}
            {enVenta.length > 0 && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-emerald-600 font-medium mb-1">{t('detail.availableFrom')}</p>
                    <p className="text-4xl font-bold text-emerald-700">
                      {precioMin?.toFixed(2)} €
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-emerald-600">
                      {enVenta.length} {enVenta.length === 1 ? t('detail.copyAvailable') : t('detail.copiesAvailable')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Details grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('detail.details')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-0.5">{t('fields.country')}</p>
                  <p className="font-semibold text-gray-900">{billete.pais}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-0.5">{t('fields.year')}</p>
                  <p className="font-semibold text-gray-900">{billete.anio || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-0.5">{t('fields.denomination')}</p>
                  <p className="font-semibold text-gray-900">
                    {billete.denominacion > 0 ? billete.denominacion : '—'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-0.5">{t('fields.currency')}</p>
                  <p className="font-semibold text-gray-900">{billete.unidad_monetaria}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                  <p className="text-xs text-gray-500 mb-0.5">{t('fields.catalog')}</p>
                  <p className="font-semibold text-gray-900">{billete.codigo_catalogo}</p>
                </div>
              </div>
            </div>

            {/* No copies for sale */}
            {enVenta.length === 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <p className="text-gray-500 font-medium">{t('detail.notForSale')}</p>
                <p className="text-sm text-gray-400 mt-1">{t('detail.notForSaleDesc')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Copies for sale section */}
        {enVenta.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 font-serif mb-6">
              {t('detail.copiesForSale')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enVenta.map((ejemplar) => {
                const condicion = condicionLabels[ejemplar.estado_conservacion] || {
                  label: ejemplar.estado_conservacion || '—',
                  color: 'bg-gray-100 text-gray-700',
                };
                const isAdding = addingToCart === ejemplar.id;
                const msg = cartMessage?.ejemplarId === ejemplar.id ? cartMessage : null;

                return (
                  <div
                    key={ejemplar.id}
                    className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    {/* Ejemplar image */}
                    {ejemplar.imagenes?.length > 0 ? (
                      <div className="relative aspect-[3/2] bg-gray-50 overflow-hidden">
                        <Image
                          src={ejemplar.imagenes[0].url}
                          alt={`${billete.codigo_catalogo} - ${ejemplar.estado_conservacion}`}
                          fill
                          className="object-contain p-2"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[3/2] bg-gray-50 flex items-center justify-center text-gray-300">
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                        </svg>
                      </div>
                    )}

                    <div className="p-5">
                      {/* Condition badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${condicion.color}`}>
                          {ejemplar.estado_conservacion || '—'} · {condicion.label}
                        </span>
                      </div>

                      {/* Seller */}
                      <p className="text-sm text-gray-500 mb-3">
                        {t('detail.seller')}: <span className="font-medium text-gray-700">{ejemplar.propietario}</span>
                      </p>

                      {/* Price */}
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-3xl font-bold text-gray-900">
                          {parseFloat(ejemplar.precio).toFixed(2)} <span className="text-lg text-gray-500">€</span>
                        </p>
                      </div>

                      {/* Add to cart button */}
                      <button
                        onClick={() => handleAddToCart(ejemplar.id)}
                        disabled={isAdding}
                        className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                      >
                        {isAdding ? (
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                          </svg>
                        )}
                        {t('detail.addToCart')}
                      </button>

                      {/* Cart feedback */}
                      {msg && (
                        <div className={`mt-3 text-sm text-center rounded-lg px-3 py-2 ${
                          msg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 
                          msg.type === 'login' ? 'bg-amber-50 text-amber-700' : 
                          'bg-red-50 text-red-700'
                        }`}>
                          {msg.type === 'success' && t('detail.addedToCart')}
                          {msg.type === 'login' && (
                            <>
                              {t('detail.loginRequired')}{' '}
                              <Link href="/login" className="underline font-semibold">{t('header.login')}</Link>
                            </>
                          )}
                          {msg.type === 'error' && (msg.msg || 'Error')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Back button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 hover:border-gray-400 text-gray-700 font-medium rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            {t('detail.back')}
          </button>
        </div>
      </div>
    </div>
  );
}
