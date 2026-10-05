import type { CatalogProduct, SiteCatalogModule, SiteConfig } from "@/data/site/types";
import type { ISiteProvider } from "./ISiteProvider";
import { StaticSiteProvider } from "./StaticSiteProvider";

/**
 * Future Firebase mapping:
 * sites/cielitodeflores
 * {
 *   siteSlug,
 *   businessName,
 *   branding,
 *   contact,
 *   social,
 *   logo,
 *   catalog
 * }
 */
export class FirebaseSiteProvider implements ISiteProvider {
  private fallback = new StaticSiteProvider();

  async getSiteConfig(): Promise<SiteConfig> {
    // Future: resolve from Firestore site configuration document.
    return this.fallback.getSiteConfig();
  }

  getSiteConfigSync(): SiteConfig {
    return this.fallback.getSiteConfigSync();
  }

  async getCompanyInfo(): Promise<any> {
    return this.fallback.getCompanyInfo();
  }

  getCompanyInfoSync(): any {
    return this.fallback.getCompanyInfoSync();
  }

  async getSiteData(): Promise<any> {
    // Future: read siteData document from Firestore.
    return this.fallback.getSiteData();
  }

  getSiteDataSync(): any {
    return this.fallback.getSiteDataSync();
  }

  async getCatalogData(): Promise<SiteCatalogModule> {
    // Future: read catalog from Firestore and map Firebase Storage URLs.
    return this.fallback.getCatalogData();
  }

  getCatalogDataSync(): SiteCatalogModule {
    return this.fallback.getCatalogDataSync();
  }

  async getProducts(): Promise<CatalogProduct[]> {
    return this.fallback.getProducts();
  }

  getProductsSync(): CatalogProduct[] {
    return this.fallback.getProductsSync();
  }

  async getServices(): Promise<any> {
    return this.fallback.getServices();
  }

  getServicesSync(): any {
    return this.fallback.getServicesSync();
  }
}

