import CommitmentsSection from "@/components/CommitmentsSection";
import Services from "@/components/Services";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import HeroCarousel from "@/components/HeroCarousel";

export default function ServicesPage() {
  return (
    <main>
      <Services />
      <CommitmentsSection />
      <ScrollToTopButton />
    </main>
  );
}
