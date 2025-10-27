import Hero from '@/components/Hero';
import Features from '@/components/AboutUs';
import Services from '@/components/Services';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <Features />
      <Services />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </main>
  );
}