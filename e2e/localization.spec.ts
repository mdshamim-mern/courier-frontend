import { test, expect, type Page } from "@playwright/test";

const shipmentId = "11111111-1111-4111-8111-111111111111";
const shipment = {
  id: shipmentId,
  trackingId: "TRK-TEST1234",
  receiverName: "Test Receiver",
  receiverAddress: "Dhaka",
  createdAt: "2026-10-08T00:00:00.000Z",
  price: "120.00",
  status: "PICKED_UP",
  paymentStatus: "UNPAID",
  allowedNextStatuses: ["AT_ORIGIN_HUB"],
  trackings: [],
};

async function mockGuest(page: Page) {
  await page.route("**/api/backend/**", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ success: false }),
    }),
  );
}

async function mockRole(page: Page, role: string) {
  await page.route("**/api/backend/**", async (route) => {
    const path = new URL(route.request().url()).pathname.replace(
      "/api/backend",
      "",
    );
    const user = {
      id: "22222222-2222-4222-8222-222222222222",
      name: "Test User",
      email: "user@example.test",
      role,
      status: "ACTIVE",
      courier: { id: "33333333-3333-4333-8333-333333333333" },
    };
    const data =
      path === "/users/me"
        ? user
        : path === "/shipments/summary"
          ? {
              totalShipments: 251,
              activeShipments: 143,
              deliveredShipments: 108,
            }
          : path === "/admin/dashboard-stats"
            ? {
                totalCustomers: 20,
                totalCouriers: 4,
                totalShipments: 251,
                totalRevenue: 120,
                shipmentsByStatus: [],
              }
            : path.includes("history-earnings")
              ? {
                  totalEarnings: null,
                  completedDeliveries: 8,
                  performanceRate: 80,
                }
              : path === "/payments"
                ? [
                    {
                      id: shipmentId,
                      transactionId: "TEST-PAYMENT",
                      amount: "120.00",
                      paymentGateway: "STRIPE",
                      status: "PAID",
                      createdAt: shipment.createdAt,
                    },
                  ]
                : path.startsWith("/shipments/")
                  ? shipment
                  : [shipment];
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data,
        meta: { page: 1, total: 20, limit: 10, totalPages: 2 },
      }),
    });
  });
}

for (const locale of ["en", "bn"]) {
  for (const [route, title] of [
    ["terms", locale === "bn" ? "ব্যবহারের শর্তাবলী" : "Terms of Service"],
    ["privacy", locale === "bn" ? "গোপনীয়তার নীতি" : "Privacy Policy"],
    ["cookies", locale === "bn" ? "কুকির নীতি" : "Cookie Policy"],
  ]) {
    test(
      locale +
        " " +
        route +
        " is a clearly marked legal draft with editable placeholders",
      async ({ page }) => {
        await mockGuest(page);
        await page.goto("/" + locale + "/" + route);
        await expect(
          page.getByRole("heading", { name: title, exact: true }),
        ).toBeVisible();
        await expect(page.getByRole("note")).toContainText(
          locale === "bn"
            ? "খসড়া — চূড়ান্ত আইনি নথি নয়"
            : "Draft — not a final legal document",
        );
        for (const placeholder of [
          "[Company Name]",
          "[Contact Email]",
          "[Address]",
          "[Effective Date]",
        ])
          await expect(page.locator("article")).toContainText(placeholder);
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
          "content",
          /noindex/,
        );
        await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
      },
    );
  }

  test(
    locale + " footer links resolve and service anchors exist",
    async ({ page }) => {
      await mockGuest(page);
      await page.goto("/" + locale);
      await expect(page.locator("footer")).toBeVisible();
      const links = await page
        .locator("footer a")
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute("href") || ""),
        );
      expect(links.length).toBeGreaterThan(10);
      for (const href of [...new Set(links)]) {
        expect(href).not.toBe("#");
        expect(href).toMatch(new RegExp("^/" + locale + "(?:/|#|$)"));
        const url = new URL(href, page.url());
        const response = await page.request.get(url.toString());
        expect(response.status(), href).toBe(200);
        if (url.hash)
          expect(await response.text(), href).toContain(
            'id="' + url.hash.slice(1) + '"',
          );
      }
    },
  );
}

for (const route of [
  "",
  "/about",
  "/services",
  "/contact",
  "/faq",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password?email=user@example.test",
  "/verify-account?email=user@example.test",
]) {
  test(
    "Bengali public content contains no untranslated English UI: " +
      (route || "home"),
    async ({ page }) => {
      await mockGuest(page);
      await page.goto("/bn" + route);
      await expect(page.locator("html")).toHaveAttribute("lang", "bn");
      const text = (await page.locator("main").first().innerText())
        .replace(/\[[^\]]+\]/g, "")
        .replace(/user@example\.test|Dropzo|Google|Stripe|bKash/g, "");
      expect(text).not.toMatch(/[A-Za-z]{2,}/);
    },
  );
}

