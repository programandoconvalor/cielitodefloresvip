"use client";

import React, { useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSiteData } from "@/context/SiteDataProvider";
import CatalogButton from "./CatalogButton";
import ServicesButton from "./ServicesButton";
import CarouselArrowButton from "./CarouselArrowButton";
const HERO_MODAL_SESSION_KEY_PREFIX = "heroCarouselModalSeen";

export default function HeroCarouselModal() {
  const siteData = useSiteData();
  const images = siteData.hero.backgroundImages;
  const modalConfig = siteData.heroModal;
  const heroData = siteData.hero;
  const heroUi = heroData.ui;
  const heroBehavior = heroData.behavior;
  const pathname = usePathname();
  const isCatalogRoute = pathname === siteData.routes.catalogPath || pathname.endsWith("/catalogo");
  const featureFlagEnabled = (modalConfig as { featureFlagEnabled?: boolean }).featureFlagEnabled ?? true;
  const isModalActive = modalConfig.enabled && featureFlagEnabled;
  const sessionKey = `${HERO_MODAL_SESSION_KEY_PREFIX}:${siteData.siteSlug}:catalogo`;
  const modalBackdropBackground = "color-mix(in srgb, var(--secondary-color, #0f172a) 82%, transparent)";
  const modalImageOverlayBackground = "linear-gradient(180deg, color-mix(in srgb, var(--secondary-color, #0f172a) 44%, transparent) 0%, color-mix(in srgb, var(--secondary-color, #0f172a) 78%, transparent) 100%)";
  const modalPanelBorderColor = "color-mix(in srgb, var(--secondary-color, #0f172a) 24%, white)";
  const modalPanelShadow = "0 40px 120px color-mix(in srgb, var(--secondary-color, #0f172a) 62%, black)";
  const closeButtonBackground = "var(--color-primary, #ec4899)";
  const closeButtonHoverBackground = "var(--color-primary-hover, #db2777)";
  const closeButtonBorderColor = "color-mix(in srgb, var(--color-primary, #ec4899) 45%, white)";

  const getStorage = (): Storage | null => {
    if (typeof window === "undefined") {
      return null;
    }
    // Este modal siempre se controla por sesión del navegador.
    return window.sessionStorage;
  };

  const markModalSeen = () => {
    const storage = getStorage();
    storage?.setItem(sessionKey, "1");
  };

  const [current, setCurrent] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const contentPaddingX = isMobile ? heroUi.contentPaddingX : heroUi.contentPaddingXDesktop;

  useLayoutEffect(() => {
    // Prevent automatic opening on route navigation or page load.
    // The modal should only open via explicit user actions or when
    // forced by the TESTHEROCAROUSELMODAL flag for testing purposes.
    if (modalConfig.TESTHEROCAROUSELMODAL) {
      setIsOpen(true);
      return;
    }

    setIsOpen(false);
  }, [
    modalConfig.enabled,
    featureFlagEnabled,
    isCatalogRoute,
    modalConfig.showOnPageLoad,
    modalConfig.TESTHEROCAROUSELMODAL,
    sessionKey,
  ]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isOpen || !heroBehavior.autoplayEnabled || images.length <= 1) {
      return;
    }
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, heroBehavior.autoplayMs);
    return () => clearInterval(interval);
  }, [isOpen, heroBehavior.autoplayEnabled, heroBehavior.autoplayMs]);

  useEffect(() => {
    if (!isOpen || !modalConfig.closeOnEscape) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        markModalSeen();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, modalConfig.closeOnEscape]);

  const prev = () => setCurrent((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  const next = () => setCurrent((prevIndex) => (prevIndex + 1) % images.length);

  if (!isModalActive || !isCatalogRoute || !isOpen || !images.length) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 backdrop-blur-sm"
      style={{ background: modalBackdropBackground }}
      onClick={() => {
        if (modalConfig.closeOnBackdrop) {
          markModalSeen();
          setIsOpen(false);
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label={modalConfig.ariaLabel}
    >
      <div
        className="relative w-full overflow-hidden rounded-3xl border"
        style={{
          maxWidth: modalConfig.ui.panelMaxWidth,
          minHeight: modalConfig.ui.panelMinHeight,
          borderColor: modalPanelBorderColor,
          boxShadow: modalPanelShadow,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={() => {
            markModalSeen();
            setIsOpen(false);
          }}
          className="absolute right-3 top-3 z-[90] inline-flex h-11 w-11 items-center justify-center rounded-full border text-lg font-bold transition hover:scale-[1.03]"
          style={{
            borderColor: closeButtonBorderColor,
            background: closeButtonBackground,
            color: "#ffffff",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = closeButtonHoverBackground;
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = closeButtonBackground;
          }}
          aria-label={modalConfig.closeButtonAriaLabel}
        >
          ✕
        </button>

        <div className="relative flex h-full w-full items-center justify-center overflow-hidden" style={{ minHeight: heroUi.minHeight }}>
          <img
            src={images[current]}
            alt={heroData.backgroundAlt}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
            style={{ zIndex: 0 }}
          />
          <div className="pointer-events-none absolute inset-0 z-10" style={{ background: modalImageOverlayBackground }} />

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

              {heroUi.titleEnabled ? <h2 className="text-3xl font-extrabold leading-tight sm:text-5xl md:text-6xl">{heroData.title}</h2> : null}

              {heroUi.subtitleEnabled ? <p className="max-w-3xl text-base text-white/95 sm:text-lg md:text-xl">{heroData.subtitle}</p> : null}

              {heroUi.shippingEnabled ? (
                <p className="text-[11px] leading-tight whitespace-nowrap sm:text-sm md:text-base" style={{ color: heroUi.shippingTextColor }}>
                  {heroData.shippingText}
                </p>
              ) : null}

              <div className="mt-2 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
                {heroUi.showCatalogButton ? (
                  <CatalogButton
                    href={heroData.ctaButtons.catalog.href || siteData.routes.catalogPath}
                    label={heroData.ctaButtons.catalog.label}
                    onClick={() => {
                      markModalSeen();
                      setIsOpen(false);
                    }}
                  />
                ) : null}

                {heroUi.showServicesButton ? (
                  <ServicesButton
                    href={heroData.ctaButtons.services.href || siteData.routes.servicesPath}
                    label={heroData.ctaButtons.services.label}
                    onClick={() => {
                      markModalSeen();
                      setIsOpen(false);
                    }}
                  />
                ) : null}
              </div>
            </div>
          </div>

          {heroUi.arrowsEnabled && !isMobile && images.length > 1 ? (
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
          ) : null}
        </div>
      </div>
    </div>
  );
}


