import Navbar from "./sections/Navbar";
import Hero from "./sections/Hero";
import Pricing from "./sections/Pricing";
import Calculator from "./sections/Calculator";
import HowItWorks from "./sections/HowItWorks";
import Trust from "./sections/Trust";
import PhoneShowcase from "./sections/PhoneShowcase";
import Footer from "./sections/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Pricing />
      <Calculator />
      <HowItWorks />
      <Trust />
      <PhoneShowcase />
      <Footer />
    </main>
  );
}
