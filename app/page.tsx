import BeatCatalog from "../components/home/BeatCatalog";
import FeaturedBeats from "../components/home/FeaturedBeats";
import Hero from "../components/home/Hero";
import Productions from "../components/home/Productions";
import Services from "../components/home/Services";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";

export default function Home() {
  return (
    <main>
      <Navbar />

      <Hero />

      <FeaturedBeats />

      <BeatCatalog />

      <Services />

      <Productions />

      <Footer />
    </main>
  );
}