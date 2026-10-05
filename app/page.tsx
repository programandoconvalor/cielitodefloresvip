import Catalog from "@/components/Catalog";
import HeroCarouselModal from "@/components/HeroCarouselModal";
import ScrollToTopButton from "@/components/ScrollToTopButton";

export default function HomePage() {
  return (
    <main className="-mt-[106px] bg-[#050505] md:-mt-20">
      <HeroCarouselModal />
      <Catalog visible={true} />
      <ScrollToTopButton />
    </main>
  );
}

