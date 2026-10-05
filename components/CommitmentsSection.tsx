"use client";
/**
 * CommitmentsSection Component
 *
 * Purpose: Display brand commitments (quality, delivery, support) with payment methods and contact information.
 *
 * Features:
 *  - Commitment Cards: Grid layout showing business promises with icons (flower, truck, handshake)
 *  - Payment Methods: Visual grid of accepted payment types (card, cash, bank transfers)
 *  - Store Image: Optional featured image of physical store/location
 *  - Contact Box: Address, phone number, social links with hover effects
 *  - Per-item Enable Flags: Each commitment card and payment method can be toggled
 *  - Responsive Layout: 2-column grid on desktop, 1-column on mobile
 *  - Icon Theming: Dynamic color and size from JSON configuration
 *  - Button Styling: Contact button with hover color transitions
 *  - 100% JSON-configurable: Cards, payment methods, contact, styling
 *
 * Sections:
 *  - Commitments Grid: Brand promises with custom icons and descriptions
 *  - Payment Methods: Accepted payment types with icons
 *  - Store Image: Optional featured image section
 *  - Contact Information: Address, phone, website, social media links
 *
 * Configuration Sources:
 *  - siteData.commitments: Section data, styling, payment methods, contact info
 *  - siteData.commitments.ui: 60+ styling properties (colors, spacing, borders, shadows)
 *
 * Sub-component:
 *  - CommitmentIcon: Renders appropriate icon based on type (flower, delivery, support, etc.)
 */

import { useState } from "react";
import { ArrowLeftRight, BalloonIcon, Banknote, Heart, Landmark, MapPin, Phone, Truck } from "lucide-react";
import { useSiteData } from "@/context/SiteDataProvider";
import Image from "next/image";

function CommitmentIcon({ type, color, size }: { type: string; color: string; size: string }) {
  const iconSize = parseInt(size);
  
  if (type === "flower") {
    return (
      <BalloonIcon 
        style={{ color, width: iconSize, height: iconSize }}
        strokeWidth={2.2}
      />
    );
  }

  if (type === "delivery") {
    return (
      <Truck
        style={{ color, width: iconSize, height: iconSize }}
        strokeWidth={2.2}
      />
    );
  }

  return (
    <Heart
      style={{ color, width: iconSize, height: iconSize }}
      strokeWidth={2.2}
    />
  );
}

function PaymentOptionIcon({ type, color }: { type: string; color: string }) {
  if (type === "cash") {
    return <Banknote style={{ color, width: "20px", height: "20px" }} strokeWidth={2.2} />;
  }

  if (type === "deposit") {
    return <Landmark style={{ color, width: "20px", height: "20px" }} strokeWidth={2.2} />;
  }

  return <ArrowLeftRight style={{ color, width: "20px", height: "20px" }} strokeWidth={2.2} />;
}

