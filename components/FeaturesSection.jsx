import Link from 'next/link';

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Autenticidad Garantizada',
    description: 'Cada billete es verificado por expertos numismáticos certificados antes de ser listado en nuestra plataforma.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'Búsqueda Avanzada',
    description: 'Encuentra exactamente lo que buscas con filtros por país, año, denominación, condición y más.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Comunidad Global',
    description: 'Conecta con coleccionistas de más de 85 países. Comparte, aprende e intercambia con expertos.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Valoración en Tiempo Real',
    description: 'Accede a precios de mercado actualizados para conocer el valor real de tu colección.',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 bg-gray-50 bg-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block px-4 py-2 bg-white text-gold-700 rounded-full text-sm font-semibold mb-4 shadow-sm">
            ¿Por qué elegirnos?
          </span>
          <h2 className="section-title mb-4">
            Todo lo que Necesitas para{' '}
            <span className="text-gradient">tu Colección</span>
          </h2>
          <p className="section-subtitle">
            Herramientas profesionales y una comunidad apasionada para llevar tu colección al siguiente nivel.
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-gold-100 to-gold-200 rounded-xl flex items-center justify-center text-gold-600 mb-5 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="font-serif font-bold text-xl text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* CTA Banner */}
        <div className="mt-16 md:mt-20 bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="p-8 md:p-12 lg:p-16">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white mb-4">
                Comienza tu Colección Hoy
              </h3>
              <p className="text-gray-300 mb-8 text-lg">
                Únete gratis y accede a más de 120,000 billetes de todo el mundo. 
                Tu próxima pieza te está esperando.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/signup"
                  className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all text-center"
                >
                  Crear Cuenta Gratis
                </Link>
                <Link 
                  href="/tour"
                  className="px-6 py-3 border border-gray-600 hover:border-gold-500 text-white hover:text-gold-500 font-semibold rounded-lg transition-all text-center flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Ver Tour</span>
                </Link>
              </div>
            </div>
            <div className="hidden md:block relative h-full min-h-[300px]">
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-gray-900/50"></div>
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-60"
                style={{ backgroundImage: "url('https://placehold.co/800x600/d4a574/ffffff?text=Colección+Premium')" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
