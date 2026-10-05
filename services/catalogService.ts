import type {
  CatalogBranding,
  CatalogCategory,
  CatalogMenuGroup,
  CatalogProduct,
} from "@/data/site/types";
import { getSiteCatalogDataSync, getSiteConfigSync } from "@/services/siteService";
import type { SiteData } from "@/services/siteDataService";
import { rewriteSiteCatalogImagePath } from "@/services/siteAssets";

export type SiteCatalogData = {
  catalogBranding: CatalogBranding;
  catalogCategories: CatalogCategory[];
  catalogMenuTree: CatalogMenuGroup[];
  catalogProducts: CatalogProduct[];
  buildCardUiMeta: (productId: number) => CatalogProduct;
};

function cloneSiteProduct(product: CatalogProduct): CatalogProduct {
  const siteConfig = getSiteConfigSync();
  const basePath = siteConfig.catalog.imageBasePath ?? "/images/catalog";
  const imagePrefix = siteConfig.catalog.imageFilePrefix ?? siteConfig.siteSlug;

  return {
    ...product,
    defaultImages: product.defaultImages.map((image) =>
      rewriteSiteCatalogImagePath(image, basePath, imagePrefix)
    ),
    activeSizeOptions: product.activeSizeOptions.map((option) => ({
      ...option,
      images: option.images.map((image) =>
        rewriteSiteCatalogImagePath(image, basePath, imagePrefix)
      ),
    })),
  };
}

export function buildSiteCatalogData(siteData: SiteData): SiteCatalogData {
  const siteCatalogModule = getSiteCatalogDataSync();

  if (!siteCatalogModule) {
    throw new Error("No site catalog module could be resolved");
  }

  const catalogProducts = siteCatalogModule.catalogProducts.map((product) =>
    cloneSiteProduct(product),
  );

  return {
    catalogBranding: {
      businessType: siteData.brand.businessType,
      businessName: siteData.brand.businessName,
      sectionLabel: siteData.brand.sectionLabel,
      logoSrc: siteData.brand.logoSrc,
    },
    catalogCategories: siteCatalogModule.catalogCategories,
    catalogMenuTree: siteCatalogModule.catalogMenuTree,
    catalogProducts,
    buildCardUiMeta(productId: number) {
      const product = catalogProducts.find((item) => item.id === productId);
      if (!product) {
        return cloneSiteProduct(siteCatalogModule.buildCardUiMeta(productId));
      }

      return product;
    },
  };
}

