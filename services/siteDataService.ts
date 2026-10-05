import type { SiteConfig, SiteBundle } from "@/data/site/types";

export type SiteData = SiteBundle["siteData"] & {
  siteSlug: string;
  siteBranding: SiteConfig["branding"];
};

export function buildSiteData(siteConfig: SiteConfig, baseSiteData: SiteBundle["siteData"]): SiteData {
  const routes = {
    ...(baseSiteData as any).routes,
    defaultPath: "/",
    homePath: "/",
    catalogPath: "/catalogo",
    servicesPath: "/servicios",
    ordersPath: "/pedidos",
    contactPath: "/contacto",
    policiesPath: "/politicas",
  };

  return {
    ...baseSiteData,
    siteSlug: siteConfig.siteSlug,
    siteBranding: siteConfig.branding,
    routes,
  };
}

