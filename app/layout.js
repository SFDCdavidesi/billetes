import { Inter, Playfair_Display } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata = {
  title: 'BilletesAntiguos | Colección de Billetes Históricos',
  description: 'La comunidad líder para coleccionistas de billetes antiguos y numismática. Descubre, comparte y comercia piezas únicas de la historia monetaria mundial.',
  keywords: 'billetes antiguos, numismática, colección, billetes históricos, monedas, coleccionistas',
  authors: [{ name: 'BilletesAntiguos' }],
  openGraph: {
    title: 'BilletesAntiguos | Colección de Billetes Históricos',
    description: 'La comunidad líder para coleccionistas de billetes antiguos y numismática.',
    type: 'website',
    locale: 'es_ES',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-white text-gray-900">
        <Header />
        <main className="min-h-screen pt-16 md:pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
