import { test, expect, type Page } from "@playwright/test";
import { setSession } from "./support/session";
import { legalOperator } from "../src/content/legal";
const a = "11111111-1111-4111-8111-111111111111",
  b = "22222222-2222-4222-8222-222222222222";
const areas = [
  {
    id: a,
    name: "Dhanmondi",
    district: "Dhaka",
    upazila: "Dhaka",
    pickupEnabled: true,
    deliveryEnabled: true,
  },
  {
    id: b,
    name: "Mirpur",
    district: "Dhaka",
    upazila: "Dhaka",
    pickupEnabled: false,
    deliveryEnabled: true,
  },
];
async function fixture(page: Page) {
  await setSession(page, "GUEST");
  await page.route("**/api/backend/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/users/me") || path.endsWith("/auth/refresh-token"))
      return route.fulfill({ status: 401, json: { success: false } });
    const data = path.endsWith("/coverage")
      ? areas
      : path.endsWith("/quote")
        ? {
            deliveryCharge: "63.50",
            baseCharge: "63.50",
            extraWeightCharge: "0",
            pickupFee: "0",
            codFee: "0",
            merchantPayable: "0",
            deliveryDays: 2,
          }
        : [];
    return route.fulfill({ json: { success: true, data } });
  });
}
test("home uses actual coverage counts and current API quote; reviews stay labelled demo", async ({
  page,
}) => {
  await fixture(page);
  await page.goto("/en");
  await expect(page.locator(".home-network-card strong")).toHaveText([
    "1",
    "2",
    "1",
    "2",
  ]);
  await expect(page.locator(".home-example-amount strong")).toContainText(
    "63.50",
  );
  await expect(page.locator(".home-example-amount")).toContainText(
    "Dhanmondi → Mirpur",
  );
  await expect(page.locator(".sample-review-badge")).toHaveCount(3);
  for (const badge of await page.locator(".sample-review-badge").all())
    await expect(badge).toHaveText("Sample review · Demo");
  await expect(page.locator(".home-sample-reviews")).toContainText(
    "not verified customer reviews",
  );
  await expect(page.locator('input[name="trackingId"]')).toHaveAttribute(
    "placeholder",
    "TRK-12345",
  );
  await expect(page.locator('input[name="trackingId"]')).toHaveAttribute(
    "aria-describedby",
    /hint$/,
  );
});
test("slow service coverage keeps skeletons then offers retry without invented prices", async ({
  page,
}) => {
  await fixture(page);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let fail = true;
  await page.route("**/api/backend/operations/coverage", async (route) => {
    await gate;
    await route.fulfill(
      fail
        ? { status: 503, json: { success: false, message: "Unavailable" } }
        : { json: { success: true, data: areas } },
    );
  });
  await page.goto("/en/pricing");
  await expect(
    page.getByRole("heading", { name: "Calculate delivery cost", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".public-state-skeleton [data-slot=skeleton]"),
  ).toHaveCount(4);
  await expect(
    page.getByText("The server may be starting up", { exact: false }),
  ).toBeVisible({ timeout: 9000 });
  release();
  await expect(
    page.getByText("Service information could not be loaded.", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".quote-total")).toHaveCount(0);
  fail = false;
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(
    page.getByRole("combobox", { name: "Pickup area", exact: true }),
  ).toBeVisible();
});
for (const locale of ["en", "bn"]) {
  test(`coverage stat cards stay visible during cold start, failure and retry (${locale})`, async ({
    page,
  }, info) => {
    await fixture(page);
    await page.setViewportSize({
      width: locale === "bn" ? 360 : 1366,
      height: 900,
    });
    let release!: () => void;
    let gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    let fail = true;
    await page.route("**/api/backend/operations/coverage", async (route) => {
      await gate;
      await route.fulfill(
        fail
          ? { status: 503, json: { success: false } }
          : { json: { success: true, data: areas } },
      );
    });
    await page.goto(`/${locale}`);
    const stats = page.locator(".home-network-section");
    await expect(stats.locator(".home-network-card")).toHaveCount(4);
    await expect(
      stats.locator(".home-network-card [data-slot=skeleton]"),
    ).toHaveCount(4);
    await expect(stats.locator(".home-network-grid")).toHaveAttribute(
      "aria-busy",
      "true",
    );
    await expect(stats.locator(".tool-caption")).toContainText(
      locale === "bn" ? "সার্ভার চালু হতে সময়" : "The server may be starting up",
      { timeout: 9000 },
    );
    await stats.screenshot({
      path: info.outputPath(`stats-loading-${locale}.png`),
    });
    release();
    await expect(stats.getByRole("alert")).toBeVisible();
    await expect(stats.locator("strong > span[aria-hidden=true]")).toHaveText([
      "—",
      "—",
      "—",
      "—",
    ]);
    await expect(stats.locator("[data-slot=skeleton]")).toHaveCount(0);
    await stats.screenshot({
      path: info.outputPath(`stats-error-${locale}.png`),
    });
    fail = false;
    gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await stats
      .getByRole("button", {
        name: locale === "bn" ? "আবার চেষ্টা করুন" : "Try again",
        exact: true,
      })
      .click();
    await expect(
      stats.locator(".home-network-card [data-slot=skeleton]"),
    ).toHaveCount(4);
    await expect(stats.getByRole("button")).toHaveCount(0);
    release();
    await expect(stats.locator("strong")).toHaveText(
      locale === "bn" ? ["১", "২", "১", "২"] : ["1", "2", "1", "2"],
    );
    await expect(stats.locator(".public-data-state")).toHaveCount(0);
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      )
      .toBe(true);
  });
}
test("coverage timeout leaves stat labels, unavailable values and a retry action", async ({
  page,
}) => {
  await fixture(page);
  await page.route("**/api/backend/operations/coverage", () => {});
  await page.goto("/en");
  const stats = page.locator(".home-network-section");
  await expect(stats.getByRole("alert")).toBeVisible({ timeout: 20000 });
  await expect(stats.locator(".home-network-card")).toHaveCount(4);
  await expect(stats.locator("strong > span[aria-hidden=true]")).toHaveText([
    "—",
    "—",
    "—",
    "—",
  ]);
  await expect(
    stats.getByRole("button", { name: "Try again", exact: true }),
  ).toBeVisible();
});
test("invalid coverage payload cannot display invented zero counts", async ({
  page,
}) => {
  await fixture(page);
  await page.route("**/api/backend/operations/coverage", (route) =>
    route.fulfill({ json: { success: true, data: null } }),
  );
  await page.goto("/en");
  const stats = page.locator(".home-network-section");
  await expect(stats.getByRole("alert")).toBeVisible();
  await expect(stats.locator("strong > span[aria-hidden=true]")).toHaveText([
    "—",
    "—",
    "—",
    "—",
  ]);
});
test("empty approved coverage returns genuine zero counts", async ({
  page,
}) => {
  await fixture(page);
  await page.route("**/api/backend/operations/coverage", (route) =>
    route.fulfill({ json: { success: true, data: [] } }),
  );
  await page.goto("/en");
  await expect(page.locator(".home-network-card strong")).toHaveText([
    "0",
    "0",
    "0",
    "0",
  ]);
  await expect(
    page.locator(".home-network-section .public-data-state"),
  ).toHaveCount(0);
});
test("a failed refresh retains real cached counts with an explicit last-loaded notice", async ({
  page,
}) => {
  await fixture(page);
  await page.clock.install();
  await page.goto("/en");
  await expect(page.locator(".home-network-card strong")).toHaveText([
    "1",
    "2",
    "1",
    "2",
  ]);
  await page.clock.setFixedTime(new Date(Date.now() + 61000));
  await page.route("**/api/backend/operations/coverage", (route) =>
    route.fulfill({ status: 503, json: { success: false } }),
  );
  await page
    .locator(".home-network-section")
    .getByRole("link", { name: "View coverage", exact: true })
    .click();
  await expect(page.getByRole("alert").first()).toContainText(
    "Service information could not be loaded.",
  );
  await page.goBack();
  const stats = page.locator(".home-network-section");
  await expect(stats.getByRole("alert")).toBeVisible();
  await expect(stats.locator("strong")).toHaveText(["1", "2", "1", "2"]);
  await expect(stats.getByRole("status")).toContainText(
    "last successfully loaded coverage counts",
  );
});
test("footer contact actions use configured details and support is not listed as a service", async ({
  page,
}) => {
  await fixture(page);
  await page.goto("/en");
  const footer = page.locator("footer");
  await expect(footer.locator("address")).toContainText(legalOperator.address);
  await expect(
    footer.locator(`a[href="mailto:${legalOperator.contactEmail}"]`),
  ).toBeVisible();
  await expect(
    footer.locator(
      `a[href="tel:${legalOperator.contactPhone.replaceAll("-", "")}"]`,
    ),
  ).toBeVisible();
  await expect(
    footer.getByRole("navigation", { name: "Our Services", exact: true }),
  ).not.toContainText("Contact and delivery information");
  await expect(
    footer.getByRole("navigation", { name: "Legal & Support", exact: true }),
  ).toContainText("Contact and delivery information");
  await expect(footer.locator(".footer-delivery-art svg")).toHaveCount(1);
});
test("guest home booking CTA returns to booking after demo customer login", async ({
  page,
}) => {
  await fixture(page);
  let loggedIn = false;
  await page.route("**/api/backend/users/me", (route) =>
    route.fulfill({
      status: loggedIn ? 200 : 401,
      json: {
        success: loggedIn,
        data: loggedIn
          ? { id: a, name: "Customer", role: "CUSTOMER", status: "ACTIVE" }
          : null,
      },
    }),
  );
  await page.route("**/api/backend/auth/login", async (route) => {
    loggedIn = true;
    await setSession(page, "CUSTOMER");
    return route.fulfill({
      json: { success: true, data: { user: { role: "CUSTOMER" } } },
    });
  });
  await page.goto("/en");
  await page
    .locator('.hero-panel a[href="/en/dashboard/new-shipment"]')
    .click();
  await expect(page).toHaveURL(
    /\/en\/login\?next=%2Fdashboard%2Fnew-shipment$/,
  );
  await page.getByRole("button", { name: "User", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/dashboard\/new-shipment$/);
});
for (const locale of ["en", "bn"])
  for (const width of [360, 1366])
    test(`home reliability glass ${locale} at ${width}`, async ({
      page,
    }, info) => {
      await fixture(page);
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}`);
      await expect(page.locator(".home-network-card")).toHaveCount(4);
      await expect(page.locator(".home-example-amount strong")).toBeVisible();
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        )
        .toBe(true);
      await page.screenshot({
        path: info.outputPath(`home-${locale}-${width}.png`),
        fullPage: true,
      });
      await page
        .locator("footer")
        .screenshot({ path: info.outputPath(`footer-${locale}-${width}.png`) });
    });
