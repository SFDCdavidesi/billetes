'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from './I18nProvider';

export default function BanknoteCarousel() {
  const { t } = useI18n();
  const [billetes, setBilletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const containerRef = useRef(null);
  const autoPlayRef = useRef(null);

  // How many cards visible at once depending on screen
  const getVisibleCount = useCallback(() => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 768) return 2;
    if (window.innerWidth < 1024) return 3;
    return 4;
  }, []);

  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const handleResize = () => setVisibleCount(getVisibleCount());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getVisibleCount]);

  // Fetch latest banknotes
  useEffect(() => {
    fetch('/api/billetes/latest')
      .then(res => res.json())
      .then(data => {
        setBilletes(data.billetes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Preload images into browser cache
  useEffect(() => {
    if (billetes.length === 0) return;
    // Preload first 20 images immediately, rest lazily
    const preloadBatch = billetes.slice(0, 20);
    preloadBatch.forEach(b => {
      if (b.imagen) {
        const img = new window.Image();
        img.src = b.imagen;
      }
    });
    // Preload rest after a short delay
    const timer = setTimeout(() => {
      billetes.slice(20).forEach(b => {
        if (b.imagen) {
          const img = new window.Image();
          img.src = b.imagen;
        }
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [billetes]);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying || billetes.length === 0) return;
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        const maxIndex = Math.max(0, billetes.length - visibleCount);
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 3000);
    return () => clearInterval(autoPlayRef.current);
  }, [isAutoPlaying, billetes.length, visibleCount]);

  const maxIndex = Math.max(0, billetes.length - visibleCount);

  const goTo = (index) => {
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
  };

  const prev = () => {
    setIsAutoPlaying(false);
    goTo(currentIndex - 1);
  };

  const next = () => {
    setIsAutoPlaying(false);
    goTo(currentIndex + 1);
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (billetes.length === 0) return null;

  return (
    <section id="carrousel" className="py-16 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 text-sm font-semibold rounded-full mb-4">
            🆕 {t('carousel.badge')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif">
            {t('carousel.title')}{' '}
            <span className="text-amber-600">{t('carousel.titleHighlight')}</span>
          </h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">{t('carousel.subtitle')}</p>
        </div>

        {/* Carousel */}
        <div className="relative group">
          {/* Arrows */}
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-amber-50 disabled:opacity-30 disabled:cursor-default transition-all"
            aria-label="Previous"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={next}
            disabled={currentIndex >= maxIndex}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-amber-50 disabled:opacity-30 disabled:cursor-default transition-all"
            aria-label="Next"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* Cards container */}
          <div className="overflow-hidden" ref={containerRef}>
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
              }}
            >
              {billetes.map((billete) => (
                <div
                  key={billete.id}
                  className="flex-shrink-0 px-2"
                  style={{ width: `${100 / visibleCount}%` }}
                >
                  <Link href={`/billete/${billete.id}`} className="block bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                    <div className="relative aspect-[3/2] bg-gray-100 overflow-hidden">
                      {billete.imagen ? (
                        <Image
                          src={billete.imagen}
                          alt={`${billete.pais} ${billete.unidad_monetaria} ${billete.codigo_catalogo}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                          </svg>
                        </div>
                      )}
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                        {billete.codigo_catalogo}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        {billete.pais}{billete.anio ? ` · ${billete.anio}` : ''}
                      </p>
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-1">
                        {billete.denominacion > 0 ? billete.denominacion : ''} {billete.unidad_monetaria}
                      </h3>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center mt-6 gap-1">
          {Array.from({ length: Math.min(20, Math.ceil(billetes.length / visibleCount)) }).map((_, i) => {
            const dotIndex = Math.round(i * (maxIndex / Math.min(19, Math.ceil(billetes.length / visibleCount) - 1)));
            return (
              <button
                key={i}
                onClick={() => { setIsAutoPlaying(false); goTo(dotIndex); }}
                className={`h-1.5 rounded-full transition-all ${
                  Math.abs(currentIndex - dotIndex) < visibleCount
                    ? 'w-6 bg-amber-500'
                    : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
