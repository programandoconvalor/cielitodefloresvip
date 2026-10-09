"use client";

import React from "react";

type Props = {
  sku: string;
  title: string;
  selectedSize?: string | null;
};

export default function ProductActions({
  sku,
  title,
  selectedSize,
}: Props) {
  const sizeText = selectedSize
    ? ` - Tamaño: ${selectedSize.toUpperCase()}`
    : "";

  const href = `https://wa.me/?text=${encodeURIComponent(
    `Hola, quiero solicitar información sobre ${title} (${sku})${sizeText}`,
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`Solicitar información por WhatsApp sobre ${title}`}
      className="
        flex
        min-h-[46px]
        w-full
        min-w-0
        items-center
        justify-center
        gap-2
        rounded-[10px]
        border
        border-[#C8A95B]/70
        bg-gradient-to-b
        from-[#8D001F]
        to-[#700018]
        px-2.5
        py-2.5
        text-center
        text-[#F8F1E4]
        shadow-[0_8px_24px_rgba(90,0,20,0.30),inset_0_1px_0_rgba(255,255,255,0.08)]
        transition-all
        duration-200
        hover:brightness-110
        active:scale-[0.99]
        sm:min-h-[52px]
        sm:gap-2.5
        sm:rounded-[13px]
        sm:px-4
        sm:py-3
      "
      style={{
        fontFamily: "inherit",
      }}
    >
      <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        <svg
          width="18"
          height="18"
          viewBox="-1 -1 26 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="block shrink-0"
        >
          <path
            d="M20.52 3.48A11.9 11.9 0 0012 0C5.373 0 .001 5.373.001 12.003 0 14.046.545 16 1.57 17.65L0 24l6.53-1.56A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12 0-2.97-1.03-5.72-2.48-8.52z"
            stroke="#F2D99A"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.5 6.9c.3-.3.7-.3 1-.1l1.4 1.1c.3.2.4.6.2.9l-.6.9c.8 1.4 1.9 2.5 3.3 3.3l.9-.6c.3-.2.7-.1.9.2l1.1 1.4c.2.3.2.7-.1 1-.7.7-1.8 1-2.7.7-3.1-1-5.8-3.7-6.8-6.8-.3-.9 0-2 .7-2.7z"
            stroke="#F2D99A"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <span
        className="
          min-w-0
          whitespace-normal
          text-[9px]
          font-bold
          uppercase
          leading-tight
          tracking-[0.04em]
          sm:text-[11px]
          sm:tracking-[0.08em]
        "
      >
        PEDIR POR WHATSAPP
      </span>
    </a>
  );
}
