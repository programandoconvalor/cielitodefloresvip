"use client";

/**
 * Catalog Component
 *
 * Purpose: Main product catalog view with synchronized search, suggestions, and responsive product cards.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  CatalogHeader,
  CatalogSearch,
  CategoryTabs,
  ProductGrid,
  BottomBenefits,
} from "./catalog/index";
import { buildSiteCatalogData } from "@/services/catalogService";
import { useSiteData } from "@/context/SiteDataProvider";
import RequestInfoButton from "./RequestInfoButton";
import ProductImageLightbox from "./catalog/ProductImageLightbox";
import { resolveDisplayTitle, findSizeById, computeFinalPrice } from "@/lib/catalogHelpers";

type SuggestionItem =
  | { type: "product"; id: number; label: string; sku: string }
  | { type: "subcategory"; label: string; groupId: string; groupLabel: string }
  | { type: "category"; groupId: string; label: string }
  | { type: "no-results"; query: string; sectionLabel: string };

type CatalogProps = {
  visible: boolean;
};

type ImagePreviewState = {
  productId: number;
  cardId: string;
  images: string[];
  index: number;
  title: string;
  sku: string;
  priceMxn: number;
  badge: "new" | "customized" | "specialDay" | "bestSeller" | "" | null;
  showBadge: boolean;
  showPrice: boolean;
  showDeliveryDate: boolean;
  deliveryMessage?: string;
  showColorDots: boolean;
  colorDots: string[];
  sizeOptions: Array<{
    id: string;
    priceMxn: number;
    buttonLabel: string;
    titleLabel: string;
    images: string[];
  }>;
  selectedVariantId?: string;
  showSizeOptions: boolean;
  selectedOptionLabel?: string;
  includeSelectedOption: boolean;
  includeDeliveryMessage: boolean;
};

export default function Catalog({ visible }: CatalogProps) {
  const siteData = useSiteData();
  const { catalogBranding, catalogCategories, catalogMenuTree, catalogProducts, buildCardUiMeta } = useMemo(
    () => buildSiteCatalogData(siteData),
    [siteData],
  );
  const catalogMenuSelectionStorageKey = "catalog-selected-menu-filter";
  const catalogSearchInputStorageKey = "catalog-search-query";
  const productSearchEventName = "catalog-product-search-changed";
  const allCategoryLabel =
    catalogCategories.find((cat) => cat.id === "all")?.label ?? "Todos";
  const defaultMobileSubcategoryLabel = "Todos";
  const defaultMobileSubcategoryGroupId = "";
  const searchConfig = siteData.search;
  const isSearchEnabled = searchConfig?.enabled ?? true;
  const showWebCatalogSearch = isSearchEnabled && (searchConfig?.web?.enabled ?? true) && (searchConfig?.web?.showCatalogInput ?? true);
  const showMobileCatalogSearch = isSearchEnabled && (searchConfig?.mobile?.enabled ?? true) && (searchConfig?.mobile?.showCatalogInput ?? true);
  const allowScopeToggle = searchConfig?.catalog?.allowScopeToggle ?? true;
  const preserveLastQuery = searchConfig?.catalog?.preserveLastQuery ?? true;
  const minSearchChars = Math.max(1, searchConfig?.behavior?.minChars ?? 2);
  const configuredDefaultScope = String(searchConfig?.catalog?.defaultScope ?? "context");
  const defaultSearchScope: "context" | "global" = configuredDefaultScope === "global" ? "global" : "context";
  const debounceMs = Math.max(0, searchConfig?.behavior?.debounceMs ?? 200);
  const suggestionsEnabled = searchConfig?.suggestions?.enabled ?? true;
  const maxSuggestions = searchConfig?.suggestions?.maxItems ?? 6;
  const suggestionsShowProducts = searchConfig?.suggestions?.showProducts ?? true;
  const suggestionsShowSubcategories = searchConfig?.suggestions?.showSubcategories ?? true;
  const suggestionsShowCategories = searchConfig?.suggestions?.showCategories ?? true;
  const showPriceOnCards = siteData.catalogUi.showPriceOnCards ?? true;
  const [filter, setFilter] = useState("all");
  const previousFilterRef = useRef(filter);
  const [search, setSearch] = useState("");
  const [searchScope, setSearchScope] = useState<"context" | "global">(defaultSearchScope);
  const [mobileIndicatorLabel, setMobileIndicatorLabel] = useState(defaultMobileSubcategoryLabel);
  const [selectedMenuGroupId, setSelectedMenuGroupId] = useState<string | null>(defaultMobileSubcategoryGroupId);
  const [selectedMenuSubcategory, setSelectedMenuSubcategory] = useState(defaultMobileSubcategoryLabel);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeImageByCard, setActiveImageByCard] = useState<Record<string, number>>({});
  const [selectedVariantByCard, setSelectedVariantByCard] = useState<Record<string, string>>({});
  const [selectedProductSizeByCard, setSelectedProductSizeByCard] = useState<Record<string, string>>({});
  const mobileGridAnchorRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<Record<string, number>>({});
  const touchStartY = useRef<Record<string, number>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(-1);
  const [focusedInput, setFocusedInput] = useState<"web" | "mobile" | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [imagePreview, setImagePreview] = useState<ImagePreviewState | null>(null);
  const scrollPositionRef = useRef(0);
  const previewHistoryEntryRef = useRef(false);
  const catalogGridRef = useRef<HTMLDivElement | null>(null);
  const previewTouchStartX = useRef(0);
  const previewTouchStartY = useRef(0);
  const previewSheetRef = useRef<HTMLDivElement | null>(null);
  const previewSizeOptionsRef = useRef<HTMLDivElement | null>(null);
  const isImagePreviewOpen = imagePreview !== null;

  // Single, authoritative initial scroll-to-top on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      try {
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      } catch (e) {
        // ignore
      }

      // Do the scroll on the next paint to override any router restoration.
      window.requestAnimationFrame(() => {
        const doScroll = () => {
          try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); } catch (e) {
            try { window.scrollTo(0, 0); } catch (err) { /* ignore */ }
          }
          try { document.documentElement.scrollTop = 0; } catch (e) { /* ignore */ }
          try { (document.scrollingElement || document.body).scrollTop = 0; } catch (e) { /* ignore */ }
        };

        // immediate
        doScroll();
        // retries to counteract late restoration
        setTimeout(doScroll, 50);
        setTimeout(doScroll, 150);
      });
    } catch (e) {
      try {
        window.scrollTo(0, 0);
      } catch (err) {
        // ignore
      }
    }
  }, []);

  const selectedCategory =
    catalogCategories.find((cat) => cat.id === filter) ?? catalogCategories[0];

  type ProductCardMeta = ReturnType<typeof buildCardUiMeta>;
  const titleVariantTokenMatcher = /\{\{\s*variant\s*\}\}|\{\s*variant\s*\}/i;
  const titleVariantTokenPattern = /\{\{\s*variant\s*\}\}|\{\s*variant\s*\}/gi;

  const resolveProductDisplayName = (product: ProductCardMeta, variantLabel?: string, sizeLabel?: string) =>
    resolveDisplayTitle(product, variantLabel, sizeLabel);

  const hasProductSizes = (product?: ProductCardMeta | null) =>
    Boolean(product && product.ui?.showProductSizes === true && Array.isArray(product.productSizes) && product.productSizes.length > 0);

  const primarySoftBorder = "color-mix(in srgb, var(--color-primary-soft) 55%, white)";
  const primarySoftSurface = "color-mix(in srgb, var(--color-primary-soft) 22%, white)";
  const primarySoftSurfaceStrong = "color-mix(in srgb, var(--color-primary-soft) 36%, white)";
  const primarySoftText = "color-mix(in srgb, var(--color-primary) 88%, white)";
  const primarySolidShadow = "0 10px 24px color-mix(in srgb, var(--color-primary) 24%, transparent)";
  const primaryCloseButtonBorder = "color-mix(in srgb, var(--color-primary) 45%, white)";
  const primaryCloseButtonShadow = "0 12px 28px color-mix(in srgb, var(--color-primary) 34%, transparent)";
  const darkAccentBorder = "color-mix(in srgb, var(--color-primary-soft) 72%, white)";
  const darkAccentText = "color-mix(in srgb, var(--color-primary-soft) 86%, white)";

  const filteredByCategory = catalogProducts.filter((p) =>
    selectedCategory.productCategoryIds.includes(p.categoryId)
  );

  useLayoutEffect(() => {
    if (previousFilterRef.current === filter) {
      return;
    }

    previousFilterRef.current = filter;
    const catalogGrid = catalogGridRef.current;
    if (!catalogGrid) {
      return;
    }

    const catalogHeaderHeight =
      document.querySelector<HTMLElement>("#catalogo header")?.offsetHeight ?? 0;
    window.scrollTo({
      top: Math.max(
        0,
        window.scrollY + catalogGrid.getBoundingClientRect().top - catalogHeaderHeight,
      ),
      behavior: "instant",
    });
  }, [filter]);

  const normalizeText = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const expandWithSynonyms = (q: string): string[] => {
    const syns = (siteData.search as unknown as { synonyms?: Array<{ terms: string[]; maps: string[] }> }).synonyms;
    if (!syns?.length) return [];
    const extra: string[] = [];
    for (const syn of syns) {
      if (syn.terms.some((t) => q.includes(normalizeText(t)))) {
        syn.maps.forEach((m) => extra.push(normalizeText(m)));
      }
    }
    return extra;
  };

  const filteredByMenuSelection = filteredByCategory.filter((product) => {
    if (selectedMenuSubcategory === allCategoryLabel) {
      return true;
    }

    return product.menuAssignments.some((assignment) => {
      if (assignment.subcategory !== selectedMenuSubcategory) {
        return false;
      }

      if (!selectedMenuGroupId) {
        return true;
      }

      return assignment.groupId === selectedMenuGroupId;
    });
  });

  const normalizedQuery = normalizeText(search);
  const isCatalogWideSearch = normalizedQuery.length >= minSearchChars;
  const searchUniverse = isCatalogWideSearch ? catalogProducts : filteredByMenuSelection;
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

  const productSearchScore = (productId: number) => {
    const product = buildCardUiMeta(productId);
    const parts: string[] = [product.baseTitle, product.sku, ...(product.menuAssignments.map((a) => a.subcategory))];

    if (product.titleTemplate) {
      parts.push(resolveProductDisplayName(product));
      product.activeSizeOptions.forEach((option) => {
        parts.push(resolveProductDisplayName(product, option.id));
        parts.push(option.buttonLabel);
        parts.push(option.titleLabel);
      });
    }

    const searchableText = normalizeText(parts.join(" "));
    if (!normalizedQuery || normalizedQuery.length < minSearchChars) {
      return 1;
    }

    const synonymExpansion = expandWithSynonyms(normalizedQuery);
    let score = 0;
    if (searchableText.includes(normalizedQuery)) {
      score += 80;
    }
    for (const extra of synonymExpansion) {
      if (searchableText.includes(extra)) {
        score += 30;
      }
    }

    for (const token of queryTokens) {
      if (searchableText.includes(token)) {
        score += 15;
      }
    }

    if (normalizeText(product.sku).includes(normalizedQuery)) {
      score += 30;
    }

    if (selectedMenuSubcategory !== allCategoryLabel) {
      const isInCurrentContext = product.menuAssignments.some((assignment) =>
        assignment.subcategory === selectedMenuSubcategory && (!selectedMenuGroupId || assignment.groupId === selectedMenuGroupId)
      );
      if (isInCurrentContext) {
        score += 12;
      }
    }

    return score;
  };

  const rankProducts = (products: typeof catalogProducts) =>
    products
      .map((product) => ({ product, score: productSearchScore(product.id) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.product);

  const filtered = rankProducts(searchUniverse);
  const isUsingGlobalFallback = false;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const computedSuggestions = useMemo<SuggestionItem[]>(() => {
    if (!suggestionsEnabled) return [];
    const rawQ = search.trim();
    if (rawQ.length < minSearchChars) return [];
    const q = normalizeText(rawQ);
    const synonymExtra = expandWithSynonyms(q);
    const matchesText = (text: string) => {
      const n = normalizeText(text);
      return n.includes(q) || synonymExtra.some((e) => n.includes(e));
    };
    const allSubcategories = catalogMenuTree.flatMap((group) =>
      group.items.map((item) => ({
        groupId: group.id,
        groupLabel: group.label,
        label: item,
      })),
    );
    const hasAnyCatalogMatch = catalogProducts.some((p) => {
      const searchableParts = [
        p.baseTitle,
        p.sku,
        ...p.menuAssignments.map((assignment) => assignment.groupId),
        ...p.menuAssignments.map((assignment) => assignment.subcategory),
      ];

      return searchableParts.some((part) => matchesText(part));
    });
    const items: SuggestionItem[] = [];
    if (suggestionsShowProducts) {
      catalogProducts
        .filter((p) => matchesText(p.baseTitle) || matchesText(p.sku))
        .slice(0, maxSuggestions)
        .forEach((p) => items.push({ type: "product", id: p.id, label: p.baseTitle, sku: p.sku }));
    }
    if (suggestionsShowSubcategories) {
      allSubcategories
        .filter((subcategory) => matchesText(subcategory.label))
        .slice(0, maxSuggestions)
        .forEach((subcategory) => items.push({
          type: "subcategory",
          label: subcategory.label,
          groupId: subcategory.groupId,
          groupLabel: subcategory.groupLabel,
        }));
    }
    if (suggestionsShowCategories) {
      catalogMenuTree
        .filter((group) => matchesText(group.label))
        .slice(0, maxSuggestions)
        .forEach((group) => items.push({
          type: "category",
          groupId: group.id,
          label: group.label,
        }));
    }
    if (items.length === 0 && !hasAnyCatalogMatch) {
      const sectionLabel =
        "el catálogo completo";
      items.push({ type: "no-results", query: rawQ, sectionLabel });
    }

    return items.slice(0, maxSuggestions);
  }, [search, minSearchChars, suggestionsEnabled, maxSuggestions, suggestionsShowProducts, suggestionsShowSubcategories, suggestionsShowCategories, selectedMenuSubcategory, allCategoryLabel]);

  const safeProducts = filtered;
  const cardsToRender = safeProducts;
        // Helper: get size adjustment for a given product size and variant id.
        // Supports legacy `priceMxn` (same for all variants) and new `priceAdjustments`.
        const getSizeAdjustment = (size?: { priceMxn?: number; priceAdjustments?: { aire: number; helio: number } }, variantId?: string) => {
          if (!size) return 0;
          if (size.priceAdjustments && variantId && (variantId in size.priceAdjustments)) {
            return (size.priceAdjustments as any)[variantId] ?? 0;
          }
          return size.priceMxn ?? 0;
        };

        // Single source of truth for computing the display price for a product card or preview.
        // Rules implemented:
        // - If the product has activeSizeOptions (variants like aire/helio): base comes from the selected variant's priceMxn,
        //   plus any size adjustment from productSizes (via priceAdjustments or legacy priceMxn on the size).
        // - If the product has NO activeSizeOptions: the display price is always the product.basePriceMxn.
        // - Never read selectedOption directly outside this helper; callers must pass selectedVariantId/selectedSizeId.
        const getDisplayPrice = (
          product?: ProductCardMeta | null,
          selectedVariantId?: string | undefined,
          selectedSizeId?: string | undefined,
        ) => {
          if (!product) return 0;

          const hasVariants = Array.isArray(product.activeSizeOptions) && product.activeSizeOptions.length > 0;

          if (!hasVariants) {
            // Simple product: always return base price (single source of truth)
            return product.basePriceMxn ?? 0;
          }

          // Product with variants: variant price + size adjustment
          const variant = product.activeSizeOptions.find((v) => v.id === selectedVariantId)
            ?? product.activeSizeOptions.find((v) => v.id === (product.defaultVariantId ?? undefined))
            ?? product.activeSizeOptions[0];

          const variantPrice = variant?.priceMxn ?? 0;
          const _hasSizes = hasProductSizes(product);
          const size = _hasSizes ? (product.productSizes!.find((s) => s.id === selectedSizeId) ?? product.productSizes![0]) : undefined;
          const sizeAdj = getSizeAdjustment(size, variant?.id);

          return (variantPrice ?? 0) + (sizeAdj ?? 0);
        };

  const activeCategoryLabel = selectedCategory.label;
  const showMobileMenuButton =
    siteData.header.nav.menuEnabled && siteData.catalogUi.showMobileCategoriesButton;
  const selectedMobileGroupLabel = selectedMenuGroupId
    ? catalogMenuTree.find((group) => group.id === selectedMenuGroupId)?.label
    : null;
  const mobileIndicatorText = !siteData.header.nav.menuEnabled
    ? siteData.catalogUi.fixedMobileIndicatorLabelWhenMenuOff
    : selectedMobileGroupLabel && mobileIndicatorLabel && mobileIndicatorLabel !== allCategoryLabel
      ? `Categoría - ${selectedMobileGroupLabel} - ${mobileIndicatorLabel}`
      : `Categoría - ${mobileIndicatorLabel || selectedCategory.label}`;
  const catalogInquiryHref = `${siteData.links.whatsappCatalogBase}?text=${encodeURIComponent("Hola, quiero información sobre la Colección VIP.")}`;

  const changeImage = (cardId: string, direction: "next" | "prev") => {
    // cardId is the product id as string
    const productId = Number(cardId);
    const productMeta = buildCardUiMeta(productId);

    // resolve selected variant for this card
    const selectedVariantId = selectedVariantByCard[cardId] ?? productMeta.defaultVariantId ?? productMeta.activeSizeOptions[0]?.id;
    const selectedOption = productMeta.activeSizeOptions.find((o) => o.id === selectedVariantId);

    const normalizePath = (p: string) => p.replace(/\/images\/tenants\/[^/]+/i, '/images/tenants/cielitodeflores');
    const safeImages = (selectedOption?.images?.length ? selectedOption.images : productMeta.defaultImages).map((p) => normalizePath(p));
    const total = Math.max(safeImages.length, 1);

    setActiveImageByCard((prev) => {
      const current = prev[cardId] ?? 0;
      const nextIndex =
        direction === "next"
          ? (current + 1) % total
          : (current - 1 + total) % total;

      return {
        ...prev,
        [cardId]: nextIndex,
      };
    });
  };

  const openImagePreview = (payload: Omit<ImagePreviewState, "index"> & { index: number }) => {
    const { images, index } = payload;
    if (!images.length) {
      return;
    }

    const boundedIndex = Math.max(0, Math.min(index, images.length - 1));
    scrollPositionRef.current = window.scrollY;
    if (!previewHistoryEntryRef.current) {
      const currentHistoryState = window.history.state;
      const previewHistoryState = currentHistoryState && typeof currentHistoryState === "object"
        ? { ...currentHistoryState, __catalogImagePreview: true }
        : { __catalogImagePreview: true, previousState: currentHistoryState };
      window.history.pushState(previewHistoryState, "", window.location.href);
      previewHistoryEntryRef.current = true;
    }
    setImagePreview({ ...payload, index: boundedIndex });
  };

  const closeImagePreview = () => {
    if (previewHistoryEntryRef.current) {
      previewHistoryEntryRef.current = false;
      if (window.history.state?.__catalogImagePreview === true) {
        window.history.back();
      }
    }
    setImagePreview(null);
  };

  const moveImagePreview = (direction: "next" | "prev") => {
    setImagePreview((prev) => {
      if (!prev || prev.images.length <= 1) {
        return prev;
      }

      const nextIndex = direction === "next"
        ? (prev.index + 1) % prev.images.length
        : (prev.index - 1 + prev.images.length) % prev.images.length;

      return { ...prev, index: nextIndex };
    });
  };

  const setImagePreviewIndex = (index: number) => {
    setImagePreview((prev) => {
      if (!prev) {
        return prev;
      }

      const boundedIndex = Math.max(0, Math.min(index, prev.images.length - 1));
      return { ...prev, index: boundedIndex };
    });
  };

  const selectImagePreviewSizeOption = (nextVariantId: string) => {
    if (!imagePreview || !imagePreview.showSizeOptions) {
      return;
    }

    const nextOption = imagePreview.sizeOptions.find((option) => option.id === nextVariantId);
    if (!nextOption) {
      return;
    }

    setSelectedVariantByCard((prev) => ({ ...prev, [imagePreview.cardId]: nextOption.id }));
    setActiveImageByCard((prev) => ({ ...prev, [imagePreview.cardId]: 0 }));

    setImagePreview((prev) => {
      if (!prev) {
        return prev;
      }

      const product = buildCardUiMeta(prev.productId);
        const nextOptionFromPreview = prev.sizeOptions.find((option) => option.id === nextVariantId);
      if (!nextOptionFromPreview) {
        return prev;
      }

      const nextImages = nextOptionFromPreview.images.length
        ? nextOptionFromPreview.images
        : product.defaultImages;

      const _hasSizes = hasProductSizes(product);
      const sizeId = selectedProductSizeByCard[prev.cardId] ?? (_hasSizes ? product.productSizes![0].id : undefined);
      const variantLabel = nextOptionFromPreview.buttonLabel;
      const sizeLabel = _hasSizes && sizeId ? product.productSizes!.find((s) => s.id === sizeId)?.label : undefined;

      const newPrice = getDisplayPrice(product, nextOptionFromPreview.id, sizeId);
      return {
        ...prev,
        selectedVariantId: nextOptionFromPreview.id,
        title: product.baseTitle,
        priceMxn: newPrice,
        images: nextImages,
        index: 0,
        selectedOptionLabel: variantLabel,
        includeSelectedOption: true,
      };
    });
  };

  // NOTE: initial scroll-to-top is handled by the mount-only effect above.

  useEffect(() => {
    if (!isImagePreviewOpen) {
      return;
    }

    // Save original body styles to restore later.
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;

    // Lock background scrolling without changing layout: set overflow hidden
    // and keep the page at the same visual position by fixing top.
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPositionRef.current}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;

      const scrollPosition = scrollPositionRef.current;
      window.requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollPosition,
          behavior: "auto",
        });
      });
    };
  }, [isImagePreviewOpen]);

  useEffect(() => {
    if (!isImagePreviewOpen) {
      return;
    }

    const onPopState = () => {
      if (!previewHistoryEntryRef.current) {
        return;
      }

      previewHistoryEntryRef.current = false;
      setImagePreview(null);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isImagePreviewOpen]);

  useEffect(() => {
    if (!imagePreview) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeImagePreview();
        return;
      }

      if (event.key === "ArrowLeft") {
        moveImagePreview("prev");
        return;
      }

      if (event.key === "ArrowRight") {
        moveImagePreview("next");
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [imagePreview]);

  useEffect(() => {
    if (!imagePreview || typeof window === "undefined") {
      return;
    }

    if (window.innerWidth >= 768 || !imagePreview.showSizeOptions) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const sheet = previewSheetRef.current;
      const options = previewSizeOptionsRef.current;
      if (!sheet || !options) {
        return;
      }

      const topPadding = 10;
      const nextScrollTop = Math.max(0, options.offsetTop - topPadding);
      sheet.scrollTo({ top: nextScrollTop, behavior: "smooth" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [imagePreview]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (preserveLastQuery) {
      const savedQuery = window.localStorage.getItem(catalogSearchInputStorageKey);
      if (savedQuery) {
        setSearch(savedQuery);
      }
    }

    const savedMenuSelectionRaw = window.localStorage.getItem(catalogMenuSelectionStorageKey);
    if (!savedMenuSelectionRaw) {
      // Default to showing the entire catalog (Todos) on first visit
      window.localStorage.setItem(
        catalogMenuSelectionStorageKey,
        JSON.stringify({ label: allCategoryLabel, groupId: null }),
      );
      setMobileIndicatorLabel(allCategoryLabel);
      setSelectedMenuSubcategory(allCategoryLabel);
      setSelectedMenuGroupId(null);
      return;
    }

    try {
      const savedMenuSelection = JSON.parse(savedMenuSelectionRaw) as {
        label?: string;
        groupId?: string | null;
      };

      if (!savedMenuSelection.label) {
        window.localStorage.setItem(
          catalogMenuSelectionStorageKey,
          JSON.stringify({ label: defaultMobileSubcategoryLabel, groupId: defaultMobileSubcategoryGroupId }),
        );
        return;
      }

      if (savedMenuSelection.label === allCategoryLabel) {
        setMobileIndicatorLabel(allCategoryLabel);
        setSelectedMenuSubcategory(allCategoryLabel);
        setSelectedMenuGroupId(null);
        window.localStorage.setItem(
          catalogMenuSelectionStorageKey,
          JSON.stringify({ label: allCategoryLabel, groupId: null }),
        );
        return;
      }

      const savedGroupId = savedMenuSelection.groupId ?? null;
      const savedSelectionHasProducts = catalogProducts.some((product) =>
        product.menuAssignments.some((assignment) =>
          assignment.subcategory === savedMenuSelection.label &&
          (!savedGroupId || assignment.groupId === savedGroupId)
        )
      );

      if (savedSelectionHasProducts) {
        setMobileIndicatorLabel(savedMenuSelection.label);
        setSelectedMenuSubcategory(savedMenuSelection.label);
        setSelectedMenuGroupId(savedGroupId);
      } else {
        setMobileIndicatorLabel(allCategoryLabel);
        setSelectedMenuSubcategory(allCategoryLabel);
        setSelectedMenuGroupId(null);
        window.localStorage.setItem(
          catalogMenuSelectionStorageKey,
          JSON.stringify({ label: allCategoryLabel, groupId: null }),
        );
      }
    } catch {
      // Ignore malformed persisted values.
    }
  }, [allCategoryLabel, catalogProducts]);

  useEffect(() => {
    const onCatalogSearchChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ query?: string; scope?: "context" | "global"; source?: string }>;
      // Ignore events dispatched by this same component to avoid feedback loop
      if (customEvent.detail?.source === "catalog") return;
      const nextQuery = customEvent.detail?.query ?? "";
      const nextScope = customEvent.detail?.scope;
      setSearch(nextQuery);
      setShowSuggestions(false);
      if (nextScope === "context" || nextScope === "global") {
        setSearchScope(nextScope);
      }
      if (typeof window !== "undefined" && preserveLastQuery) {
        window.localStorage.setItem(catalogSearchInputStorageKey, nextQuery);
      }
    };

    window.addEventListener(productSearchEventName, onCatalogSearchChanged);
    return () => {
      window.removeEventListener(productSearchEventName, onCatalogSearchChanged);
    };
  }, [preserveLastQuery]);

  const syncSearch = (value: string) => {
    if (typeof window !== "undefined") {
      if (preserveLastQuery) {
        window.localStorage.setItem(catalogSearchInputStorageKey, value);
      }
      window.dispatchEvent(
        new CustomEvent(productSearchEventName, {
          detail: { query: value, scope: searchScope, source: "catalog" },
        }),
      );
    }
  };

  const handleSearchInput = (value: string) => {
    setSearch(value);
    setActiveSuggestionIdx(-1);
    setShowSuggestions(value.length >= minSearchChars);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => syncSearch(value), debounceMs);
  };

  const handleClearSearch = () => {
    if (debounceRef.current) { clearTimeout(debounceRef.current); debounceRef.current = null; }
    setSearch("");
    setShowSuggestions(false);
    setActiveSuggestionIdx(-1);
    syncSearch("");
    if (typeof window !== "undefined") {
      if (preserveLastQuery) window.localStorage.setItem(catalogSearchInputStorageKey, "");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleViewAllCatalog = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    setSearch("");
    setShowSuggestions(false);
    setActiveSuggestionIdx(-1);
    setSelectedMenuSubcategory(allCategoryLabel);
    setSelectedMenuGroupId(null);
    setMobileIndicatorLabel(allCategoryLabel);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        catalogMenuSelectionStorageKey,
        JSON.stringify({ label: allCategoryLabel, groupId: null }),
      );
      if (preserveLastQuery) {
        window.localStorage.setItem(catalogSearchInputStorageKey, "");
      }
      window.dispatchEvent(
        new CustomEvent("catalog-mobile-subcategory-selected", {
          detail: { label: allCategoryLabel, groupId: null },
        }),
      );
      window.dispatchEvent(
        new CustomEvent(productSearchEventName, {
          detail: { query: "", scope: searchScope, source: "catalog" },
        }),
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSuggestionSelect = (item: SuggestionItem) => {
    if (item.type === "no-results") {
      handleViewAllCatalog();
      return;
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setShowSuggestions(false);
    setActiveSuggestionIdx(-1);
    if (item.type === "product" || item.type === "category") {
      const v = item.label;
      setSearch(v);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => syncSearch(v), debounceMs);
    } else if (item.type === "subcategory") {
      setSelectedMenuSubcategory(item.label);
      setSelectedMenuGroupId(item.groupId);
      setMobileIndicatorLabel(item.label);
      setSearch("");
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          catalogMenuSelectionStorageKey,
          JSON.stringify({ label: item.label, groupId: item.groupId }),
        );
        if (preserveLastQuery) {
          window.localStorage.setItem(catalogSearchInputStorageKey, "");
        }
        window.dispatchEvent(
          new CustomEvent(productSearchEventName, { detail: { query: "", scope: searchScope, source: "catalog" } }),
        );
        // ensure the main catalog scrolls to the top when selecting a subcategory from suggestions
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || computedSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIdx((prev) => Math.min(prev + 1, computedSuggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIdx((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && activeSuggestionIdx >= 0) {
      e.preventDefault();
      const selectedSug = computedSuggestions[activeSuggestionIdx];
      if (selectedSug.type !== "no-results") handleSuggestionSelect(selectedSug);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveSuggestionIdx(-1);
    }
  };

  const updateSearchScope = (scope: "context" | "global") => {
    setSearchScope(scope);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(productSearchEventName, {
          detail: { query: search, scope, source: "catalog" },
        }),
      );
    }
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onMobileSubcategorySelected = (event: Event) => {
      const customEvent = event as CustomEvent<{ label?: string; groupId?: string | null }>;
      const selectedLabel = customEvent.detail?.label?.trim();
      if (!selectedLabel) return;

      setMobileIndicatorLabel(selectedLabel);
      setSelectedMenuSubcategory(selectedLabel);
      setSelectedMenuGroupId(customEvent.detail?.groupId ?? null);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          catalogMenuSelectionStorageKey,
          JSON.stringify({ label: selectedLabel, groupId: customEvent.detail?.groupId ?? null }),
        );
        // ensure scroll to top on mobile selection
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener("catalog-mobile-subcategory-selected", onMobileSubcategorySelected);

    return () => {
      window.removeEventListener("catalog-mobile-subcategory-selected", onMobileSubcategorySelected);
      };
    }, [catalogMenuSelectionStorageKey]);

    // Removed complex scroll restoration logic; rely on single authoritative mount scroll.

  if (!visible) {
    return <section id="catalogo" className="hidden" aria-hidden="true" />;
  }

  return (
    <>
    <section id="catalogo" className="bg-[#050505] text-white pb-20 pt-0">
      {/* VIP Header (branding) */}
      <CatalogHeader
        branding={catalogBranding}
        categories={catalogCategories}
        activeId={filter}
        onSelect={(id) => {
          // update existing filter state
          setFilter(id);
          // when selecting a top-level category, reset menu subcategory selection to 'Todos'
          const allLabel = catalogCategories.find((c) => c.id === 'all')?.label ?? 'Todos';
          setSelectedMenuSubcategory(allLabel);
          setSelectedMenuGroupId(null);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(catalogMenuSelectionStorageKey, JSON.stringify({ label: allLabel, groupId: null }));
          }
        }}
      />

      <div className="mx-auto w-full max-w-[1460px] px-3 md:px-6 lg:px-8">

        {/* MOBILE GRID ANCHOR - Scroll target used after external menu selections */}
        <div ref={mobileGridAnchorRef} className="h-0" />

        {/* PRODUCT GRID - VIP large cards: image left, info right on desktop */}
        <div ref={catalogGridRef} className="grid grid-cols-1 gap-8 md:grid-cols-1 lg:grid-cols-1">
          <ProductGrid
            products={safeProducts as any}
            activeImageByCard={activeImageByCard}
            onPrevImage={(cardId) => changeImage(cardId, "prev")}
            onNextImage={(cardId) => changeImage(cardId, "next")}
            onOpenPreview={(cardId, index) => {
              const productId = Number(cardId);
              const ui = buildCardUiMeta(productId);
              const selectedVariantId = selectedVariantByCard[cardId] ?? ui.defaultVariantId ?? ui.activeSizeOptions[0]?.id;
              const selectedOption = ui.activeSizeOptions.find((o) => o.id === selectedVariantId);
              const normalizePath = (p: string) => p.replace(/\/images\/tenants\/[^/]+/i, '/images/tenants/cielitodeflores');
              const safeImages = (selectedOption?.images?.length ? selectedOption.images : ui.defaultImages).map((p) => normalizePath(p));
              const boundedIndex = Math.max(0, Math.min(index, safeImages.length - 1));
              const showBadge = ui.ui.showBadge && Boolean(ui.badge);
              const showPrice = showPriceOnCards;
              const _hasSizes = hasProductSizes(ui);
              const sizeId = selectedProductSizeByCard[cardId] ?? (_hasSizes ? ui.productSizes![0].id : undefined);
              const variantLabel = selectedOption?.buttonLabel;
              const sizeLabel = _hasSizes && sizeId ? ui.productSizes!.find((s) => s.id === sizeId)?.label : undefined;

              openImagePreview({
                productId,
                cardId,
                images: safeImages,
                index: boundedIndex,
                title: ui.baseTitle,
                sku: ui.sku,
                priceMxn: getDisplayPrice(ui, selectedOption?.id ?? selectedVariantId, sizeId),
                badge: ui.badge,
                showBadge,
                showPrice,
                showDeliveryDate: ui.ui.showDeliveryDate,
                deliveryMessage: ui.deliveryMessage,
                showColorDots: ui.ui.showColorDots,
                colorDots: ui.colorDots,
                sizeOptions: ui.activeSizeOptions,
                selectedVariantId: selectedOption?.id ?? selectedVariantId,
                showSizeOptions: ui.activeSizeOptions.length > 0,
                selectedOptionLabel: selectedOption?.buttonLabel,
                includeSelectedOption: Boolean(selectedOption),
                includeDeliveryMessage: ui.ui.showDeliveryDate,
              });
            }}
            getDisplayPrice={(productId) => {
              const ui = buildCardUiMeta(productId);
              const selectedVariantId = selectedVariantByCard[String(productId)] ?? ui.defaultVariantId ?? ui.activeSizeOptions[0]?.id;
              const sizeId = selectedProductSizeByCard[String(productId)] ?? (hasProductSizes(ui) ? ui.productSizes![0].id : undefined);
              return getDisplayPrice(ui, selectedVariantId, sizeId);
            }}
          />
          </div>
          {imagePreview ? (
            <>
              <ProductImageLightbox
                images={imagePreview.images}
                activeIndex={imagePreview.index}
                productTitle={imagePreview.title}
                sku={imagePreview.sku}
                priceMxn={imagePreview.priceMxn}
                selectedSizeLabel={imagePreview.selectedOptionLabel}
                isOpen={true}
                onClose={closeImagePreview}
                onPrev={() => setImagePreviewIndex(Math.max(0, imagePreview.index - 1))}
                onNext={() => setImagePreviewIndex(Math.min(imagePreview.images.length - 1, imagePreview.index + 1))}
                onChangeIndex={(i) => setImagePreviewIndex(i)}
              />
            </>
          ) : null}
      </div>
    </section>
    </>
  );
}
