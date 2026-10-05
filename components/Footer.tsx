"use client";
/**
 * Footer Component
 *
 * Purpose: Website footer with brand information, links, social icons, payment methods and developer credit.
 *
 * Features:
 *  - Grid Layout: Multiple sections (brand, policies, contact, payments, developer)
 *  - Brand Section: Logo, company name, description
 *  - Policy Links: Policies and terms navigation
 *  - Contact Information: Address, phone, email with hover effects
 *  - Payment Methods: Visual icons for accepted payment types (Visa, Mastercard, etc.)
 *  - Social Icons: Facebook, Instagram, Maps, WhatsApp links
 *  - Developer Credit: "Developed by" section with WhatsApp link to developer
 *  - Dark Theme: Gradient background with custom scrollbar styling
 *  - 100% JSON-configurable: Sections, colors, sizes, hover effects, visibility flags
 *
 * Responsive Layout:
 *  - Mobile: Stacked single-column layout, smaller text and spacing
 *  - Tablet/Desktop: Multi-column grid layout with organized sections
 *
 * Configuration Sources:
 *  - siteData.footer: All section content, styling, social links, developer info
 *
 * Special Features:
 *  - Dark scrollbar styling: Custom colors for scrollbar track and thumb
 *  - Developer WhatsApp: Dynamic message includes business name from configuration
 */

"use client";

import { useState } from "react";
import { MapPin, CreditCard, Landmark, Banknote } from "lucide-react";
import PoliciesModal from "./PoliciesModal";
import { useSiteData } from "@/context/SiteDataProvider";

