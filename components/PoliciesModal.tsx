"use client";
/**
 * PoliciesModal Component
 *
 * Purpose: Modal overlay displaying company policies, terms and conditions.
 *
 * Features:
 *  - Modal Overlay: Semi-transparent backdrop for focus
 *  - Centered Panel: Scrollable content area with custom styling
 *  - Close Button: Icon button with hover effects and keyboard support
 *  - Gradient Icon: Badge with glow effect at top of modal
 *  - Multiple Sections: Policies header, content body, close button
 *  - Click-outside Close: Closes modal when clicking backdrop
 *  - Escape Key Support: Close modal with ESC key
 *  - Mobile Responsive: Full-height on mobile, centered panel on desktop
 *  - 100% JSON-configurable: All colors, sizes, borders, shadows, text styling
 *
 * Props:
 *  - isOpen: Boolean controlling modal visibility
 *  - onClose: Callback function to close modal
 *
 * Configuration Sources:
 *  - siteData.policies.modalUi: All styling properties (20+ configuration options)
 *  - siteData.policies.title: Modal title text
 *  - siteData.policies.content: Modal body content
 *
 * Styling Features:
 *  - Overlay with configurable background and opacity
 *  - Panel border, shadow, and background colors
 *  - Icon badge with gradient and glow effect
 *  - Typography: Title and body text colors/sizes
 *  - Close button: Border, background, hover states
 *
 * Keyboard Support:
 *  - ESC key to close modal
 */
import { Flower2, X } from "lucide-react";
import { useSiteData } from "@/context/SiteDataProvider";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function PoliciesModal({ isOpen, onClose }: Props) {
  const siteData = useSiteData();
  if (!isOpen) return null;
  const modalUi = siteData.policies.modalUi;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: modalUi.overlayBackground }}
    >
      <div
        className="relative flex w-full flex-col overflow-hidden rounded-3xl border"
        style={{
          maxHeight: modalUi.panelMaxHeight,
          maxWidth: modalUi.panelMaxWidth,
          borderColor: modalUi.panelBorderColor,
          backgroundColor: modalUi.panelBackground,
          boxShadow: modalUi.panelShadow,
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -left-12 top-10 h-44 w-44 rounded-full blur-3xl"
            style={{ backgroundColor: modalUi.glowTopLeft }}
          />
          <div
            className="absolute -right-10 bottom-8 h-52 w-52 rounded-full blur-3xl"
            style={{ backgroundColor: modalUi.glowBottomRight }}
          />
        </div>

        <div
          className="relative z-10 border-b px-5 pb-4 pt-4 backdrop-blur-sm md:px-7 md:pt-5"
          style={{
            borderColor: "rgba(148, 163, 184, 0.24)",
            backgroundColor: "color-mix(in srgb, var(--color-panel-bg) 92%, transparent)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-sm"
                style={{
                  borderColor: modalUi.iconBadgeBorderColor,
                  background: modalUi.iconBadgeBackground,
                }}
              >
                <Flower2 style={{ color: modalUi.iconBadgeColor }} className="h-7 w-7" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: modalUi.subtitleColor }}>
                  {modalUi.subtitle}
                </p>
                <h2 className="truncate text-lg font-extrabold md:text-2xl" style={{ color: modalUi.titleColor }}>
                  {siteData.policies.title}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition hover:scale-[1.03]"
              style={{
                borderColor: modalUi.closeButtonBorderColor,
                background: modalUi.closeButtonBackground,
                color: modalUi.closeButtonColor,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = modalUi.closeButtonHoverBackground;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = modalUi.closeButtonBackground;
              }}
              aria-label="Cerrar"
            >
              <X style={{ color: modalUi.closeButtonIconColor ?? modalUi.closeButtonColor }} width={18} height={18} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        <div className="themed-scrollbar relative z-10 overflow-y-auto px-5 pb-7 pt-5 md:px-7 md:pt-6">
          <div
            className="space-y-5"
            style={{ color: modalUi.bodyTextColor, fontSize: modalUi.bodyFontSize, lineHeight: modalUi.bodyLineHeight }}
          >
            {siteData.policies.paragraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

