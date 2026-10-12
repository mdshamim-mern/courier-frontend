import { test, expect } from "@playwright/test";

for (const locale of ["en", "bn"])
  for (const width of [360, 768, 1366]) {
    test(`contact support ${locale} at ${width}px`, async ({ page }, info) => {
      await page.route("**/api/backend/**", (route) =>
        route.fulfill({ status: 401, json: { success: false } }),
      );
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}/contact`);
      await expect(
        page.getByRole("heading", {
          name: locale === "bn" ? "যোগাযোগ করুন" : "Contact Us",
          exact: true,
        }),
      ).toBeVisible();
      const main = page.locator("main");
      await expect(
        main.locator('a[href="mailto:mdshamim.mern@gmail.com"]'),
      ).toHaveCount(2);
      await expect(main.locator('a[href="tel:01865190471"]')).toHaveCount(2);
      await expect(
        main.locator('a[href^="https://www.google.com/maps/search/"]'),
      ).toHaveAttribute("rel", "noopener noreferrer");
      await expect(main.locator(`a[href="/${locale}/faq"]`)).toBeVisible();
      await expect(main.locator(`a[href="/${locale}/privacy"]`)).toBeVisible();
      await expect(main.locator("#contact-prepare-title")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      for (const height of await main
        .locator("a")
        .evaluateAll((elements) =>
          elements.map((el) => el.getBoundingClientRect().height),
        ))
        expect(height).toBeGreaterThanOrEqual(44);
      await page.screenshot({
        path: info.outputPath(`contact-${locale}-${width}.png`),
        fullPage: true,
      });
    });
  }
