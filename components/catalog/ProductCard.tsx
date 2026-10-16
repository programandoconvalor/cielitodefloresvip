
"use client";

import React, { useEffect, useState } from "react";

import ProductImageCarousel from "./ProductImageCarousel";
import ProductInfo from "./ProductInfo";
import ProductPrice from "./ProductPrice";
import ProductActions from "./ProductActions";

import type { CatalogProduct } from "@/data/site/catalogProducts";

type Props = {
  product: CatalogProduct;
  activeImageIndex: number;
  onPrevImage: () => void;
  onNextImage: () => void;
  onOpenPreview: (index: number) => void;
  displayPrice: number;
};

export default function ProductCard({
  product,
  activeImageIndex,
  onPrevImage,
  onNextImage,
  onOpenPreview,
  displayPrice,
}: Props) {
  const ui = product.ui;

  const showProductSizes = ui.showProductSizes !== false;
  const showStandard = ui.showStandard !== false;
  const showPremium = ui.showPremium !== false;
  const showLuxury = ui.showLuxury !== false;

  const sizeKind = (id: string) => {
    const key = id.toLowerCase();

    if (key.includes("premium")) return "premium";

    if (
      key.includes("estandar") ||
      key.includes("standard") ||
      key.includes("estándar")
    ) {
      return "estandar";
    }

    if (key.includes("luxury") || key.includes("luxe")) {
      return "luxury";
    }

    return key;
  };

  const visibleSizes = (product.productSizes ?? []).filter((size) => {
    const kind = sizeKind(size.id);

    if (kind === "premium") return showPremium;
    if (kind === "estandar") return showStandard;
    if (kind === "luxury") return showLuxury;

    return showProductSizes;
  });

  const pickInitial = (): string | undefined => {
    if (!showProductSizes) return undefined;

    const findByKind = (kind: string) =>
      visibleSizes.find((size) => sizeKind(size.id) === kind)?.id;

    return (
      findByKind("premium") ??
      findByKind("estandar") ??
      findByKind("luxury") ??
      visibleSizes[0]?.id
    );
  };

  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    pickInitial,
  );

  useEffect(() => {
    const next = pickInitial();

    if (next !== selectedSize) {
      setSelectedSize(next);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    showProductSizes,
    showStandard,
    showPremium,
    showLuxury,
    product.productSizes?.length,
  ]);

  const selectedSizeData =
    showProductSizes && selectedSize
      ? product.productSizes?.find((size) => size.id === selectedSize)
      : undefined;

  const priceToShow =
    selectedSizeData?.priceMxn ??
    (displayPrice > 0 ? displayPrice : product.basePriceMxn ?? 0);

  const showBadge =
    Boolean(product.ui?.showBadge) &&
    Boolean(product.badgeLabel || product.badge);

  const badgeText = product.badgeLabel || "EXCLUSIVO";

  // Imagen actual del carrusel, con alternativa a la primera imagen.
  const imageUrl =
    product.defaultImages?.[activeImageIndex] ??
    product.defaultImages?.[0] ??
    undefined;

  // Nombre y etiqueta del tamaño para el mensaje de WhatsApp.
  const selectedSizeLabel = selectedSizeData?.label ?? undefined;

  return (
    <article
      className="
        relative
        mx-auto
        w-full
        max-w-[420px]
        overflow-hidden
        rounded-[18px]
        border
        border-[#8E6B35]
        bg-[#080808]
        shadow-[0_18px_55px_rgba(0,0,0,0.75)]
        sm:max-w-[440px]
        md:max-w-none
      "
    >
      {/* Borde interior dorado */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-40 rounded-[18px]"
        style={{
          boxShadow: "inset 0 0 0 1px rgba(200,169,91,0.22)",
        }}
      />

      {/* Etiqueta del producto */}
      {showBadge && (
        <div className="absolute left-3 top-3 z-30 sm:left-5 sm:top-5">
          <div
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-br-[11px]
              rounded-tl-[11px]
              px-2.5
              py-1.5
              sm:gap-2
              sm:px-4
              sm:py-2
            "
            style={{
              background:
                "linear-gradient(180deg, #7A001C 0%, #5C0015 100%)",
              boxShadow: "0 6px 18px rgba(0,0,0,0.45)",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="sm:h-4 sm:w-4"
            >
              <path
                d="M12 2l1.9 4.3L18.5 8l-3.8 2.9L15 15l-3-2-3 2 .3-4.1L3.5 8l4.6-1.7L12 2z"
                fill="#C8A95B"
              />
            </svg>

            <span
              className="text-[8px] font-semibold uppercase tracking-[0.13em] sm:text-xs sm:tracking-[0.16em]"
              style={{ color: "#F8F1E4" }}
            >
              {badgeText}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col">
        {/* Imagen y carrusel */}
        <div className="w-full">
          <ProductImageCarousel
            images={product.defaultImages}
            sku={product.sku}
            activeIndex={activeImageIndex}
            onPrev={onPrevImage}
            onNext={onNextImage}
            onOpen={onOpenPreview}
          />
        </div>

        {/* Información del producto */}
        <div
          className="
            flex
            flex-col
            px-4
            pb-4
            pt-4
            sm:px-7
            sm:pb-7
            sm:pt-6
          "
          style={{
            borderTop: "1px solid rgba(200,169,91,0.16)",
          }}
        >
          <ProductInfo
            product={product}
            subtitle={selectedSizeData?.subtitle ?? product.subtitle}
          />

          {/* Precio actualizado según el tamaño seleccionado */}
          <div className="mt-4 sm:mt-6">
            <ProductPrice price={priceToShow} />
          </div>

          {/* Selector de tamaño */}
          {showProductSizes && visibleSizes.length > 0 && (
            <div className="mt-4 sm:mt-6">
              <div
                className="mb-2 text-[8px] uppercase tracking-[0.2em] sm:mb-3 sm:text-[10px]"
                style={{ color: "rgba(201,180,129,0.82)" }}
              >
                TAMAÑO
              </div>

              <div
                role="tablist"
                aria-label="Seleccionar tamaño"
                className="grid grid-cols-3 gap-1.5 sm:gap-2"
              >
                {visibleSizes.map((size) => {
                  const active = selectedSize === size.id;

                  return (
                    <button
                      key={size.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-pressed={active}
                      onClick={() => setSelectedSize(size.id)}
                      className="
                        min-h-[34px]
                        rounded-full
                        px-1
                        text-[8px]
                        font-medium
                        uppercase
                        tracking-[0.04em]
                        transition-all
                        duration-200
                        sm:min-h-[42px]
                        sm:px-2
                        sm:text-[10px]
                        sm:tracking-[0.08em]
                      "
                      style={{
                        color: active
                          ? "#C8A95B"
                          : "rgba(235,229,218,0.82)",
                        border: active
                          ? "1.5px solid #C8A95B"
                          : "1px solid rgba(255,255,255,0.25)",
                        background: active
                          ? "rgba(200,169,91,0.05)"
                          : "rgba(255,255,255,0.015)",
                      }}
                    >
                      {size.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Acciones del producto */}
          <div className="mt-4 flex w-full flex-col items-end gap-2 sm:mt-6">
            <button
              type="button"
              onClick={() => onOpenPreview(activeImageIndex)}
              aria-label={`Ver detalles de ${product.baseTitle}`}
              title="Ver detalle"
              className="
                flex h-8 w-8 items-center justify-center rounded-full
                border border-[#C8A95B]/55 bg-[#8E6B35] text-white
                shadow-[0_3px_10px_rgba(142,107,53,0.35)]
                transition hover:scale-105 hover:bg-[#725329]
                active:scale-95 focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-[#C8A95B]
                focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]
              "
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>

            <div className="w-full">
              <ProductActions
                sku={product.sku}
                title={product.baseTitle}
                price={priceToShow}
                fallbackPrice={product.basePriceMxn}
                selectedSize={selectedSizeLabel}
                imageUrl={imageUrl}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
