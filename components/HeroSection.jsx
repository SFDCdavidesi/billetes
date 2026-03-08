import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-gold-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pattern opacity-50"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gold-200 rounded-full filter blur-3xl opacity-30 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-200 rounded-full filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '3s' }}></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left animate-fade-in">
            <span className="inline-block px-4 py-2 bg-gold-100 text-gold-700 rounded-full text-sm font-semibold mb-6">
              🏆 La comunidad #1 de numismática
            </span>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-gray-900 leading-tight mb-6">
              Descubre el{' '}
              <span className="text-gradient">Valor</span>{' '}
              de la Historia
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
              Únete a la comunidad más grande de coleccionistas de billetes antiguos. 
              Explora piezas únicas, comparte tu colección y conecta con expertos de todo el mundo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/catalogo" className="btn-primary inline-flex items-center justify-center gap-2">
                <span>Explorar Catálogo</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link href="/signup" className="btn-secondary inline-flex items-center justify-center gap-2">
                <span>Crear Cuenta Gratis</span>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8">
              <div>
                <p className="text-3xl md:text-4xl font-bold text-gray-900">50K+</p>
                <p className="text-sm text-gray-500">Coleccionistas</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-gray-900">120K+</p>
                <p className="text-sm text-gray-500">Billetes</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-gray-900">85+</p>
                <p className="text-sm text-gray-500">Países</p>
              </div>
            </div>
          </div>
          
          {/* Hero Image/Illustration */}
          <div className="relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="relative">
              {/* Main Image Container */}
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <Image
                  src="https://placehold.co/600x400/d4a574/ffffff?text=Billete+Antiguo+1920"
                  alt="Billete antiguo de colección"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              
              {/* Secondary Cards */}
              <div className="absolute -bottom-6 -left-6 z-20 bg-white rounded-xl shadow-xl p-4 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                <Image
                  src="https://placehold.co/200x120/8b7355/ffffff?text=Billete+España"
                  alt="Billete de España"
                  width={200}
                  height={120}
                  className="rounded-lg"
                />
              </div>
              
              <div className="absolute -top-4 -right-4 z-20 bg-white rounded-xl shadow-xl p-4 transform rotate-6 hover:rotate-0 transition-transform duration-500">
                <Image
                  src="https://placehold.co/180x100/6b8e23/ffffff?text=Dollar+1928"
                  alt="Dollar 1928"
                  width={180}
                  height={100}
                  className="rounded-lg"
                />
              </div>
              
              {/* Floating Badge */}
              <div className="absolute bottom-8 right-8 z-30 bg-gradient-to-r from-gold-500 to-gold-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="font-semibold">Premium Quality</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
