import { buildSiteData } from "@/services/siteDataService";
import { getSiteConfig, getSiteData } from "@/services/siteService";

export async function getCurrentSiteData() {
  const config = await getSiteConfig();
  const baseSiteData = await getSiteData();
  return buildSiteData(config, baseSiteData);
}

export async function getLayoutSiteData() {
  const config = await getSiteConfig();
  const baseSiteData = await getSiteData();
  const siteData = buildSiteData(config, baseSiteData);
  return { siteConfig: config, siteData };
}

