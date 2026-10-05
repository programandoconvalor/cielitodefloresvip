"use client";

import { createContext, useContext, useLayoutEffect, type ReactNode } from "react";
import type { SiteData } from "@/services/siteDataService";

const SiteDataContext = createContext<SiteData | null>(null);

export function SiteDataProvider({
  siteData,
  children,
}: {
  siteData: SiteData;
  children: ReactNode;
}) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const themeVars: Record<string, string> = {
      "--primary-color": siteData.siteBranding.primaryColor,
      "--secondary-color": siteData.siteBranding.secondaryColor,
      "--accent-color": siteData.siteBranding.accentColor,
      "--background-color": siteData.theme.colors.pageBackground,
      "--foreground-color": siteData.theme.colors.textDark,
      "--logo-background": siteData.siteBranding.backgroundLogo,
      "--color-primary": siteData.theme.colors.primary,
      "--color-primary-hover": siteData.theme.colors.primaryHover,
      "--color-primary-soft": siteData.theme.colors.primarySoft,
      "--color-primary-soft-hover": siteData.theme.colors.primarySoftHover,
      "--color-primary-border": siteData.theme.colors.primaryBorder,
      "--color-primary-text": siteData.theme.colors.primaryText,
      "--color-accent-green": siteData.theme.colors.accentGreen,
      "--color-accent-green-hover": siteData.theme.colors.accentGreenHover,
      "--color-accent-green-shadow": siteData.theme.colors.accentGreenShadow,
      "--color-text-dark": siteData.theme.colors.textDark,
      "--color-text-muted": siteData.theme.colors.textMuted,
      "--color-text-light": siteData.theme.colors.textLight,
      "--color-page-bg": siteData.theme.colors.pageBackground,
      "--color-panel-bg": siteData.theme.colors.panelBackground,
      "--color-footer-from": siteData.theme.colors.footerFrom,
      "--color-footer-to": siteData.theme.colors.footerTo,
      "--color-scrollbar-thumb": siteData.theme.colors.scrollbarThumb,
      "--color-scrollbar-track": siteData.theme.colors.scrollbarTrack,
      "--scrollbar-size": siteData.theme.colors.scrollbarSize,
    };

    for (const [name, value] of Object.entries(themeVars)) {
      root.style.setProperty(name, value);
      body.style.setProperty(name, value);
    }

    body.dataset.siteSlug = siteData.siteSlug;
  }, [siteData]);

  return (
    <SiteDataContext.Provider value={siteData}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const context = useContext(SiteDataContext);
  if (!context) {
    throw new Error("useSiteData must be used within SiteDataProvider");
  }
  return context;
}

