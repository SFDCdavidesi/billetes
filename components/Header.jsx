'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-gold-500 to-gold-700 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <svg 
                className="w-6 h-6 md:w-7 md:h-7 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl md:text-2xl font-serif font-bold text-gray-900">
                Billetes<span className="text-gold-600">Antiguos</span>
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Colección & Numismática</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/catalogo" 
              className="text-gray-700 hover:text-gold-600 font-medium transition-colors"
            >
              Catálogo
            </Link>
            <Link 
              href="/subastas" 
              className="text-gray-700 hover:text-gold-600 font-medium transition-colors"
            >
              Subastas
            </Link>
            <Link 
              href="/comunidad" 
              className="text-gray-700 hover:text-gold-600 font-medium transition-colors"
            >
              Comunidad
            </Link>
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link 
              href="/login"
              className="px-4 py-2 text-gray-700 hover:text-gold-600 font-medium transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/signup"
              className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-gold-600 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-3">
            <Link 
              href="/catalogo" 
              className="block px-4 py-2 text-gray-700 hover:bg-gold-50 hover:text-gold-600 rounded-lg transition-colors"
            >
              Catálogo
            </Link>
            <Link 
              href="/subastas" 
              className="block px-4 py-2 text-gray-700 hover:bg-gold-50 hover:text-gold-600 rounded-lg transition-colors"
            >
              Subastas
            </Link>
            <Link 
              href="/comunidad" 
              className="block px-4 py-2 text-gray-700 hover:bg-gold-50 hover:text-gold-600 rounded-lg transition-colors"
            >
              Comunidad
            </Link>
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              <Link 
                href="/login"
                className="px-4 py-2 text-center text-gray-700 hover:text-gold-600 font-medium transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/signup"
                className="mx-4 px-4 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-white font-semibold rounded-lg text-center shadow-md"
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
