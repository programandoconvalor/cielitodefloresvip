"use client";

/**
 * RequestInfoButton Component
 * 
 * Purpose: CTA button to request detailed product information.
 * 
 * Features:
 *  - Product-specific action: Request info for specific product
 *  - Modal trigger: Opens contact/info request form
 *  - Text: Configurable text from JSON configuration
 *  - Styling: Button colors, hover effects, sizing from JSON
 *  - Responsive: Adapts to card layouts on all screen sizes
 *  - 100% JSON-configurable: Text, colors, hover states
 * 
 * Props:
 *  - productNumber: The product number to request info for
 * 
 * Configuration Source: siteData.buttons.requestInfoButton
 * 
 * Usage Locations:
 *  - Catalog: Product cards (primary CTA)
 */

import { useSiteData } from "@/context/SiteDataProvider";
import WhatsAppActionButtonBase from "./WhatsAppActionButtonBase";

type RequestInfoButtonProps = {
  productName: string;
  priceMxn: number;
  sku?: string;
  selectedOptionLabel?: string;
  variantLabel?: string;
  sizeLabel?: string;
  finalPrice?: number;
  imagePath?: string;
  deliveryMessage?: string;
  includePrice?: boolean;
  includeSku?: boolean;
  includeSelectedOption?: boolean;
  includeImageRef?: boolean;
  includeDeliveryMessage?: boolean;
  includePublishedImageUrl?: boolean;
};

export default function RequestInfoButton({
  productName,
  priceMxn,
  sku,
  selectedOptionLabel,
  variantLabel,
  sizeLabel,
  finalPrice,
  imagePath,
  deliveryMessage,
  includePrice = true,
  includeSku = true,
  includeSelectedOption = false,
  includeImageRef = true,
  includeDeliveryMessage = false,
  includePublishedImageUrl = true,
}: RequestInfoButtonProps) {
  const siteData = useSiteData();
  const requestInfoConfig = siteData.buttons.requestInfo;
  if (!requestInfoConfig.enabled) return null;

  const buildWhatsappUrl = () => {
    const normalizedImagePath = imagePath?.startsWith("/") ? imagePath : imagePath ? `/${imagePath}` : "";
    const baseUrl = siteData.links.publicSiteBaseUrl;
    const localImageReference = includeImageRef && normalizedImagePath ? normalizedImagePath : "";
    const publishedImageUrl =
      includePublishedImageUrl && normalizedImagePath && baseUrl
        ? `${baseUrl}${normalizedImagePath}`
        : "";
    const imageReference = publishedImageUrl || localImageReference;

    const message = [
      requestInfoConfig.messageIntro || "Hola, me interesa este arreglo del catálogo:",
      "",
      `Producto: ${productName}`,
      includePrice ? `Precio: $${priceMxn.toLocaleString("es-MX")} mxn` : "",
      includeSku && sku ? `Código: ${sku}` : "",
      // Prefer explicit variant/size/finalPrice when provided
      includeSelectedOption && variantLabel ? `Variante: ${variantLabel}` : (includeSelectedOption && selectedOptionLabel ? `Variante: ${selectedOptionLabel}` : ""),
      sizeLabel ? `Tamaño: ${sizeLabel}` : "",
      typeof finalPrice === "number" ? `Precio final: $${finalPrice.toLocaleString("es-MX")} mxn` : "",
      includeDeliveryMessage && deliveryMessage ? `Entrega: ${deliveryMessage}` : "",
      imageReference ? `Imagen: ${imageReference}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return `${siteData.links.whatsappCatalogBase}?text=${encodeURIComponent(message)}`;
  };

  const fallbackHref = buildWhatsappUrl();

  return (
    <WhatsAppActionButtonBase
      href={fallbackHref}
      label={requestInfoConfig.label}
      ariaLabel={`${requestInfoConfig.ariaLabelPrefix} ${productName}`}
      styleConfig={requestInfoConfig.variants.card}
      iconClassName="h-3.5 w-3.5 sm:h-4 sm:w-4"
      onClick={(event) => {
        if (typeof window === "undefined") {
          return;
        }

        event.preventDefault();
        const dynamicHref = buildWhatsappUrl();
        window.open(dynamicHref, "_blank", "noopener,noreferrer");
      }}
      className="mt-3"
    />
  );
}

