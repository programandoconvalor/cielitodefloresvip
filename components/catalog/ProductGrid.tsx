"use client";
import React from 'react';
import ProductCard from './ProductCard';
import type { CatalogProduct } from '@/data/site/catalogProducts';

type Props = {
  products: CatalogProduct[];
  activeImageByCard: Record<string, number>;
  onPrevImage: (cardId: string) => void;
  onNextImage: (cardId: string) => void;
  onOpenPreview: (cardId: string, index: number) => void;
  getDisplayPrice: (productId: number) => number;
};

export default function ProductGrid({ products, activeImageByCard, onPrevImage, onNextImage, onOpenPreview, getDisplayPrice }: Props) {
  return (
    <div className="mx-auto grid max-w-[1460px] grid-cols-1 gap-8 px-4 md:grid-cols-2 lg:grid-cols-2 lg:gap-10 md:px-6 lg:px-8">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          activeImageIndex={activeImageByCard[String(p.id)] ?? 0}
          onPrevImage={() => onPrevImage(String(p.id))}
          onNextImage={() => onNextImage(String(p.id))}
          onOpenPreview={(index) => onOpenPreview(String(p.id), index)}
          displayPrice={getDisplayPrice(p.id)}
        />
      ))}
    </div>
  );
}
