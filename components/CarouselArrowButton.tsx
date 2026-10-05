"use client";

/**
 * CarouselArrowButton Component
 *
 * Purpose: Shared reusable carousel navigation arrow button used across Hero and Services components.
 *
 * Features:
 *  - Fully styled via JSON configuration (carouselArrowButton block)
 *  - Directional support: Previous (left arrow) and next (right arrow) buttons
 *  - Hover states: Background and icon color transitions
 *  - Responsive sizing: Different sizes for mobile vs desktop
 *  - Click handler: Accepts onClick callback from parent carousel
 *  - Accessibility: Proper pointer events, cursor styling
 *  - Shadow effects: Configurable shadow and hover shadow
 *  - Responsive: Mobile and desktop size variants
 *
 * Props:
 *  - direction: "prev" (left arrow) or "next" (right arrow)
 *  - onClick: Callback function for navigation
 *
 * Configuration Sources:
 *  - siteData.carouselArrowButton: All styling (colors, sizes, shadows, transitions)
 *
 * Usage:
 *  - HeroCarousel: Hero section image navigation
 *  - Services: Services carousel navigation
 */
import { useState, type CSSProperties } from "react";
import { useSiteData } from "@/context/SiteDataProvider";

type Props = {
  direction: "left" | "right";
  onClick: () => void;
  ariaLabel: string;
  symbol: string;
  className?: string;
  zIndex?: number;
  pointerEvents?: CSSProperties["pointerEvents"];
};

export default function CarouselArrowButton({
  direction,
  onClick,
  ariaLabel,
  symbol,
  className,
  zIndex,
  pointerEvents,
}: Props) {
  const siteData = useSiteData();
  const [isHovered, setIsHovered] = useState(false);
  const ui = siteData.carouselArrowButton;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={ariaLabel}
      className={className}
      data-direction={direction}
      style={{
        height: ui.mobileSize,
        width: ui.mobileSize,
        fontSize: ui.mobileIconSize,
        borderWidth: ui.borderWidth,
        borderStyle: "solid",
        borderRadius: ui.borderRadius,
        background: isHovered ? ui.hoverBackground : ui.background,
        color: isHovered ? ui.hoverIconColor : ui.iconColor,
        borderColor: isHovered ? ui.hoverBorderColor : ui.borderColor,
        boxShadow: isHovered ? ui.hoverShadow : ui.shadow,
        transition: ui.transition,
        zIndex,
        pointerEvents,
      }}
    >
      <span className="leading-none" aria-hidden="true">
        {symbol}
      </span>
      <style jsx>{`
        /* Hidden by default on small screens; visible (flex) from md and up */
        button {
          display: none;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          line-height: 1;
        }

        @media (min-width: 768px) {
          button {
            display: flex;
            height: ${ui.size};
            width: ${ui.size};
            font-size: ${ui.iconSize};
          }
        }
      `}</style>
    </button>
  );
}


