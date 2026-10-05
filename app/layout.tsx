import "../styles/globals.css";
import Header from "@/components/Header"
import Footer from "@/components/Footer";
import { Nunito_Sans } from "next/font/google";
import type { CSSProperties } from "react";
import { getLayoutSiteData } from "@/services/siteRuntime";
import { SiteDataProvider } from "@/providers/SiteDataProvider";
import { defaultSiteConfig } from "@/data/site/siteConfig";

const nunito = Nunito_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export async function generateMetadata() {
  const { siteData } = await getLayoutSiteData();

  return {
    metadataBase: new URL(defaultSiteConfig.publicSiteUrl),
    title: siteData.seo.title || `Catalogo Floreria | ${defaultSiteConfig.businessName}`,
    description: siteData.seo.description,
    keywords: siteData.seo.keywords,
    alternates: {
      canonical: defaultSiteConfig.publicSiteUrl,
    },
    openGraph: {
      title: siteData.seo.title || defaultSiteConfig.businessName,
      description: siteData.seo.description,
      url: defaultSiteConfig.publicSiteUrl,
      images: [siteData.hero.backgroundImages?.[0] || defaultSiteConfig.logo.desktop],
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { siteConfig, siteData } = await getLayoutSiteData();

  const themeVars = {
    "--primary-color": siteConfig.branding.primaryColor,
    "--secondary-color": siteConfig.branding.secondaryColor,
    "--accent-color": siteConfig.branding.accentColor,
    "--logo-background": siteConfig.branding.backgroundLogo,
    "--background-color": siteData.theme.colors.pageBackground,
    "--foreground-color": siteData.theme.colors.textDark,
    "--color-primary": siteConfig.branding.primaryColor,
    "--color-primary-hover": siteData.theme.colors.primaryHover,
    "--color-primary-soft": siteConfig.branding.accentColor,
    "--color-primary-soft-hover": siteData.theme.colors.primarySoftHover,
    "--color-primary-border": siteConfig.branding.accentColor,
    "--color-primary-text": siteData.theme.colors.primaryText,
    "--color-accent-green": siteData.theme.colors.accentGreen,
    "--color-accent-green-hover": siteData.theme.colors.accentGreenHover,
    "--color-accent-green-shadow": siteData.theme.colors.accentGreenShadow,
    "--color-text-dark": siteConfig.branding.secondaryColor,
    "--color-text-muted": siteData.theme.colors.textMuted,
    "--color-text-light": siteData.theme.colors.textLight,
    "--color-page-bg": siteData.theme.colors.pageBackground,
    "--color-panel-bg": siteData.theme.colors.panelBackground,
    "--color-footer-from": siteConfig.branding.secondaryColor,
    "--color-footer-to": siteConfig.branding.secondaryColor,
    "--color-scrollbar-thumb": siteConfig.branding.primaryColor,
    "--color-scrollbar-track": siteConfig.branding.accentColor,
    "--scrollbar-size": siteData.theme.colors.scrollbarSize,
  } as CSSProperties;

  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&display=swap" rel="stylesheet" />
      </head>
      <body
        style={themeVars}
        className={`${nunito.className} min-h-screen bg-[var(--color-page-bg)] pt-[106px] text-[var(--color-text-dark)] md:pt-20`}
      >
        <SiteDataProvider key={siteData.siteSlug} siteData={siteData}>
          <Header />
          {children}
          <Footer />
        </SiteDataProvider>
      </body>
    </html>
  );
}
