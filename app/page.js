import HeroSection from '@/components/HeroSection';
import FeaturedCollections from '@/components/FeaturedCollections';
import FeaturesSection from '@/components/FeaturesSection';
import TestimonialsSection from '@/components/TestimonialsSection';

export default function Home() {
  return (
    <>
      {/* Hero Section - Sección principal impactante */}
      <HeroSection />
      
      {/* Featured Collections - Colecciones destacadas con cards de billetes */}
      <FeaturedCollections />
      
      {/* Features Section - Por qué elegirnos */}
      <FeaturesSection />
      
      {/* Testimonials - Lo que dicen los coleccionistas */}
      <TestimonialsSection />
    </>
  );
}
