import HeroSection from '@/components/HeroSection';
import BanknoteCarousel from '@/components/BanknoteCarousel';
import SearchBanknotes from '@/components/SearchBanknotes';
import FeaturesSection from '@/components/FeaturesSection';
import TestimonialsSection from '@/components/TestimonialsSection';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Carousel - Últimos 100 billetes de la BD */}
      <BanknoteCarousel />
      
      {/* Buscador con filtros */}
      <SearchBanknotes />
      
      {/* Features Section - Por qué elegirnos */}
      <FeaturesSection />
      
      {/* Testimonials */}
      <TestimonialsSection />
    </>
  );
}
