"use client";

import React, { useState, useEffect } from "react";
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
  // Determine visibility flags (undefined -> true for backward compatibility)
  const ui = product.ui;
  const showProductSizes = ui.showProductSizes !== false;
  const showStandard = ui.showStandard !== false;
  const showPremium = ui.showPremium !== false;
  const showLuxury = ui.showLuxury !== false;

  // Helper: map product size id to one of 'estandar' | 'premium' | 'luxury' (tolerant)
  const sizeKind = (id: string) => {
    const key = id.toLowerCase();
    if (key.includes("premium")) return "premium";
    if (key.includes("estandar") || key.includes("standard") || key.includes("estándar")) return "estandar";
    if (key.includes("luxury") || key.includes("luxe")) return "luxury";
    return key;
  };

  // Build list of visible sizes preserving product.productSizes order
  const visibleSizes = (product.productSizes ?? []).filter((s) => {
    const kind = sizeKind(s.id);
    if (kind === "premium") return showPremium;
    if (kind === "estandar") return showStandard;
    if (kind === "luxury") return showLuxury;
    // unknown kinds default to visible only if showProductSizes is true
    return showProductSizes;
  });

  // Choose initial selected size following priority: premium -> estandar -> luxury
  const pickInitial = (): string | undefined => {
    if (!showProductSizes) return undefined;
    const findByKind = (k: string) => visibleSizes.find((s) => sizeKind(s.id) === k)?.id;
    return findByKind("premium") ?? findByKind("estandar") ?? findByKind("luxury") ?? visibleSizes[0]?.id;
  };

  const [selectedSize, setSelectedSize] = useState<string | undefined>(pickInitial());

  // Determine price: for VIP products that define `productSizes`, prefer
  // the price of the currently selected size. Otherwise fall back to
  // `basePriceMxn` or `displayPrice` for non-VIP products.
  // Synchronize selectedSize when visibility rules change (including showProductSizes=false)
  useEffect(() => {
    const next = pickInitial();
    // Only update when it actually differs to avoid unnecessary renders
    if (next !== selectedSize) {
      setSelectedSize(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showProductSizes, showStandard, showPremium, showLuxury, product.productSizes?.length]);

  const selectedSizeData = selectedSize
    ? product.productSizes?.find((s) => s.id === selectedSize)
    : undefined;

  const priceToShow = (product.productSizes && product.productSizes.length > 0 && selectedSizeData)
    ? selectedSizeData.priceMxn
    : (product.productSizes && product.productSizes.length > 0 && !selectedSizeData && visibleSizes.length > 0)
      ? visibleSizes[0].priceMxn
      : displayPrice && displayPrice > 0
        ? displayPrice
        : product.basePriceMxn ?? 0;

  const showBadge =
    product.ui?.showBadge &&
    Boolean(product.badgeLabel || product.badge);

  const badgeText = product.badgeLabel || "EXCLUSIVO";

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
      {/* Inner gold border */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-40
          rounded-[18px]
        "
        style={{
          boxShadow:
            "inset 0 0 0 1px rgba(200,169,91,0.22)",
        }}
      />

      {/* =========================================================
          BADGE
      ========================================================= */}
      {showBadge && (
        <div
          className="
            absolute
            left-3
            top-3
            z-30
            sm:left-5
            sm:top-5
          "
        >
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
              boxShadow:
                "0 6px 18px rgba(0,0,0,0.45)",
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
              className="
                text-[8px]
                font-semibold
                uppercase
                tracking-[0.13em]
                sm:text-xs
                sm:tracking-[0.16em]
              "
              style={{
                color: "#F8F1E4",
              }}
            >
              {badgeText}
            </span>
          </div>
        </div>
      )}

      {/* Favorite button removed from product card per request */}

      {/* =========================================================
          CONTENT
      ========================================================= */}
      <div className="flex flex-col">

        {/* IMAGE */}
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

        {/* =======================================================
            PRODUCT INFORMATION
        ======================================================= */}
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
            borderTop:
              "1px solid rgba(200,169,91,0.16)",
          }}
        >
          <ProductInfo product={product} subtitle={selectedSizeData?.subtitle ?? product.subtitle} />

          {/* PRICE */}
          <div className="mt-4 sm:mt-6">
            <ProductPrice price={priceToShow} />
          </div>

          {/* SIZE */}
          {showProductSizes && visibleSizes.length > 0 && (
            <div className="mt-4 sm:mt-6">
              <div
                className="
                  mb-2
                  text-[8px]
                  uppercase
                  tracking-[0.2em]
                  sm:mb-3
                  sm:text-[10px]
                "
                style={{
                  color:
                    "rgba(201,180,129,0.82)",
                }}
              >
                TAMAÑO
              </div>

              <div
                role="tablist"
                aria-label="Seleccionar tamaño"
                className="
                  grid
                  grid-cols-3
                  gap-1.5
                  sm:gap-2
                "
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

          {/* WHATSAPP */}
          <div className="mt-4 sm:mt-6">
            <ProductActions
              sku={product.sku}
              title={product.baseTitle}
              // pass human-friendly label (if available) instead of internal id
              selectedSize={
                selectedSize
                  ? product.productSizes?.find((s) => s.id === selectedSize)?.label ?? selectedSize
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    </article>
  );
}