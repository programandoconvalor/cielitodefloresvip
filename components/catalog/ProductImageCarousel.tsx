"use client";

import React from "react";

type Props = {
  images: string[];
  sku: string;
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onOpen: (index: number) => void;
};

export default function ProductImageCarousel({
  images,
  sku,
  activeIndex,
  onPrev,
  onNext,
  onOpen,
}: Props) {
  const current =
    images[activeIndex] ?? images[0];

  if (!current) {
    return null;
  }

  return (
    <div className="relative w-full">
      {/* =========================================================
          IMAGE AREA
      ========================================================= */}
      <div
        className="
          relative
          w-full
          aspect-square
          overflow-hidden
          bg-[#050505]
        "
      >
        <img
          src={current}
          alt="Producto"
          className="
            h-full
            w-full
            cursor-pointer
            object-cover
          "
          loading="lazy"
          onClick={() =>
            onOpen(activeIndex)
          }
          style={{
            objectPosition: "center center",
          }}
        />

        {/* Subtle image overlay */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
          "
          style={{
            boxShadow:
              "inset 0 0 0 1px rgba(200,169,91,0.08)",
          }}
        />

        <span
          className="
            absolute
            bottom-2
            right-2
            z-10
            rounded-[4px]
            bg-black/80
            px-2
            py-1
            text-[9px]
            font-medium
            tracking-[0.08em]
            text-white
            sm:bottom-3
            sm:right-3
            sm:text-[10px]
          "
          style={{
            bottom: "10px",
            right: "10px",
            zIndex: 30,
            display: "block",
            backgroundColor: "rgba(0, 0, 0, 0.86)",
            color: "#ffffff",
            whiteSpace: "nowrap",
          }}
        >
          {sku}
        </span>

        {/* =======================================================
            PREVIOUS
        ======================================================= */}
        {images.length > 1 && (
          <button
            type="button"
            aria-label="Imagen anterior"
            onClick={onPrev}
            className="
              absolute
              left-2
              top-1/2
              flex
              h-8
              w-8
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              bg-black/45
              text-lg
              text-white/80
              backdrop-blur-sm
              sm:left-4
              sm:h-10
              sm:w-10
            "
          >
            ‹
          </button>
        )}

        {/* =======================================================
            NEXT
        ======================================================= */}
        {images.length > 1 && (
          <button
            type="button"
            aria-label="Imagen siguiente"
            onClick={onNext}
            className="
              absolute
              right-2
              top-1/2
              flex
              h-8
              w-8
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              bg-black/45
              text-lg
              text-white/80
              backdrop-blur-sm
              sm:right-4
              sm:h-10
              sm:w-10
            "
          >
            ›
          </button>
        )}

        {/* Favorite button removed from carousel for VIP product cards */}

        {/* =======================================================
            PAGINATION DOTS
        ======================================================= */}
        {images.length > 1 && (
          <div
            className="
              absolute
              bottom-3
              left-1/2
              z-20
              flex
              -translate-x-1/2
              items-center
              gap-2
              rounded-full
              bg-black/40
              px-3
              py-1.5
              backdrop-blur-sm
            "
          >
            {images.map((_, index) => {
              const active =
                index === activeIndex;

              return (
                <button
                  key={index}
                  type="button"
                  aria-label={`Ver imagen ${index + 1}`}
                  onClick={() =>
                    onOpen(index)
                  }
                  className="
                    rounded-full
                    transition-all
                    duration-200
                  "
                  style={{
                    width: active ? 10 : 7,
                    height: active ? 10 : 7,
                    background: active
                      ? "#C8A95B"
                      : "rgba(255,255,255,0.28)",
                    boxShadow: active
                      ? "0 2px 8px rgba(0,0,0,0.5)"
                      : "none",
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}