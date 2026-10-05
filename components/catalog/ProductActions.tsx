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
    `Hola, quiero solicitar información sobre ${title} (${sku})${sizeText}`
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="
        flex
        min-h-[46px]
        w-full
        items-center
        justify-center
        gap-2
        rounded-[10px]
        px-3
        py-2.5
        text-center
        transition-all
        duration-200
        active:scale-[0.99]
        hover:brightness-110
        sm:min-h-[56px]
        sm:gap-3
        sm:rounded-[13px]
        sm:px-5
        sm:py-3
      "
      style={{
        background:
          "linear-gradient(180deg, #8D001F 0%, #700018 100%)",
        border:
          "1px solid rgba(190,25,48,0.9)",
        color: "#F8F1E4",
        boxShadow:
          "0 8px 24px rgba(90,0,20,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <span className="flex-shrink-0 flex items-center justify-center" style={{width:18, height:18, flexShrink:0}}>
        <svg
          width="18"
          height="18"
          viewBox="-1 -1 26 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid meet"
          style={{display: 'block', overflow: 'visible'}}
        >
          <path
            d="M20.52 3.48A11.9 11.9 0 0012 0C5.373 0 .001 5.373.001 12.003 0 14.046.545 16 1.57 17.65L0 24l6.53-1.56A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12 0-2.97-1.03-5.72-2.48-8.52z"
            stroke="#F2D99A"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M7.5 6.9c.3-.3.7-.3 1-.1l1.4 1.1c.3.2.4.6.2.9l-.6.9c.8 1.4 1.9 2.5 3.3 3.3l.9-.6c.3-.2.7-.1.9.2l1.1 1.4c.2.3.2.7-.1 1-0.7.7-1.8 1-2.7.7-3.1-1-5.8-3.7-6.8-6.8-.3-.9 0-2 .7-2.7z"
            stroke="#F2D99A"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <span
        className="
          whitespace-nowrap
          text-[8px]
          font-semibold
          uppercase
          tracking-[0.09em]
          sm:text-sm
          sm:tracking-[0.12em]
        "
      >
        Solicitar información
      </span>
    </a>
  );
}