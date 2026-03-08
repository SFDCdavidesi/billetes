import Link from 'next/link';
import BilleteCard from './BilleteCard';

// Datos de ejemplo para los billetes destacados
const billetesFeatured = [
  {
    id: 1,
    title: 'Billete de 100 Pesetas - Hernán Cortés',
    description: 'Hermoso billete español de la serie E, con la imagen de Hernán Cortés. Impresión detallada y colores vibrantes conservados.',
    image: 'https://placehold.co/600x400/c9a227/ffffff?text=100+Pesetas+1925',
    country: 'España',
    flag: '🇪🇸',
    year: 1925,
    price: 450,
    condition: 'Excelente',
    featured: true,
    rare: false,
  },
  {
    id: 2,
    title: 'Dollar Bill Series - Blue Seal',
    description: 'Billete de un dólar con el sello azul característico de las series Silver Certificate. Pieza de colección muy buscada.',
    image: 'https://placehold.co/600x400/2d5a27/ffffff?text=US+Dollar+1957',
    country: 'Estados Unidos',
    flag: '🇺🇸',
    year: 1957,
    price: 180,
    condition: 'Muy Bueno',
    featured: true,
    rare: true,
  },
  {
    id: 3,
    title: 'Reichsmark - República de Weimar',
    description: 'Billete alemán de la época de la inflación. Testimonio histórico de una de las crisis económicas más importantes del siglo XX.',
    image: 'https://placehold.co/600x400/8b4513/ffffff?text=1000+Reichsmark',
    country: 'Alemania',
    flag: '🇩🇪',
    year: 1922,
    price: 320,
    condition: 'Bueno',
    featured: false,
    rare: true,
  },
  {
    id: 4,
    title: 'Peso Argentino - Eva Perón',
    description: 'Billete conmemorativo con la imagen de Eva Perón. Edición especial muy valorada por coleccionistas latinoamericanos.',
    image: 'https://placehold.co/600x400/4a90a4/ffffff?text=100+Pesos+Arg',
    country: 'Argentina',
    flag: '🇦🇷',
    year: 2012,
    price: 85,
    condition: 'Excelente',
    featured: true,
    rare: false,
  },
  {
    id: 5,
    title: 'Franco Suizo - Serie Vintage',
    description: 'Billete suizo de alta calidad con diseño artístico único. Los billetes suizos son reconocidos por su excelente impresión.',
    image: 'https://placehold.co/600x400/722f37/ffffff?text=50+Francs+CHF',
    country: 'Suiza',
    flag: '🇨🇭',
    year: 1978,
    price: 290,
    condition: 'Excelente',
    featured: false,
    rare: false,
  },
  {
    id: 6,
    title: 'Yen Japonés - Era Meiji',
    description: 'Raro billete japonés de la era Meiji. Diseño oriental tradicional con detalles en oro. Pieza de museo para coleccionistas serios.',
    image: 'https://placehold.co/600x400/c41e3a/ffffff?text=Yen+Meiji+1910',
    country: 'Japón',
    flag: '🇯🇵',
    year: 1910,
    price: 1200,
    condition: 'Muy Bueno',
    featured: true,
    rare: true,
  },
];

export default function FeaturedCollections() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block px-4 py-2 bg-gold-100 text-gold-700 rounded-full text-sm font-semibold mb-4">
            Colección Destacada
          </span>
          <h2 className="section-title mb-4">
            Billetes <span className="text-gradient">Excepcionales</span>
          </h2>
          <p className="section-subtitle">
            Explora nuestra selección curada de los billetes más valiosos y únicos de todo el mundo. 
            Cada pieza cuenta una historia.
          </p>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-10">
          {['Todos', 'Europa', 'América', 'Asia', 'Raros', 'Más Valorados'].map((tab, index) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                index === 0 
                  ? 'bg-gold-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gold-100 hover:text-gold-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {billetesFeatured.map((billete) => (
            <BilleteCard key={billete.id} billete={billete} />
          ))}
        </div>
        
        {/* View All Button */}
        <div className="text-center mt-12">
          <Link 
            href="/catalogo"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            <span>Ver Catálogo Completo</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
