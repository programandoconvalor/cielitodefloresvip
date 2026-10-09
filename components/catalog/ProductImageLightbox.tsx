"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  images: string[];
  activeIndex: number;
  productTitle: string;
  sku: string;
  priceMxn: number;
  selectedSizeLabel?: string;
  description?: string;
  includes?: string[];
  deliveryZones?: string[];
  isAvailable?: boolean;
  ctaHref?: string;
  isOpen: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onChangeIndex: (index: number) => void;
};

export default function ProductImageLightbox({
  images,
  activeIndex,
  productTitle,
  sku,
  priceMxn,
  selectedSizeLabel,
  description,
  includes,
  deliveryZones,
  isAvailable,
  ctaHref,
  isOpen,
  onClose,
  onPrev,
  onNext,
  onChangeIndex,
}: Props) {
  const [index, setIndex] = useState(activeIndex ?? 0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastTouch = useRef<{ x: number; y: number } | null>(null);
  const pinchStart = useRef<number | null>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIndex(activeIndex ?? 0);
  }, [activeIndex]);

  useEffect(() => {
    if (!isOpen) return;

    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, [index, isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (scale !== 1) return;

      if (event.key === "ArrowLeft") prev();
      if (event.key === "ArrowRight") next();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, scale, index]);

  const setImageIndex = (newIndex: number) => {
    if (images.length === 0) return;

    const boundedIndex = Math.max(0, Math.min(newIndex, images.length - 1));
    setIndex(boundedIndex);
    onChangeIndex(boundedIndex);
  };

  const prev = () => {
    if (index <= 0) return;
    setImageIndex(index - 1);
    onPrev();
  };

  const next = () => {
    if (index >= images.length - 1) return;
    setImageIndex(index + 1);
    onNext();
  };

  const onTouchStart = (event: React.TouchEvent) => {
    if (event.touches.length === 1) {
      lastTouch.current = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
      return;
    }

    if (event.touches.length === 2) {
      const [first, second] = [event.touches[0], event.touches[1]];
      pinchStart.current = Math.hypot(
        first.clientX - second.clientX,
        first.clientY - second.clientY,
      );
    }
  };

  const onTouchMove = (event: React.TouchEvent) => {
    if (
      event.touches.length === 1 &&
      lastTouch.current &&
      scale === 1
    ) {
      const dx = event.touches[0].clientX - lastTouch.current.x;
      const dy = event.touches[0].clientY - lastTouch.current.y;

      // Detect horizontal swipes without interfering with vertical scrolling.
      if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) prev();
        else next();

        lastTouch.current = null;
      }
      return;
    }

    if (event.touches.length === 2) {
      const [first, second] = [event.touches[0], event.touches[1]];
      const distance = Math.hypot(
        first.clientX - second.clientX,
        first.clientY - second.clientY,
      );

      if (pinchStart.current) {
        const ratio = distance / pinchStart.current;
        setScale((currentScale) =>
          Math.max(1, Math.min(4, currentScale * ratio)),
        );
      }

      pinchStart.current = distance;
    }
  };

  const onTouchEnd = () => {
    lastTouch.current = null;
    pinchStart.current = null;

    if (scale <= 1.01) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    }
  };

  const onWheel = (event: React.WheelEvent) => {
    // Ctrl + wheel zoom is supported; regular wheel scrolls the modal.
    if (!event.ctrlKey) return;

    event.preventDefault();
    const delta = -event.deltaY / 500;
    setScale((currentScale) =>
      Math.max(1, Math.min(4, currentScale + delta)),
    );
  };

  if (!isOpen || images.length === 0) return null;

  const CheckIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3 w-3 fill-current">
      <path d="M9.2 16.2 4.9 12l-1.4 1.4 5.7 5.7L21 7.3l-1.4-1.4z" />
    </svg>
  );

  const GiftIcon = () => (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 fill-none stroke-current"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 12v9H4v-9M2 7h20v5H2zM12 7v14M12 7H7.5a2.5 2.5 0 1 1 2.5-2.5C10 6 12 7 12 7Zm0 0h4.5A2.5 2.5 0 1 0 14 4.5C14 6 12 7 12 7Z" />
    </svg>
  );

  const PinIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M12 2a8 8 0 0 0-8 8c0 5.7 8 12 8 12s8-6.3 8-12a8 8 0 0 0-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
    </svg>
  );

  const WhatsAppIcon = () => (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 fill-none stroke-current"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3 20l1-4.7a8.5 8.5 0 1 1 16.5-3.6Z" />
      <path d="M8.5 8.2c.3-.6.6-.6.9-.6h.4c.2 0 .4.1.5.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.2.2-.2.4 0 .7.5.8 1.2 1.5 2.1 1.9.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.6.8c.3.1.4.3.3.6-.1.6-.5 1.1-1.1 1.4-.6.3-1.4.3-2.2 0-1.2-.4-2.5-1.3-3.5-2.4-.9-1-1.5-2.2-1.5-3.1 0-.6.2-1.2.5-1.6Z" />
    </svg>
  );

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Vista previa de ${productTitle}`}
      className="
        fixed inset-0 z-50 overflow-y-auto overscroll-contain
        bg-black/75 px-3 py-3 backdrop-blur-[2px]
        sm:px-5 sm:py-5
      "
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
    >
      {/* The close button scrolls with the modal content, not the viewport. */}
      <section
        className="
          relative mx-auto w-full max-w-[560px] overflow-hidden
          rounded-[14px] border border-[#C8A95B]/55 bg-[#080808]
          text-[#F8F1E4] shadow-[0_24px_70px_rgba(0,0,0,0.55)]
        "
      >
        <button
          type="button"
          aria-label="Cerrar galería"
          onClick={onClose}
          className="
            absolute right-2 top-2 z-30 flex h-9 w-9 items-center
            justify-center rounded-full border border-[#C8A95B]/70
            bg-[#8E6B35] text-[25px] font-light leading-none text-white
            shadow-md transition hover:bg-[#725329] active:scale-95
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-[#C8A95B] focus-visible:ring-offset-2
            focus-visible:ring-offset-[#080808]
          "
        >
          <span className="-mt-0.5">×</span>
        </button>

        {/* Product image and centered bottom carousel indicator. */}
        <div className="relative flex min-h-0 shrink-0 items-center justify-center overflow-hidden bg-[#111111]">
          <img
            src={images[index]}
            alt={productTitle}
            className="max-h-[48vh] min-h-[190px] w-full select-none object-cover sm:max-h-[56vh]"
            style={{
              transform: `scale(${scale}) translate(${translate.x}px, ${translate.y}px)`,
              transformOrigin: "center center",
            }}
            draggable={false}
          />

          {images.length > 1 && index > 0 && (
            <button
              type="button"
              aria-label="Imagen anterior"
              onClick={prev}
              className="
                absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2
                items-center justify-center rounded-full bg-black/65
                text-2xl text-[#F2D99A] shadow transition hover:bg-black/85
              "
            >
              ‹
            </button>
          )}

          {images.length > 1 && index < images.length - 1 && (
            <button
              type="button"
              aria-label="Imagen siguiente"
              onClick={next}
              className="
                absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2
                items-center justify-center rounded-full bg-black/65
                text-2xl text-[#F2D99A] shadow transition hover:bg-black/85
              "
            >
              ›
            </button>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center justify-center gap-1.5 rounded-full border border-[#C8A95B]/35 bg-black/65 px-3 py-2 backdrop-blur-sm">
              {images.map((_, imageIndex) => (
                <button
                  key={imageIndex}
                  type="button"
                  aria-label={`Ver imagen ${imageIndex + 1}`}
                  aria-current={imageIndex === index ? "true" : undefined}
                  onClick={() => setImageIndex(imageIndex)}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    imageIndex === index
                      ? "w-5 bg-[#C8A95B]"
                      : "w-1.5 bg-white/75 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Scrollable product details. */}
        <div className="min-h-0 overflow-y-auto px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
          <header>
            <h2 className="text-[19px] font-extrabold leading-tight tracking-[-0.025em] text-[#F8F1E4] sm:text-[22px]">
              {productTitle}
            </h2>

            {sku && (
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#C8A95B]">
                {sku}
              </p>
            )}

            {selectedSizeLabel && (
              <p className="mt-1 text-xs font-medium text-[#D6C7A6]">
                {selectedSizeLabel}
              </p>
            )}

            <p className="mt-1 text-[17px] font-extrabold tracking-[-0.02em] text-[#F2D99A] sm:text-[19px]">
              ${priceMxn.toLocaleString("es-MX")} MXN
            </p>

            {description && (
              <p className="mt-1.5 text-[11px] leading-[1.5] text-[#D7D0C3] sm:text-xs">
                {description}
              </p>
            )}
          </header>

          {includes && includes.length > 0 && (
            <section className="mt-3 rounded-[11px] border border-[#C8A95B]/25 bg-[#17120D] px-3 py-2.5 text-[#F2D99A]">
              <h3 className="mb-1.5 flex items-center gap-2 text-[12px] font-bold">
                <GiftIcon />
                Incluye:
              </h3>

              <ul className="space-y-1 pl-1 text-[10px] leading-tight text-[#F8F1E4] sm:text-[11px]">
                {includes.map((item) => (
                  <li key={item} className="flex items-start gap-1.5">
                    <span className="mt-0.5 flex h-[13px] w-[13px] shrink-0 items-center justify-center rounded-full bg-[#8E6B35] text-white">
                      <CheckIcon />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {deliveryZones && deliveryZones.length > 0 && (
            <section className="mt-2 rounded-[11px] border border-[#C8A95B]/20 bg-[#171A1D] px-3 py-2.5 text-[#F2D99A]">
              <h3 className="mb-1.5 flex items-center gap-2 text-[12px] font-bold">
                <PinIcon />
                Entregas y envíos a domicilio en:
              </h3>
              <p className="pl-7 text-[10px] leading-relaxed text-[#E5DED0] sm:text-[11px]">
                {deliveryZones.join(", ")}
              </p>
            </section>
          )}

          <p className="mt-3 rounded-lg border border-[#C8A95B]/25 bg-[#120F0B] px-3 py-2.5 text-[10px] leading-relaxed text-[#D7D0C3] sm:text-[11px]">
            Cada arreglo se prepara con dedicación. Buscamos lograr el mayor
            parecido a la imagen del catálogo; los tonos de las flores y los
            detalles decorativos pueden variar según la disponibilidad.
          </p>

          <div className="mt-3">
            {ctaHref && isAvailable !== false ? (
              <a
                href={ctaHref}
                target="_blank"
                rel="noreferrer"
                className="
                  inline-flex min-h-[42px] w-full items-center justify-center
                  gap-2 rounded-[8px] border border-[#C8A95B]/70
                  bg-gradient-to-b from-[#8D001F] to-[#700018] px-4 py-2
                  text-[11px] font-extrabold uppercase tracking-[0.02em]
                  text-[#F8F1E4] shadow-[0_8px_20px_rgba(90,0,20,0.28)]
                  transition hover:brightness-110 active:scale-[0.99]
                  sm:min-h-[46px] sm:text-xs
                "
              >
                <WhatsAppIcon />
                Solicitar por WhatsApp
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="
                  inline-flex min-h-[42px] w-full cursor-not-allowed
                  items-center justify-center rounded-[8px] border
                  border-[#C8A95B]/20 bg-[#292725] px-4 py-2
                  text-[11px] font-bold uppercase text-[#A9A196]
                "
              >
                No disponible
              </button>
            )}
          </div>

          {isAvailable === false && (
            <p className="mt-2 text-center text-[10px] text-[#BEB4A3]">
              Consulta disponibilidad para otra fecha.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
