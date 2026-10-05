"use client";

/**
 * CtaButtonBase Component
 * 
 * Purpose: Base button component for all call-to-action buttons throughout the site.
 * 
 * Features:
 *  - Reusable Base: Foundation for CatalogButton, ServicesButton, QuoteButton, etc.
 *  - Consistent Styling: Unified button appearance across all CTAs
 *  - Hover Effects: Smooth color transitions and visual feedback
 *  - Text & Children: Flexible content (text or custom child elements)
 *  - Responsive: Adapts sizing and padding to screen size
 *  - 100% JSON-configurable: Colors, hover states, padding, sizing
 *  - Event Handling: Click, hover, and keyboard event support
 * 
 * Props:
 *  - onClick: Click handler function
 *  - children: Button content (text or elements)
 *  - disabled: Optional disabled state
 *  - className: Additional CSS classes
 * 
 * Configuration Source: siteData.buttons
 * 
 * Sub-components built on this:
 *  - CatalogButton: Navigate to catalog
 *  - ServicesButton: Navigate to services
 *  - QuoteButton: Request quote
 *  - RequestInfoButton: Request product info
 */
import Link from "next/link";
import { ComponentType, useState } from "react";
import type { LucideIcon } from "lucide-react";



type CtaVariantStyle = {
  className?: string;
  background: string;
  hoverBackground?: string;
  borderColor?: string;
  textColor?: string;
  shadow?: string;
  hoverShadow?: string;
};

type CtaButtonBaseProps = {
  href: string;
  label: string;
  ariaLabel?: string;
  icon: LucideIcon | ComponentType<{ className?: string }>;
  styleConfig: CtaVariantStyle;
  className?: string;
  onClick?: () => void;
};

export default function CtaButtonBase({
  href,
  label,
  ariaLabel,
  icon: Icon,
  styleConfig,
  className = "",
  onClick,
}: CtaButtonBaseProps) {
  const [isHovered, setIsHovered] = useState(false);
  const baseClassName = "inline-flex items-center justify-center gap-2 transition-transform duration-200 hover:-translate-y-0.5";

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`${baseClassName} ${styleConfig.className || ""} ${className}`.trim()}
      style={{
        background: isHovered && styleConfig.hoverBackground ? styleConfig.hoverBackground : styleConfig.background,
        borderColor: styleConfig.borderColor,
        color: styleConfig.textColor,
        boxShadow: isHovered && styleConfig.hoverShadow ? styleConfig.hoverShadow : styleConfig.shadow,
      }}
    >
      <Icon className="h-4 w-4" strokeWidth={2.3} />
      {label}
    </Link>
  );
}