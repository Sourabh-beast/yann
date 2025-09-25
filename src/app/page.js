import Image from "next/image";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AboutUs from "@/components/AboutUs";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
export default function Home() {
  return (
  <>
  <Navbar />
  <Hero />
  <AboutUs />
  <Services />
  <Testimonials />
  <Footer />
  </>
  );
}
