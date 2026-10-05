import { companyInfo } from "@/data/site/companyInfo";
import { servicesData } from "@/data/site/services";
import { siteData } from "@/data/site/siteData";
import { siteConfig } from "@/data/site/siteConfig";
import {
  catalogProducts,
  catalogCategories,
  catalogMenuTree,
  buildCardUiMeta,
} from "@/data/site/catalogProducts";
import type { CatalogProduct, SiteCatalogModule, SiteConfig } from "@/data/site/types";
import type { ISiteProvider } from "./ISiteProvider";

export class StaticSiteProvider implements ISiteProvider {
  async getSiteConfig(): Promise<SiteConfig> {
    return siteConfig;
  }

  getSiteConfigSync(): SiteConfig {
    return siteConfig;
  }

  async getCompanyInfo(): Promise<any> {
    return companyInfo;
  }

  getCompanyInfoSync(): any {
    return companyInfo;
  }

  async getSiteData(): Promise<any> {
    return this.getSiteDataSync();
  }

  getSiteDataSync(): any {
    return siteData;
  }

  async getCatalogData(): Promise<SiteCatalogModule> {
    return this.getCatalogDataSync();
  }

  getCatalogDataSync(): SiteCatalogModule {
    return {
      catalogCategories,
      catalogMenuTree,
      catalogProducts,
      buildCardUiMeta,
    };
  }

  async getProducts(): Promise<CatalogProduct[]> {
    return catalogProducts;
  }

  getProductsSync(): CatalogProduct[] {
    return catalogProducts;
  }

  async getServices(): Promise<any> {
    return servicesData;
  }

  getServicesSync(): any {
    return servicesData;
  }
}

