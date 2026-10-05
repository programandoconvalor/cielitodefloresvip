import type { CatalogProduct, ProductSelectableSize } from "@/data/site/types";

export function resolveDisplayTitle(product: CatalogProduct, variantLabel?: string, sizeLabel?: string) {
  const parts = [product.baseTitle];
  if (variantLabel) parts.push(variantLabel);
  // Only include size label when product UI allows showing product sizes
  const showSizes = product.ui?.showProductSizes !== false;
  if (showSizes && sizeLabel) parts.push(sizeLabel);
  return parts.filter(Boolean).join(" - ");
}

export function findSizeById(product: CatalogProduct, sizeId?: string): ProductSelectableSize | undefined {
  if (!product.productSizes) return undefined;
  return product.productSizes.find((s) => s.id === sizeId);
}

export function computeFinalPrice(product: CatalogProduct, variantPrice: number | undefined, sizeId?: string) {
  const size = findSizeById(product, sizeId);
  const sizePrice = size ? size.priceMxn : 0;
  const variant = variantPrice ?? 0;
  return variant + sizePrice;
}
