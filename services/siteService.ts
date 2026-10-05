import { defaultSiteConfig } from "@/data/site/siteConfig";
import { FirebaseSiteProvider } from "@/providers/FirebaseSiteProvider";
import { StaticSiteProvider } from "@/providers/StaticSiteProvider";
import type { ISiteProvider } from "@/providers/ISiteProvider";
import type { SiteCatalogModule, SiteConfig } from "@/data/site/types";

function createSiteProvider(): ISiteProvider {
  return process.env.NEXT_PUBLIC_SITE_PROVIDER === "firebase"
    ? new FirebaseSiteProvider()
    : new StaticSiteProvider();
}

let siteProvider: ISiteProvider = createSiteProvider();

export function setSiteProvider(provider: ISiteProvider) {
  siteProvider = provider;
}

export async function getSiteConfig(): Promise<SiteConfig> {
  return siteProvider.getSiteConfig();
}

export function getSiteConfigSync(): SiteConfig {
  return siteProvider.getSiteConfigSync?.() ?? defaultSiteConfig;
}

export async function getCompanyInfo(): Promise<any> {
  return siteProvider.getCompanyInfo();
}

export function getCompanyInfoSync(): any {
  return siteProvider.getCompanyInfoSync?.();
}

export async function getSiteData(): Promise<any> {
  return siteProvider.getSiteData();
}

export function getSiteDataSync(): any {
  return siteProvider.getSiteDataSync?.();
}

export async function getSiteCatalogData(): Promise<SiteCatalogModule> {
  return siteProvider.getCatalogData();
}

export function getSiteCatalogDataSync(): SiteCatalogModule {
  const catalog = siteProvider.getCatalogDataSync?.();
  if (!catalog) {
    throw new Error("No catalog data could be resolved for the current site");
  }
  return catalog;
}

export async function getProducts() {
  return siteProvider.getProducts();
}

export async function getServices() {
  return siteProvider.getServices();
}

