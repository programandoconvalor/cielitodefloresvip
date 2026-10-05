"use client";

/**
 * ScrollToTopButton Component
 * 
 * Purpose: Floating action button for smooth scroll-to-top navigation.
 * 
 * Features:
 *  - Visibility Toggle: Shows only when user scrolls down past threshold
 *  - Smooth Scroll: Animated scroll to page top on click
 *  - Floating Position: Fixed position on screen, right-aligned
 *  - Hover Effects: Color transitions for interactive feedback
 *  - Mobile Responsive: Hides on very small screens, repositions on mobile
 *  - Accessibility: Proper aria-labels and keyboard support
 *  - 100% JSON-configurable: Position, colors, sizes, scroll threshold
 * 
 * Configuration Source: siteData.buttons.scrollToTopButton
 * 
 * Behavior:
 *  - Appears when page scroll > threshold pixels
 *  - Smooth scrolls to top with animation
 *  - Auto-hides when at top of page
 */

import React from "react";
import { useSiteData } from "@/context/SiteDataProvider";

export default function ScrollToTopButton() {
  const siteData = useSiteData();
  const scrollTopConfig = siteData.buttons.scrollTop;
  if (!scrollTopConfig?.enabled) {
    return null;
  }

  const [visible, setVisible] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > scrollTopConfig.showAfterPx);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollTopConfig.showAfterPx]);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={scrollTopConfig.ariaLabel}
      className={`fixed transition-all duration-300 ${visible ? "opacity-100" : "pointer-events-none opacity-0"} rounded-full`}
      style={{
        right: scrollTopConfig.right,
        bottom: scrollTopConfig.bottom,
        zIndex: scrollTopConfig.zIndex,
      }}
    >
      <span
        className="flex items-center justify-center rounded-full border"
        style={{
          width: scrollTopConfig.size,
          height: scrollTopConfig.size,
          background: isHovered ? scrollTopConfig.hoverBackground : scrollTopConfig.background,
          borderColor: isHovered ? scrollTopConfig.hoverBorderColor : scrollTopConfig.borderColor,
          boxShadow: isHovered ? scrollTopConfig.hoverShadow : scrollTopConfig.shadow,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke={isHovered ? scrollTopConfig.hoverIconColor : scrollTopConfig.iconColor}
          className="transition-colors"
          style={{ width: scrollTopConfig.iconSize, height: scrollTopConfig.iconSize }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
        </svg>
      </span>
    </button>
  );
}


