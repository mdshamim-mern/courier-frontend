import { test, expect } from "@playwright/test";
import { setSession } from "./support/session";

test("coverage combines filters, sorts, paginates and opens public details", async ({
  page,
}) => {
  await setSession(page, "GUEST");
  const areas = Array.from({ length: 18 }, (_, i) => ({
    id: `area-${i}`,
    name: `Area ${String(i).padStart(2, "0")}`,
    district: i < 12 ? "Dhaka" : "Gazipur",
    upazila: "Sadar",
    pickupEnabled: i % 2 === 0,
    deliveryEnabled: true,
  }));
  await page.route("**/api/backend/operations/coverage", (route) =>
    route.fulfill({ json: { success: true, data: areas } }),
  );
  await page.goto("/en/coverage");
  await expect(page.locator(".coverage-area-card")).toHaveCount(8);
  await page.getByLabel("District", { exact: true }).selectOption("Dhaka");
  await page.getByLabel("Pickup", { exact: true }).selectOption("true");
  await page.getByLabel("Delivery", { exact: true }).selectOption("true");
  await expect(page.locator(".coverage-area-card")).toHaveCount(6);
  await page.getByLabel("Sort by name").selectOption("desc");
  await expect(page.locator(".coverage-area-card h2").first()).toHaveText(
    "Area 10",
  );
  await page.getByRole("link", { name: "View Details" }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Area 10");
  await expect(
    page.getByRole("heading", { name: "Key information" }),
  ).toBeVisible();
});

test("theme persists, language switch survives, homepage has ten sections and real content", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await setSession(page, "GUEST");
  await page.goto("/en");
  await page.getByRole("button", { name: "Dark mode", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(
    page.locator("#main-content > .page-wrap > section"),
  ).toHaveCount(10);
  await expect(page.getByText("Sample review · Demo")).toHaveCount(0);
  await expect(
    page.locator('footer a[href="https://wa.me/8801865190471"]'),
  ).toBeVisible();
  await page.locator(".desktop-accounts .language-button").first().click();
  await expect(page).toHaveURL(/\/bn/);
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(
    page.getByRole("button", { name: "লাইট মোড", exact: true }),
  ).toBeVisible();
});

test("public service details and mobile hero remain usable", async ({
  page,
}) => {
  await setSession(page, "GUEST");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");
  const hero = await page.locator(".hero-panel").boundingBox();
  expect(hero!.height).toBeGreaterThanOrEqual(844 * 0.6 - 2);
  expect(hero!.height).toBeLessThanOrEqual(844 * 0.7 + 2);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.goto("/en/services/standard-delivery");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Standard Delivery",
  );
  await expect(
    page.getByRole("link", { name: "Calculate cost", exact: true }),
  ).toHaveAttribute("href", "/en/pricing");
});

test("AI fails clearly without configuration and rejects foreign origins", async ({
  request,
}) => {
  const invalid = await request.post("/api/ai", {
    headers: { Origin: "https://untrusted.example" },
    data: { mode: "support", locale: "en", question: "How do I book?" },
  });
  expect(invalid.status()).toBe(403);
  const bad = await request.post("/api/ai", {
    headers: { Origin: "http://localhost:3100" },
    data: { mode: "invalid", locale: "en" },
  });
  expect(bad.status()).toBe(400);
});
