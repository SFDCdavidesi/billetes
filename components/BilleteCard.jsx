import Image from 'next/image';
import Link from 'next/link';

export default function BilleteCard({ billete }) {
  return (
    <article className="card card-hover group">
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <Image
          src={billete.image}
          alt={billete.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Quick View Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            Ver Detalles
          </button>
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {billete.featured && (
            <span className="px-2 py-1 bg-gold-500 text-white text-xs font-semibold rounded-full">
              Destacado
            </span>
          )}
          {billete.rare && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
              Raro
            </span>
          )}
        </div>
        
        {/* Favorite Button */}
        <button 
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors group/fav"
          aria-label="Añadir a favoritos"
        >
          <svg 
            className="w-4 h-4 text-gray-400 group-hover/fav:text-red-500 transition-colors" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
        </button>
      </div>
      
      {/* Content */}
      <div className="p-5">
        {/* Country & Year */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{billete.flag}</span>
          <span className="text-sm text-gray-500">{billete.country}</span>
          <span className="text-gray-300">•</span>
          <span className="text-sm text-gray-500">{billete.year}</span>
        </div>
        
        {/* Title */}
        <h3 className="font-serif font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-gold-600 transition-colors">
          {billete.title}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {billete.description}
        </p>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {/* Condition Badge */}
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${
              billete.condition === 'Excelente' ? 'bg-green-500' :
              billete.condition === 'Muy Bueno' ? 'bg-blue-500' :
              billete.condition === 'Bueno' ? 'bg-yellow-500' : 'bg-gray-400'
            }`}></span>
            <span className="text-xs text-gray-500">{billete.condition}</span>
          </div>
          
          {/* Price or Value */}
          {billete.price ? (
            <span className="text-lg font-bold text-gold-600">
              €{billete.price.toLocaleString()}
            </span>
          ) : (
            <span className="text-sm text-gray-400 italic">Sin precio</span>
          )}
        </div>
      </div>
    </article>
  );
}
