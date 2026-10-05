"use client";

/**
 * WhatsAppActionButtonBase Component
 * 
 * Purpose: Base WhatsApp CTA button for product inquiries and direct messaging.
 * 
 * Features:
 *  - WhatsApp Integration: Opens business WhatsApp chat in new window
 *  - Message Support: Customizable message templates with product context
 *  - Product-aware: Can include product number and details in messages
 *  - Hover Effects: Color transitions from normal to hover state
 *  - Mobile Responsive: Adapts text and sizing for all screen sizes
 *  - 100% JSON-configurable: Colors, sizes, hover effects, messages
 * 
 * Props:
 *  - productNumber: Optional product code/number for the message
 *  - variant: Visual variant (e.g., primary, secondary)
 *  - size: Button size configuration
 * 
 * Configuration Source: siteData.buttons.whatsappButton
 * 
 * Usage Locations:
 *  - Catalog: Product cards for quick purchase inquiries
 *  - Services: Support contact action
 */



import { MouseEventHandler } from "react";
import { useState } from "react";
import { useSiteData } from "@/context/SiteDataProvider";

type WhatsAppVariantStyle = {
  className?: string;
  background: string;
  hoverBackground?: string;
  borderColor?: string;
  textColor?: string;
  shadow?: string;
  hoverShadow?: string;
};

type WhatsAppActionButtonBaseProps = {
  href: string;
  label: string;
  ariaLabel?: string;
  styleConfig: WhatsAppVariantStyle;
  className?: string;
  iconClassName?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export default function WhatsAppActionButtonBase({
  href,
  label,
  ariaLabel,
  styleConfig,
  className = "",
  iconClassName,
  onClick,
}: WhatsAppActionButtonBaseProps) {
  const siteData = useSiteData();
  const [isHovered, setIsHovered] = useState(false);
  const variantClasses = "inline-flex items-center justify-center gap-2 transition-transform duration-200 hover:-translate-y-0.5";

  const resolvedIconClassName = iconClassName || "h-4 w-4";

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${variantClasses} ${styleConfig.className || ""} ${className}`.trim()}
      style={{
        background: isHovered && styleConfig.hoverBackground ? styleConfig.hoverBackground : styleConfig.background,
        borderColor: styleConfig.borderColor,
        color: styleConfig.textColor,
        boxShadow: isHovered && styleConfig.hoverShadow ? styleConfig.hoverShadow : styleConfig.shadow,
      }}
    >
      <img src={siteData.assets.whatsappIconSrc} alt="WhatsApp" className={resolvedIconClassName} />
      {label}
    </a>
  );
}

