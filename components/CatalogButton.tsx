"use client";

/**
 * CatalogButton Component
 * 
 * Purpose: CTA button that navigates to the product catalog page.
 * 
 * Features:
 *  - Primary action button: Styled as main call-to-action
 *  - Navigation: Routes to /catalogo page on click
 *  - Text: Fully configurable via JSON (siteData.buttons.catalogButton.text)
 *  - Styling: Colors, hover effects, sizing from JSON configuration
 *  - Responsive: Adapts to mobile and desktop layouts
 *  - 100% JSON-configurable: Text, colors, hover states, padding
 * 
 * Configuration Source: siteData.buttons.catalogButton
 * 
 * Usage Locations:
 *  - HeroCarousel: Hero banner CTA
 *  - Services: Services section bottom action
 *  - Footer: Navigation links
 */

import { BalloonIcon } from "@/components/icons/BalloonIcon";
import { useSiteData } from "@/context/SiteDataProvider";
import CtaButtonBase from "./CtaButtonBase";

type CatalogButtonProps = {
  href?: string;
  label?: string;
  ariaLabel?: string;
  variant?: "hero" | "stacked";
  className?: string;
  onClick?: () => void;
};

export default function CatalogButton({
  href,
  label,
  ariaLabel,
  variant = "hero",
  className,
  onClick,
}: CatalogButtonProps) {
  const siteData = useSiteData();
  const config = siteData.buttons.catalog;
  if (!config.enabled) return null;
  const handleClick = () => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        "catalog-selected-menu-filter",
        JSON.stringify({ label: "Todos", groupId: null }),
      );
      window.dispatchEvent(new CustomEvent("catalog-mobile-subcategory-selected", { detail: { label: "Todos", groupId: null } }));
      try {
        // Mark hero modal as seen for this session so arriving at /catalogo
        // after clicking a CTA does not reopen the promotional modal.
        const key = `heroCarouselModalSeen:${siteData.siteSlug}:catalogo`;
        window.sessionStorage.setItem(key, "1");
      } catch (e) {
        // ignore storage errors
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <CtaButtonBase
      href={href || siteData.routes.catalogPath}
      label={label || config.label}
      ariaLabel={ariaLabel || config.ariaLabel}
      icon={BalloonIcon}
      styleConfig={config.variants[variant]}
      className={className}
      onClick={() => {
        handleClick();
        if (onClick) onClick();
      }}
    />
  );
}