test("Bengali customer totals, parcel status, prices, dates and pagination are localized", async ({
  page,
}) => {
  await mockRole(page, "CUSTOMER");
  await page.goto("/bn/dashboard");
  await expect(page.getByText("২৫১", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "আমার পার্সেলসমূহ", exact: true }),
  ).toBeVisible();
  await page.goto("/bn/dashboard/my-shipments");
  await expect(
    page.getByRole("cell", { name: "সংগ্রহ করা হয়েছে অপরিশোধিত", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("অপরিশোধিত", { exact: true })).toBeVisible();
  await expect(page.getByText("৳১২০.০০", { exact: true })).toBeVisible();
  await expect(page.getByText(/২০২৬/).first()).toBeVisible();
  await expect(page.getByLabel("পরের পাতায় যান")).toBeVisible();
});

test("Bengali administrator overview and sidebar are localized", async ({
  page,
}) => {
  await mockRole(page, "ADMIN");
  await page.goto("/bn/admin");
  await expect(
    page.getByRole("heading", { name: "প্রশাসকের ড্যাশবোর্ড" }),
  ).toBeVisible();
  await expect(page.getByText("মোট আদায়", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "ব্যবহারকারী ব্যবস্থাপনা", exact: true }),
  ).toBeVisible();
});

test("Bengali courier actions are localized without changing API status values", async ({
  page,
}) => {
  await mockRole(page, "COURIER");
  await page.route(
    "**/api/backend/shipments/" + shipmentId + "/status",
    async (route) => {
      expect(route.request().postDataJSON()).toEqual({
        status: "AT_ORIGIN_HUB",
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { ...shipment, status: "AT_ORIGIN_HUB" },
        }),
      });
    },
  );
  await page.goto("/bn/courier/deliveries");
  await page
    .getByRole("button", { name: "প্রেরণ হাবে এসেছে", exact: true })
    .click();
  await expect(
    page.getByText("অবস্থা হালনাগাদ হয়েছে", { exact: true }),
  ).toBeVisible();
});

test("Bengali payment status and monetary amounts are localized", async ({
  page,
}) => {
  await mockRole(page, "CUSTOMER");
  await page.goto("/bn/dashboard/payments");
  await expect(
    page.getByRole("heading", { name: "অর্থপ্রদানের ইতিহাস" }),
  ).toBeVisible();
  await expect(page.getByText("পরিশোধিত", { exact: true })).toBeVisible();
  await expect(page.getByText("৳১২০.০০", { exact: true })).toBeVisible();
});

test("Bengali login validation is localized", async ({ page }) => {
  await mockGuest(page);
  await page.goto("/bn/login");
  await page
    .getByRole("textbox", { name: "ইমেইল ঠিকানা" })
    .fill("user@example.test");
  await page.locator("#password").fill("a");
  await page.locator("#password").fill("");
  await page
    .locator("form")
    .getByRole("button", { name: "প্রবেশ করুন", exact: true })
    .click();
  await expect(page.locator('[data-slot="field-error"]')).toContainText(
    "পাসওয়ার্ড দিন",
  );
});

test("Bengali errors and notifications are localized", async ({ page }) => {
  await mockGuest(page);
  await page.route("**/api/backend/auth/login", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ success: false, message: "Provider unavailable" }),
    }),
  );
  await page.goto("/bn/login");
  await page
    .getByRole("textbox", { name: "ইমেইল ঠিকানা" })
    .fill("user@example.test");
  await page.locator("#password").fill("Valid@12345");
  await page
    .locator("form")
    .getByRole("button", { name: "প্রবেশ করুন", exact: true })
    .click();
  await expect(
    page.getByText("পরিচয় যাচাই ব্যর্থ হয়েছে", { exact: true }),
  ).toBeVisible();
  await expect(
    page.locator('[data-slot="toast-description"]'),
  ).not.toContainText(/[A-Za-z]{2,}/);
});

test("language switching keeps reset-password query parameters", async ({
  page,
}) => {
  await mockGuest(page);
  await page.goto("/en/reset-password?email=user%40example.test");
  await page.getByRole("button", { name: "বাংলায় দেখুন", exact: true }).click();
  await expect(page).toHaveURL(
    /\/bn\/reset-password\?email=user%40example\.test$/,
  );
  await expect(
    page.getByRole("heading", { name: "পাসওয়ার্ড বদলান", exact: true }),
  ).toBeVisible();
  await expect(page.locator("main").first()).toContainText("user@example.test");
});

test("Bengali audit action captions are localized while raw event details stay intact", async ({ page }) => {
  await mockRole(page, "ADMIN");
  await page.route("**/api/backend/audit-logs*", route => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      success: true,
      data: [{ id: "event", action: "CREATE_SHIPMENT", entityType: "SHIPMENT", entityId: shipmentId, createdAt: shipment.createdAt, details: { status: "PENDING" } }],
      meta: { page: 1, total: 1, limit: 10, totalPages: 1 },
    }),
  }));
  await page.goto("/bn/admin/audit-logs");
  await expect(page.getByText("পার্সেলের অনুরোধ তৈরি", { exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "পার্সেল", exact: true })).toBeVisible();
  await expect(page.getByText('{"status":"PENDING"}', { exact: true })).toBeVisible();
});
