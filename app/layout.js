import { Inter, Playfair_Display } from 'next/font/google';
import { I18nProvider } from '@/components/I18nProvider';
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
  description: 'La comunidad líder para coleccionistas de billetes antiguos y notafilia. Descubre, comparte y comercia piezas únicas de la historia monetaria mundial.',
  keywords: 'billetes antiguos, notafilia, colección, billetes históricos, coleccionistas',
  authors: [{ name: 'BilletesAntiguos' }],
  openGraph: {
    title: 'BilletesAntiguos | Colección de Billetes Históricos',
    description: 'La comunidad líder para coleccionistas de billetes antiguos y notafilia.',
    type: 'website',
    locale: 'es_ES',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-white text-gray-900">
        <I18nProvider>
          <Header />
          <main className="min-h-screen pt-16 md:pt-20">
            {children}
          </main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
