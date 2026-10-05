"use client";

/**
 * Services Component
 *
 * Purpose: Horizontal carousel displaying business service offerings with auto-rotating card images.
 *
 * Features:
 *  - Card-based grid layout: Each service is a card with title, rotating images, and features list
 *  - Auto-rotating images: Each card cycles through its images independently (4-second interval)
 *  - Horizontal scroll carousel: Smooth scrolling with navigation arrow buttons
 *  - Visual indicators (dots): Shows current image per card
 *  - Responsive layout: Cards adapt width for mobile/tablet/desktop screens
 *  - CTA button: "Visit Catalog" button at bottom to navigate to products
 *  - 100% JSON-configurable: Card data, indicators, carousel controls, visibility flags
 *
 * Layout Behavior:
 *  - Mobile & Desktop: Same horizontal scroll pattern, responsive card widths
 *  - Arrow Controls: Previous/next buttons for manual navigation (mobile: hidden by default)
 *  - Overflow Behavior: Cards scroll horizontally, visible scroll area adapts to screen size
 *
 * Configuration Sources:
 *  - siteData.services: Card data, section styling, carousel controls
 *  - siteData.carouselArrowButton: Shared arrow button styling
 *
 * Dependencies: CatalogButton, CarouselArrowButton
 */
import { useState, useRef, useEffect } from "react";
import { useSiteData } from "@/context/SiteDataProvider";
import CatalogButton from "./CatalogButton";
import CarouselArrowButton from "./CarouselArrowButton";

export default function Services() {
  const siteData = useSiteData();
  const serviceCards = siteData.services.cards;
  if (!siteData.services.enabled) {
    return null;
  }

  const scrollRef = useRef<HTMLDivElement>(null);
  const servicesUi = siteData.services.ui;
  const carouselControls = siteData.services.carouselControls;
  const carouselIndicators = siteData.services.carouselIndicators;
  const [isMobile, setIsMobile] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [imageIndices, setImageIndices] = useState<number[]>(
    serviceCards.map(() => 0)
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    const updateScrollControls = () => {
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      const threshold = 2;
      setCanScrollLeft(container.scrollLeft > threshold);
      setCanScrollRight(container.scrollLeft < maxScrollLeft - threshold);
    };

    updateScrollControls();
    container.addEventListener("scroll", updateScrollControls, { passive: true });
    window.addEventListener("resize", updateScrollControls);

    return () => {
      container.removeEventListener("scroll", updateScrollControls);
      window.removeEventListener("resize", updateScrollControls);
    };
  }, []);

  useEffect(() => {
    const timers = serviceCards.map((service, idx) => {
      return setInterval(() => {
        setImageIndices((prev) => {
          const newIndices = [...prev];
          newIndices[idx] = (newIndices[idx] + 1) % service.images.length;
          return newIndices;
        });
      }, 4000);
    });

    return () => timers.forEach((timer) => clearInterval(timer));
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      if (direction === "left") {
        scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  return (
    <section
      id="servicios"
      style={{
        paddingTop: servicesUi.sectionPaddingY,
        paddingBottom: servicesUi.sectionPaddingY,
        background: servicesUi.sectionBackground,
      }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: servicesUi.contentMaxWidth,
          paddingLeft: servicesUi.contentPaddingX,
          paddingRight: servicesUi.contentPaddingX,
        }}
      >
        {/* SERVICES HEADER - Title and top spacing for the section */}
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-900">{siteData.services.title}</h2>
        </div>

        {/* SERVICES CAROUSEL - Scrollable service cards with overlay controls */}
        <div className="relative">
          {/* CARD VIEWPORT - Defines the visual card area so arrows stay centered on the cards themselves */}
          <div className="relative">
            <div
              ref={scrollRef}
              className="themed-scrollbar flex gap-6 overflow-x-auto scroll-smooth pb-20"
              style={{ scrollBehavior: "smooth" }}
            >
              {serviceCards.map((service, idx) => (
                <div
                  key={idx}
                  className="relative min-w-[280px] overflow-hidden rounded-xl shadow-lg md:min-w-[320px]"
                >
                  {/* SERVICE CARD MEDIA - Rotating image for the current service */}
                  <img
                    src={service.images[imageIndices[idx]]}
                    alt={service.title}
                    className="h-96 w-full object-cover transition-opacity duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
                    <div className="flex justify-center w-full">
                      <div className="whitespace-nowrap rounded-lg bg-slate-900/40 px-4 py-2 backdrop-blur-sm w-fit">
                        <h3 className="text-xs font-light uppercase tracking-widest drop-shadow-lg md:text-sm text-center">
                          {service.title}
                        </h3>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-center gap-2 mb-3">
                        {service.images.map((_, i) => (
                          <div
                            key={i}
                            className="h-2 w-2 rounded-full transition"
                            style={{
                              backgroundColor:
                                i === imageIndices[idx]
                                  ? carouselIndicators.activeColor
                                  : carouselIndicators.inactiveColor,
                              transform: i === imageIndices[idx] ? `scale(${carouselIndicators.activeScale})` : "scale(1)",
                            }}
                          />
                        ))}
                      </div>
                      <div className="rounded-lg bg-slate-900/40 p-3 backdrop-blur-sm">
                        <ul className="space-y-1 text-sm font-medium">
                          {service.items.map((item, i) => (
                            <li key={i} className="truncate">
                              • {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CAROUSEL NAVIGATION - Shared previous/next arrows centered against the card viewport */}
            {servicesUi.controlsEnabled && carouselControls.previousEnabled && (!isMobile || canScrollLeft) ? (
              <CarouselArrowButton
                direction="left"
                onClick={() => scroll("left")}
                ariaLabel={carouselControls.previousAriaLabel}
                symbol={carouselControls.previousSymbol}
                className={
                  isMobile
                    ? "absolute left-2 top-48 z-10 -translate-y-1/2"
                    : "absolute left-0 top-48 z-10 -translate-y-1/2 -translate-x-6"
                }
              />
            ) : null}

            {servicesUi.controlsEnabled && carouselControls.nextEnabled && (!isMobile || canScrollRight) ? (
              <CarouselArrowButton
                direction="right"
                onClick={() => scroll("right")}
                ariaLabel={carouselControls.nextAriaLabel}
                symbol={carouselControls.nextSymbol}
                className={
                  isMobile
                    ? "absolute right-2 top-48 z-10 -translate-y-1/2"
                    : "absolute right-0 top-48 z-10 -translate-y-1/2 translate-x-6"
                }
              />
            ) : null}
          </div>

          {/* SERVICES CTA - Catalog shortcut anchored over the carousel footer */}
          <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center px-4">
            <CatalogButton
              href={siteData.services.cta.href || siteData.routes.catalogPath}
              ariaLabel={siteData.services.cta.ariaLabel}
              label={siteData.services.cta.label}
              className="pointer-events-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}


