import type { SiteConfig } from "@/data/site/types";

export const siteConfig: SiteConfig = {
  siteSlug: "cielitodeflores",
  businessName: "Cielito de Flores VIP",
  businessType: "Florería",
  slogan: "Diseños florales exclusivos para momentos inolvidables.",
  publicSiteUrl: "https://cielitodefloresvip.vercel.app",

  branding: {
  primaryColor: "#F7769B",
  secondaryColor: "#0f172ab8",
  accentColor: "#FCE7F3",
  backgroundLogo: "#FFFFFF",
},

  /*branding: {
  primaryColor: "#D98FE8", // #D9A7F7
  secondaryColor: "#0F172A",
  accentColor: "#8EC5FF",
  backgroundLogo: "#FFFFFF",
}*/

  contact: {
    whatsapp: "527225141995",
    email: "contacto@cielitofloresvip.com",
    maps: "https://maps.app.goo.gl/hxAiKa7BELqosF4g6",
    phoneDisplay: "7225141995",
    address:
      "Calle Morelos #144 Colonia Alvaro Obregón, CP 52105, San Mateo Atenco, Edo. Mex.",
  },

  social: {
    facebook: "https://www.facebook.com/floreriacielitodeflores",
    instagram: "https://www.instagram.com/cielito.de.flores/",
    tiktok: "",
  },

  logo: {
    basePath: "/images/tenants/cielitodeflores/logo",
    desktop: "/images/tenants/cielitodeflores/logo/logo_ORIGINAL.png",
    mobile: "/images/tenants/cielitodeflores/logo/logo_ORIGINAL.png",
    fallback: "/images/tenants/cielitodeflores/logo/logo_ORIGINAL.png",
  },

  catalog: {
    categories: [
      "Arreglos florales",
      "Fechas especiales",
      "Decoracion de eventos",
      "Arreglos funerarios",
    ],
    imageBasePath: "/images/tenants/cielitodeflores/catalog",
    imageFilePrefix: "cielitodeflores",
    source: "default-catalog",
  },

  services: {
    imageBasePath: "/images/tenants/cielitodeflores/services",
    storeImageSrc: "/images/tenants/cielitodeflores/services/Tienda.jpg",
  },

  payments: {
    imageBasePath: "/images/tenants/cielitodeflores/payments",
  },

  hero: {
    title: "Cielito de Flores VIP",
    subtitle: "Arreglos florales exclusivos para momentos inolvidables.",
    shippingText: "Envios en San Mateo Atenco, Metepec, Lerma, Toluca y alrededores.",
    backgroundImages: [
      "/images/tenants/cielitodeflores/services/Portada_fondo_1.jpg",
      "/images/tenants/cielitodeflores/services/Portada_fondo_2.jpg",
      "/images/tenants/cielitodeflores/services/Portada_fondo_3.jpg",
    ],
  },
};

export const DEFAULT_SITE_SLUG = siteConfig.siteSlug;
export const siteConfigs: Record<string, SiteConfig> = {
  [siteConfig.siteSlug]: siteConfig,
};
export const defaultSiteConfig = siteConfig;