export default function Footer() {
  const siteData = useSiteData();
  const footerConfig = siteData.footer;
  if (!footerConfig?.enabled) return null;
  const footerUi = footerConfig.ui;

  const year = new Date().getFullYear();
  const [openPolicies, setOpenPolicies] = useState(false);
  const brandSection = footerConfig.sections.brand;
  const policiesSection = footerConfig.sections.policies;
  const contactSection = footerConfig.sections.contact;
  const paymentsSection = footerConfig.sections.payments;
  const bottomSection = footerConfig.bottom;

  const renderSocialIcon = (key: string) => {
    if (key === "maps") {
      return <MapPin size={footerUi.socialIconGlyphSize} />;
    }
    if (key === "whatsapp") {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ width: footerUi.socialIconGlyphSize, height: footerUi.socialIconGlyphSize }}
        >
          <path d="M20.52 3.48A11.8 11.8 0 0 0 12.04 0C5.52 0 .2 5.3.2 11.84c0 2.08.54 4.1 1.56 5.88L0 24l6.46-1.7a11.8 11.8 0 0 0 5.58 1.42h.01c6.52 0 11.84-5.3 11.84-11.84 0-3.16-1.23-6.13-3.37-8.4zM12.05 21.7a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.83 1 1.02-3.73-.24-.38a9.86 9.86 0 0 1-1.52-5.18c0-5.45 4.43-9.88 9.9-9.88 2.64 0 5.12 1.03 6.98 2.9a9.8 9.8 0 0 1 2.9 6.98c0 5.45-4.44 9.88-9.9 9.88zm5.42-7.42c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.08-.3-.15-1.25-.46-2.39-1.47-.88-.78-1.48-1.74-1.66-2.03-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.08-.8.37-.27.3-1.05 1.02-1.05 2.5 0 1.47 1.08 2.9 1.23 3.1.15.2 2.12 3.23 5.13 4.53.72.31 1.28.5 1.72.64.72.23 1.37.2 1.88.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.08-.12-.28-.2-.58-.35z" />
        </svg>
      );
    }
    if (key === "facebook") {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ width: footerUi.socialIconGlyphSize, height: footerUi.socialIconGlyphSize }}
        >
          <path d="M13.5 21v-7h2.3l.4-2.8h-2.7V9.4c0-.8.2-1.4 1.4-1.4h1.5V5.5c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H8V14h2.5v7h3z" />
        </svg>
      );
    }
    if (key === "instagram") {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ width: footerUi.socialIconGlyphSize, height: footerUi.socialIconGlyphSize }}
        >
          <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm11 1.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
        </svg>
      );
    }
    if (key === "tiktok") {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ width: footerUi.socialIconGlyphSize, height: footerUi.socialIconGlyphSize }}
        >
          <path d="M16.5 3c.3 1.7 1.4 3 3 3.7v2.7a8.1 8.1 0 0 1-3-1v5.8a5.5 5.5 0 1 1-4.2-5.3v2.8a2.8 2.8 0 1 0 1.4 2.5V3h2.8z" />
        </svg>
      );
    }
    return null;
  };

  const renderPaymentIcon = (icon: string) => {
    if (icon === "cash") {
      return <Banknote size={footerUi.paymentIconSize} style={{ color: footerUi.paymentIconColor }} />;
    }
    if (icon === "bank") {
      return <Landmark size={footerUi.paymentIconSize} style={{ color: footerUi.paymentIconColor }} />;
    }
    if (icon === "card") {
      return <CreditCard size={footerUi.paymentIconSize} style={{ color: footerUi.paymentIconColor }} />;
    }
    return null;
  };

  const buildDeveloperWhatsappHref = () => {
    const contact = bottomSection.developerContact;
    if (!contact?.enabled) {
      return "";
    }

    const message = contact.messageTemplate.replace("{{businessName}}", siteData.brand.businessName);
    return `${contact.whatsappBase}?text=${encodeURIComponent(message)}`;
  };

  const developerHref = buildDeveloperWhatsappHref();

  return (
    <div className="flow-root w-full max-w-full overflow-x-clip bg-[#050505]">
      <footer
        className="w-full min-w-0 text-[#F8F1E4]"
        style={{
          marginTop: footerUi.marginTop,
          height: "auto",
          borderTopWidth: "1px",
          borderTopStyle: "solid",
          borderTopColor: "rgba(200,169,107,0.42)",
          background: "#050505",
        }}
      >
        <div
          className="mx-auto box-border w-full max-w-full min-w-0 px-4 py-8 sm:px-6 md:px-10 md:py-10"
          style={{
            maxWidth: footerUi.containerMaxWidth,
          }}
        >
          <div className="grid min-w-0 grid-cols-1 items-start gap-8 md:grid-cols-4" style={{ gap: footerUi.gridGap }}>

            {/* Marca */}
            {brandSection.enabled ? (
              <div className="min-w-0">
                <h3 className="break-words font-serif text-lg font-semibold text-[#C8A96B]">
                  {brandSection.title}
                </h3>

                <p className="break-words text-sm leading-6 text-[#C9C9C9]" style={{ marginTop: footerUi.sectionBodyMarginTop }}>
                  {brandSection.description}
                </p>
              </div>
            ) : null}

            {/* Políticas */}
            {policiesSection.enabled ? (
              <div className="min-w-0">
                <h4 className="break-words font-serif font-semibold text-[#C8A96B]">
                  {policiesSection.title}
                </h4>

                <div className="flex min-w-0 flex-col gap-2 text-sm" style={{ marginTop: footerUi.sectionBodyMarginTop }}>
                  {policiesSection.items
                    .filter((item) => item.enabled)
                    .map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          if (item.action === "openPoliciesModal") {
                            setOpenPolicies(true);
                          }
                        }}
                        className="w-fit max-w-full whitespace-normal break-words text-left text-[#F8F1E4] underline decoration-[#C8A96B] underline-offset-4 transition"
                        style={{ color: "#F8F1E4" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#A00025";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#F8F1E4";
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                </div>
              </div>
            ) : null}

            {/* Contacto */}
            {contactSection.enabled ? (
              <div className="min-w-0">
                <h4 className="break-words font-serif font-semibold text-[#C8A96B]">
                  {contactSection.title}
                </h4>

                <div className="flex min-w-0 max-w-full flex-wrap gap-3" style={{ marginTop: footerUi.sectionBodyMarginTop }}>
                  {contactSection.socialLinks
                    .filter((link) => link.enabled)
                    .map((link) => (
                      <a
                        key={`${link.key}-${link.href}`}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.ariaLabel}
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition"
                        style={{
                          borderColor: "rgba(200,169,107,0.38)",
                          background: "#0F0F14",
                          color: "#C8A96B",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#8D001F";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#0F0F14";
                        }}
                      >
                        {renderSocialIcon(link.key)}
                      </a>
                    ))}
                </div>
              </div>
            ) : null}

            {/* PAYMENT METHODS - Accepted payment types and supporting icons */}
            {paymentsSection.enabled ? (
              <div className="min-w-0">
                <h4 className="break-words font-serif font-semibold text-[#C8A96B]">
                  {paymentsSection.title}
                </h4>

                <div className="space-y-2 text-sm text-[#C9C9C9]" style={{ marginTop: footerUi.sectionBodyMarginTop }}>
                  {paymentsSection.items
                    .filter((item) => item.enabled)
                    .map((item) => (
                      <div key={`${item.icon}-${item.label}`} className="flex min-w-0 items-center gap-2 break-words">
                        {renderPaymentIcon(item.icon)}
                        {item.label}
                      </div>
                    ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Bottom */}
          {bottomSection.enabled ? (
            <div
              className="flex min-w-0 flex-col gap-2 border-t border-[#C8A96B]/30 pt-4 text-xs text-[#C9C9C9] sm:flex-row sm:items-center sm:justify-between"
              style={{
                marginTop: footerUi.bottomMarginTop,
              }}
            >
              <p className="min-w-0 break-words">{bottomSection.copyrightPrefix} © {year} </p>

              {bottomSection.showDeveloperLink && developerHref ? (
                <p className="min-w-0 break-words">
                  <a
                    href={developerHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block max-w-full break-words text-[#C9C9C9] underline decoration-[#C8A96B] underline-offset-4 transition"
                    style={{ fontSize: footerUi.developerLinkFontSize, color: "#C9C9C9" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#6D28D9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#C9C9C9";
                    }}
                  >
                    {bottomSection.developerLabel}
                  </a>
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </footer>

      {/* Modal */}
      <PoliciesModal
        isOpen={openPolicies}
        onClose={() => setOpenPolicies(false)}
      />
    </div>
  );
}

