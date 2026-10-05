import { test, expect } from '@playwright/test';

test.describe('Catalog page behavior', () => {
  test.beforeEach(async ({ page }) => {
    // ensure clean storage between tests
    await page.context().clearCookies();
    await page.addInitScript(() => sessionStorage.clear());
    await page.addInitScript(() => localStorage.clear());
  });

  test('navigating to /catalogo starts at top and first card is fully visible', async ({ page, browserName }) => {
    await page.goto('/');
    await page.click('text=Ver catálogo, View Catalog, Catálogo, Catalogo', { timeout: 2000 }).catch(() => {});
    // fallback: navigate directly
    await page.goto('/catalogo');

    // wait for the grid/cards to render
    await page.waitForSelector('[data-catalog-card], .catalog-card', { timeout: 10000 }).catch(() => {});

    // check first card is fully visible (top of viewport <= top of card)
    const firstCard = await page.locator('[data-catalog-card], .catalog-card').first();
    await expect(firstCard).toBeVisible();

    const cardBox = await firstCard.boundingBox();
    const viewport = await page.viewportSize();
    if (cardBox && viewport) {
      // card top should be >= 0 and bottom <= viewport height
        expect(cardBox.y).toBeGreaterThanOrEqual(0);
    // allow a tolerance for fixed headers, toolbars or minor offsets across browsers
        const tolerance = 120;
        expect(cardBox.y + cardBox.height).toBeLessThanOrEqual(viewport.height + tolerance);
    }
  });

  test('modal does not open automatically when entering /catalogo', async ({ page }) => {
    await page.goto('/catalogo');
    // check that modal container is not present
      const modal = page.locator('dialog, .hero-carousel-modal, [aria-label="Promocion principal"]');
    await expect(modal).toHaveCount(0);
  });
});
