"use client";

import React from "react";

type Props = {
  price: number;
};

export default function ProductPrice({
  price,
}: Props) {
  return (
    <div className="min-w-0">
      <div
        className="
          flex
          items-end
          gap-1.5
          whitespace-nowrap
          sm:gap-2
        "
      >
        <span
          className="
            font-display
            leading-none
            font-medium
            tracking-[-0.035em]
            text-[2rem]
            sm:text-[2.55rem]
            md:text-[3rem]
            lg:text-[3.35rem]
          "
          style={{
            color: "var(--gold)",
          }}
        >
          <span className="font-sans">$</span>{price.toLocaleString("es-MX")}
        </span>

        <span
          className="
            mb-[2px]
            text-[0.58rem]
            uppercase
            tracking-[0.07em]
            sm:mb-1
            sm:text-[0.75rem]
            md:text-[0.85rem]
          "
          style={{
            color: "rgba(201,180,129,0.9)",
          }}
        >
          MXN
        </span>
      </div>
    </div>
  );
}