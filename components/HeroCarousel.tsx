"use client";
/**
 * HeroCarousel Component
 *
 * Purpose: Main hero banner section with rotating background images and Call-To-Action buttons.
 *
 * Features:
 *  - Auto-rotating background images carousel (configurable auto-play interval)
 *  - Navigation arrow buttons for manual control (desktop + mobile options)
 *  - Responsive text overlay: badge, title, subtitle, shipping information
 *  - Gradient overlay for improved text readability
 *  - Mobile vs Desktop layouts: Responsive padding, text sizes, arrow visibility
 *  - 100% JSON-configurable: Section visibility, colors, spacing, autoplay behavior
 *
 * Layout Breakpoints:
 *  - Mobile (< 640px): Center-aligned text, compact padding, simplified arrow display
 *  - Desktop (>= 640px): Full-width banner, extra padding, always-visible arrows
 *
 * Configuration Sources:
 *  - siteData.hero: Main carousel configuration (images, text, behavior)
 *  - siteData.carouselArrowButton: Shared styling for arrow buttons
 *
 * Dependencies: CatalogButton, ServicesButton, CarouselArrowButton
 */

import React, { useState, useEffect } from 'react';
import { useSiteData } from "@/context/SiteDataProvider";
import CatalogButton from "./CatalogButton";
import ServicesButton from "./ServicesButton";
import CarouselArrowButton from "./CarouselArrowButton";

export default function HeroCarousel() {
  const siteData = useSiteData();
  const images = siteData.hero.backgroundImages;
  const [current, setCurrent] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const heroData = siteData.hero;
  const heroUi = heroData.ui;
  const heroBehavior = heroData.behavior;
  const contentPaddingX = isMobile ? heroUi.contentPaddingX : heroUi.contentPaddingXDesktop;

  if (!heroData.enabled) {
    return null;
  }

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!heroBehavior.autoplayEnabled) {
      return;
    }
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, heroBehavior.autoplayMs);
    return () => clearInterval(interval);
  }, [heroBehavior.autoplayEnabled, heroBehavior.autoplayMs]);

  const prev = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);
  const next = () => setCurrent((prev) => (prev + 1) % images.length);

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ minHeight: heroUi.minHeight }}
    >
      {/* HERO BACKGROUND MEDIA - Current slide image and readability overlay */}
      <img
        src={images[current]}
        alt={heroData.backgroundAlt}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 pointer-events-none"
        style={{ zIndex: 0 }}
      />
      <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: heroUi.overlayBackground }} />

      {/* HERO CONTENT - Headline, supporting copy, and primary CTAs */}
      <div
        className="relative z-20 w-full"
        style={{
          maxWidth: heroUi.contentMaxWidth,
          paddingLeft: contentPaddingX,
          paddingRight: contentPaddingX,
        }}
      >
        <div className="mx-auto flex flex-col items-center gap-4 text-center text-white" style={{ maxWidth: heroUi.textBlockMaxWidth }}>
          {heroUi.badgeEnabled ? (
          <span
            className="inline-flex items-center rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] backdrop-blur"
            style={{
              borderColor: heroUi.badgeBorderColor,
              background: heroUi.badgeBackground,
              color: heroUi.badgeTextColor,
            }}
          >
            {heroData.badgeLabel}
          </span>
          ) : null}

          {heroUi.titleEnabled ? (
          <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
            {heroData.title}
          </h1>
          ) : null}

          {heroUi.subtitleEnabled ? (
          <p className="max-w-3xl text-base text-white/95 sm:text-lg md:text-xl">
            {heroData.subtitle}
          </p>
          ) : null}

          {heroUi.shippingEnabled ? (
          <p className="max-w-3xl text-sm sm:text-base" style={{ color: heroUi.shippingTextColor }}>
            {heroData.shippingText}
          </p>
          ) : null}

          {/* HERO CTA GROUP - Stacked on mobile, inline on desktop */}
          <div className="mt-2 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            {heroUi.showCatalogButton ? (
            <CatalogButton
              href={heroData.ctaButtons.catalog.href || siteData.routes.catalogPath}
              label={heroData.ctaButtons.catalog.label}
            />
            ) : null}

            {heroUi.showServicesButton ? (
            <ServicesButton
              href={heroData.ctaButtons.services.href || siteData.routes.servicesPath}
              label={heroData.ctaButtons.services.label}
            />
            ) : null}
          </div>
        </div>
      </div>

      {/* HERO NAVIGATION ARROWS - Desktop-first controls with optional mobile support */}
      {heroUi.arrowsEnabled && (!isMobile || heroBehavior.showArrowsOnMobile) && (
        <>
          <CarouselArrowButton
            direction="left"
            onClick={prev}
            ariaLabel={heroData.controls.previousAriaLabel}
            symbol={heroData.controls.previousSymbol}
            className="absolute left-6 top-1/2 -translate-y-1/2"
            zIndex={heroUi.arrowsZIndex}
            pointerEvents={heroUi.arrowsPointerEvents}
          />
          <CarouselArrowButton
            direction="right"
            onClick={next}
            ariaLabel={heroData.controls.nextAriaLabel}
            symbol={heroData.controls.nextSymbol}
            className="absolute right-6 top-1/2 -translate-y-1/2"
            zIndex={heroUi.arrowsZIndex}
            pointerEvents={heroUi.arrowsPointerEvents}
          />
        </>
      )}
    </div>
  );
}



