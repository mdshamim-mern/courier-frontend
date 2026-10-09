import { test, expect, type Page } from "@playwright/test";
const areaId = "22222222-2222-4222-8222-222222222222";
async function setup(page: Page, role = "GUEST") {
  await page.route("**/api/backend/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/users/me"))
      return route.fulfill({
        status: role === "GUEST" ? 401 : 200,
        json: {
          success: role !== "GUEST",
          data:
            role === "GUEST"
              ? undefined
              : {
                  id: areaId,
                  name: "Test Customer",
                  email: "test@example.test",
                  role,
                  status: "ACTIVE",
                },
        },
      });
    const data = path.endsWith("/operations/coverage")
      ? [
          {
            id: areaId,
            name: "মিরপুর",
            district: "ঢাকা",
            upazila: "ঢাকা মহানগর",
            pickupEnabled: true,
            dropoffEnabled: true,
            deliveryEnabled: true,
          },
        ]
      : path.includes("/stats")
        ? {
            total: 0,
            delivered: 0,
            pending: 0,
            totalSpent: 0,
            totalEarnings: 0,
          }
        : [];
    return route.fulfill({
      json: {
        success: true,
        data,
        meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
      },
    });
  });
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
for (const locale of ["en", "bn"]) {
  for (const width of [1280, 1366, 1440]) {
    test(`desktop ${locale} navigation stays in one row at ${width}px`, async ({
      page,
    }) => {
      await setup(page, "CUSTOMER");
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/" + locale);
      await expect(
        page.locator(".desktop-accounts").getByRole("button").last(),
      ).toBeVisible();
      const boxes = await page
        .locator(".header-row > .brand-lockup, .desktop-nav, .desktop-accounts")
        .evaluateAll((elements) =>
          elements.map((e) => {
            const r = e.getBoundingClientRect();
            return {
              top: r.top,
              bottom: r.bottom,
              left: r.left,
              right: r.right,
            };
          }),
        );
      expect(boxes).toHaveLength(3);
      expect(Math.max(...boxes.map((b) => b.top))).toBeLessThan(
        Math.min(...boxes.map((b) => b.bottom)),
      );
      expect(boxes[0].right).toBeLessThanOrEqual(boxes[1].left);
      expect(boxes[1].right).toBeLessThanOrEqual(boxes[2].left);
      await noOverflow(page);
    });
  }
  test(`localized coverage and booking retain area IDs in ${locale}`, async ({
    page,
  }) => {
    await setup(page, "CUSTOMER");
    await page.goto("/" + locale + "/coverage");
    const display = locale === "en" ? "Mirpur" : "মিরপুর";
    await expect(
      page.getByRole("heading", { name: display, exact: true }),
    ).toBeVisible();
    const search = page.getByRole("searchbox");
    await search.fill(locale === "en" ? "মিরপুর" : "Mirpur");
    await expect(
      page.getByRole("heading", { name: display, exact: true }),
    ).toBeVisible();
    await expect(
      page
        .locator("select")
        .first()
        .locator('option[value="' + areaId + '"]'),
    ).toContainText(display);
    await page.goto("/" + locale + "/dashboard/new-shipment");
    await expect(
      page
        .locator("select")
        .first()
        .locator('option[value="' + areaId + '"]'),
    ).toContainText(display);
  });
}
for (const width of [360, 390, 768, 1024]) {
  test(`responsive public pages and mobile menu at ${width}px`, async ({
    page,
  }) => {
    await setup(page);
    await page.setViewportSize({ width, height: 844 });
    for (const path of [
      "/en",
      "/en/about",
      "/en/contact",
      "/en/coverage",
      "/bn",
    ]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      await noOverflow(page);
    }
    await page.locator(".mobile-menu summary").click();
    await expect(page.locator(".mobile-dropdown")).toBeVisible();
    await page.locator('.mobile-dropdown a[href="/bn/coverage"]').click();
    await expect(page).toHaveURL(/\/bn\/coverage/);
    await expect(page.locator(".mobile-menu")).not.toHaveAttribute("open");
    await noOverflow(page);
  });
}
test("desktop dashboard sidebar clears header and footer and supports collapse", async ({
  page,
}) => {
  await setup(page, "CUSTOMER");
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto("/en/dashboard/new-shipment");
  const sidebar = page.locator('[data-slot="sidebar"][data-state]');
  await expect(
    sidebar.getByRole("link", { name: "Overview", exact: true }),
  ).toBeVisible();
  const header = await page.locator(".site-header").boundingBox();
  const overview = await sidebar
    .getByRole("link", { name: "Overview", exact: true })
    .boundingBox();
  expect(overview!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
  await page.locator("footer").scrollIntoViewIfNeeded();
  const side = await sidebar.boundingBox(),
    footer = await page.locator("footer").boundingBox();
  expect(side!.y + side!.height).toBeLessThanOrEqual(footer!.y + 1);
  await page.locator('[data-slot="sidebar-trigger"]').click();
  await expect(sidebar).toHaveAttribute("data-state", "collapsed");
  await expect.poll(async () => (await sidebar.boundingBox())?.width).toBe(0);
  await page.locator('[data-slot="sidebar-trigger"]').click();
  await expect(sidebar).toHaveAttribute("data-state", "expanded");
  await noOverflow(page);
});
test("mobile dashboard opens an accessible sidebar drawer", async ({
  page,
}) => {
  await setup(page, "CUSTOMER");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/dashboard/new-shipment");
  await page.locator('[data-slot="sidebar-trigger"]').click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("link", { name: "Overview", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await noOverflow(page);
});
test("purple branding and glass cards render across key pages", async ({
  page,
}, testInfo) => {
  await setup(page, "CUSTOMER");
  for (const [path, width, name] of [
    ["/en", 1366, "home-desktop"],
    ["/bn", 390, "home-mobile"],
    ["/en/about", 1366, "about-desktop"],
    ["/en/contact", 390, "contact-mobile"],
    ["/en/coverage", 1366, "coverage-desktop"],
    ["/en/dashboard/new-shipment", 1366, "dashboard-desktop"],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    await expect(page.locator("h1,h2").first()).toBeVisible();
    if (path.endsWith("coverage"))
      await expect(
        page.getByRole("heading", { name: "Mirpur", exact: true }),
      ).toBeVisible();
    await expect(page.locator(".site-header")).toBeVisible();
    expect(
      await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--primary")
          .trim(),
      ),
    ).toBe("#7135b8");
    await noOverflow(page);
    await page.screenshot({
      path: testInfo.outputPath(name + ".png"),
      fullPage: true,
      animations: "disabled",
    });
  }
});

for (const [role, path] of [
  ["CUSTOMER", "/dashboard"],
  ["ADMIN", "/admin"],
  ["COURIER", "/courier"],
] as const) {
  test(
    role + " dashboard keeps its overview and footer separated",
    async ({ page }) => {
      await setup(page, role);
      await page.setViewportSize({ width: 1366, height: 900 });
      await page.goto("/en" + path);
      const sidebar = page.locator('[data-slot="sidebar"][data-state]');
      const overview = sidebar.getByRole("link", {
        name: "Overview",
        exact: true,
      });
      await expect(overview).toBeVisible();
      const header = await page.locator(".site-header").boundingBox(),
        item = await overview.boundingBox();
      expect(item!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
      await page.locator("footer").scrollIntoViewIfNeeded();
      const side = await sidebar.boundingBox(),
        footer = await page.locator("footer").boundingBox();
      expect(side!.y + side!.height).toBeLessThanOrEqual(footer!.y + 1);
      await noOverflow(page);
    },
  );
}
test("Bengali coverage localizes English records and preserves unfamiliar area names", async ({
  page,
}) => {
  await setup(page);
  await page.route("**/api/backend/operations/coverage", (route) =>
    route.fulfill({
      json: {
        success: true,
        data: [
          {
            id: areaId,
            name: "Uttara",
            district: "Dhaka",
            upazila: "Dhaka Metropolitan",
            pickupEnabled: true,
            deliveryEnabled: true,
          },
          {
            id: "unknown-area",
            name: "New locality",
            district: "New district",
            upazila: "New upazila",
            pickupEnabled: true,
            deliveryEnabled: true,
          },
        ],
      },
    }),
  );
  await page.goto("/bn/coverage");
  await expect(
    page.getByRole("heading", { name: "উত্তরা", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "New locality", exact: true }),
  ).toBeVisible();
  await page.getByRole("searchbox").fill("Uttara");
  await expect(
    page.getByRole("heading", { name: "উত্তরা", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "New locality", exact: true }),
  ).not.toBeVisible();
});
