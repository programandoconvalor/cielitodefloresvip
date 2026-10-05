"use client";

import React from "react";

type Props = {
  product: any;
  subtitle?: string;
};

export default function ProductInfo({
  product,
  subtitle: subtitleProp,
}: Props) {
  const title: string =
    product?.baseTitle ??
    product?.title ??
    "";

  const subtitle: string | undefined =
    subtitleProp ?? product?.subtitle ?? undefined;

  return (
    <div className="min-w-0">
      {/* =========================================================
          PRODUCT TITLE (CENTERED, MULTILINE FRIENDLY)
      ========================================================= */}
      <h3
        className="
          w-full
          text-center
          font-display
          text-[1.65rem]
          font-medium
          leading-[1.05]
          tracking-[-0.025em]
          sm:text-[2rem]
          md:text-[2.25rem]
          lg:text-[2.45rem]
          break-words
        "
        style={{
          color: "#D7A84A",
        }}
        title={title}
      >
        {title}
      </h3>

      {/* =========================================================
          PRODUCT SUBTITLE (CENTERED, FROM PROP)
      ========================================================= */}
      {subtitle && (
        <p
          className="
            mt-1
            w-full
            text-center
            text-[0.58rem]
            font-medium
            uppercase
            leading-[1.25]
            tracking-[0.17em]
            sm:mt-1.5
            sm:text-[0.72rem]
            md:text-[0.82rem]
            break-words
          "
          style={{
            color: "rgba(201,180,129,0.92)",
          }}
          title={subtitle}
        >
          {subtitle}
        </p>
      )}

      {/* =========================================================
          GOLD DECORATIVE LINE (CENTERED, SHORT)
      ========================================================= */}
      <div className="flex justify-center">
        <div
          aria-hidden
          className="mt-3"
          style={{
            width: "100px",
            maxWidth: "70%",
            height: "1px",
            background: "#C8A95B",
            opacity: 0.95,
            marginTop: subtitle ? 12 : 8,
          }}
        />
      </div>
    </div>
  );
}