export default function CommitmentsSection() {
  const siteData = useSiteData();
  const commitments = siteData.commitments;
  const ui = commitments.ui;

  if (!commitments.enabled) {
    return null;
  }

  const [hoveredAddressBtn, setHoveredAddressBtn] = useState(false);
  const [hoveredPhoneBtn, setHoveredPhoneBtn] = useState(false);
  const [hoveredFacebookBtn, setHoveredFacebookBtn] = useState(false);
  const [hoveredInstagramBtn, setHoveredInstagramBtn] = useState(false);
  const showPaymentMethodsCard = ui.paymentMethodsEnabled && (commitments.paymentMethodsCard?.enabled ?? true);
  const showPaymentOptionsCard = ui.paymentMethodsEnabled && Boolean(commitments.paymentOptionsCard?.enabled);

  const paymentMethodsCard = (
    <div
      style={{
        borderRadius: ui.paymentMethodsRadius,
        border: `1px solid ${ui.paymentMethodsBorderColor}`,
        background: ui.paymentMethodsBackground,
        padding: ui.paymentMethodsPadding,
        boxShadow: ui.paymentMethodsShadow,
      }}
    >
      <h3 style={{ fontSize: "24px", fontWeight: "700", color: ui.titleCardColor, marginBottom: "16px" }}>
        {commitments.paymentMethodsCard?.title || ui.paymentMethodsTitle}
      </h3>

      <div className="flex flex-wrap items-center gap-4">
        {commitments.paymentLogos.map((logo) => (
          logo.enabled ? (
            <Image
              key={logo.src}
              src={logo.src}
              alt={logo.alt}
              width={180}
              height={56}
              className="object-contain"
              style={{
                height: (logo.alt as string) === "Carnet" ? "40px" : "24px",
                width: "auto",
              }}
              sizes="180px"
            />
          ) : null
        ))}
      </div>
    </div>
  );

  const paymentOptionsCard = commitments.paymentOptionsCard ? (
    <div
      style={{
        borderRadius: ui.paymentMethodsRadius,
        border: `1px solid ${ui.paymentMethodsBorderColor}`,
        background: ui.paymentMethodsBackground,
        padding: ui.paymentMethodsPadding,
        boxShadow: ui.paymentMethodsShadow,
      }}
    >
      <h3 style={{ fontSize: "24px", fontWeight: "700", color: ui.titleCardColor, marginBottom: "16px" }}>
        {commitments.paymentOptionsCard.title}
      </h3>

      <div className="space-y-2">
        {commitments.paymentOptionsCard.items.map((item) => (
          item.enabled ? (
            <div key={`${item.icon}-${item.label}`} className="flex items-center gap-3">
              <div
                className="inline-flex items-center justify-center rounded-full"
                style={{
                  width: "34px",
                  height: "34px",
                  background: ui.iconButtonBackground,
                }}
              >
                <PaymentOptionIcon type={item.icon} color={ui.iconButtonColor} />
              </div>
              <p style={{ color: ui.contactTextColor, fontSize: ui.contactTextFontSize }}>
                {item.label}
              </p>
            </div>
          ) : null
        ))}
      </div>
    </div>
  ) : null;

  // Compute contact box style to optionally overlap the store image neatly
  const contactBoxStyleBase: any = {
    borderRadius: ui.contactBoxRadius,
    border: `1px solid ${ui.contactBoxBorderColor}`,
    background: ui.contactBoxBackground,
    padding: ui.contactBoxPadding,
    boxShadow: ui.contactBoxShadow,
  };

  // If store image is shown, pull the contact box up to overlap slightly for a cohesive card look
  const contactBoxComputedStyle = {
    ...contactBoxStyleBase,
    marginTop: ui.storeImageEnabled ? (ui.contactBoxOverlap ?? (typeof ui.contactBoxMarginTop === 'number' ? `-${Math.min(56, ui.storeImageMinHeightMobile / 6)}px` : ui.contactBoxMarginTop)) : ui.contactBoxMarginTop,
  };

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background: ui.sectionBackground,
        paddingTop: ui.sectionPaddingY,
        paddingBottom: ui.sectionPaddingY,
      }}
    >
      <div className="pointer-events-none absolute inset-0 lg:hidden">
        <div className="absolute -left-20 top-20 h-56 w-56 rounded-full bg-pink-200/60 blur-3xl" />
        <div className="absolute -right-16 top-1/3 h-52 w-52 rounded-full bg-rose-200/50 blur-3xl" />
        <div className="absolute bottom-16 left-1/3 h-48 w-48 rounded-full bg-pink-100/70 blur-3xl" />
      </div>

      <div
        className="relative z-10 mx-auto"
        style={{
          maxWidth: ui.contentMaxWidth,
          paddingLeft: ui.contentPaddingX,
          paddingRight: ui.contentPaddingX,
        }}
      >
        <div
          className="grid grid-cols-1 lg:grid-cols-2 items-start"
          style={{ gap: ui.contentGap }}
        >
          {/* LEFT COLUMN - Commitment cards and payment methods; full width first on mobile */}
          <div className="flex flex-col" style={{ gap: "20px" }}>
            <h2 style={{ fontSize: ui.titleFontSize, fontWeight: ui.titleFontWeight, color: ui.titleColor }}>
              {commitments.title}
            </h2>

            {ui.cardsEnabled && commitments.cards.map((item) => (
              item.enabled ? (
                <article
                  key={item.num}
                  className="relative overflow-hidden border-pink-200/70 shadow-[0_10px_24px_rgba(236,72,153,0.12)]"
                  style={{
                    borderRadius: ui.cardBorderRadius,
                    border: `1px solid ${ui.cardBorderColor}`,
                    background: ui.cardBackground,
                    padding: ui.cardPadding,
                    boxShadow: ui.cardShadow,
                  }}
                >
                  <div className="pointer-events-none absolute inset-0 md:hidden bg-gradient-to-br from-pink-50/90 via-white/75 to-rose-50/85" />

                  <div className="relative z-10 flex gap-4">
                    <div
                      className="flex shrink-0 items-center justify-center"
                      style={{
                        height: "56px",
                        width: "56px",
                        borderRadius: ui.iconContainerRadius,
                        border: `1px solid ${ui.iconContainerBorderColor}`,
                        backgroundColor: ui.iconContainerBackground,
                      }}
                    >
                      <CommitmentIcon type={item.icon} color={ui.iconColor} size={ui.iconSize} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h5
                          className="min-w-0 leading-tight truncate"
                          style={{ fontSize: `clamp(0.5rem, 4.5vw, ${ui.titleCardFontSize})`, fontWeight: ui.titleCardFontWeight, color: ui.titleCardColor }}
                        >
                          {item.title}
                        </h5>

                        <span
                          className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-[0_8px_16px_rgba(236,72,153,0.28)]"
                          style={{
                            backgroundColor: ui.badgeBackground,
                            color: ui.badgeTextColor,
                            fontSize: ui.badgeFontSize,
                            fontWeight: ui.badgeFontWeight,
                          }}
                        >
                          {item.num}
                        </span>
                      </div>

                      <p style={{ marginTop: "8px", color: ui.descriptionColor, fontSize: ui.descriptionFontSize, lineHeight: ui.descriptionLineHeight }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </article>
              ) : null
            ))}

            {/* PAYMENT METHODS - Desktop placement stays in the left column */}
            {ui.paymentMethodsEnabled ? (
              <div className="hidden lg:block">
                {showPaymentMethodsCard ? paymentMethodsCard : null}
                {showPaymentOptionsCard && paymentOptionsCard ? (
                  <div className={showPaymentMethodsCard ? "mt-4" : ""}>{paymentOptionsCard}</div>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* RIGHT COLUMN - Store image and contact actions; stacked below on mobile */}
          <div className="flex flex-col h-full lg:min-h-[750px] justify-between">
            {/* STORE IMAGE - Responsive background image with zoom effect on hover */}
            {ui.storeImageEnabled && (
              <div
                className="relative overflow-hidden lg:flex-1"
                style={{
                  minHeight: ui.storeImageMinHeightMobile,
                  borderRadius: ui.storeImageRadius,
                  border: `1px solid ${ui.storeImageBorderColor}`,
                  boxShadow: ui.storeImageShadow,
                }}
              >
                <Image
                  src={commitments.storeImage.src}
                  alt={commitments.storeImage.alt}
                  fill
                  priority
                  quality={95}
                  sizes="(min-width: 1280px) 560px, (min-width: 1024px) 48vw, 100vw"
                  className="object-cover object-center"
                />
              </div>
            )}

            {/* CONTACT BOX - Address, phone (WhatsApp), social media links with hover states */}
            {ui.contactBoxEnabled && (
              <div
                style={contactBoxComputedStyle}
              >
                <div className="w-full flex justify-center">
                  <div
                    className="w-full max-w-xl rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row items-start md:items-center"
                    style={{
                      background: ui.contactBoxInnerBackground ?? "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,248,250,0.85))",
                      border: `1px solid ${ui.contactBoxInnerBorderColor ?? 'rgba(236,72,153,0.08)'}`,
                    }}
                  >
                    <div className="flex-shrink-0 w-full md:w-16 flex items-center justify-center p-3" style={{ background: ui.contactBoxAccentBackground ?? 'transparent' }}>
                      <div className="rounded-full" style={{ width: 40, height: 40, display: 'grid', placeItems: 'center', background: ui.iconContainerBackground ?? 'rgba(236,72,153,0.06)', border: `1px solid ${ui.iconContainerBorderColor ?? 'rgba(236,72,153,0.12)'}` }}>
                        <Heart style={{ color: ui.iconColor, width: 20, height: 20 }} strokeWidth={2.2} />
                      </div>
                    </div>

                    <div className="px-4 py-3 flex-1">
                      <h2 className="text-sm md:text-base font-semibold text-center md:text-left" style={{ color: ui.titleCardColor }}>
                        {commitments.contactBanner?.title}
                      </h2>
                      <p className="mt-1 text-xs md:text-sm text-center md:text-left" style={{ color: ui.contactTextColor }}>
                        {commitments.contactBanner?.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
                <br/>
                {/* ADDRESS ACTION - External maps link with address text */}
                {commitments.address.enabled && (
                  <div className="flex items-start" style={{ gap: ui.contactIconGap }}>
                    <a
                      href={siteData.links.maps}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={commitments.address.ariaLabel}
                      onMouseEnter={() => setHoveredAddressBtn(true)}
                      onMouseLeave={() => setHoveredAddressBtn(false)}
                      className="mt-1 flex shrink-0 cursor-pointer items-center justify-center transition"
                      style={{
                        height: ui.iconButtonSize,
                        width: ui.iconButtonSize,
                        borderRadius: ui.iconButtonRadius,
                        background: hoveredAddressBtn ? ui.iconButtonHoverBackground : ui.iconButtonBackground,
                      }}
                    >
                      <MapPin style={{ color: ui.iconButtonColor, width: "20px", height: "20px" }} />
                    </a>

                    <p style={{ color: ui.contactTextColor, fontSize: ui.contactTextFontSize, lineHeight: ui.contactTextLineHeight }}>
                      {commitments.address.text}
                    </p>
                  </div>
                )}

                {/* DELIVERY CONTACT - WhatsApp shortcut for support and delivery */}
                {commitments.phone.enabled && (
                  <div className="flex items-center" style={{ marginTop: ui.contactItemMarginTop, gap: ui.contactIconGap }}>
                    
                    <a
                      href={siteData.links.whatsappDeliveryContact}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={commitments.phone.ariaLabel}
                      onMouseEnter={() => setHoveredPhoneBtn(true)}
                      onMouseLeave={() => setHoveredPhoneBtn(false)}
                      className="inline-flex cursor-pointer items-center justify-center transition"
                      style={{
                        height: ui.iconButtonSize,
                        width: ui.iconButtonSize,
                        borderRadius: ui.iconButtonRadius,
                        background: hoveredPhoneBtn ? ui.iconButtonHoverBackground : ui.iconButtonBackground,
                      }}
                    >
                      <svg viewBox="0 0 24 24" style={{ color: ui.iconButtonColor, width: "20px", height: "20px" }} fill="currentColor">
                        <path d="M20.52 3.48A11.8 11.8 0 0 0 12.04 0C5.52 0 .2 5.3.2 11.84c0 2.08.54 4.1 1.56 5.88L0 24l6.46-1.7a11.8 11.8 0 0 0 5.58 1.42h.01c6.52 0 11.84-5.3 11.84-11.84 0-3.16-1.23-6.13-3.37-8.4zM12.05 21.7a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.83 1 1.02-3.73-.24-.38a9.86 9.86 0 0 1-1.52-5.18c0-5.45 4.43-9.88 9.9-9.88 2.64 0 5.12 1.03 6.98 2.9a9.8 9.8 0 0 1 2.9 6.98c0 5.45-4.44 9.88-9.9 9.88zm5.42-7.42c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.08-.3-.15-1.25-.46-2.39-1.47-.88-.78-1.48-1.74-1.66-2.03-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.08-.8.37-.27.3-1.05 1.02-1.05 2.5 0 1.47 1.08 2.9 1.23 3.1.15.2 2.12 3.23 5.13 4.53.72.31 1.28.5 1.72.64.72.23 1.37.2 1.88.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.08-.12-.28-.2-.58-.35z" />
                      </svg>
                    </a>

                    <p style={{ color: ui.contactTextColor, fontSize: ui.contactTextFontSize }}>
                      {commitments.phone.display}
                    </p>
                  </div>
                )}

                {/* SOCIAL MEDIA SECTION - Facebook and Instagram links with hover state tracking */}
                {commitments.social.enabled && (
                  <div className="flex flex-wrap items-center gap-3" style={{ marginTop: ui.contactItemMarginTop }}>
                    <a
                      href={siteData.links.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      onMouseEnter={() => setHoveredFacebookBtn(true)}
                      onMouseLeave={() => setHoveredFacebookBtn(false)}
                      className="inline-flex cursor-pointer items-center justify-center transition"
                      style={{
                        height: ui.iconButtonSize,
                        width: ui.iconButtonSize,
                        borderRadius: ui.iconButtonRadius,
                        background: hoveredFacebookBtn ? ui.iconButtonHoverBackground : ui.iconButtonBackground,
                      }}
                    >
                      <svg viewBox="0 0 24 24" style={{ color: ui.iconButtonColor, width: "20px", height: "20px" }} fill="currentColor">
                        <path d="M13.5 21v-7h2.3l.4-2.8h-2.7V9.4c0-.8.2-1.4 1.4-1.4h1.5V5.5c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H8V14h2.5v7h3z" />
                      </svg>
                    </a>

                    <a
                      href={siteData.links.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      onMouseEnter={() => setHoveredInstagramBtn(true)}
                      onMouseLeave={() => setHoveredInstagramBtn(false)}
                      className="inline-flex cursor-pointer items-center justify-center transition"
                      style={{
                        height: ui.iconButtonSize,
                        width: ui.iconButtonSize,
                        borderRadius: ui.iconButtonRadius,
                        background: hoveredInstagramBtn ? ui.iconButtonHoverBackground : ui.iconButtonBackground,
                      }}
                    >
                      <svg viewBox="0 0 24 24" style={{ color: ui.iconButtonColor, width: "20px", height: "20px" }} fill="currentColor">
                        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm11 1.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                      </svg>
                    </a>

                    <p style={{ color: ui.socialTextColor, fontSize: ui.socialTextFontSize }}>
                      {commitments.social.text}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* PAYMENT METHODS - Mobile placement moves below the social/contact box */}
            {ui.paymentMethodsEnabled ? (
              <div className="mt-4 lg:hidden">
                {showPaymentMethodsCard ? paymentMethodsCard : null}
                {showPaymentOptionsCard && paymentOptionsCard ? (
                  <div className={showPaymentMethodsCard ? "mt-4" : ""}>{paymentOptionsCard}</div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}




