'use client';

import { useI18n } from './I18nProvider';

const testimonials = [
  { name: 'Carlos M.', location: 'Madrid, España', avatar: '👨‍💼', rating: 5, text: 'Encontré un billete de 1000 pesetas de 1928 en perfecto estado. La autenticación fue impecable.' },
  { name: 'Sarah K.', location: 'London, UK', avatar: '👩‍🦰', rating: 5, text: 'The best platform for banknote collectors. The community is incredibly knowledgeable and helpful.' },
  { name: 'Hans W.', location: 'Berlin, Deutschland', avatar: '🧔', rating: 5, text: 'Fantastische Sammlung und sehr professionelle Bewertung. Meine Weimarer Banknoten wurden korrekt eingestuft.' },
];

export default function TestimonialsSection() {
  const { t } = useI18n();

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 text-sm font-semibold rounded-full mb-4">
            💬 {t('testimonials.badge')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif">
            {t('testimonials.title')}{' '}
            <span className="text-amber-600">{t('testimonials.titleHighlight')}</span>
          </h2>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">{t('testimonials.subtitle')}</p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(item.rating)].map((_, j) => (
                  <svg key={j} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-600 leading-relaxed mb-6 italic">&ldquo;{item.text}&rdquo;</p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <span className="text-3xl">{item.avatar}</span>
                <div>
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400 mb-4">{t('testimonials.trustBadge')}</p>
          <div className="flex justify-center gap-8 items-center opacity-40">
            {['🏛️ Heritage', '🔍 NGC', '📜 PMG', '🌍 IBNS'].map((b) => (
              <span key={b} className="text-lg font-bold text-gray-600">{b}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
