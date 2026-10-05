import { siteConfig } from "./siteConfig";

const site = siteConfig;
const siteWhatsappBase = `https://wa.me/${site.contact.whatsapp}`;
const siteWhatsappQuoteMessage =
  "Hola, me gustaria solicitar una cotizacion para un Arreglo de Flores. Me pueden apoyar con opciones y precios?";
const siteWhatsappDeliveryMessage =
  "Hola, quiero informacion sobre arreglos de flores personalizados y entregas. Me pueden apoyar?";

export const siteData = {
  // ─── TEMA ────────────────────────────────────────────────────────────────────
  // Paleta de colores global del sitio. Se usan como variables CSS en globals.css.
  theme: {
    colors: {
      primary: site.branding.primaryColor,
      primaryHover: site.branding.primaryColor,
      primarySoft: site.branding.accentColor,
      primarySoftHover: site.branding.accentColor,
      primaryBorder: site.branding.accentColor,
      primaryText: site.branding.primaryColor,
      accentGreen: "#22c55e",
      accentGreenHover: "#16a34a",
      accentGreenShadow: "rgba(21, 128, 61, 0.25)",
      textDark: site.branding.secondaryColor,
      textMuted: "#64748b",
      textLight: "#ffffff",
      pageBackground: "#f8fafc",
      panelBackground: "#ffffff",
      footerFrom: site.branding.secondaryColor,
      footerTo: site.branding.secondaryColor,
      scrollbarThumb: site.branding.primaryColor,
      scrollbarTrack: site.branding.accentColor,
      scrollbarSize: "14px",
    },
  },
  // ─── MARCA ────────────────────────────────────────────────────────────────────
  // Datos de identidad del negocio: nombre, tipo, logo.
  brand: {
    businessType: site.businessType,
    businessName: site.businessName,
    sectionLabel: "Catálogo",
    logoSrc: site.logo.desktop,
    logoFallbackSrc: site.logo.fallback,
  },
  // ─── ASSETS ───────────────────────────────────────────────────────────────────
  // Rutas a íconos e imágenes globales reutilizables.
  assets: {
    whatsappIconSrc: "/images/shared/whatsapp.png",
  },
  // ─── SEO ─────────────────────────────────────────────────────────────────────
  // Metadatos para motores de búsqueda: título de la pestaña, descripción y palabras clave.
  seo: {
  title: `Arreglos Florales Exclusivos | ${site.businessName} `,
  description:
    "Flores personalizadas, arreglos florales VIP, cajas sorpresa, peluches y regalos para cumpleaños, aniversarios y Flores para Novia. Entregas en San Mateo Atenco, Metepec, Lerma, Toluca y alrededores. Realiza tu pedido por WhatsApp.",
  
  canonical: "https://cielitodefloresvip.vercel.app",
  robots: {
    index: true,
    follow: true
  },
    keywords: [

    // Marca
    "Cielito de Flores",
    "Cielito de Flores en San Mateo Atenco",

    // Principal
    "globos personalizados",
    "globos personalizados san mateo atenco",
    "globos personalizados metepec",
    "globos personalizados toluca",
    "globos personalizados lerma",

    // Globo burbuja
    "globos burbuja",
    "globos burbuja personalizados",
    "globos burbuja san mateo atenco",
    "globos burbuja metepec",
    "globos burbuja toluca",

    // Regalos
    "regalos personalizados",
    "regalos con globos",
    "arreglos con globos",
    "arreglos para graduacion",
    "arreglos cumpleaños",
    "arreglos con dulces",
    "arreglos con peluches",

    // Eventos
    "globos para cumpleaños",
    "globos para graduación",
    "globos para aniversario",
    "globos para baby shower",
    "globos para xv años",
    "globos para san valentin",
    "globos para dia de las madres",

    // Decoración
    "decoracion con globos",
    "decoracion de eventos",
    "decoracion para fiestas",

    // Local SEO
    "globos en san mateo atenco",
    "globos en metepec",
    "globos en toluca",
    "globos en lerma",
    "globos cerca de mi",
    "tienda de globos",
    "tienda de globos san mateo atenco",
    "tienda de regalos san mateo atenco",

    // Conversión
    "pedir globos por whatsapp",
    "globos personalizados whatsapp",
    "envio de globos",
    "entrega de globos a domicilio",
    "globos a domicilio",
    "regalos a domicilio",

    // Marca
    "cielitodeflores"
  ]
},
  // ─── ENLACES ──────────────────────────────────────────────────────────────────
  // URLs de contacto, redes sociales y WhatsApp con mensajes predefinidos.
  links: {
    whatsappCatalogBase: siteWhatsappBase,
    publicSiteBaseUrl: site.publicSiteUrl,
    whatsappQuote: `${siteWhatsappBase}?text=${encodeURIComponent(siteWhatsappQuoteMessage)}`,
    whatsappDeliveryContact: `${siteWhatsappBase}?text=${encodeURIComponent(siteWhatsappDeliveryMessage)}`,
    whatsappContactMessage:
      "Hola, quiero información sobre arreglos de flores y regalos. ¿Me pueden apoyar?",
    maps: site.contact.maps,
    facebook: site.social.facebook,
    instagram: site.social.instagram,
    developer: "https://juancarloszepeda.com",
  },
  // ─── RUTAS ───────────────────────────────────────────────────────────────────
  // Rutas de navegación interna del sitio. Cambiar aquí si se renombran las páginas.
  routes: {
    defaultPath: "/",
    catalogPath: "/catalogo",
    servicesPath: "/servicios",
    ordersPath: "/pedidos",
    contactPath: "/contacto",
    policiesPath: "/politicas",
  },
  // ─── BOTÓN DE FLECHA DEL CARRUSEL ────────────────────────────────────────────
  // Estilos visuales de los botones anterior/siguiente usados en todos los carruseles.
  carouselArrowButton: {
    size: "56px",
    mobileSize: "48px",
    iconSize: "30px",
    mobileIconSize: "24px",
    borderWidth: "1px",
    borderRadius: "9999px",
    background: "#ffffff",
    hoverBackground: "var(--color-primary-soft)",
    iconColor: "#0f172a",
    hoverIconColor: "var(--color-primary)",
    borderColor: "rgba(15, 23, 42, 0.08)",
    hoverBorderColor: "var(--color-primary-border)",
    shadow: "0 16px 28px rgba(15, 23, 42, 0.16)",
    hoverShadow: "0 18px 34px color-mix(in srgb, var(--color-primary) 24%, transparent)",
    transition: "all 200ms ease",
  },
  // ─── BÚSQUEDA ─────────────────────────────────────────────────────────────────
  // Configuración del motor de búsqueda: qué se muestra, comportamiento y sinónimos.
  search: {
    enabled: true, // true = búsqueda activa en todo el sitio
    web: {
      enabled: true, // Activa la búsqueda en escritorio
      showHeaderMenuInput: true, // Muestra input de búsqueda en el menú del header (escritorio)
      showCatalogInput: true, // Muestra input de búsqueda dentro del catálogo (escritorio)
    },
    mobile: {
      enabled: true, // Activa la búsqueda en móvil en el menu de categorias
      showCatalogInput: true, // Muestra input de búsqueda dentro del catálogo (móvil)
      drawerAutocompleteEnabled: true, // Activa el autocompletado en el drawer de navegación móvil
    },
    catalog: {
      defaultScope: "context", // "context" = busca en la categoría activa | "global" = busca en todo el catálogo
      allowScopeToggle: true, // Muestra botón para cambiar el alcance de búsqueda (contexto vs. global)
      preserveLastQuery: true, // Recuerda la última búsqueda al cambiar de categoría
    },
    behavior: {
      minChars: 2, // Número mínimo de caracteres para activar la búsqueda
      debounceMs: 120, // Espera (ms) antes de ejecutar la búsqueda al escribir
    },
    suggestions: {
      enabled: true, // Muestra sugerencias en tiempo real mientras el usuario escribe
      maxItems: 6, // Número máximo de sugerencias a mostrar
      showProducts: true, // Incluye productos individuales en las sugerencias
      showSubcategories: true, // Incluye subcategorías en las sugerencias
      showCategories: true, // Incluye categorías principales en las sugerencias
    },
    synonyms: [
      { terms: ["buchon", "buchón", "gran ramo"], maps: ["100 rosas", "grande"] },
      { terms: ["mama", "mamá", "madre", "madres"], maps: ["día de las madres", "bouquet"] },
      { terms: ["novio", "novia", "amor", "enamorado"], maps: ["declaraciones y noviazgo", "san valentín"] },
      { terms: ["funeral", "difunto", "luto", "pesame"], maps: ["condolencias", "flores blancas", "coronas"] },
      { terms: ["boda", "matrimonio", "casamiento"], maps: ["bodas", "centros de mesa"] },
      { terms: ["quince", "xv", "quinceañera"], maps: ["xv años"] },
      { terms: ["graduacion", "graduación", "egresado"], maps: ["graduaciones"] },
      { terms: ["cumple", "cumpleaños", "felicidades"], maps: ["cumpleaños"] },
      { terms: ["globo", "globos"], maps: ["globos de helio", "globos de aire"] },
      { terms: ["girasol"], maps: ["girasoles"] },
      { terms: ["lirio"], maps: ["lirios"] },
      { terms: ["sorpresa", "regalo"], maps: ["ramos con peluche", "ramos con dulces"] },
    ],
  },
  // ─── ETIQUETAS CTA GLOBALES ──────────────────────────────────────────────────
  // Textos reutilizables para los botones de llamada a la acción.
  cta: {
    quoteLabel: "Solicitar Cotización",
    viewCatalogLabel: "Ver catálogo",
    requestInfoLabel: "Pedir información",
  },
  // ─── BOTONES ──────────────────────────────────────────────────────────────────
  // Configuración individual de cada botón del sitio: etiqueta, visibilidad y estilos.
  buttons: {
    catalog: {
      enabled: true, // Muestra el botón "Ver catálogo" en las secciones correspondientes
      label: "Ver catálogo",
      ariaLabel: "Ir al catálogo",
      variants: {
        hero: {
          className: "min-w-[220px] rounded-xl border px-6 py-3 text-sm font-bold",
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-text) 100%)",
          hoverBackground: "linear-gradient(135deg, var(--color-primary-hover) 0%, var(--color-primary-text) 100%)",
          borderColor: "rgba(255, 255, 255, 0.28)",
          textColor: "#ffffff",
          shadow: "0 16px 34px color-mix(in srgb, var(--color-primary) 36%, transparent)",
          hoverShadow: "0 18px 38px color-mix(in srgb, var(--color-primary-hover) 42%, transparent)",
        },
        stacked: {
          className: "h-12 w-full rounded-2xl px-5 text-sm font-extrabold",
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-text) 100%)",
          hoverBackground: "linear-gradient(135deg, var(--color-primary-hover) 0%, var(--color-primary-text) 100%)",
          borderColor: "transparent",
          textColor: "#ffffff",
          shadow: "0 12px 30px color-mix(in srgb, var(--color-primary) 35%, transparent)",
          hoverShadow: "0 16px 36px color-mix(in srgb, var(--color-primary-hover) 40%, transparent)",
        },
      },
    },
    services: {
      enabled: false, // Muestra el botón "Ver servicios"
      label: "Ver servicios",
      ariaLabel: "Ir a servicios",
      variants: {
        hero: {
          className: "min-w-[220px] rounded-xl border px-6 py-3 text-sm font-bold",
          background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
          hoverBackground: "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
          borderColor: "rgba(255, 255, 255, 0.25)",
          textColor: "#ffffff",
          shadow: "0 16px 34px rgba(15, 23, 42, 0.34)",
          hoverShadow: "0 18px 38px rgba(15, 23, 42, 0.4)",
        },
        stacked: {
          className: "h-12 w-full rounded-2xl border px-5 text-sm font-extrabold",
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          hoverBackground: "linear-gradient(135deg, #334155 0%, #475569 100%)",
          borderColor: "rgba(255, 255, 255, 0.1)",
          textColor: "#ffffff",
          shadow: "0 12px 24px rgba(15, 23, 42, 0.24)",
          hoverShadow: "0 16px 30px rgba(15, 23, 42, 0.32)",
        },
      },
    },
    quote: {
      enabled: true, // Muestra el botón de cotización por WhatsApp
      label: "Solicitar Cotización",
      ariaLabel: "Solicitar cotización por WhatsApp",
      variants: {
        main: {
          className: "rounded-full px-3 py-1.5 text-xs font-semibold sm:px-5 sm:py-2.5 sm:text-sm",
          background: "var(--color-accent-green)",
          hoverBackground: "var(--color-accent-green-hover)",
          borderColor: "transparent",
          textColor: "#ffffff",
          shadow: "0 10px 24px rgba(21, 128, 61, 0.25)",
          hoverShadow: "0 12px 28px rgba(21, 128, 61, 0.32)",
        },
        compact: {
          className: "h-9 shrink-0 rounded-full px-3.5 text-[10px] font-semibold",
          background: "var(--color-accent-green)",
          hoverBackground: "var(--color-accent-green-hover)",
          borderColor: "transparent",
          textColor: "#ffffff",
          shadow: "0 10px 22px rgba(21, 128, 61, 0.2)",
          hoverShadow: "0 12px 26px rgba(21, 128, 61, 0.28)",
        },
      },
    },
    requestInfo: {
      enabled: true, // Muestra el botón "Pedir información" en cada tarjeta del catálogo
      label: "Pedir información",
      ariaLabelPrefix: "Solicitar información de",
      messageIntro: "Hola, me interesa este arreglo del catálogo:",
      variants: {
        card: {
          className: "h-10 w-full rounded-full whitespace-nowrap px-2.5 text-[11px] font-semibold sm:px-4 sm:text-[12px]",
          background: "var(--color-accent-green)",
          hoverBackground: "var(--color-accent-green-hover)",
          borderColor: "transparent",
          textColor: "#ffffff",
          shadow: "0 6px 14px rgba(29, 200, 90, 0.35)",
          hoverShadow: "0 10px 20px rgba(29, 200, 90, 0.42)",
        },
      },
    },
    scrollTop: {
      enabled: true, // Muestra el botón flotante para regresar al inicio de la página
      ariaLabel: "Ir hacia arriba",
      showAfterPx: 200,
      size: "44px",
      iconSize: "20px",
      right: "24px",
      bottom: "24px",
      zIndex: 50,
      background: "var(--color-primary)",
      hoverBackground: "var(--color-primary-hover)",
      iconColor: "#ffffff",
      hoverIconColor: "#ffffff",
      borderColor: "var(--color-primary-border)",
      hoverBorderColor: "var(--color-primary-text)",
      shadow: "0 14px 28px color-mix(in srgb, var(--color-primary) 30%, transparent)",
      hoverShadow: "0 16px 32px color-mix(in srgb, var(--color-primary-hover) 40%, transparent)",
    },
  },
  // ─── ENCABEZADO (HEADER) ────────────────────────────────────────────────────
  // Configuración del header: navegación, menú escritorio y drawer móvil.
  header: {
    nav: {
      menuEnabled: true, // Activa la barra de navegación principal (links de Catálogo y Servicios)
      showDesktopMegaMenu: true, // Muestra el megamenú desplegable de categorías en escritorio
      showServicesTab: false, // Muestra la pestaña "Servicios" en la navegación
      catalogLabel: "Catálogo",
      servicesLabel: "Servicios",
      viewAllLabel: "Ver todo",
    },
    ui: {
      shell: {
        background: "rgba(255,255,255,0.95)",
        borderBottomColor: "rgba(255,255,255,0.2)",
        shadow: "0 1px 2px rgba(15,23,42,0.08)",
      },
      branding: {
        webLogoSize: "56px",
        webLogoRadius: "16px",
        mobileLogoSize: "36px",
        mobileLogoRadius: "11px",
        // Fondo alternativo oscuro para el contenedor del logo:
        // logoBackground: "#020617",
        logoBackground: "#ffffff",
      },
      tabs: {
        inactiveTextColor: "#475569",
        activeTextColor: "#0f172a",
        hoverTextColor: "#0f172a",
        activeIndicatorColor: "var(--color-primary)",
      },
      mobileHeader: {
        background: "#ffffff",
        topBorderColor: "rgba(15,23,42,0.08)",
      },
      drawer: {
        overlayBackground: "rgba(0,0,0,0.35)",
        panelBackground: "#ffffff",
        panelShadow: "0 24px 40px rgba(0,0,0,0.24)",
        panelWidth: "84vw",
        panelMaxWidth: "320px",
        closeButtonBackground: "var(--color-primary)",
        closeButtonHoverBackground: "var(--color-primary-hover)",
        closeButtonTextColor: "#ffffff",
      },
    },
    desktopCatalogMenu: {
      reservedLeftSpace: "0px",
      minPanelHeight: "164px",
      topOffset: "80px",
      containerPaddingX: "24px",
      pillsGapClassName: "gap-2",
      contentColumnsClassName: "grid-cols-3",
      subcategoryGrid: {
        columns: 3,
        rowsPerColumn: 3,
        columnGapClassName: "gap-x-0",
        rowGapClassName: "gap-y-3",
        maxWidth: "600px",
        columnMinWidth: "160px",
        dividerColor: "color-mix(in srgb, var(--color-primary-soft) 60%, white)",
        dividerPaddingLeft: "20px",
      },
      activeGroupIconLabel: "Activa",
      search: {
        placeholder: "Buscar",
        buttonAriaLabel: "Buscar en menú de catálogo",
        width: "312px",
      },
      panel: {
        width: "100%",
        height: "176px",
        radiusBottom: "18px",
        background: "rgba(255, 255, 255, 0.98)",
        borderColor: "rgba(15, 23, 42, 0.08)",
        shadow: "none",
      },
      groupPill: {
        inactiveBackground: "#ffffff",
        inactiveBorderColor: "#cbd5e1",
        inactiveTextColor: "#334155",
        activeBackground: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)",
        activeBorderColor: "color-mix(in srgb, var(--color-primary) 20%, transparent)",
        activeTextColor: "#ffffff",
        activeShadow: "0 12px 24px color-mix(in srgb, var(--color-primary) 24%, transparent)",
      },
      itemLink: {
        textColor: "#475569",
        hoverTextColor: "var(--color-primary)",
      },
      progressBar: {
        trackColor: "var(--color-primary-soft)",
        fillColor: "var(--color-primary)",
        width: "100%",
        maxWidth: "none",
        height: "8px",
        showWhenOverflowExceedsPx: 1,
      },
    },
    mobileDrawer: {
      overlayCloseAria: "Cerrar superposición",
      menuCloseAria: "Cerrar menú",
      searchPlaceholder: "Buscar...",
      autocompleteTitle: "Autocompletado",
      routePrefix: "Ruta",
      selectLabel: "Seleccionar",
      clearLabel: "Limpiar",
      noMatchesLabel: "Sin coincidencias. Prueba con al menos 3 letras.",
      allCategoriesLabel: "Todas las categorías",
    },
  },
  // ─── UI DEL CATÁLOGO ──────────────────────────────────────────────────────────
  // Opciones visuales y de comportamiento de la página del catálogo.
  catalogUi: {
    categoriesLabel: "",
    searchPlaceholder: "Buscar",
    openCategoriesAria: "Abrir categorías",
    showMobileCategoriesButton: true, // true = muestra botón "Categorías" flotante en móvil
    showPriceOnCards: true, // true = muestra el precio en las tarjetas de productos
    fixedMobileIndicatorLabelWhenMenuOff: "Catálogo",
    desktopMenuBottomSpacerHeight: "150px",
    // Controla qué elementos se muestran en las tarjetas cuando se filtra "Día de las Madres"
    mothersDayCard: {
      showBadge: true,        // Oculta el badge (Nuevo, Más vendido, etc.) sobre la imagen
      showSkuOverlay: true,   // Oculta el overlay con el SKU en la esquina de la imagen
      showDeliveryDate: true, // Oculta el mensaje de fecha de entrega
      showColorDots: true,    // Oculta los puntos de color disponibles
      showSizeOptions: true,  // Oculta los botones de opciones de tamaño (12, 24, 50 rosas...)
    },
  },
  // ─── HERO (BANNER PRINCIPAL) ────────────────────────────────────────────────
  // Carrusel de portada con imágenes de fondo, texto y botones CTA.
  hero: {
    enabled: true, // true = muestra el banner principal en la página
    badgeLabel: "Florería", // Texto del badge que aparece sobre la imagen
    title: site.businessName,
    subtitle: site.hero.subtitle,
    shippingText: site.hero.shippingText,
    backgroundAlt: "Fondo principal",
    behavior: {
      autoplayEnabled: true, // true = el carrusel avanza automáticamente
      autoplayMs: 4000, // Tiempo en milisegundos entre cada cambio de imagen
      showArrowsOnMobile: true, // true = oculta las flechas de navegación en móvil
    },
    ui: {
      minHeight: "78vh",
      overlayBackground: "rgba(15, 23, 42, 0.55)",
      contentMaxWidth: "80rem",
      contentPaddingX: "16px",
      contentPaddingXDesktop: "24px",
      textBlockMaxWidth: "64rem",
      badgeEnabled: true,
      badgeBorderColor: "rgba(255, 255, 255, 0.45)",
      badgeBackground: "rgba(255, 255, 255, 0.15)",
      badgeTextColor: "rgba(255, 255, 255, 0.95)",
      titleEnabled: true,
      subtitleEnabled: true,
      shippingEnabled: true,
      shippingTextColor: "rgba(255, 255, 255, 0.9)",
      showCatalogButton: true,
      showServicesButton: true,
      arrowsEnabled: true,
      arrowsOffsetX: "24px",
      arrowsZIndex: 30,
      arrowsPointerEvents: "auto",
    },
    controls: {
      previousAriaLabel: "Anterior",
      nextAriaLabel: "Siguiente",
      previousSymbol: "‹",
      nextSymbol: "›",
    },
    ctaButtons: {
      catalog: {
        label: "Ver catálogo",
        href: "/catalogo",
      },
      services: {
        label: "Ver servicios",
        href: "/servicios",
      },
    },
    ctaStyles: {
      catalog: {
        background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)",
        borderColor: "rgba(255, 255, 255, 0.28)",
        textColor: "#ffffff",
        shadow: "0 16px 34px color-mix(in srgb, var(--color-primary) 36%, transparent)",
      },
      services: {
        background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
        borderColor: "rgba(255, 255, 255, 0.25)",
        textColor: "#ffffff",
        shadow: "0 16px 34px rgba(15, 23, 42, 0.34)",
      },
    },
    backgroundImages: site.hero.backgroundImages,
  },
  // ─── MODAL HERO (MODAL PROMOCIONAL) ────────────────────────────────────────
  // Modal que aparece automáticamente al cargar la página con el carrusel de portada.
  heroModal: {
    enabled: true, // true = activa el modal promocional al entrar al sitio
    featureFlagEnabled: true, // Bandera principal para activar o desactivar este modal.
    TESTHEROCAROUSELMODAL: false, // true = fuerza apertura en cada carga (solo pruebas). false = comportamiento normal por sesión.
    showOnPageLoad: true, // true = abre el modal automáticamente al cargar la página
    rememberOnlyPerSession: true, // true = usa sessionStorage; true = usa localStorage
    closeOnBackdrop: true, // true = cerrar el modal al hacer clic fuera del panel
    closeOnEscape: true, // true = cerrar el modal al presionar la tecla Escape
    ariaLabel: "Promocion principal",
    closeButtonAriaLabel: "Cerrar modal",
    ui: {
      overlayBackground: "rgba(15, 23, 42, 0.72)",
      panelMaxWidth: "1100px",
      panelMinHeight: "70vh",
      panelBorderColor: "rgba(255, 255, 255, 0.22)",
      panelShadow: "0 40px 120px rgba(15, 23, 42, 0.58)",
      closeButtonBackground: "rgba(15, 23, 42, 0.82)",
      closeButtonHoverBackground: "rgba(30, 41, 59, 0.92)",
      closeButtonTextColor: "#ffffff",
      closeButtonBorderColor: "rgba(255, 255, 255, 0.45)",
    },
  },
  // ─── SECCIÓN COMPROMISOS ────────────────────────────────────────────────────
  // Sección con tarjetas de valores, métodos de pago, imagen de la tienda y contacto.
  commitments: {
    enabled: true, // true = muestra la sección de compromisos
    title: "Nuestros Compromisos",
    contactBanner: {
      title: "🎈 Chuloglobo es una tienda 100% online", 
      subtitle: "Compra con confianza te enviamos tu pedido a domicilio, pero si lo prefieres, recoge tu pedido en nuestro punto de entrega en San Mateo Atenco"
    },

    ui: {
      sectionBackground: "#f3f4f6",
      sectionPaddingY: "48px",
      sectionPaddingYDesktop: "64px",
      contentMaxWidth: "80rem",
      contentPaddingX: "16px",
      contentGap: "32px",
      titleFontSize: "30px",
      titleFontWeight: "700",
      titleColor: "#0f172a",
      cardsEnabled: true,
      cardBackground: "#f3f5f7",
      cardBorderColor: "#cbd5e1",
      cardBorderRadius: "16px",
      cardPadding: "20px",
      cardShadow: "0 1px 3px rgba(15,23,42,0.1)",
      badgeBackground: "var(--color-primary)",
      badgeTextColor: "#ffffff",
      badgeFontSize: "14px",
      badgeFontWeight: "700",
      iconContainerBackground: "#ffffff",
      iconContainerBorderColor: "#f1d2df",
      iconContainerRadius: "12px",
      iconColor: "var(--color-primary)",
      iconSize: "36px",
      titleCardFontSize: "20px",
      titleCardFontWeight: "700",
      titleCardColor: "#1e293b",
      descriptionColor: "#475569",
      descriptionFontSize: "14px",
      descriptionLineHeight: "1.75rem",
      paymentMethodsEnabled: true,
      paymentMethodsTitle: "Métodos de pago",
      paymentMethodsBorderColor: "#cbd5e1",
      paymentMethodsBackground: "#ffffff",
      paymentMethodsPadding: "20px",
      paymentMethodsRadius: "16px",
      paymentMethodsShadow: "0 1px 3px rgba(15,23,42,0.1)",
      storeImageEnabled: true,
      storeImageBorderColor: "#cbd5e1",
      storeImageRadius: "16px",
      storeImageShadow: "0 4px 6px rgba(15,23,42,0.1)",
      storeImageMinHeightMobile: "260px",
      storeImageMinHeightDesktop: "520px",
      contactBoxEnabled: true,
      contactBoxBackground: "#ffffff",
      contactBoxBorderColor: "#cbd5e1",
      contactBoxRadius: "16px",
      contactBoxPadding: "20px",
      contactBoxShadow: "0 1px 3px rgba(15,23,42,0.1)",
      contactBoxMarginTop: "16px",
      iconButtonBackground: "rgba(236,72,153,0.1)",
      iconButtonHoverBackground: "rgba(236,72,153,0.15)",
      iconButtonColor: "var(--color-primary)",
      iconButtonSize: "44px",
      iconButtonRadius: "9999px",
      contactIconGap: "12px",
      contactTextColor: "#1e293b",
      contactTextFontSize: "14px",
      contactTextLineHeight: "1.75rem",
      contactItemMarginTop: "16px",
      socialTextFontSize: "14px",
      socialTextColor: "#475569",
    },
    cards: [
      {
        enabled: true,
        num: 1,
        icon: "flower",
        title: "Diseños Personalizados",
        description:
          "Creamos regalos y arreglos con globos personalizados para hacer especial cada una de tus celebraciones.",
      },
      {
        enabled: true,
        num: 2,
        icon: "delivery",
        title: "Entrega Puntual",
        description:
          "Entregamos tus pedidos a tiempo para que tu sorpresa llegue justo en el momento perfecto.",
      },
      {
        enabled: true,
        num: 3,
        icon: "attention",
        title: "Experiencias Memorables",
        description:
          "Nos enfocamos en crear momentos especiales que se conviertan en recuerdos inolvidables.",
      },
    ],
    paymentLogos: [
      { enabled: true, src: `${site.payments.imageBasePath}/visa.svg`, alt: "Visa", className: "h-6 w-auto object-contain" },
      { enabled: true, src: `${site.payments.imageBasePath}/mastercard.svg`, alt: "Mastercard", className: "h-6 w-auto object-contain" },
      { enabled: true, src: `${site.payments.imageBasePath}/amex.svg`, alt: "American Express", className: "h-6 w-auto object-contain" },
      { enabled: true, src: `${site.payments.imageBasePath}/oxxo.svg`, alt: "OXXO", className: "h-6 w-auto object-contain" },
    ],
    // Tarjeta con logos visuales de métodos de pago (Visa, Mastercard, etc.)
    paymentMethodsCard: {
      enabled: false, // true = muestra la tarjeta con logos de métodos de pago
      title: "Métodos de pago",
    },
    // Tarjeta con lista de métodos de pago en texto (Efectivo, Transferencias, etc.)
    paymentOptionsCard: {
      enabled: true, // true = muestra la tarjeta con lista de métodos de pago
      title: "Métodos de pago",
      items: [
        { enabled: true, label: "Efectivo", icon: "cash" },
        { enabled: true, label: "Depósitos", icon: "deposit" },
        { enabled: true, label: "Transferencias", icon: "transfer" },
      ],
    },
    storeImage: {
      enabled: true,
      src: site.services.storeImageSrc,
      alt: site.businessName,
    },
    address: {
      enabled: true,
      text: site.contact.address,
      ariaLabel: "Ubicación en Google Maps",
    },
    phone: {
      enabled: true,
      display: site.contact.phoneDisplay,
      ariaLabel: "WhatsApp",
    },
    social: {
      enabled: true,
      text: "Síguenos en redes sociales",
    },
  },
  // ─── SECCIÓN SERVICIOS ──────────────────────────────────────────────────────
  // Carrusel de tarjetas con los tipos de servicios que ofrece la florería.
  services: {
    enabled: true, // true = muestra la sección de servicios
    title: "Nuestros Servicios",
    ui: {
      sectionBackground: "#f9fafb",
      sectionPaddingY: "64px",
      contentMaxWidth: "80rem",
      contentPaddingX: "16px",
      controlsEnabled: true,
      controlsOffsetX: "24px",
    },
    carouselControls: {
      previousEnabled: true,
      nextEnabled: true,
      previousAriaLabel: "Servicio anterior",
      nextAriaLabel: "Servicio siguiente",
      previousSymbol: "‹",
      nextSymbol: "›",
    },
    carouselIndicators: {
      activeColor: "var(--color-primary)",
      inactiveColor: "rgba(255, 255, 255, 0.45)",
      activeScale: "1.1",
    },
    cta: {
      label: "Ver catálogo",
      href: "/catalogo",
      ariaLabel: "Ir al catálogo",
    },
    cards: [
      {
        title: "Arreglos florales",
        images: [
          `${site.services.imageBasePath}/Servicio_1_Ramos.jpg`,
          `${site.services.imageBasePath}/Servicio_1_Bouquets.jpg`,
          `${site.services.imageBasePath}/Servicio_1_Cajasflorales.jpg`,
          `${site.services.imageBasePath}/Servicio_1_Floreros.jpg`,
        ],
        items: ["Ramos", "Bouquets", "Cajas florales", "Floreros"],
      },
      {
        title: "Decoración de eventos",
        images: [
          `${site.services.imageBasePath}/Servicio_2_Bodas.jpg`,
          `${site.services.imageBasePath}/Servicio_2_XVanos.jpg`,
          `${site.services.imageBasePath}/Servicio_2_Centrosdemesa.jpg`,
          `${site.services.imageBasePath}/Servicio_2_Carros.jpg`,
        ],
        items: ["Bodas", "XV años", "Centros de mesa", "Carros"],
      },
      {
        title: "Regalos complementarios",
        images: [
          `${site.services.imageBasePath}/Servicio_3_Globos.jpg`,
          `${site.services.imageBasePath}/Servicio_3_Chocolates.jpg`,
          `${site.services.imageBasePath}/Servicio_3_Peluches.jpg`,
          `${site.services.imageBasePath}/Servicio_3_Vinos.jpg`,
        ],
        items: ["Globos", "Chocolates", "Peluches", "Vinos (según regulación)"],
      },
      {
        title: "Fechas especiales",
        images: [
          `${site.services.imageBasePath}/Servicio_4_Aniversarios.jpg`,
          `${site.services.imageBasePath}/Servicio_4_Cumpleanos.jpg`,
          `${site.services.imageBasePath}/Servicio_4_Diadelasmadres.jpg`,
          `${site.services.imageBasePath}/Servicio_4_SanValentin.jpg`,
        ],
        items: ["Aniversarios", "Cumpleaños", "Día de las madres", "San Valentín"],
      },
      {
        title: "Arreglos funerarios",
        images: [
          `${site.services.imageBasePath}/Servicio_5_Coronas.jpg`,
          `${site.services.imageBasePath}/Servicio_5_Cruces.jpg`,
          `${site.services.imageBasePath}/Servicio_5_Floresblancas.jpg`,
          `${site.services.imageBasePath}/Servicio_5_Entregaurgente.jpg`,
        ],
        items: ["Coronas", "Cruces", "Flores blancas", "Entrega urgente"],
      },
      {
        title: "Personalización",
        images: [
          `${site.services.imageBasePath}/Servicio_6_Coloresespecificos.jpg`,
          `${site.services.imageBasePath}/Servicio_6_Tipodeflor.jpg`,
          `${site.services.imageBasePath}/Servicio_6_Tamano.jpg`,
          `${site.services.imageBasePath}/Servicio_6_Tarjetaconmensaje.jpg`,
          `${site.services.imageBasePath}/Servicio_6_Empaqueespecial.jpg`,
        ],
        items: [
          "Colores específicos",
          "Tipo de flor",
          "Tamaño",
          "Tarjeta con mensaje",
          "Empaque especial",
        ],
      },
      {
        title: "Eventos Religiosos",
        images: [
          `${site.services.imageBasePath}/Servicio_7_Arreglofloralparaaltar.jpg`,
          `${site.services.imageBasePath}/Servicio_7_VirgendeGuadalupe.jpg`,
          `${site.services.imageBasePath}/Servicio_7_Altaresycapillas.jpg`,
          `${site.services.imageBasePath}/Servicio_7_Arcosparaimagenes.jpg`,
        ],
        items: [
          "Arreglo floral para altar",
          "Virgen de Guadalupe",
          "Altares y capillas",
          "Arcos para imágenes",
        ],
      },
    ],
  },
  // ─── PIE DE PÁGINA (FOOTER) ─────────────────────────────────────────────────
  // Contenido del footer: secciones de marca, políticas, contacto y métodos de pago.
  footer: {
    enabled: true, // true = muestra el pie de página en todas las rutas
    ui: {
      marginTop: "48px",
      containerMaxWidth: "72rem",
      containerPaddingX: "16px",
      containerPaddingY: "32px",
      gridGap: "32px",
      titleColor: "var(--color-primary)",
      mutedTextColor: "rgba(255,255,255,0.7)",
      itemTextColor: "rgba(255,255,255,0.8)",
      itemHoverTextColor: "var(--color-primary-border)",
      borderTopColor: "color-mix(in srgb, var(--color-primary) 22%, transparent)",
      socialIconSize: "44px",
      socialIconGlyphSize: 20,
      socialIconBorderColor: "rgba(255,255,255,0.1)",
      socialIconBackground: "rgba(255,255,255,0.08)",
      socialIconHoverBackground: "rgba(255,255,255,0.2)",
      socialIconColor: "var(--color-primary)",
      paymentIconSize: 16,
      paymentIconColor: "var(--color-primary)",
      sectionBodyMarginTop: "12px",
      bottomMarginTop: "24px",
      bottomPaddingTop: "16px",
      bottomTextColor: "rgba(255,255,255,0.6)",
      developerLinkFontSize: "14px",
      developerLinkHoverColor: "var(--color-primary-border)",
    },
    sections: {
      brand: {
        enabled: true,
        title: `Florería - ${site.businessName}`,
        description: site.slogan,
      },
      policies: {
        enabled: true,
        title: "Políticas",
        items: [
          {
            enabled: true,
            label: "Políticas de Compra",
            action: "openPoliciesModal",
          },
        ],
      },
      contact: {
        enabled: true,
        title: "Contáctanos",
        socialLinks: [
          {
            enabled: true,
            key: "maps",
            href: site.contact.maps,
            ariaLabel: "Ubicación",
          },
          {
            enabled: true,
            key: "whatsapp",
            href: `${siteWhatsappBase}?text=${encodeURIComponent(siteWhatsappDeliveryMessage)}`,
            ariaLabel: "WhatsApp de contacto cliente",
          },
          {
            enabled: true,
            key: "facebook",
            href: site.social.facebook,
            ariaLabel: "Facebook",
          },
          {
            enabled: true,
            key: "instagram",
            href: site.social.instagram,
            ariaLabel: "Instagram",
          },
          {
            enabled: false,
            key: "tiktok",
            href: site.social.tiktok,
            ariaLabel: "TikTok",
          },
        ],
      },
      payments: {
        enabled: true,
        title: "Métodos de Pago",
        items: [
          { enabled: true, icon: "cash", label: "Efectivo" },
          { enabled: true, icon: "bank", label: "Depósitos" },
          { enabled: true, icon: "card", label: "Transferencias" },
        ],
      },
    },
    bottom: {
      enabled: true,
      showDeveloperLink: true,
      copyrightPrefix: "Colección VIP",
      developerLabel: "Desarrollado por Juan Carlos Zepeda IA",
      developerContact: {
        enabled: true,
        whatsappBase: "https://wa.me/5217227914217",
        messageTemplate:
          "Hola vi el catálogo: {{businessName}} y estoy interesado en configurar el ",
      },
    },
  },
  // ─── PÁGINA 404 ───────────────────────────────────────────────────────────────
  // Contenido y acciones de la página de error «Ruta no encontrada».
  notFound: {
    codeLabel: "404",
    badgeLabel: "Ruta no encontrada",
    title: "Este globo se perdió en el camino",
    description:
      "La página que buscas no existe o cambió de dirección. Te llevamos de vuelta a una ruta activa.",
    image: {
      src: `${site.catalog.imageBasePath}/${site.catalog.imageFilePrefix ?? site.siteSlug}_442.jpg`,
      alt: "Globo perdido 404",
    },
    primaryAction: {
      label: "Ir al catálogo",
      href: "/catalogo",
    },
    secondaryAction: {
      label: "Ver servicios",
      href: "/servicios",
    },
  },
  // ─── MODAL DE POLÍTICAS ──────────────────────────────────────────────────────
  // Contenido del modal de políticas de compra accesible desde el footer.
  policies: {
    title: "Políticas de Compra",
    modalUi: {
      overlayBackground: "rgba(0,0,0,0.65)",
      panelMaxWidth: "48rem",
      panelMaxHeight: "90vh",
      panelBorderColor: "rgba(148, 163, 184, 0.28)",
      panelBackground: "var(--color-panel-bg)",
      panelShadow: "0 24px 70px rgba(15, 23, 42, 0.18)",
      glowTopLeft: "rgba(148, 163, 184, 0.12)",
      glowBottomRight: "rgba(148, 163, 184, 0.14)",
      iconBadgeBackground: "rgba(148, 163, 184, 0.14)",
      iconBadgeBorderColor: "rgba(148, 163, 184, 0.28)",
      iconBadgeColor: "#475569",
      subtitle: "Información Legal",
      subtitleColor: "#64748b",
      titleColor: "#0f172a",
      closeButtonBackground: "#f8fafc",
      closeButtonHoverBackground: "#e2e8f0",
      closeButtonBorderColor: "#cbd5e1",
      closeButtonColor: "#334155",
      closeButtonIconColor: "#334155",
      bodyTextColor: "#334155",
      bodyFontSize: "15px",
      bodyLineHeight: "2rem",
    },
    paragraphs: [
      "En Cielito de Flores VIP elaboramos cada arreglo floral con especial atención a los detalles. Los productos se preparan de acuerdo con las imágenes y características mostradas en nuestro catálogo.",

      "Los colores, flores y elementos decorativos están sujetos a disponibilidad. En algunos casos puede existir una ligera variación respecto a la imagen publicada, manteniendo siempre el estilo y calidad del arreglo.",

      "Para realizar un pedido, selecciona el arreglo de tu preferencia y presiona “Pedir información”. Te atenderemos por WhatsApp para confirmar disponibilidad, detalles del pedido y datos de entrega.",

      "Una vez confirmado tu pedido, te proporcionaremos los datos para realizar el pago. El pedido quedará confirmado al recibir el comprobante correspondiente.",

      "Contamos con entregas en San Mateo Atenco, Metepec, Lerma, Toluca y alrededores. El costo de envío puede variar dependiendo de la zona.",

      "En fechas de alta demanda, recomendamos realizar tu pedido con anticipación. Los horarios de entrega se coordinan previamente con cada cliente.",

      "Una vez confirmado el pedido, cualquier modificación estará sujeta a disponibilidad y al avance de elaboración del arreglo.",
],
    summaryParagraphs: [
      "Los arreglos se elaboran con atención a los detalles y pueden presentar ligeras variaciones por disponibilidad.",
      "Los pedidos se confirman por WhatsApp y quedan formalizados al recibir el comprobante de pago.",
      "El costo de entrega puede variar según la zona de San Mateo Atenco, Metepec, Lerma, Toluca y alrededores.",
      "En fechas de alta demanda, recomendamos anticipar el pedido y coordinar previamente el horario de entrega.",
    ],
  },
} as const;

