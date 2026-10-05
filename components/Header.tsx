"use client";

/**
 * Header Component
 *
 * Features:
 *  - Desktop Navigation (>= 640px): Sticky header with logo, horizontal menu, searchable mega-dropdown
 *  - Mobile Navigation (< 640px): Compact header with logo, quote button, drawer trigger
 *  - Search Functionality: Real-time category/subcategory autocomplete in mega-dropdown
 *  - Mobile Drawer: Collapsible side menu with search, category navigation, footer quote button
 *  - Hover States: All links and buttons highlight with primary color accents
 *  - Logo Branding: Dynamic logo sizing and border-radius from JSON config
 *  - 100% JSON-configurable: Colors, spacing, logo, menu items, drawer styles
 *
 * Responsive Layout:
 *  - Mobile (< 640px): Drawer-based navigation, simplified header with logo + buttons
 *  - Tablet/Desktop (>= 640px): Sticky mega-menu, full horizontal navigation with search
 *
 * Event System:
 *  - Listens to custom 'catalog-product-search-changed' event for search synchronization
 *  - Updates local state when catalog search changes
 *
 * Configuration Sources:
 *  - siteData.header: Navigation menu items, styling, drawer configuration
 *  - catalogData: Product categories and subcategories for mega-menu
 *
 * Dependencies: QuoteButton
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  BalloonIcon,
} from "lucide-react";
import { buildSiteCatalogData } from "@/services/catalogService";
import { useSiteData } from "@/context/SiteDataProvider";
import QuoteButton from "./QuoteButton";

export default function Header() {
  const siteData = useSiteData();
  const { catalogBranding, catalogCategories, catalogMenuTree, catalogProducts } = useMemo(
    () => buildSiteCatalogData(siteData),
    [siteData],
  );
  const desktopSubcategoryStorageKey = "catalog-desktop-subcategory";
  const catalogMenuSelectionStorageKey = "catalog-selected-menu-filter";
  const catalogSearchInputStorageKey = "catalog-search-query";
  const productSearchEventName = "catalog-product-search-changed";
  const desktopCatalogMenu = siteData.header.desktopCatalogMenu;
  const searchConfig = siteData.search;
  const showDesktopMenuSearchInput =
    (searchConfig?.enabled ?? true)
    && (searchConfig?.web?.enabled ?? true)
    && (searchConfig?.web?.showHeaderMenuInput ?? true);
  const showMobileDrawerAutocomplete = false;
  const allCategoryLabel =
    catalogCategories.find((category) => category.id === "all")?.label ??
    "Todos";
  const [open, setOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [activeDesktopGroupId, setActiveDesktopGroupId] = useState(
    catalogMenuTree[0]?.id ?? "",
  );
  const [openMobileGroupId, setOpenMobileGroupId] = useState<string | null>(
    null,
  );
  const [selectedDesktopSubcategory, setSelectedDesktopSubcategory] = useState<string>(
    catalogMenuTree[0]?.items[0] ?? "",
  );
  const [selectedMobileSubcategory, setSelectedMobileSubcategory] =
    useState<string>(allCategoryLabel);
  const pathname = usePathname();
  const [mobileMenuSearch, setMobileMenuSearch] = useState("");
  const [desktopCatalogSearch, setDesktopCatalogSearch] = useState("");
  const desktopPillsRef = useRef<HTMLDivElement | null>(null);
  const desktopPillsDragRef = useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
  });
  const [desktopPillsOverflow, setDesktopPillsOverflow] = useState(false);
  const [desktopPillsProgress, setDesktopPillsProgress] = useState(0);
  const [desktopPillsThumbWidth, setDesktopPillsThumbWidth] = useState(0);
  const [desktopPillsDragging, setDesktopPillsDragging] = useState(false);
  const desktopHeaderRef = useRef<HTMLElement | null>(null);
  const [mobileMenuSuggestion, setMobileMenuSuggestion] = useState<{
    groupId: string | null;
    groupLabel: string;
    itemLabel: string;
  } | null>(null);
  const isNavMenuEnabled = siteData.header.nav.menuEnabled;
  const showDesktopMegaMenu = (siteData.header.nav as unknown as { showDesktopMegaMenu?: boolean }).showDesktopMegaMenu ?? true;
  const showServicesTab = siteData.header.nav.showServicesTab;
  const headerUi = siteData.header.ui;
  const logoBackground = `var(--logo-background, var(--accent-color, ${headerUi.branding.logoBackground}))`;
  const [drawerCloseHovered, setDrawerCloseHovered] = useState(false);

  const normalizeText = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  const activeRouteTab: "catalog" | "services" =
    pathname === siteData.routes.servicesPath ? "services" : "catalog";
  const keepDesktopCatalogMenuVisible = showDesktopMegaMenu && activeRouteTab === "catalog";

  // Avoid returning early when `pathname` is undefined during hydration —
  // this can change the number of hooks between renders and cause
  // "Rendered fewer hooks than expected" errors. Only short-circuit
  // when we have a defined pathname and it matches the catalog path or root.
  // Hiding the global Header on both `/catalogo` and `/` lets the
  // `Catalog` component render its VIP header in both routes.
  if (
    pathname &&
    (pathname === siteData.routes.catalogPath || pathname === "/")
  ) {
    return null;
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!isNavMenuEnabled) {
      return;
    }

    const openFromCatalogButton = () => setOpen(true);
    window.addEventListener("open-mobile-drawer-menu", openFromCatalogButton);

    return () => {
      window.removeEventListener(
        "open-mobile-drawer-menu",
        openFromCatalogButton,
      );
    };
  }, [isNavMenuEnabled]);

  const activeDesktopGroup =
    catalogMenuTree.find((group) => group.id === activeDesktopGroupId) ??
    catalogMenuTree[0];
  const desktopSubcategoryRowsPerColumn =
    Math.max(1, siteData.header.desktopCatalogMenu.subcategoryGrid?.rowsPerColumn ?? 3);
  const desktopSubcategoryColumnsCount = Math.max(
    1,
    Math.ceil(activeDesktopGroup.items.length / desktopSubcategoryRowsPerColumn),
  );
  const desktopSubcategoryColumns = Array.from(
    { length: desktopSubcategoryColumnsCount },
    (_, columnIndex) =>
      activeDesktopGroup.items.slice(
        columnIndex * desktopSubcategoryRowsPerColumn,
        (columnIndex + 1) * desktopSubcategoryRowsPerColumn,
      ),
  );
  const desktopSubcategoryGridWidth = `min(100%, ${desktopCatalogMenu.subcategoryGrid.maxWidth})`;
  const mobileAllBadgeCount = String(catalogProducts?.length ?? 0);

  const handleDesktopSubcategorySelect = (label: string, groupId: string) => {
    setSelectedDesktopSubcategory(label);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(desktopSubcategoryStorageKey, label);
      window.localStorage.setItem(
        catalogMenuSelectionStorageKey,
        JSON.stringify({ label, groupId }),
      );
    }
    window.dispatchEvent(
      new CustomEvent("catalog-mobile-subcategory-selected", {
        detail: { label, groupId },
      }),
    );
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedMenuSelectionRaw = window.localStorage.getItem(catalogMenuSelectionStorageKey);
    if (savedMenuSelectionRaw) {
      try {
        const savedMenuSelection = JSON.parse(savedMenuSelectionRaw) as {
          label?: string;
          groupId?: string | null;
        };
        if (savedMenuSelection.label) {
          setSelectedDesktopSubcategory(savedMenuSelection.label);
          setSelectedMobileSubcategory(savedMenuSelection.label);
          if (savedMenuSelection.groupId) {
            setOpenMobileGroupId(savedMenuSelection.groupId);
            setActiveDesktopGroupId(savedMenuSelection.groupId);
          }
          return;
        }
      } catch {
        // Keep legacy fallback below if stored JSON is malformed.
      }
    }

    const savedSubcategory = window.localStorage.getItem(desktopSubcategoryStorageKey);
    if (!savedSubcategory) {
      return;
    }

    const exists = catalogMenuTree.some((group) => group.items.includes(savedSubcategory));
    if (exists) {
      setSelectedDesktopSubcategory(savedSubcategory);
    }
  }, []);

  useEffect(() => {
    const onCatalogMobileSubcategorySelected = (event: Event) => {
      const customEvent = event as CustomEvent<{ label?: string; groupId?: string | null }>;
      const nextLabel = customEvent.detail?.label?.trim();
      if (!nextLabel) {
        return;
      }

      const nextGroupId = customEvent.detail?.groupId ?? null;
      setSelectedMobileSubcategory(nextLabel);

      if (nextLabel === allCategoryLabel) {
        setOpenMobileGroupId(null);
      } else {
        setOpenMobileGroupId(nextGroupId);
      }

      if (nextGroupId) {
        setActiveDesktopGroupId(nextGroupId);
        setSelectedDesktopSubcategory(nextLabel);
      }
    };

    window.addEventListener("catalog-mobile-subcategory-selected", onCatalogMobileSubcategorySelected);
    return () => {
      window.removeEventListener("catalog-mobile-subcategory-selected", onCatalogMobileSubcategorySelected);
    };
  }, [allCategoryLabel]);

  const handleMobileSubcategorySelect = (label: string, groupId: string | null = openMobileGroupId) => {
    setSelectedMobileSubcategory(label);
    const resolvedGroupId = label === allCategoryLabel ? null : groupId;
    if (label === allCategoryLabel) {
      setOpenMobileGroupId(null);
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        catalogMenuSelectionStorageKey,
        JSON.stringify({ label, groupId: resolvedGroupId }),
      );
    }
    window.dispatchEvent(
      new CustomEvent("catalog-mobile-subcategory-selected", {
        detail: { label, groupId: resolvedGroupId },
      }),
    );
    setOpen(false);
    setMobileMenuSearch("");
    setMobileMenuSuggestion(null);
  };

  const findMobileMenuMatch = (query: string) => {
    const normalizedQuery = normalizeText(query);
    if (normalizedQuery.length < 3) {
      return null;
    }

    if (normalizeText(allCategoryLabel).includes(normalizedQuery)) {
      return {
        groupId: null as string | null,
        groupLabel: siteData.header.mobileDrawer.allCategoriesLabel,
        itemLabel: allCategoryLabel,
      };
    }

    for (const group of catalogMenuTree) {
      for (const item of group.items) {
        if (normalizeText(item).includes(normalizedQuery)) {
          return {
            groupId: group.id,
            groupLabel: group.label,
            itemLabel: item,
          };
        }
      }
    }

    return null;
  };

  const applyMobileMenuSearch = (rawValue: string) => {
    setMobileMenuSearch(rawValue);
    const match = findMobileMenuMatch(rawValue);
    if (!match) {
      setMobileMenuSuggestion(null);
      return;
    }

    setMobileMenuSuggestion(match);
    setOpenMobileGroupId(match.groupId);
  };

  const confirmMobileMenuSuggestion = () => {
    if (!mobileMenuSuggestion) {
      return;
    }

    setMobileMenuSearch(mobileMenuSuggestion.itemLabel);
    setOpenMobileGroupId(mobileMenuSuggestion.groupId);
    handleMobileSubcategorySelect(mobileMenuSuggestion.itemLabel, mobileMenuSuggestion.groupId);
  };

  const clearMobileMenuSuggestion = () => {
    setMobileMenuSearch("");
    setMobileMenuSuggestion(null);
  };

  useEffect(() => {
    if (!open) {
      setMobileMenuSearch("");
      setMobileMenuSuggestion(null);
    }
  }, [open]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedQuery = window.localStorage.getItem(catalogSearchInputStorageKey);
    if (savedQuery) {
      setDesktopCatalogSearch(savedQuery);
    }

    const onCatalogSearchChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ query?: string }>;
      setDesktopCatalogSearch(customEvent.detail?.query ?? "");
    };

    window.addEventListener(productSearchEventName, onCatalogSearchChanged);
    return () => {
      window.removeEventListener(productSearchEventName, onCatalogSearchChanged);
    };
  }, []);

  useEffect(() => {
    if (!desktopMenuOpen || keepDesktopCatalogMenuVisible || typeof window === "undefined") {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (desktopHeaderRef.current && target && !desktopHeaderRef.current.contains(target)) {
        setDesktopMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [desktopMenuOpen, keepDesktopCatalogMenuVisible]);

  const syncCatalogSearch = (value: string) => {
    setDesktopCatalogSearch(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(catalogSearchInputStorageKey, value);
      window.dispatchEvent(
        new CustomEvent(productSearchEventName, {
          detail: { query: value },
        }),
      );
    }
  };

  const suggestedGroupId = mobileMenuSuggestion?.groupId ?? null;
  const suggestedItemLabel = mobileMenuSuggestion?.itemLabel ?? "";
  const isAllSuggested = suggestedItemLabel === allCategoryLabel;
  const hasActiveSuggestion = Boolean(mobileMenuSuggestion);

  useEffect(() => {
    const el = desktopPillsRef.current;
    if (!el) return;

    const updateDesktopPillsMetrics = () => {
      const overflowThresholdPx =
        siteData.header.desktopCatalogMenu.progressBar.showWhenOverflowExceedsPx ?? 1;
      const scrollWidth = el.scrollWidth;
      const clientWidth = el.clientWidth;
      const maxScroll = Math.max(scrollWidth - clientWidth, 0);
      const hasOverflow = maxScroll > overflowThresholdPx;
      setDesktopPillsOverflow(hasOverflow);

      if (!hasOverflow) {
        setDesktopPillsProgress(0);
        setDesktopPillsThumbWidth(0);
        return;
      }

      // Thumb width is proportional to visible viewport in the horizontal list.
      const visibleRatio = Math.min(clientWidth / scrollWidth, 1);
      const thumbWidthPercent = Math.max(18, visibleRatio * 100);
      const progressPercent = (el.scrollLeft / maxScroll) * (100 - thumbWidthPercent);

      setDesktopPillsThumbWidth(thumbWidthPercent);
      setDesktopPillsProgress(progressPercent);
    };

    updateDesktopPillsMetrics();
    el.addEventListener("scroll", updateDesktopPillsMetrics, { passive: true });
    window.addEventListener("resize", updateDesktopPillsMetrics);

    return () => {
      el.removeEventListener("scroll", updateDesktopPillsMetrics);
      window.removeEventListener("resize", updateDesktopPillsMetrics);
    };
  }, [desktopMenuOpen, keepDesktopCatalogMenuVisible, activeDesktopGroupId]);

  const handleDesktopPillsWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    const el = desktopPillsRef.current;
    if (!el || !desktopPillsOverflow) return;

    // Translate vertical wheel into horizontal movement for easier desktop scrolling.
    const dominantDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX)
      ? event.deltaY
      : event.deltaX;

    if (Math.abs(dominantDelta) < 1) {
      return;
    }

    el.scrollBy({ left: dominantDelta, behavior: "auto" });
    event.preventDefault();
  };

  const handleDesktopPillsMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const el = desktopPillsRef.current;
    if (!el) return;

    event.preventDefault();

    desktopPillsDragRef.current = {
      active: true,
      startX: event.clientX,
      startScrollLeft: el.scrollLeft,
    };
    setDesktopPillsDragging(true);
  };

  const handleDesktopPillsMouseMove: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const el = desktopPillsRef.current;
    if (!el || !desktopPillsDragRef.current.active) return;

    const deltaX = event.clientX - desktopPillsDragRef.current.startX;
    el.scrollLeft = desktopPillsDragRef.current.startScrollLeft - deltaX;
  };

  const stopDesktopPillsDrag = () => {
    if (!desktopPillsDragRef.current.active) return;
    desktopPillsDragRef.current.active = false;
    setDesktopPillsDragging(false);
  };

  const scrollDesktopPills = (direction: "left" | "right") => {
    const el = desktopPillsRef.current;
    if (!el) return;
    const amount = Math.max(220, Math.floor(el.clientWidth * 0.35));
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <>
      {/* GLOBAL HEADER SHELL - Shared fixed container for desktop and mobile navigation */}
      <header
        ref={desktopHeaderRef}
        className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md"
        style={{
          borderBottomColor: headerUi.shell.borderBottomColor,
          background: headerUi.shell.background,
          boxShadow: headerUi.shell.shadow,
        }}
      >
        {/* DESKTOP HEADER - Branding, primary tabs, and quote CTA */}
        <div className="mx-auto hidden h-20 max-w-[1460px] items-center justify-between px-6 lg:px-8 md:flex">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center p-2"
              style={{
                height: headerUi.branding.webLogoSize,
                width: headerUi.branding.webLogoSize,
                borderRadius: headerUi.branding.webLogoRadius,
                background: logoBackground,
              }}
            >
              <img
                src={catalogBranding.logoSrc}
                className="h-full w-full object-contain"
                alt={catalogBranding.businessName}
                onError={(event) => {
                  event.currentTarget.src = siteData.brand.logoFallbackSrc;
                }}
              />
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="text-xs uppercase tracking-[0.28em] text-slate-500">
                {catalogBranding.businessType}
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {catalogBranding.businessName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full justify-center sm:w-auto sm:justify-normal">
            {isNavMenuEnabled ? (
              <nav
                className="flex flex-row items-center gap-4 text-sm font-medium text-slate-600"
              >
                <a
                  href={siteData.routes.catalogPath}
                  onClick={(event) => {
                    if (!showDesktopMegaMenu) return;
                    if (pathname === siteData.routes.catalogPath) {
                      event.preventDefault();
                      setDesktopMenuOpen((prev) => !prev);
                      return;
                    }

                    setDesktopMenuOpen(true);
                  }}
                  className="relative pb-1 transition"
                  style={{
                    color:
                      activeRouteTab === "catalog"
                        ? headerUi.tabs.activeTextColor
                        : headerUi.tabs.inactiveTextColor,
                  }}
                >
                  {siteData.header.nav.catalogLabel}
                  {activeRouteTab === "catalog" ? (
                    <span
                      className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full"
                      style={{ background: headerUi.tabs.activeIndicatorColor }}
                    />
                  ) : null}
                </a>

                {showServicesTab ? (
                  <a
                    href={siteData.routes.servicesPath}
                    onClick={() => setDesktopMenuOpen(false)}
                    className="relative pb-1 transition"
                    style={{
                      color:
                        activeRouteTab === "services"
                          ? headerUi.tabs.activeTextColor
                          : headerUi.tabs.inactiveTextColor,
                    }}
                  >
                    {siteData.header.nav.servicesLabel}
                    {activeRouteTab === "services" ? (
                      <span
                        className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full"
                        style={{ background: headerUi.tabs.activeIndicatorColor }}
                      />
                    ) : null}
                  </a>
                ) : null}
              </nav>
            ) : (
              <span className="text-sm font-semibold text-slate-900">
                {siteData.header.nav.catalogLabel}
              </span>
            )}
            {/* Desktop-only hamburger to toggle the mega menu (>=1024px) */}
            {isNavMenuEnabled ? (
              <button
                type="button"
                onClick={() => setDesktopMenuOpen((s) => !s)}
                aria-label="Alternar menú de catálogo"
                className="hidden lg:inline-flex ml-3 h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-slate-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            ) : null}
            <QuoteButton className="whitespace-nowrap" />
          </div>
        </div>

        {isNavMenuEnabled && desktopMenuOpen && activeDesktopGroup ? (
          <div
            className="absolute inset-x-0 z-[70] hidden md:block"
            style={{ top: desktopCatalogMenu.topOffset }}
          >
            <div
              className="mx-auto w-full max-w-[1460px] px-6 lg:px-8"
              style={{
                paddingLeft: desktopCatalogMenu.containerPaddingX,
                paddingRight: desktopCatalogMenu.containerPaddingX,
              }}
            >
              <div
                className="w-full border border-t-0 px-4 pb-5 pt-3"
                style={{
                  width: desktopCatalogMenu.panel.width,
                  minHeight: desktopCatalogMenu.panel.height || desktopCatalogMenu.minPanelHeight,
                  height: "auto",
                  maxHeight: "none",
                  overflowX: "hidden",
                  overflowY: "visible",
                  borderBottomLeftRadius: desktopCatalogMenu.panel.radiusBottom,
                  borderBottomRightRadius: desktopCatalogMenu.panel.radiusBottom,
                  marginLeft: desktopCatalogMenu.reservedLeftSpace,
                  background: desktopCatalogMenu.panel.background,
                  borderColor: desktopCatalogMenu.panel.borderColor,
                  boxShadow: desktopCatalogMenu.panel.shadow,
                }}
              >
                <div className="flex items-center gap-4 pb-3">
                  <div
                    ref={desktopPillsRef}
                    className={`themed-scrollbar flex min-w-0 flex-1 overflow-x-auto scroll-smooth select-none ${desktopCatalogMenu.pillsGapClassName} ${desktopPillsDragging ? "cursor-grabbing" : "cursor-grab"}`}
                    onWheel={handleDesktopPillsWheel}
                    onMouseDown={handleDesktopPillsMouseDown}
                    onMouseMove={handleDesktopPillsMouseMove}
                    onMouseUp={stopDesktopPillsDrag}
                    onMouseLeave={stopDesktopPillsDrag}
                  >
                    {catalogMenuTree.map((group) => {
                      const isActive = activeDesktopGroup.id === group.id;

                      return (
                        <button
                            key={group.id}
                            onMouseEnter={() => {
                              setActiveDesktopGroupId(group.id);
                              if (typeof window !== "undefined" && window.innerWidth >= 1024) {
                                setDesktopMenuOpen(true);
                                setActiveDesktopGroupId(group.id);
                              }
                            }}
                          className="inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold whitespace-nowrap transition"
                          style={
                            isActive
                              ? {
                                  background: desktopCatalogMenu.groupPill.activeBackground,
                                  borderColor: desktopCatalogMenu.groupPill.activeBorderColor,
                                  color: desktopCatalogMenu.groupPill.activeTextColor,
                                  boxShadow: desktopCatalogMenu.groupPill.activeShadow,
                                }
                              : {
                                  background: desktopCatalogMenu.groupPill.inactiveBackground,
                                  borderColor: desktopCatalogMenu.groupPill.inactiveBorderColor,
                                  color: desktopCatalogMenu.groupPill.inactiveTextColor,
                                }
                          }
                        >
                          {isActive ? <BalloonIcon  className="h-3.5 w-3.5" strokeWidth={2.2} /> : null}
                          <span className="whitespace-nowrap">{group.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {desktopPillsOverflow ? (
                    <div className="hidden items-center gap-1 xl:flex">
                      <button
                        type="button"
                        onClick={() => scrollDesktopPills("left")}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-slate-600 transition hover:border-pink-300 hover:text-pink-600"
                        aria-label="Desplazar categorías a la izquierda"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollDesktopPills("right")}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-slate-600 transition hover:border-pink-300 hover:text-pink-600"
                        aria-label="Desplazar categorías a la derecha"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}

                  {showDesktopMenuSearchInput ? (
                  <div
                    className="hidden h-10 shrink-0 items-center rounded-lg border border-black/15 bg-white px-3 lg:flex"
                    style={{ width: desktopCatalogMenu.search.width }}
                  >
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder={desktopCatalogMenu.search.placeholder || siteData.catalogUi.searchPlaceholder}
                      aria-label={desktopCatalogMenu.search.buttonAriaLabel}
                      value={desktopCatalogSearch}
                      onChange={(event) => syncCatalogSearch(event.target.value)}
                      className="ios-no-zoom ml-2 w-full bg-transparent text-sm text-slate-700 outline-none"
                    />
                  </div>
                  ) : null}
                </div>

                <div
                  onMouseLeave={() => {
                    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
                      setDesktopMenuOpen(false);
                    }
                  }}
                  className={`inline-grid w-full border-black/10 pt-2 text-sm ${desktopCatalogMenu.contentColumnsClassName} ${desktopCatalogMenu.subcategoryGrid.columnGapClassName}`}
                  style={{
                    width: desktopSubcategoryGridWidth,
                    gridTemplateColumns: `repeat(${desktopSubcategoryColumnsCount}, minmax(${desktopCatalogMenu.subcategoryGrid.columnMinWidth}, 1fr))`,
                  }}
                >
                  {desktopSubcategoryColumns.map((columnItems, columnIndex) => (
                    <div
                      key={`desktop-subcategory-column-${columnIndex}`}
                      className={`${desktopCatalogMenu.subcategoryGrid.rowGapClassName} grid`}
                      style={{
                        minWidth: desktopCatalogMenu.subcategoryGrid.columnMinWidth,
                        borderLeft: columnIndex === 0 ? "none" : `1px solid ${desktopCatalogMenu.subcategoryGrid.dividerColor}`,
                        paddingLeft: columnIndex === 0 ? "0px" : desktopCatalogMenu.subcategoryGrid.dividerPaddingLeft,
                      }}
                    >
                      {columnItems.map((item) => {
                        const isDesktopSubcategoryActive = selectedDesktopSubcategory === item;

                        return (
                          <a
                            key={item}
                            href={siteData.routes.catalogPath}
                            onClick={(event) => {
                              handleDesktopSubcategorySelect(item, activeDesktopGroup.id);
                              if (pathname === siteData.routes.catalogPath) {
                                event.preventDefault();
                              }
                            }}
                            className={`inline-flex h-8 w-auto max-w-full justify-self-start items-center whitespace-nowrap rounded-full border px-3 text-[13px] font-medium leading-none transition ${
                              isDesktopSubcategoryActive
                                ? "border-pink-500 bg-pink-50 text-pink-600"
                                : "border-transparent bg-transparent text-slate-600 hover:text-pink-600"
                            }`}
                          >
                            <span className="block max-w-full overflow-hidden text-ellipsis">{item}</span>
                          </a>
                        );
                      })}
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        ) : null}

        {/* MOBILE HEADER - Compact branding, active tabs, and quote CTA */}
        <div className="mx-auto w-full max-w-7xl md:hidden">
          <div className="px-4 pb-2 pt-3" style={{ background: headerUi.mobileHeader.background }}>
            <div className="flex items-center gap-2.5 px-0 pb-2.5">
              <div
                className="flex shrink-0 items-center justify-center p-1.5"
                style={{
                  height: headerUi.branding.mobileLogoSize,
                  width: headerUi.branding.mobileLogoSize,
                  borderRadius: headerUi.branding.mobileLogoRadius,
                  background: logoBackground,
                }}
              >
                <img
                  src={catalogBranding.logoSrc}
                  className="h-full w-full object-contain"
                  alt={catalogBranding.businessName}
                  onError={(event) => {
                    event.currentTarget.src = siteData.brand.logoFallbackSrc;
                  }}
                />
              </div>

              <div className="min-w-0 leading-tight">
                <div className="truncate text-[9px] uppercase tracking-[0.30em] text-slate-500">
                  {catalogBranding.businessType}
                </div>
                <div className="truncate text-[13px] font-semibold text-slate-900">
                  {catalogBranding.businessName}{" "}
                </div>
              </div>

              {isNavMenuEnabled ? (
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="ml-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-black/10"
                  style={{ color: headerUi.tabs.activeIndicatorColor }}
                  aria-label={siteData.catalogUi.openCategoriesAria}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              ) : null}
            </div>

            <div
              className="flex items-center justify-between gap-3 border-t px-0 pt-2.5"
              style={{ borderTopColor: headerUi.mobileHeader.topBorderColor }}
            >
              {isNavMenuEnabled ? (
                <div className="flex items-center gap-3 text-[14px] font-medium text-slate-600">
                  <a
                    href={siteData.routes.catalogPath}
                    className="relative whitespace-nowrap pb-1 transition"
                    style={{
                      color:
                        activeRouteTab === "catalog"
                          ? headerUi.tabs.activeTextColor
                          : headerUi.tabs.inactiveTextColor,
                    }}
                  >
                    {siteData.header.nav.catalogLabel}
                    {activeRouteTab === "catalog" ? (
                      <span
                        className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full"
                        style={{ background: headerUi.tabs.activeIndicatorColor }}
                      />
                    ) : null}
                  </a>

                  {showServicesTab ? (
                    <a
                      href={siteData.routes.servicesPath}
                      className="relative whitespace-nowrap pb-1 transition"
                      style={{
                        color:
                          activeRouteTab === "services"
                            ? headerUi.tabs.activeTextColor
                            : headerUi.tabs.inactiveTextColor,
                      }}
                    >
                      {siteData.header.nav.servicesLabel}
                      {activeRouteTab === "services" ? (
                        <span
                          className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full"
                          style={{ background: headerUi.tabs.activeIndicatorColor }}
                        />
                      ) : null}
                    </a>
                  ) : null}
                </div>
              ) : (
                <span className="text-[14px] font-semibold text-slate-900">
                  {siteData.header.nav.catalogLabel}
                </span>
              )}

              <QuoteButton variant="compact" />
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER - Off-canvas category navigation and mobile search */}
      {isNavMenuEnabled ? (
      <div
        className={`fixed inset-0 z-[80] md:hidden ${open ? "visible" : "invisible"}`}
      >
        <button
          onClick={() => setOpen(false)}
          className={`absolute inset-0 transition ${open ? "opacity-100" : "opacity-0"}`}
          style={{ background: headerUi.drawer.overlayBackground }}
          aria-label={siteData.header.mobileDrawer.overlayCloseAria}
        />

        <aside
          className={`absolute left-0 top-0 h-full transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{
            width: headerUi.drawer.panelWidth,
            maxWidth: headerUi.drawer.panelMaxWidth,
            background: headerUi.drawer.panelBackground,
            boxShadow: headerUi.drawer.panelShadow,
          }}
        >
          <div className="flex h-full flex-col relative">
            {/* MOBILE DRAWER CLOSE BUTTON - Floating dismiss action */}
            <button
              onClick={() => setOpen(false)}
              className="absolute -right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition"
              style={{
                background: drawerCloseHovered
                  ? headerUi.drawer.closeButtonHoverBackground
                  : headerUi.drawer.closeButtonBackground,
                color: headerUi.drawer.closeButtonTextColor,
              }}
              onMouseEnter={() => setDrawerCloseHovered(true)}
              onMouseLeave={() => setDrawerCloseHovered(false)}
              aria-label={siteData.header.mobileDrawer.menuCloseAria}
            >
              <ChevronLeft size={20} />
            </button>

            {/* MOBILE DRAWER BRANDING - Logo and business context */}
            <div className="border-b border-black/10 px-5 py-5">
              <div className="flex items-center gap-3">
                <img
                  src={catalogBranding.logoSrc}
                  alt={catalogBranding.businessName}
                  className="h-11 w-11 rounded-xl object-cover"
                  onError={(event) => {
                    event.currentTarget.src = siteData.brand.logoFallbackSrc;
                  }}
                />

                <div className="min-w-0 leading-tight">
                  <div className="truncate text-[9px] uppercase tracking-[0.30em] text-slate-500">
                    {catalogBranding.businessType}
                  </div>
                  <div className="truncate text-[13px] font-semibold text-slate-900">
                    {catalogBranding.businessName}{" "}
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-500">
                    {catalogBranding.sectionLabel}
                  </p>
                </div>
              </div>
            </div>

            {/* MOBILE DRAWER SEARCH - Autocomplete entry point for mobile navigation */}
            {showMobileDrawerAutocomplete ? (
            <div className="p-4">
              <div className="flex items-center rounded-xl border border-black/10 px-3 py-2.5">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={siteData.header.mobileDrawer.searchPlaceholder}
                  value={mobileMenuSearch}
                  onChange={(event) => applyMobileMenuSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      confirmMobileMenuSuggestion();
                    }
                  }}
                  className="ios-no-zoom ml-2 w-full text-base outline-none"
                />
              </div>

              {mobileMenuSearch.trim().length >= 3 ? (
                <div className="mt-2 rounded-xl border border-pink-200 bg-pink-50/60 px-3 py-2">
                  {mobileMenuSuggestion ? (
                    <>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-pink-600">
                        {siteData.header.mobileDrawer.autocompleteTitle}
                      </p>
                      <p className="mt-0.5 text-[13px] font-semibold text-slate-800">
                        {mobileMenuSuggestion.itemLabel}
                      </p>
                      <p className="mt-0.5 text-[12px] text-slate-500">
                        {siteData.header.mobileDrawer.routePrefix}: {mobileMenuSuggestion.groupLabel} &gt; {mobileMenuSuggestion.itemLabel}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={confirmMobileMenuSuggestion}
                          className="rounded-full bg-pink-500 px-3 py-1.5 text-[12px] font-semibold text-white"
                        >
                          {siteData.header.mobileDrawer.selectLabel}
                        </button>
                        <button
                          type="button"
                          onClick={clearMobileMenuSuggestion}
                          className="rounded-full border border-pink-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-pink-600"
                        >
                          {siteData.header.mobileDrawer.clearLabel}
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-[12px] text-slate-500">
                      {siteData.header.mobileDrawer.noMatchesLabel}
                    </p>
                  )}
                </div>
              ) : null}
            </div>
            ) : (<div className="p-4">
              <br/>
              </div>)}

            {/* MOBILE: scrollable content */}
            <nav
              className="flex flex-1 flex-col px-3 pb-3 min-h-0 relative"
            >
              <div className="themed-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto pb-3">
                <a
                  href={siteData.routes.catalogPath}
                  onClick={(event) => {
                    handleMobileSubcategorySelect(allCategoryLabel, null);
                    if (pathname === siteData.routes.catalogPath) {
                      event.preventDefault();
                    }
                  }}
                  className={`flex items-center justify-between rounded-xl px-3 py-3 transition ${
                    hasActiveSuggestion
                      ? isAllSuggested
                        ? "bg-pink-50 text-pink-500"
                        : "text-slate-700 hover:bg-pink-50 hover:text-pink-500"
                      : selectedMobileSubcategory === allCategoryLabel
                      ? "bg-pink-50 text-pink-500"
                      : "text-slate-700 hover:bg-pink-50 hover:text-pink-500"
                  }`}
                >
                  <div className="flex items-center gap-2 text-[15px] font-medium">
                    <BalloonIcon className="h-3.5 w-3.5 text-pink-500" /> {allCategoryLabel}
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                    style={{ background: headerUi.tabs.activeIndicatorColor }}
                  >
                    {mobileAllBadgeCount}
                  </span>
                </a>

                <div className="my-3 border-t border-black/10" />

                <div className="space-y-1">
                  {catalogMenuTree.map((group) => {
                    const isOpen = group.id === openMobileGroupId;
                    const isSuggestedGroup = suggestedGroupId === group.id;

                    return (
                      <div
                        key={group.id}
                        className={`rounded-xl border bg-white ${
                          isSuggestedGroup
                            ? "border-pink-300 shadow-sm shadow-pink-100"
                            : "border-black/10"
                        }`}
                      >
                        <button
                          onClick={() => {
                            const nextOpenGroupId = isOpen ? null : group.id;
                            setOpenMobileGroupId(nextOpenGroupId);
                            if (!isOpen && selectedMobileSubcategory === allCategoryLabel) {
                              setSelectedMobileSubcategory("");
                            }
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${
                            isOpen || isSuggestedGroup
                              ? "bg-pink-50 text-pink-600"
                              : "text-slate-700"
                          }`}
                          aria-expanded={isOpen}
                        >
                          <span className="inline-flex items-center gap-2 text-[15px] font-medium">
                            <BalloonIcon className="h-3.5 w-3.5 text-pink-500" />
                            {group.label}
                          </span>
                          <ChevronRight
                            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                          />
                        </button>

                        <div
                          className={`overflow-hidden px-3 transition-all duration-300 ease-out ${
                            isOpen
                              ? "max-h-96 pb-3 opacity-100"
                              : "max-h-0 pb-0 opacity-0"
                          }`}
                        >
                          <ul className="space-y-2 border-l border-pink-200 pl-3">
                            {group.items.map((item) => (
                              <li key={item}>
                                <a
                                  href={siteData.routes.catalogPath}
                                  onClick={(event) => {
                                    handleMobileSubcategorySelect(item, group.id);
                                    if (pathname === siteData.routes.catalogPath) {
                                      event.preventDefault();
                                    }
                                  }}
                                  className={`block rounded-md px-2 py-1 text-[14px] transition ${
                                    hasActiveSuggestion
                                      ? suggestedItemLabel === item
                                        ? "bg-pink-50 font-semibold text-pink-600"
                                        : "text-slate-700 hover:text-pink-600"
                                      : selectedMobileSubcategory === item
                                      ? "bg-pink-50 font-semibold text-pink-600"
                                      : "text-slate-700 hover:text-pink-600"
                                  }`}
                                >
                                  {item}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </nav>

            {/* MOBILE: footer button fixed at bottom */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-black/10 bg-white px-3 py-3 shadow-lg shadow-black/10">
              <QuoteButton variant="compact" className="w-full justify-center" />
            </div>
          </div>
        </aside>
      </div>
      ) : null}
    </>
  );
}


