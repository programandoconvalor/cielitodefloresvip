export interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundLogo: string;
}

export interface ContactConfig {
  whatsapp: string;
  email: string;
  maps: string;
  phoneDisplay: string;
  address: string;
}

export interface SocialLinksConfig {
  facebook: string;
  instagram: string;
  tiktok: string;
}

export interface LogoConfig {
  basePath: string;
  desktop: string;
  mobile: string;
  fallback: string;
}

export interface CatalogConfig {
  categories: string[];
  source: "default-catalog";
  imageBasePath?: string;
  imageFilePrefix?: string;
}

export interface ServicesConfig {
  imageBasePath: string;
  storeImageSrc: string;
}

export interface PaymentsConfig {
  imageBasePath: string;
}

export interface HeroConfig {
  title: string;
  subtitle: string;
  shippingText: string;
  backgroundImages: string[];
}

export interface SiteConfig {
  siteSlug: string;
  businessName: string;
  businessType: string;
  slogan: string;
  publicSiteUrl: string;
  branding: BrandingConfig;
  contact: ContactConfig;
  social: SocialLinksConfig;
  logo: LogoConfig;
  catalog: CatalogConfig;
  services: ServicesConfig;
  payments: PaymentsConfig;
  hero: HeroConfig;
}

export type BadgeType = "new" | "customized" | "specialDay" | "bestSeller" | null;

/* Variant model used by catalogProducts.ts */
export type ProductVariantId = "aire" | "helio";

export type CatalogCategory = {
  id: string;
  label: string;
  productCategoryIds: string[];
  ui: {
    arrowsOnHover: boolean;
  };
};

export type CatalogMenuGroup = {
  id: string;
  label: string;
  items: string[];
};

export type CatalogBranding = {
  businessType: string;
  businessName: string;
  sectionLabel: string;
  logoSrc: string;
};

export type ProductSizeOption = {
  id: ProductVariantId;
  priceMxn: number;
  buttonLabel: string;
  titleLabel: string;
  images: string[];
};

export type ProductSelectableSize = {
  id: string;
  label: string;
  priceMxn?: number;
};

export type ProductMenuAssignment = {
  groupId: string;
  subcategory: string;
};

export type CatalogProduct = {
  id: number;
  categoryId: string;
  titleTemplate?: string;
  baseTitle: string;
  subtitle?: string;
  badgeLabel?: string;
  defaultVariantId?: ProductVariantId;
  basePriceMxn: number;
  defaultImages: string[];
  activeSizeOptions: ProductSizeOption[];
  productSizes?: ProductSelectableSize[];
  colorDots: string[];
  badge: BadgeType | "";
  deliveryMessage?: string;
  description?: string;
  includes?: string[];
  deliveryZones?: string[];
  isAvailable?: boolean;
  sku: string;
  menuAssignments: ProductMenuAssignment[];
  ui: {
    showBadge: boolean;
    showDeliveryDate: boolean;
    showColorDots: boolean;
    showProductSizes?: boolean;
    showStandard?: boolean;
    showPremium?: boolean;
    showLuxury?: boolean;
  };
};

export type SiteCatalogModule = {
  catalogCategories: CatalogCategory[];
  catalogMenuTree: CatalogMenuGroup[];
  catalogProducts: CatalogProduct[];
  buildCardUiMeta: (productId: number) => CatalogProduct;
};

export type SiteBundle = {
  siteConfig: SiteConfig;
  siteData: any;
  catalog: SiteCatalogModule;
};