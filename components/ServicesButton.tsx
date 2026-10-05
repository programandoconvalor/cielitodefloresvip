"use client";

/**
 * ServicesButton Component
 * 
 * Purpose: CTA button that navigates to the services page.
 * 
 * Features:
 *  - Primary action button: Styled as main call-to-action
 *  - Navigation: Routes to /servicios page on click
 *  - Text: Fully configurable via JSON (siteData.buttons.servicesButton.text)
 *  - Styling: Colors, hover effects, sizing from JSON configuration
 *  - Responsive: Adapts to mobile and desktop layouts
 *  - 100% JSON-configurable: Text, colors, hover states, padding
 * 
 * Configuration Source: siteData.buttons.servicesButton
 * 
 * Usage Locations:
 *  - HeroCarousel: Hero banner CTA
 */

import { Handshake } from "lucide-react";
import { useSiteData } from "@/context/SiteDataProvider";
import CtaButtonBase from "./CtaButtonBase";

type ServicesButtonProps = {
  href?: string;
  label?: string;
  ariaLabel?: string;
  variant?: "hero" | "stacked";
  className?: string;
  onClick?: () => void;
};

export default function ServicesButton({
  href,
  label,
  ariaLabel,
  variant = "hero",
  className,
  onClick,
}: ServicesButtonProps) {
  const siteData = useSiteData();
  const config = siteData.buttons.services;
  if (!config.enabled) return null;

  return (
    <CtaButtonBase
      href={href || siteData.routes.servicesPath}
      label={label || config.label}
      ariaLabel={ariaLabel || config.ariaLabel}
      icon={Handshake}
      styleConfig={config.variants[variant]}
      className={className}
      onClick={onClick}
    />
  );
}

