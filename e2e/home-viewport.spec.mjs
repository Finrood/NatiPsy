import { expect, test } from '@playwright/test';

for (const [width, height] of [
  [320, 568],
  [390, 844],
  [768, 1024],
  [1440, 900],
]) {
  test(`homepage keeps its proposition and CTA readable at ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.addInitScript(() => {
      window.__measuredCLS = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__measuredCLS += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto('/');

    const heading = page.locator('#site-home-heading');
    const cta = page.getByRole('link', { name: 'Agende Sua Consulta via WhatsApp' });
    await expect(heading).toBeVisible();
    await expect(cta).toBeVisible();
    const floatingContact = page.getByRole('link', { name: 'Entre em contato pelo WhatsApp' });
    if (width < 360) {
      await expect(floatingContact).toBeHidden();
    } else {
      await expect(floatingContact).toBeVisible();
    }
    const geometry = await page.evaluate(async () => {
      await document.fonts.ready;
      const h1 = document.getElementById('site-home-heading').getBoundingClientRect();
      const cta = document.querySelector('#hero a[href^="https://wa.me/"]').getBoundingClientRect();
      return {
        headingTop: h1.top,
        headingBottom: h1.bottom,
        ctaTop: cta.top,
        ctaBottom: cta.bottom,
        ctaLeft: cta.left,
        ctaRight: cta.right,
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
        cls: window.__measuredCLS,
      };
    });

    expect(geometry.headingTop).toBeGreaterThanOrEqual(0);
    expect(geometry.headingBottom).toBeLessThan(geometry.ctaTop);
    expect(geometry.ctaLeft).toBeGreaterThanOrEqual(0);
    expect(geometry.ctaRight).toBeLessThanOrEqual(width);
    expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
    expect(geometry.cls).toBeLessThan(0.1);
    if (width === 390) expect(geometry.ctaBottom).toBeLessThan(1266);

    await page.screenshot({ path: `test-results/home-${width}x${height}.png`, fullPage: false });
  });
}
