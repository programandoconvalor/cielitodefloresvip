import type { SiteConfig, SiteCatalogModule, CatalogProduct } from "@/data/site/types";

export interface ISiteProvider {
  getSiteConfig(): Promise<SiteConfig>;
  getSiteConfigSync?(): SiteConfig;
  getCompanyInfo(): Promise<any>;
  getCompanyInfoSync?(): any;
  getSiteData(): Promise<any>;
  getSiteDataSync?(): any;
  getCatalogData(): Promise<SiteCatalogModule>;
  getCatalogDataSync?(): SiteCatalogModule;
  getProducts(): Promise<CatalogProduct[]>;
  getProductsSync?(): CatalogProduct[];
  getServices(): Promise<any>;
  getServicesSync?(): any;
}

