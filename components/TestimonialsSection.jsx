const testimonials = [
  {
    id: 1,
    name: 'Carlos Martínez',
    role: 'Coleccionista desde 2015',
    avatar: 'https://placehold.co/100x100/e2c88d/333333?text=CM',
    content: 'BilletesAntiguos ha transformado mi forma de coleccionar. La comunidad es increíble y he encontrado piezas que buscaba hace años.',
    rating: 5,
    location: 'Madrid, España',
  },
  {
    id: 2,
    name: 'Maria Silva',
    role: 'Experta en Numismática',
    avatar: 'https://placehold.co/100x100/a4c3b2/333333?text=MS',
    content: 'Como profesional, valoro la autenticidad garantizada de cada pieza. Es el estándar que el mercado necesitaba.',
    rating: 5,
    location: 'Lisboa, Portugal',
  },
  {
    id: 3,
    name: 'John Williams',
    role: 'Coleccionista Amateur',
    avatar: 'https://placehold.co/100x100/b8a9c9/333333?text=JW',
    content: 'Empecé como principiante y gracias a la comunidad he aprendido muchísimo. Ahora tengo una colección de la que estoy muy orgulloso.',
    rating: 5,
    location: 'London, UK',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block px-4 py-2 bg-gold-100 text-gold-700 rounded-full text-sm font-semibold mb-4">
            Testimonios
          </span>
          <h2 className="section-title mb-4">
            Lo que Dicen Nuestros{' '}
            <span className="text-gradient">Coleccionistas</span>
          </h2>
          <p className="section-subtitle">
            Miles de coleccionistas confían en nosotros para encontrar y autenticar sus piezas más preciadas.
          </p>
        </div>
        
        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-gray-50 rounded-2xl p-6 md:p-8 hover:bg-white hover:shadow-xl transition-all duration-300"
            >
              {/* Rating Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-gold-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              
              {/* Quote */}
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                  <p className="text-xs text-gray-400">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm mb-6">Confían en nosotros</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
            <div className="text-2xl font-serif font-bold text-gray-400">NumisNews</div>
            <div className="text-2xl font-serif font-bold text-gray-400">CoinWorld</div>
            <div className="text-2xl font-serif font-bold text-gray-400">CollectPro</div>
            <div className="text-2xl font-serif font-bold text-gray-400">Heritage</div>
          </div>
        </div>
      </div>
    </section>
  );
}
