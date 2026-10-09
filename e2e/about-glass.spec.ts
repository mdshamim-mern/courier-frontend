import { test, expect } from "@playwright/test";

for (const locale of ["en", "bn"]) {
  for (const width of [360, 390, 768, 1024, 1366]) {
    test(`about glass design ${locale} at ${width}px`, async ({
      page,
    }, testInfo) => {
      await page.route("**/api/backend/**", (route) =>
        route.fulfill({ status: 401, json: { success: false } }),
      );
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}/about`);
      await expect(
        page.getByRole("heading", {
          name: locale === "bn" ? "ড্রপজো সম্পর্কে" : "About Dropzo",
          exact: true,
        }),
      ).toBeVisible();
      const journey = page.locator(
        'section[aria-labelledby="about-route-title"]',
      );
      await expect(journey.locator("ol > li")).toHaveCount(3);
      const process = page.locator(
        'section[aria-labelledby="about-process-title"]',
      );
      await expect(process.locator("ol > li")).toHaveCount(6);
      await expect(journey).toContainText(
        locale === "bn" ? "সরাসরি পার্সেল অনুসরণ নয়" : "not live parcel tracking",
      );
      const article = page.locator("article").first();
      await expect(
        article.getByRole("link", {
          name: locale === "bn" ? "পার্সেল পাঠান" : "Send a parcel",
          exact: true,
        }),
      ).toHaveAttribute("href", `/${locale}/dashboard/new-shipment`);
      await expect(article.locator('a[href$="/pricing"]')).toHaveCount(1);
      await expect(article.locator('a[href$="/contact"]')).toHaveCount(1);
      await expect(article).toContainText(
        locale === "bn" ? "ম্যানুয়াল হস্তান্তর" : "manual remittances",
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const cards = await process.locator("ol > li").evaluateAll((elements) =>
        elements.map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            x: rect.x,
            right: rect.right,
            width: rect.width,
            height: rect.height,
          };
        }),
      );
      for (const card of cards) {
        expect(card.x).toBeGreaterThanOrEqual(0);
        expect(card.right).toBeLessThanOrEqual(width);
        expect(card.height).toBeGreaterThan(140);
      }
      expect(
        await journey.evaluate(
          (element) => getComputedStyle(element).backdropFilter,
        ),
      ).toContain("blur");
      if (width === 360) {
        const actions = await article
          .locator("a")
          .evaluateAll((elements) =>
            elements.map((element) => element.getBoundingClientRect().height),
          );
        for (const height of actions) expect(height).toBeGreaterThanOrEqual(44);
        expect(
          Math.max(...cards.map((card) => card.x)) -
            Math.min(...cards.map((card) => card.x)),
        ).toBeLessThan(1);
      }
      if (locale === "bn") {
        expect(
          (await article.innerText()).replaceAll("Dropzo", ""),
        ).not.toMatch(/[A-Za-z]{2,}/);
        await expect(process.locator("ol > li").first()).toContainText("০১");
      }
      if (width === 390 || width === 1366) {
        await page.screenshot({
          path: testInfo.outputPath(`about-${locale}-${width}.png`),
          fullPage: true,
        });
      }
      await page.emulateMedia({ reducedMotion: "reduce" });
      expect(
        await process
          .locator("ol > li")
          .first()
          .evaluate((element) => getComputedStyle(element).transitionDuration),
      ).toBe("0s");
    });
  }
}
