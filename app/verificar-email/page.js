'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '@/components/I18nProvider';
import Link from 'next/link';
import { Suspense } from 'react';

function VerificarEmailContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading, success, already, error

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    fetch(`/api/auth/verificar-email?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus(data.alreadyVerified ? 'already' : 'success');
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-amber-50 via-white to-amber-50">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6">
              <svg className="animate-spin w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-serif mb-3">
              {t('verifyEmail.verifying')}
            </h1>
            <p className="text-gray-600">{t('verifyEmail.pleaseWait')}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-serif mb-3">
              {t('verifyEmail.successTitle')}
            </h1>
            <p className="text-gray-600 mb-2">
              {t('verifyEmail.successMessage')}
            </p>
            <p className="text-sm text-gray-500 mb-8">
              {t('verifyEmail.successNote')}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold rounded-xl shadow-lg shadow-amber-200 transition-all duration-200"
            >
              {t('verifyEmail.goToLogin')}
            </Link>
          </>
        )}

        {status === 'already' && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-serif mb-3">
              {t('verifyEmail.alreadyTitle')}
            </h1>
            <p className="text-gray-600 mb-8">
              {t('verifyEmail.alreadyMessage')}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold rounded-xl shadow-lg shadow-amber-200 transition-all duration-200"
            >
              {t('verifyEmail.goToLogin')}
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-serif mb-3">
              {t('verifyEmail.errorTitle')}
            </h1>
            <p className="text-gray-600 mb-8">
              {t('verifyEmail.errorMessage')}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold rounded-xl shadow-lg shadow-amber-200 transition-all duration-200"
            >
              {t('verifyEmail.goHome')}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full" />
      </div>
    }>
      <VerificarEmailContent />
    </Suspense>
  );
}
