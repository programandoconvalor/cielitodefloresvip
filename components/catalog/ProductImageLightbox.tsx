"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  images: string[];
  activeIndex: number;
  productTitle: string;
  sku: string;
  priceMxn: number;
  selectedSizeLabel?: string | undefined;
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
  isOpen,
  onClose,
  onPrev,
  onNext,
  onChangeIndex,
}: Props) {
  const [index, setIndex] = useState(activeIndex ?? 0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const lastTouch = useRef<{ x: number; y: number } | null>(null);
  const pinchStart = useRef<number | null>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIndex(activeIndex ?? 0);
  }, [activeIndex]);

  // Do not manipulate body styles here: Catalog.tsx centrally manages
  // the page scroll lock when opening the preview. This component
  // must avoid side-effects that interfere with that behavior.

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        if (scale === 1) { prev(); }
      }
      if (e.key === "ArrowRight") {
        if (scale === 1) { next(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, scale]);

  const setImageIndex = (i: number) => {
    const bounded = Math.max(0, Math.min(i, images.length - 1));
    setIndex(bounded);
    onChangeIndex(bounded);
  };

  const prev = () => {
    if (index > 0) setImageIndex(index - 1);
    onPrev();
  };

  const next = () => {
    if (index < images.length - 1) setImageIndex(index + 1);
    onNext();
  };

  // Touch handlers for swipe and pinch
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const dx = a.clientX - b.clientX;
      const dy = a.clientY - b.clientY;
      pinchStart.current = Math.hypot(dx, dy);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && lastTouch.current && scale === 1) {
      const dx = e.touches[0].clientX - lastTouch.current.x;
      const dy = e.touches[0].clientY - lastTouch.current.y;
      // horizontal swipe threshold
      if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) prev(); else next();
        lastTouch.current = null;
      }
    } else if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const dx = a.clientX - b.clientX;
      const dy = a.clientY - b.clientY;
      const dist = Math.hypot(dx, dy);
      if (pinchStart.current) {
        const ratio = dist / pinchStart.current;
        const newScale = Math.max(1, Math.min(4, scale * ratio));
        setScale(newScale);
      }
      pinchStart.current = dist;
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    lastTouch.current = null;
    pinchStart.current = null;
    if (scale <= 1.01) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    // allow ctrl+wheel zoom on desktop
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = -e.deltaY / 500;
      setScale((s) => Math.max(1, Math.min(4, s + delta)));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
    >
      <button
        aria-label="Cerrar galería"
        onClick={onClose}
        className="absolute top-4 right-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--gold)] text-2xl leading-none text-white"
      >
        ✕
      </button>

      <div className="flex flex-1 items-center justify-center w-full h-full p-4">
        <div className="relative max-h-full max-w-full flex items-center justify-center">
          <img
            ref={imgRef}
            src={images[index]}
            alt={productTitle}
            className="max-h-[88vh] max-w-[96vw] object-contain"
            style={{ transform: `scale(${scale}) translate(${translate.x}px, ${translate.y}px)` }}
            draggable={false}
          />

          {/* navigation arrows for desktop */}
          {images.length > 1 && (
            <>
              <button aria-label="Imagen anterior" onClick={prev} className="hidden md:flex absolute left-4 text-white text-3xl">‹</button>
              <button aria-label="Imagen siguiente" onClick={next} className="hidden md:flex absolute right-4 text-white text-3xl">›</button>
            </>
          )}
        </div>
      </div>

      {/* product info */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center text-white">
        <div className="text-center">
          <div className="font-display text-lg" style={{color:'var(--gold)'}}>{productTitle}</div>
          {selectedSizeLabel && <div className="mt-1">{selectedSizeLabel}</div>}
          <div className="mt-1 font-extrabold">${priceMxn.toLocaleString('es-MX')}</div>
        </div>
      </div>
    </div>
  );
}
