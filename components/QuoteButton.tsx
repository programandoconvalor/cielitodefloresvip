"use client";

/**
 * QuoteButton Component
 * 
 * Purpose: CTA button to request a quote for products/services.
 * 
 * Features:
 *  - Quote Request: Opens contact form for quote submission
 *  - Styling: Header-optimized button with hover color transitions
 *  - Text: Configurable label from JSON (siteData.buttons.quoteButton.text)
 *  - Responsive: Adapts to header layouts on all screen sizes
 *  - 100% JSON-configurable: Text, colors, hover states
 * 
 * Configuration Source: siteData.buttons.quoteButton
 * 
 * Usage Locations:
 *  - Header: Primary navigation CTA (desktop and mobile)
 *  - Services: Product/service quote action
 */

import { useSiteData } from "@/context/SiteDataProvider";
import WhatsAppActionButtonBase from "./WhatsAppActionButtonBase";

type QuoteButtonProps = {
  href?: string;
  label?: string;
  ariaLabel?: string;
  variant?: "main" | "compact";
  className?: string;
};

export default function QuoteButton({
  href,
  label,
  ariaLabel,
  variant = "main",
  className,
}: QuoteButtonProps) {
  const siteData = useSiteData();
  const config = siteData.buttons.quote;
  const resolvedHref = href || siteData.links.whatsappQuote;
  if (!config.enabled) return null;

  return (
    <WhatsAppActionButtonBase
      href={resolvedHref}
      label={label || config.label}
      ariaLabel={ariaLabel || config.ariaLabel}
      styleConfig={variant === "compact" ? config.variants.compact : config.variants.main}
      iconClassName={variant === "compact" ? "h-3.5 w-3.5" : "h-4 w-4"}
      className={className}
    />
  );
}

