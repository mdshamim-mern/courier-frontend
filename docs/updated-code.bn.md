# পরিবর্তিত কোড: সম্পূর্ণ পথসহ

মূল কাঠামো রেখে সংশোধিত ফাইলের বর্তমান কোড নিচে আছে। প্রতিটি কোডের আগে সম্পূর্ণ স্থানীয় পথ দেওয়া হয়েছে। বাস্তব শংসাপত্রের ফাইল অন্তর্ভুক্ত করা হয়নি। যেগুলোতে কার্যকর পরিবর্তনের বদলে টাইপের আমদানি, ভাষা-সচেতন লিংক বা প্রবেশযোগ্যতার সংশোধন হয়েছে, সেগুলোও অন্তর্ভুক্ত।

মোট কোড ফাইল: 128।

অন্যান্য পরিবর্তিত ফাইল:

- [.gitignore](D:/NEXT_LEVEL_WEB_DEV/assignment/courier-frontend/.gitignore)
- [next-env.d.ts](D:/NEXT_LEVEL_WEB_DEV/assignment/courier-frontend/next-env.d.ts)
- [package-lock.json](D:/NEXT_LEVEL_WEB_DEV/assignment/courier-frontend/package-lock.json)

লকফাইল, গিটের উপেক্ষার নিয়ম এবং নেক্সটের তৈরি ঘোষণা উপরে মূল ফাইলের লিংকে আছে। স্বয়ংক্রিয়ভাবে তৈরি AGENTS.md ও CLAUDE.md এবং আপনার অব্যবহৃত খালি ফাইল এই কোড-তালিকার অংশ নয়। চালানোর নিয়ম, পরীক্ষা ও প্রকাশের আগে বাকি কাজ production-readiness.bn.md নথিতে আছে।



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\.env.example

```dotenv
API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_ENABLE_DEMO_LOGIN=false
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\.github\workflows\ci.yml

```yaml
name: frontend-checks
on:
  push:
  pull_request:
permissions:
  contents: read
jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run build
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: browser-test-results
          path: test-results
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\e2e\critical-flows.spec.ts

```ts
import { test, expect, type Page } from "@playwright/test";

const shipmentId = "11111111-1111-4111-8111-111111111111";
const user = {
  id: "22222222-2222-4222-8222-222222222222",
  name: "Test Customer",
  email: "customer@example.test",
  role: "CUSTOMER",
  status: "ACTIVE",
  courier: { id: "33333333-3333-4333-8333-333333333333" },
};
const shipment = {
  id: shipmentId,
  trackingId: "TRK-TEST1234",
  receiverName: "Receiver",
  receiverAddress: "Dhaka",
  createdAt: "2026-10-08T00:00:00.000Z",
  price: "120.00",
  status: "PICKED_UP",
  paymentStatus: "UNPAID",
  allowedNextStatuses: ["AT_ORIGIN_HUB"],
  trackings: [],
};

async function mockApi(
  page: Page,
  handler: (path: string) => { status?: number; data?: unknown },
) {
  await page.route("**/api/backend/**", async (route) => {
    const path = new URL(route.request().url()).pathname.replace(
      "/api/backend",
      "",
    );
    const response = handler(path);
    await route.fulfill({
      status: response.status || 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: (response.status || 200) < 400,
        data: response.data,
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      }),
    });
  });
}

test("public tracking returns a timeline without receiver details", async ({
  page,
}) => {
  await mockApi(page, (path) =>
    path.startsWith("/shipments/track/")
      ? {
          data: {
            trackingId: shipment.trackingId,
            status: "PICKED_UP",
            trackings: [
              {
                id: "event",
                status: "PICKED_UP",
                createdAt: shipment.createdAt,
              },
            ],
          },
        }
      : { status: 401 },
  );
  await page.goto("/en/track-shipment");
  await page
    .getByRole("textbox", { name: "Tracking ID" })
    .fill(shipment.trackingId);
  await page.getByRole("button", { name: "Track", exact: true }).click();
  await expect(page.getByText("PICKED UP", { exact: true })).toBeVisible();
  await expect(page.getByText("Receiver", { exact: true })).toHaveCount(0);
});

test("login preserves Bengali locale and routes verified administrators correctly", async ({
  page,
}) => {
  let loggedIn = false;
  await mockApi(page, (path) => {
    if (path === "/auth/login") {
      loggedIn = true;
      return { data: { user: { ...user, role: "ADMIN" }, role: "ADMIN" } };
    }
    if (path === "/users/me")
      return loggedIn ? { data: { ...user, role: "ADMIN" } } : { status: 401 };
    if (path === "/admin/dashboard-stats")
      return {
        data: {
          totalCustomers: 0,
          totalCouriers: 0,
          totalShipments: 0,
          totalRevenue: 0,
          shipmentsByStatus: [],
        },
      };
    return { status: 401 };
  });
  await page.goto("/bn/login");
  await page
    .getByRole("textbox", { name: "ইমেইল ঠিকানা" })
    .fill("admin@example.test");
  await page.locator("#password").fill("Valid@12345");
  await page
    .locator("form")
    .getByRole("button", { name: "প্রবেশ করুন", exact: true })
    .click();
  await expect(page).toHaveURL(/\/bn\/admin$/);
});

test("a service outage offers retry without logging the customer out", async ({
  page,
}) => {
  await mockApi(page, () => ({ status: 503 }));
  await page.goto("/en/dashboard");
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  await expect(page).toHaveURL(/\/en\/dashboard$/);
});

test("visiting the payment success URL cannot fake a successful payment", async ({
  page,
}) => {
  await mockApi(page, (path) =>
    path === "/users/me" ? { data: user } : { data: shipment },
  );
  await page.goto("/en/payment/success?shipmentId=" + shipmentId);
  await expect(
    page.getByRole("heading", { name: "Payment Not Yet Confirmed" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Payment Confirmed", exact: true }),
  ).toHaveCount(0);
});

test("courier actions use server-approved hub steps", async ({ page }) => {
  await mockApi(page, (path) =>
    path === "/users/me"
      ? { data: { ...user, role: "COURIER" } }
      : { data: [shipment] },
  );
  await page.goto("/en/courier/deliveries");
  await expect(
    page.getByRole("button", { name: "Arrived at Origin Hub" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Start Hub Transfer" }),
  ).toHaveCount(0);
});

test("payment initiation sends shipmentId to the API", async ({ page }) => {
  await mockApi(page, (path) =>
    path === "/users/me" ? { data: user } : { data: [shipment] },
  );
  await page.route("**/api/backend/payments/initiate", async (route) => {
    expect(route.request().postDataJSON()).toEqual({ shipmentId });
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ success: false, message: "Provider unavailable" }),
    });
  });
  await page.goto("/en/dashboard/my-shipments");
  await page.getByRole("button", { name: "Pay Now" }).click();
  await expect(
    page.getByText("Provider unavailable", { exact: true }),
  ).toBeVisible();
});

test("customer overview uses full server totals rather than one page", async ({
  page,
}) => {
  await mockApi(page, (path) =>
    path === "/users/me"
      ? { data: user }
      : path === "/shipments/summary"
        ? {
            data: {
              totalShipments: 251,
              activeShipments: 143,
              deliveredShipments: 108,
            },
          }
        : { data: [shipment] },
  );
  await page.goto("/en/dashboard");
  for (const total of ["251", "143", "108"])
    await expect(page.getByText(total, { exact: true })).toBeVisible();
});

test("payment recheck calls the provider reconciliation endpoint", async ({
  page,
}) => {
  await mockApi(page, (path) =>
    path === "/users/me" ? { data: user } : { data: shipment },
  );
  await page.route("**/api/backend/payments/reconcile", async (route) => {
    expect(route.request().postDataJSON()).toEqual({ shipmentId });
    await route.fulfill({
      status: 409,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        message: "Payment pending provider verification",
      }),
    });
  });
  await page.goto("/en/payment/success?shipmentId=" + shipmentId);
  await page.getByRole("button", { name: "Check again" }).click();
  await expect(
    page.getByText("Payment pending provider verification", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Payment Confirmed", exact: true }),
  ).toHaveCount(0);
});
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\e2e\localization.spec.ts

```ts
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
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\messages\bn.json

```json
{
  "HomePage": {
    "title": "ড্রপজোতে স্বাগতম",
    "description": "সারাদেশে আপনার প্যাকেজ পৌঁছে দেওয়ার সবচেয়ে দ্রুত ও বিশ্বস্ত মাধ্যম। আপনার পার্সেল ম্যানেজ করুন, ট্র্যাক করুন এবং আরও অনেক কিছু।",
    "login": "প্রবেশ করুন",
    "register": "অ্যাকাউন্ট তৈরি করুন"
  },
  "Header": {
    "services": "সেবাসমূহ",
    "about": "আমাদের সম্পর্কে",
    "contact": "যোগাযোগ",
    "track": "পার্সেল ট্র্যাক করুন",
    "login": "প্রবেশ করুন",
    "register": "নিবন্ধন করুন",
    "dashboard": "ড্যাশবোর্ড",
    "logout": "বের হন",
    "loggingOut": "বের হওয়া হচ্ছে...",
    "menu": "মেনু",
    "language": "ভাষা: ",
    "switchLanguage": "ইংরেজিতে দেখুন"
  }
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\messages\en.json

```json
{
  "HomePage": {
    "title": "Welcome to Dropzo",
    "description": "The fastest and most reliable way to deliver your packages across the country. Manage your shipments, track deliveries, and more.",
    "login": "Login Now",
    "register": "Create Account"
  },
  "Header": {
    "services": "Services",
    "about": "About",
    "contact": "Contact",
    "track": "Track Shipment",
    "login": "Login",
    "register": "Sign Up",
    "dashboard": "Dashboard",
    "logout": "Logout",
    "loggingOut": "Logging out...",
    "menu": "Menu",
    "language": "Language: ",
    "switchLanguage": "বাংলায় দেখুন"
  }
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\messages\ui.bn.json

```json
{
  "OTP Sent": "এককালীন সংকেত পাঠানো হয়েছে",
  "Check your email for the reset instructions.": "পাসওয়ার্ড বদলানোর নির্দেশনার জন্য আপনার ইমেইল দেখুন।",
  "Request Failed": "অনুরোধ ব্যর্থ হয়েছে",
  "Forgot Password": "পাসওয়ার্ড ভুলে গেছেন",
  "Enter your email address and we will send you a code to reset your password.": "আপনার ইমেইল লিখুন। পাসওয়ার্ড বদলানোর সংকেত সেখানে পাঠানো হবে।",
  "Email Address": "ইমেইল ঠিকানা",
  "Sending OTP...": "এককালীন সংকেত পাঠানো হচ্ছে...",
  "Send Reset OTP": "পাসওয়ার্ড বদলানোর সংকেত পাঠান",
  "Remember your password?": "পাসওয়ার্ড মনে পড়েছে?",
  "Back to Login": "প্রবেশের পাতায় ফিরুন",
  "Password Reset": "পাসওয়ার্ড বদলানো হয়েছে",
  "Your password has been successfully reset. Please login.": "পাসওয়ার্ড সফলভাবে বদলানো হয়েছে। এখন প্রবেশ করুন।",
  "Reset Failed": "পাসওয়ার্ড বদলানো যায়নি",
  "Reset Password": "পাসওয়ার্ড বদলান",
  "Enter the 6-digit OTP sent to": "৬ সংখ্যার এককালীন সংকেতটি লিখুন, যা পাঠানো হয়েছে",
  "and your new password.": "এবং নতুন পাসওয়ার্ড দিন।",
  "OTP Code": "এককালীন সংকেত",
  "New Password": "নতুন পাসওয়ার্ড",
  "Resetting...": "পাসওয়ার্ড বদলানো হচ্ছে...",
  "About Courier": "ড্রপজো সম্পর্কে",
  "Delivering trust and reliability across every mile. We are dedicated to providing seamless logistics solutions for businesses and individuals alike.": "প্রতিটি পথেই আস্থা ও নির্ভরযোগ্যতা। ব্যক্তি ও প্রতিষ্ঠানের জন্য সহজ পরিবহনসেবা দিতে আমরা প্রতিশ্রুতিবদ্ধ।",
  "Our Mission": "আমাদের লক্ষ্য",
  "At Dropzo, our mission is to simplify the delivery process through innovative technology and a dedicated network of professionals. We aim to ensure that every parcel, no matter how small or large, reaches its destination safely, securely, and on time.": "প্রযুক্তি ও দক্ষ কর্মীদের মাধ্যমে পার্সেল পৌঁছানোর প্রক্রিয়া সহজ করাই ড্রপজোর লক্ষ্য। ছোট-বড় সব পার্সেল নিরাপদে ও সময়মতো গন্তব্যে পৌঁছানোর জন্য আমরা কাজ করি।",
  "Our Vision": "আমাদের স্বপ্ন",
  "We envision a future where logistics barriers are completely eliminated, making commerce more accessible for everyone. By expanding our hub networks and integrating real-time AI-driven tracking, we strive to become the most trusted logistics partner in the region.": "হাবের বিস্তৃত নেটওয়ার্ক ও পার্সেলের হালনাগাদ তথ্যের মাধ্যমে সবার জন্য পণ্য আদান-প্রদান সহজ করতে চাই। অঞ্চলের বিশ্বস্ত পরিবহন সহযোগী হয়ে ওঠাই আমাদের স্বপ্ন।",
  "Why Choose Us?": "কেন আমাদের বেছে নেবেন?",
  "Fast & Secure": "দ্রুত ও নিরাপদ",
  "Industry-leading delivery speeds with guaranteed item security.": "পার্সেল নিরাপদে ও দ্রুত পৌঁছানোর জন্য যত্নশীল ব্যবস্থাপনা।",
  "Real-time Tracking": "হালনাগাদ পার্সেল অনুসরণ",
  "Monitor your shipments at every step of the journey.": "যাত্রার প্রতিটি ধাপে আপনার পার্সেলের খবর রাখুন।",
  "24/7 Support": "সহায়তা",
  "Dedicated customer service team ready to assist you anytime.": "সহায়তার জন্য আমাদের গ্রাহকসেবা দলের সঙ্গে যোগাযোগ করুন।",
  "All Shipments": "সব পার্সেল",
  "Monitor all active and completed shipments across the platform.": "চলমান ও সম্পন্ন সব পার্সেলের অবস্থা দেখুন।",
  "Search by tracking ID or receiver name...": "অনুসন্ধানসংখ্যা বা প্রাপকের নাম দিয়ে খুঁজুন...",
  "Tracking ID": "পার্সেলের অনুসন্ধানসংখ্যা",
  "Date": "তারিখ",
  "Customer": "গ্রাহক",
  "Receiver": "প্রাপক",
  "Hubs": "হাবসমূহ",
  "Status": "অবস্থা",
  "Actions": "করণীয়",
  "No shipments found.": "কোনো পার্সেল পাওয়া যায়নি।",
  "From:": "প্রেরণ:",
  "To:": "গন্তব্য:",
  "Assign Courier": "বাহক নিয়োগ করুন",
  "View Details": "বিস্তারিত দেখুন",
  "System Audit Logs": "ব্যবস্থার কার্যক্রমের নথি",
  "View system-wide automated logs, tracking history, and payment events.": "স্বয়ংক্রিয় কার্যক্রমের নথি, পার্সেলের ইতিহাস ও অর্থপ্রদানের ঘটনা দেখুন।",
  "Date & Time": "তারিখ ও সময়",
  "Action": "কার্যক্রম",
  "Entity Type": "তথ্যের ধরন",
  "Entity ID": "তথ্যের পরিচয়সংখ্যা",
  "Details": "বিস্তারিত",
  "No logs found.": "কোনো নথি পাওয়া যায়নি।",
  "Hub Management": "হাব ব্যবস্থাপনা",
  "Manage origin and destination hubs for routing shipments.": "পার্সেলের প্রেরণ ও গন্তব্য হাব পরিচালনা করুন।",
  "Add Hub": "হাব যোগ করুন",
  "Search hubs...": "হাব খুঁজুন...",
  "Hub Name": "হাবের নাম",
  "Location": "অবস্থান",
  "Detailed Address": "বিস্তারিত ঠিকানা",
  "Created At": "তৈরির তারিখ",
  "No hubs found.": "কোনো হাব পাওয়া যায়নি।",
  "Edit": "সম্পাদনা করুন",
  "Delete": "মুছুন",
  "Loading dashboard data...": "ড্যাশবোর্ডের তথ্য আনা হচ্ছে...",
  "Manage Couriers": "বাহক ব্যবস্থাপনা",
  "Manage delivery personnel, check availability, and view assigned hubs.": "বাহকদের পরিচালনা করুন, কাজের জন্য প্রস্তুতি ও নির্ধারিত হাব দেখুন।",
  "Add Courier": "বাহক যোগ করুন",
  "Search couriers...": "বাহক খুঁজুন...",
  "Name": "নাম",
  "Email & Phone": "ইমেইল ও ফোন",
  "Vehicle": "যানবাহন",
  "Availability": "কাজের জন্য প্রস্তুতি",
  "Joined": "যোগদানের তারিখ",
  "No couriers found.": "কোনো বাহক পাওয়া যায়নি।",
  "N/A": "প্রযোজ্য নয়",
  "Unknown": "অজানা",
  "Available": "প্রস্তুত",
  "Unavailable": "প্রস্তুত নন",
  "View": "দেখুন",
  "Manage Users": "ব্যবহারকারী ব্যবস্থাপনা",
  "View, filter, and modify user roles and account statuses across the platform.": "ব্যবহারকারীর তালিকা দেখুন, খুঁজুন এবং ভূমিকা ও অ্যাকাউন্টের অবস্থা পরিবর্তন করুন।",
  "Admin Dashboard": "প্রশাসকের ড্যাশবোর্ড",
  "Overview of platform statistics and recent activities.": "সার্বিক পরিসংখ্যান ও সাম্প্রতিক কার্যক্রমের সারসংক্ষেপ।",
  "Contact Us": "যোগাযোগ করুন",
  "Have a question or need assistance? We are here to help you every step of the way.": "কোনো প্রশ্ন বা সহায়তা দরকার? যোগাযোগের তথ্য পূরণ করা হলে আমাদের সঙ্গে যোগাযোগ করতে পারবেন।",
  "Head Office": "প্রধান কার্যালয়",
  "Contact Details": "যোগাযোগের তথ্য",
  "Business Hours": "কর্মসময়",
  "First Name": "নামের প্রথম অংশ",
  "Last Name": "নামের শেষ অংশ",
  "Subject": "বিষয়",
  "Message": "বার্তা",
  "How can we help?": "কীভাবে সহায়তা করতে পারি?",
  "Write your message here...": "এখানে আপনার বার্তা লিখুন...",
  "Send Message": "বার্তা পাঠান",
  "My Deliveries": "আমার সরবরাহের কাজ",
  "Manage your assigned shipments and update delivery statuses.": "আপনার জন্য নির্ধারিত পার্সেল পরিচালনা করুন এবং সরবরাহের অবস্থা হালনাগাদ করুন।",
  "Earnings & History": "আয় ও কাজের ইতিহাস",
  "View your total earnings and delivery performance over time.": "আপনার মোট আয় ও সরবরাহের কাজের অগ্রগতি দেখুন।",
  "Total Earnings": "মোট আয়",
  "Completed Deliveries": "সম্পন্ন সরবরাহ",
  "Performance Rate": "সফলতার হার",
  "Compensation needs configuration": "পারিশ্রমিকের নিয়ম নির্ধারণ করা প্রয়োজন",
  "Loading courier dashboard...": "বাহকের ড্যাশবোর্ড আনা হচ্ছে...",
  "Courier Dashboard": "বাহকের ড্যাশবোর্ড",
  "Overview of your deliveries and earnings.": "আপনার সরবরাহ ও আয়ের সারসংক্ষেপ।",
  "Profile Updated": "ব্যক্তিগত তথ্য হালনাগাদ হয়েছে",
  "Update Failed": "হালনাগাদ করা যায়নি",
  "My Profile": "আমার ব্যক্তিগত তথ্য",
  "Manage your personal courier profile and settings.": "আপনার ব্যক্তিগত তথ্য ও বাহকের সেটিংস পরিচালনা করুন।",
  "Profile Details": "ব্যক্তিগত তথ্যের বিবরণ",
  "Full Name": "পুরো নাম",
  "Contact Number": "যোগাযোগের নম্বর",
  "Save Changes": "পরিবর্তন সংরক্ষণ করুন",
  "My Shipments": "আমার পার্সেলসমূহ",
  "View and track all your active and past shipments.": "আপনার চলমান ও আগের সব পার্সেল দেখুন ও অনুসরণ করুন।",
  "New Shipment": "নতুন পার্সেল",
  "Fill in the details below to create a new delivery request.": "নতুন সরবরাহের অনুরোধ করতে নিচের তথ্য পূরণ করুন।",
  "Dashboard": "ড্যাশবোর্ড",
  "Payment History": "অর্থপ্রদানের ইতিহাস",
  "View your transaction records and payment statuses.": "আপনার লেনদেনের নথি ও অর্থপ্রদানের অবস্থা দেখুন।",
  "Transaction ID": "লেনদেনের পরিচয়সংখ্যা",
  "Amount": "পরিমাণ",
  "Gateway": "অর্থপ্রদানের মাধ্যম",
  "No payment records found.": "অর্থপ্রদানের কোনো নথি পাওয়া যায়নি।",
  "Manage your personal information and settings.": "আপনার ব্যক্তিগত তথ্য ও সেটিংস পরিচালনা করুন।",
  "Default Address": "নিয়মিত ব্যবহৃত ঠিকানা",
  "House, Street, City": "বাড়ি, সড়ক, শহর",
  "Something went wrong!": "কিছু একটা সমস্যা হয়েছে!",
  "We encountered an unexpected error while processing your request. Our team has been notified.": "আপনার অনুরোধ সম্পন্ন করতে অপ্রত্যাশিত সমস্যা হয়েছে। আবার চেষ্টা করুন; সমস্যা থাকলে সহায়তা নিন।",
  "Try again": "আবার চেষ্টা করুন",
  "Go to Homepage": "প্রথম পাতায় যান",
  "Page Not Found": "পাতাটি পাওয়া যায়নি",
  "The page you are looking for doesn't exist or has been moved. Please check the URL or return to the homepage.": "আপনি যে পাতাটি খুঁজছেন তা নেই অথবা সরানো হয়েছে। ঠিকানা যাচাই করুন বা প্রথম পাতায় ফিরুন।",
  "Return to Homepage": "প্রথম পাতায় ফিরুন",
  "Payment Cancelled": "অর্থপ্রদান বাতিল হয়েছে",
  "You have cancelled the payment process. Your shipment will remain in unpaid status.": "অর্থপ্রদানের প্রক্রিয়া বাতিল হয়েছে। চূড়ান্ত অবস্থা জানতে অর্থপ্রদানের তালিকা দেখুন।",
  "Go to Payments": "অর্থপ্রদানের তালিকায় যান",
  "Payment Failed": "অর্থপ্রদান ব্যর্থ হয়েছে",
  "We were unable to process your payment at this time. Please check your credentials or try again with a different payment method.": "এই মুহূর্তে অর্থপ্রদান সম্পন্ন করা যায়নি। তথ্য যাচাই করুন অথবা অন্য মাধ্যম দিয়ে আবার চেষ্টা করুন।",
  "Back": "ফিরে যান",
  "Try Again": "আবার চেষ্টা করুন",
  "Standard Delivery": "সাধারণ সরবরাহ",
  "Reliable and cost-effective delivery for your everyday parcels. Expected delivery within 2-3 business days across major cities.": "আপনার নিয়মিত পার্সেলের জন্য নির্ভরযোগ্য ও সাশ্রয়ী সরবরাহ। সম্ভাব্য সময় ও সেবার আওতা জানতে যোগাযোগ করুন।",
  "Express Delivery": "জরুরি সরবরাহ",
  "Urgent shipments require priority handling. Our express service guarantees next-day delivery for time-sensitive documents and goods.": "জরুরি নথি ও পণ্যের জন্য অগ্রাধিকারভিত্তিক সরবরাহ। প্রাপ্যতা ও সময়সীমা আগেই নিশ্চিত করুন।",
  "Corporate Logistics": "প্রাতিষ্ঠানিক পরিবহন",
  "Tailored B2B logistics solutions for businesses of all sizes. Manage bulk shipments easily with our dedicated corporate dashboard.": "প্রতিষ্ঠানের প্রয়োজন অনুযায়ী পণ্য পরিবহনের ব্যবস্থা। আপনার পার্সেলগুলো ড্যাশবোর্ড থেকে পরিচালনা করুন।",
  "Fragile Handling": "ভঙ্গুর পণ্যের যত্ন",
  "Specialized care and secure packaging for delicate items. We ensure your fragile goods arrive in pristine condition.": "ভঙ্গুর পণ্য পাঠানোর আগে উপযুক্ত মোড়ক, গ্রহণযোগ্যতা ও বিশেষ ব্যবস্থার শর্ত নিশ্চিত করুন।",
  "Cash on Delivery (COD)": "পণ্য হাতে পেয়ে মূল্য পরিশোধ",
  "Empower your e-commerce business with our seamless COD service. Fast remittance and transparent payment tracking.": "পণ্য হাতে পেয়ে মূল্য পরিশোধের সুবিধা ও টাকা পাঠানোর নিয়ম চালুর আগে প্রতিষ্ঠানের সঙ্গে নিশ্চিত করুন।",
  "E-commerce Fulfillment": "অনলাইন ব্যবসার সরবরাহ",
  "From warehouse storage to last-mile delivery, we handle the entire supply chain so you can focus on growing your business.": "অনলাইন ব্যবসার পণ্য পৌঁছানোর ব্যবস্থা নিয়ে আলোচনা করুন। গুদাম ও অতিরিক্ত সেবার প্রাপ্যতা আগে নিশ্চিত করুন।",
  "Our Services": "আমাদের সেবাসমূহ",
  "Comprehensive logistics solutions designed to meet the unique needs of individuals and modern businesses.": "ব্যক্তি ও আধুনিক প্রতিষ্ঠানের চাহিদা অনুযায়ী পণ্য পরিবহনের সেবা।",
  "Access Denied": "প্রবেশের অনুমতি নেই",
  "You do not have the required permissions to view this page. If you believe this is a mistake, please contact your administrator.": "এই পাতা দেখার প্রয়োজনীয় অনুমতি আপনার নেই। ভুল মনে হলে প্রশাসকের সঙ্গে যোগাযোগ করুন।",
  "Shipment Created": "পার্সেলের অনুরোধ তৈরি হয়েছে",
  "Your shipment has been created successfully.": "আপনার পার্সেলের অনুরোধ সফলভাবে তৈরি হয়েছে।",
  "Creation Failed": "অনুরোধ তৈরি করা যায়নি",
  "Create New Shipment": "নতুন পার্সেলের অনুরোধ",
  "Enter receiver details and select origin/destination hubs to generate a shipment.": "প্রাপকের তথ্য দিন এবং প্রেরণ ও গন্তব্য হাব বেছে নিন।",
  "Receiver Name": "প্রাপকের নাম",
  "Alice Smith": "প্রাপকের পুরো নাম",
  "Receiver Phone": "প্রাপকের ফোন",
  "House, Road, Area, City": "বাড়ি, সড়ক, এলাকা, শহর",
  "Weight (kg)": "ওজন (কিলোগ্রাম)",
  "Origin Hub": "প্রেরণ হাব",
  "Select origin hub": "প্রেরণ হাব বেছে নিন",
  "Destination Hub": "গন্তব্য হাব",
  "Select destination hub": "গন্তব্য হাব বেছে নিন",
  "Login Successful": "প্রবেশ সফল হয়েছে",
  "Welcome back to Dropzo": "ড্রপজোতে আবার স্বাগতম",
  "Authentication Failed": "পরিচয় যাচাই ব্যর্থ হয়েছে",
  "Welcome Back 👋": "আবার স্বাগতম 👋",
  "Login to your account to continue": "এগিয়ে যেতে আপনার অ্যাকাউন্টে প্রবেশ করুন",
  "Password": "পাসওয়ার্ড",
  "Forgot Password?": "পাসওয়ার্ড ভুলে গেছেন?",
  "Authenticating...": "পরিচয় যাচাই করা হচ্ছে...",
  "One-Click Demo Login": "এক ক্লিকে নমুনা অ্যাকাউন্টে প্রবেশ",
  "Admin": "প্রশাসক",
  "Courier": "বাহক",
  "User": "ব্যবহারকারী",
  "Or continue with": "অথবা এই মাধ্যমে এগিয়ে যান",
  "Don't have an account?": "অ্যাকাউন্ট নেই?",
  "Create Account": "অ্যাকাউন্ট তৈরি করুন",
  "Validation Error": "তথ্য যাচাইয়ে সমস্যা",
  "Passwords do not match": "পাসওয়ার্ড দুটি মিলছে না",
  "Registration Successful": "নিবন্ধন সফল হয়েছে",
  "Please check your email for the OTP.": "এককালীন সংকেতের জন্য আপনার ইমেইল দেখুন।",
  "Registration Failed": "নিবন্ধন ব্যর্থ হয়েছে",
  "Create an Account": "অ্যাকাউন্ট তৈরি করুন",
  "Enter your details to get started": "শুরু করতে আপনার তথ্য দিন",
  "John Doe": "আপনার পুরো নাম",
  "Phone Number": "ফোন নম্বর",
  "Confirm": "নিশ্চিত করুন",
  "Creating...": "তৈরি করা হচ্ছে...",
  "Already have an account?": "আগেই অ্যাকাউন্ট আছে?",
  "Login here": "এখানে প্রবেশ করুন",
  "Verification Successful": "যাচাই সফল হয়েছে",
  "Your account is now verified.": "আপনার অ্যাকাউন্ট যাচাই করা হয়েছে।",
  "Verification Failed": "যাচাই ব্যর্থ হয়েছে",
  "Verify your email": "আপনার ইমেইল যাচাই করুন",
  "We sent a 6-digit code to": "৬ সংখ্যার সংকেত পাঠানো হয়েছে",
  "Invalid or expired code": "সংকেত ভুল অথবা মেয়াদ শেষ",
  "Please enter the code to complete registration": "নিবন্ধন শেষ করতে সংকেতটি দিন",
  "Fast Delivery": "দ্রুত সরবরাহ",
  "We ensure your packages reach their destination in the shortest time possible.": "আপনার পার্সেল দ্রুত গন্তব্যে পৌঁছানোর জন্য আমরা কাজ করি।",
  "Secure Handling": "নিরাপদ ব্যবস্থাপনা",
  "Your packages are handled with the utmost care and security at every step.": "প্রতিটি ধাপে আপনার পার্সেল যত্নের সঙ্গে পরিচালনা করা হয়।",
  "Live Tracking": "পার্সেলের হালনাগাদ তথ্য",
  "Track your shipments in real-time from our hubs directly to your doorstep.": "হাব থেকে গন্তব্য পর্যন্ত আপনার পার্সেলের সর্বশেষ অবস্থা দেখুন।",
  "Our dedicated support team is available around the clock to assist you.": "সহায়তার প্রাপ্যতা ও সময় জানতে যোগাযোগের পাতায় দেখুন।",
  "Why Choose Dropzo?": "কেন ড্রপজো বেছে নেবেন?",
  "We provide top-notch logistics solutions designed for businesses and individuals alike.": "ব্যক্তি ও প্রতিষ্ঠানের জন্য সহজ পণ্য পরিবহনব্যবস্থা।",
  "Create Shipment": "পার্সেলের অনুরোধ তৈরি করুন",
  "Enter package details and destination.": "পার্সেলের বিবরণ ও গন্তব্য দিন।",
  "Hub Assignment": "হাব নির্ধারণ",
  "Package is routed through our network.": "আমাদের হাবের মাধ্যমে পার্সেলের পথ নির্ধারিত হয়।",
  "In Transit": "পথে রয়েছে",
  "Assigned to a courier for delivery.": "সরবরাহের জন্য বাহক নিয়োগ করা হয়।",
  "Delivered": "পৌঁছে দেওয়া হয়েছে",
  "Successfully handed over to receiver.": "প্রাপকের কাছে সফলভাবে হস্তান্তর করা হয়েছে।",
  "How It Works": "যেভাবে কাজ করে",
  "A simple, streamlined process to get your package from A to B.": "প্রেরণস্থান থেকে গন্তব্যে পার্সেল পৌঁছানোর সহজ প্রক্রিয়া।",
  "Cities Covered": "সেবার আওতায় শহর",
  "Happy Customers": "সন্তুষ্ট গ্রাহক",
  "Delivery Success": "সরবরাহের সফলতা",
  "Customer Support": "গ্রাহক সহায়তা",
  "Fast, secure, and reliable parcel delivery services across the nation. We bridge the gap between businesses and their customers.": "দ্রুত ও নির্ভরযোগ্য পার্সেল সরবরাহের মাধ্যমে প্রতিষ্ঠান ও গ্রাহকের মধ্যে সংযোগ গড়ে তুলি।",
  "Quick Links": "প্রয়োজনীয় লিংক",
  "Home": "প্রথম পাতা",
  "About Us": "আমাদের সম্পর্কে",
  "Services": "সেবাসমূহ",
  "Contact": "যোগাযোগ",
  "Express Courier": "জরুরি সরবরাহ",
  "E-commerce Logistics": "অনলাইন ব্যবসার পরিবহন",
  "Heavy Freight": "ভারী পণ্য পরিবহন",
  "Legal & Support": "নীতি ও সহায়তা",
  "Privacy Policy": "গোপনীয়তার নীতি",
  "Terms of Service": "ব্যবহারের শর্তাবলী",
  "Cookie Policy": "কুকির নীতি",
  "FAQ": "সচরাচর প্রশ্ন",
  "Dropzo. All rights reserved.": "ড্রপজো। সর্বস্বত্ব সংরক্ষিত।",
  "Designed for secure and fast logistics.": "নিরাপদ ও দ্রুত পণ্য পরিবহনের জন্য তৈরি।",
  "Logged Out": "বের হওয়া হয়েছে",
  "You have been successfully logged out.": "আপনি সফলভাবে অ্যাকাউন্ট থেকে বের হয়েছেন।",
  "Logout Failed": "অ্যাকাউন্ট থেকে বের হওয়া যায়নি",
  "Something went wrong.": "কিছু একটা সমস্যা হয়েছে।",
  "Failed to load dashboard statistics.": "ড্যাশবোর্ডের পরিসংখ্যান আনা যায়নি।",
  "Total Revenue": "মোট আদায়",
  "Total Customers": "মোট গ্রাহক",
  "Total Couriers": "মোট বাহক",
  "Total Shipments": "মোট পার্সেল",
  "Status Updated": "অবস্থা হালনাগাদ হয়েছে",
  "Role Updated": "ভূমিকা হালনাগাদ হয়েছে",
  "Search users...": "ব্যবহারকারী খুঁজুন...",
  "Email": "ইমেইল",
  "Role": "ভূমিকা",
  "No users found.": "কোনো ব্যবহারকারী পাওয়া যায়নি।",
  "Total Deliveries": "মোট সরবরাহ",
  "Address": "ঠিকানা",
  "No delivery tasks found.": "সরবরাহের কোনো কাজ পাওয়া যায়নি।",
  "+ Create Shipment": "+ পার্সেলের অনুরোধ তৈরি করুন",
  "Active & Pending": "চলমান ও অপেক্ষমাণ",
  "Price": "মূল্য",
  "Pay Now": "এখন পরিশোধ করুন",
  "Track": "খুঁজুন",
  "Check Payment": "অর্থপ্রদান যাচাই করুন",
  "Shipment Cancelled": "পার্সেলের অনুরোধ বাতিল হয়েছে",
  "Cancellation Failed": "বাতিল করা যায়নি",
  "Cancel": "বাতিল করুন",
  "Shipment Tracking": "পার্সেলের পথের বিবরণ",
  "Logged in Successfully": "সফলভাবে প্রবেশ হয়েছে",
  "Google Login Failed": "গুগলের মাধ্যমে প্রবেশ ব্যর্থ হয়েছে",
  "No tracking information available yet.": "পার্সেলের পথের তথ্য এখনো পাওয়া যায়নি।",
  "Close": "বন্ধ করুন",
  "pagination": "পাতা নির্বাচন",
  "Go to previous page": "আগের পাতায় যান",
  "Go to next page": "পরের পাতায় যান",
  "More pages": "আরও পাতা",
  "Previous": "আগের পাতা",
  "Next": "পরের পাতা",
  "Sidebar": "পাশের মেনু",
  "Displays the mobile sidebar.": "মুঠোফোনের পাশের মেনু দেখায়।",
  "Toggle Sidebar": "পাশের মেনু খুলুন বা বন্ধ করুন",
  "Loading": "তথ্য আনা হচ্ছে",
  "Close toast": "বিজ্ঞপ্তি বন্ধ করুন",
  "Management": "ব্যবস্থাপনা",
  "Overview": "সারসংক্ষেপ",
  "Delivery Management": "সরবরাহ ব্যবস্থাপনা",
  "Earnings": "আয়",
  "Settings": "সেটিংস",
  "Profile": "ব্যক্তিগত তথ্য",
  "Shipments": "পার্সেলসমূহ",
  "Billing & Settings": "বিল ও সেটিংস",
  "Payments": "অর্থপ্রদান",
  "Login": "প্রবেশ করুন",
  "Sign Up": "নিবন্ধন করুন",
  "Verifying...": "যাচাই করা হচ্ছে...",
  "Verify Account": "অ্যাকাউন্ট যাচাই করুন",
  "Block": "বন্ধ করুন",
  "Unblock": "আবার চালু করুন",
  "50+": "৫০+",
  "10K+": "১০ হাজারের বেশি",
  "99.9%": "৯৯.৯%",
  "24/7": "২৪ ঘণ্টা, সপ্তাহে ৭ দিন",
  "Name must be at least 3 characters": "নাম কমপক্ষে ৩ অক্ষরের হতে হবে",
  "Invalid email address": "সঠিক ইমেইল ঠিকানা দিন",
  "Invalid phone number": "সঠিক ফোন নম্বর দিন",
  "Password must be at least 8 characters": "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে",
  "Password must be at most 72 characters": "পাসওয়ার্ড সর্বোচ্চ ৭২ অক্ষরের হতে পারবে",
  "Must contain a lowercase letter": "কমপক্ষে একটি ছোট হাতের ইংরেজি অক্ষর থাকতে হবে",
  "Must contain an uppercase letter": "কমপক্ষে একটি বড় হাতের ইংরেজি অক্ষর থাকতে হবে",
  "Must contain a number": "কমপক্ষে একটি সংখ্যা থাকতে হবে",
  "Must contain a special character": "কমপক্ষে একটি বিশেষ চিহ্ন থাকতে হবে",
  "Please confirm your password": "পাসওয়ার্ডটি আবার লিখে নিশ্চিত করুন",
  "Password is required": "পাসওয়ার্ড দিন",
  "OTP must be exactly 6 digits": "এককালীন সংকেত ঠিক ৬ সংখ্যার হতে হবে",
  "Name is required": "নাম দিন",
  "Receiver name is required": "প্রাপকের নাম দিন",
  "Detailed address is required": "বিস্তারিত ঠিকানা দিন",
  "Weight exceeds limit": "ওজন অনুমোদিত সীমার বেশি",
  "Origin hub is required": "প্রেরণ হাব বেছে নিন",
  "Destination hub is required": "গন্তব্য হাব বেছে নিন",
  "Origin and Destination hubs cannot be the same": "প্রেরণ ও গন্তব্য হাব একই হতে পারে না",
  "Invalid input: expected number, received NaN": "ওজনের ঘরে সঠিক সংখ্যা দিন",
  "Too small: expected number to be >0": "ওজন শূন্যের বেশি হতে হবে",
  "Unable to complete this request": "অনুরোধটি সম্পন্ন করা যায়নি",
  "Invalid email or password": "ইমেইল অথবা পাসওয়ার্ড ভুল",
  "Provider unavailable": "অর্থপ্রদানের সেবা এখন পাওয়া যাচ্ছে না",
  "Payment pending provider verification": "অর্থপ্রদানকারী প্রতিষ্ঠানের যাচাই এখনো সম্পন্ন হয়নি",
  "Mark Picked Up": "সংগ্রহ করা হয়েছে",
  "Arrived at Origin Hub": "প্রেরণ হাবে এসেছে",
  "Start Hub Transfer": "হাবের মধ্যে পরিবহন শুরু করুন",
  "Arrived at Destination Hub": "গন্তব্য হাবে এসেছে",
  "Out for Delivery": "প্রাপকের কাছে পৌঁছানোর পথে",
  "Mark Delivered": "সরবরাহ সম্পন্ন করুন",
  "Delivery Failed": "সরবরাহ ব্যর্থ হয়েছে",
  "Mark Returned": "ফেরত দেওয়া হয়েছে",
  "PENDING": "অপেক্ষমাণ",
  "ASSIGNED": "বাহক নির্ধারিত",
  "PICKED_UP": "সংগ্রহ করা হয়েছে",
  "AT_ORIGIN_HUB": "প্রেরণ হাবে",
  "IN_TRANSIT": "পরিবহনে",
  "AT_DESTINATION_HUB": "গন্তব্য হাবে",
  "OUT_FOR_DELIVERY": "প্রাপকের কাছে পৌঁছানোর পথে",
  "DELIVERED": "পৌঁছে দেওয়া হয়েছে",
  "DELIVERY_FAILED": "সরবরাহ ব্যর্থ হয়েছে",
  "RETURNED": "ফেরত দেওয়া হয়েছে",
  "CANCELLED": "বাতিল হয়েছে",
  "PICKED UP": "সংগ্রহ করা হয়েছে",
  "AT ORIGIN HUB": "প্রেরণ হাবে",
  "IN TRANSIT": "পরিবহনে",
  "AT DESTINATION HUB": "গন্তব্য হাবে",
  "OUT FOR DELIVERY": "প্রাপকের কাছে পৌঁছানোর পথে",
  "DELIVERY FAILED": "সরবরাহ ব্যর্থ হয়েছে",
  "PAID": "পরিশোধিত",
  "UNPAID": "অপরিশোধিত",
  "FAILED": "ব্যর্থ হয়েছে",
  "REFUNDED": "ফেরত দেওয়া হয়েছে",
  "ACTIVE": "সক্রিয়",
  "BLOCKED": "বন্ধ",
  "INACTIVE": "নিষ্ক্রিয়",
  "ADMIN": "প্রশাসক",
  "SUPER_ADMIN": "প্রধান প্রশাসক",
  "COURIER": "বাহক",
  "CUSTOMER": "গ্রাহক",
  "TRUCK": "ট্রাক",
  "BIKE": "মোটরসাইকেল",
  "BICYCLE": "সাইকেল",
  "VAN": "ভ্যান",
  "Draft — not a final legal document": "খসড়া — চূড়ান্ত আইনি নথি নয়",
  "Fill in every placeholder and obtain legal review before publishing this as your final policy.": "চূড়ান্ত নীতি হিসেবে প্রকাশের আগে সব প্লেসহোল্ডার পূরণ করুন এবং আইনি পর্যালোচনা করান।",
  "Company": "প্রতিষ্ঠান",
  "Effective date": "কার্যকর হওয়ার তারিখ",
  "Legal address": "প্রতিষ্ঠানের ঠিকানা",
  "Contact information is not configured yet. Replace the placeholders before accepting support requests.": "যোগাযোগের তথ্য এখনো নির্ধারিত নয়। সহায়তার অনুরোধ গ্রহণের আগে প্লেসহোল্ডারগুলো পূরণ করুন।",
  "Contact form is not available until a verified support address is configured.": "যাচাইকৃত সহায়তার ঠিকানা নির্ধারিত না হওয়া পর্যন্ত যোগাযোগের ফরম চালু নয়।",
  "View frequently asked questions": "সচরাচর প্রশ্ন দেখুন",
  "Read our privacy policy": "গোপনীয়তার নীতি পড়ুন",
  "Contact and delivery information": "যোগাযোগ ও সরবরাহের তথ্য",
  "Service availability and delivery terms must be confirmed before booking.": "বুকিংয়ের আগে সেবার প্রাপ্যতা ও সরবরাহের শর্ত নিশ্চিত করতে হবে।",
  "SLA and support hours require configuration": "সেবার সময়সীমা ও সহায়তার সময় নির্ধারণ প্রয়োজন",
  "Show password": "পাসওয়ার্ড দেখুন",
  "Hide password": "পাসওয়ার্ড লুকান",
  "No shipment was provided for payment verification.": "অর্থপ্রদান যাচাই করার পরিচয়সংখ্যা নেই।",
  "Sign in to view payment status": "অর্থপ্রদানের অবস্থা দেখতে প্রবেশ করুন",
  "Payment Confirmed": "অর্থপ্রদান নিশ্চিত হয়েছে",
  "Payment Not Yet Confirmed": "অর্থপ্রদান এখনও নিশ্চিত হয়নি",
  "Your payment has been verified and recorded.": "সার্ভারে আপনার অর্থপ্রদানের নথি সংরক্ষিত হয়েছে।",
  "Awaiting verified payment confirmation from the provider.": "অর্থপ্রদানকারী প্রতিষ্ঠানের যাচাইয়ের জন্য অপেক্ষা করছি।",
  "Check again": "আবার যাচাই করুন",
  "View My Shipments": "পার্সেলের তালিকায় যান",
  "Track Your Parcel": "আপনার পার্সেল খুঁজুন",
  "Enter your tracking ID to view the latest shipment updates.": "পার্সেলের বর্তমান অবস্থা জানতে অনুসন্ধানসংখ্যা লিখুন।",
  "Unable to load this information. Please try again.": "তথ্য আনা যায়নি। আবার চেষ্টা করুন।",
  "truck": "ট্রাক",
  "bike": "মোটরসাইকেল",
  "bicycle": "সাইকেল",
  "van": "ভ্যান",
  "DELETED": "মুছে ফেলা হয়েছে",
  "Notifications": "বিজ্ঞপ্তি",
  "STRIPE": "স্ট্রাইপ",
  "BKASH": "বিকাশ",
  "SSLCOMMERZ": "এসএসএলকমার্জ",
  "PAYMENT_REQUIRES_REVIEW": "অর্থপ্রদান পর্যালোচনা প্রয়োজন",
  "PAYMENT_SUCCESS": "অর্থপ্রদান সফল",
  "UPDATE_USER_STATUS": "ব্যবহারকারীর অবস্থা পরিবর্তন",
  "UPDATE_USER_ROLE": "ব্যবহারকারীর ভূমিকা পরিবর্তন",
  "CREATE_SHIPMENT": "পার্সেলের অনুরোধ তৈরি",
  "ASSIGN_COURIER": "বাহক নিয়োগ",
  "UPDATE_STATUS": "অবস্থা পরিবর্তন",
  "CANCEL_SHIPMENT": "পার্সেলের অনুরোধ বাতিল",
  "SHIPMENT": "পার্সেল",
  "USER": "ব্যবহারকারী"
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\next.config.ts

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");
const upstream = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const apiUrl = new URL(upstream);
if (!["http:", "https:"].includes(apiUrl.protocol) || apiUrl.username || apiUrl.password) throw new Error("Invalid API_BASE_URL");

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [{ source: "/api/backend/:path*", destination: upstream.replace(/\/$/, "") + "/:path*" }];
  },
  async headers() {
    return [
      { source: "/api/backend/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
      { source: "/:path*", headers: [{ key: "X-Content-Type-Options", value: "nosniff" }, { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }] },
    ];
  },
};
export default withNextIntl(nextConfig);
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\package.json

```json
{
  "name": "courier-frontend",
  "module": "index.ts",
  "type": "module",
  "private": true,
  "engines": { "node": ">=22 <27" },
  "devDependencies": {
    "@biomejs/biome": "^2.5.15",
    "@playwright/test": "^1.63.0",
    "@tailwindcss/postcss": "^4.3.3",
    "@types/bun": "latest",
    "@types/node": "^26.6.3",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "babel-plugin-react-compiler": "^1.0.0",
    "tailwindcss": "^4.3.3"
  },
  "peerDependencies": {
    "typescript": "^7.0.2"
  },
  "dependencies": {
    "@base-ui/react": "^1.8.0",
    "@radix-ui/react-slot": "^1.3.3",
    "@react-oauth/google": "^0.13.5",
    "@tanstack/react-form": "^1.33.5",
    "@tanstack/react-query": "^5.104.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cn": "^0.4.0",
    "date-fns": "^4.4.0",
    "input-otp": "^1.5.0",
    "lucide-react": "^1.49.0",
    "next": "^16.3.8",
    "next-intl": "^4.14.9",
    "ofetch": "^1.5.1",
    "react": "^19.3.0",
    "react-day-picker": "^10.0.2",
    "react-dom": "^19.3.0",
    "tailwind-merge": "^3.7.0",
    "tw-animate-css": "^1.4.0",
    "zod": "^4.6.5"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "biome lint src",
    "format": "biome format --write",
    "typecheck": "next typegen && tsc --noEmit",
    "test:e2e": "playwright test"
  }
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\playwright.config.ts

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 45000,
  expect: { timeout: 10000 },
  workers: 1,
  fullyParallel: false,
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://localhost:3100",
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run start -- --port 3100",
    url: "http://localhost:3100/en",
    timeout: 120000,
    reuseExistingServer: false,
    env: { NEXT_PUBLIC_GOOGLE_CLIENT_ID: "", NEXT_PUBLIC_ENABLE_DEMO_LOGIN: "false" },
  },
});
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\api\admin.api.ts

```ts
import apiClient from "@/lib/apiClient";
import type { ApiResponse, DashboardStats, User, AuditLog } from "@/types";

export const getDashboardStats = () => apiClient<ApiResponse<DashboardStats>>("/admin/dashboard-stats", { method: "GET" });
export const getAllUsers = (params?: Record<string, unknown>) => apiClient<ApiResponse<User[]>>("/admin/users", { method: "GET", params });
export const updateUserStatus = (id: string, payload: Record<string, unknown>) => apiClient<ApiResponse<User>>(`/admin/users/${encodeURIComponent(id)}/status`, { method: "PATCH", body: payload });
export const updateUserRole = (id: string, payload: Record<string, unknown>) => apiClient<ApiResponse<User>>(`/admin/users/${encodeURIComponent(id)}/role`, { method: "PATCH", body: payload });
export const getAuditLogs = (params?: Record<string, unknown>) => apiClient<ApiResponse<AuditLog[]>>("/audit-logs", { method: "GET", params });
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\api\auth.api.ts

```ts
import apiClient from "@/lib/apiClient";
import type { ApiResponse, LoginPayload, LoginResponse, RegistrationPayload, VerifyEmailPayload, VerifyEmailResponse } from "@/types";

export const registerCustomer = (payload: RegistrationPayload) => apiClient<ApiResponse<null>>("/auth/register", { method: "POST", body: payload });
export const verifyEmail = (payload: VerifyEmailPayload) => apiClient<ApiResponse<VerifyEmailResponse>>("/auth/verify-email", { method: "POST", body: payload });
export const userLogin = (payload: LoginPayload) => apiClient<ApiResponse<LoginResponse>>("/auth/login", { method: "POST", body: payload });
export const refreshToken = () => apiClient<ApiResponse<LoginResponse>>("/auth/refresh-token", { method: "POST" });
export const googleOAuth = (payload: { idToken: string }) => apiClient<ApiResponse<LoginResponse>>("/auth/google", { method: "POST", body: payload });
export const forgotPassword = (payload: { email: string }) => apiClient<ApiResponse<null>>("/auth/forgot-password", { method: "POST", body: payload });
export const resetPassword = (payload: VerifyEmailPayload & { newPassword: string }) => apiClient<ApiResponse<null>>("/auth/reset-password", { method: "POST", body: payload });
export const userLogout = () => apiClient<ApiResponse<null>>("/auth/logout", { method: "POST" });
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\api\courier.api.ts

```ts
import apiClient from "@/lib/apiClient";
import type { ApiResponse, Courier, CourierEarnings, User } from "@/types";

export const createCourier = (payload: Record<string, unknown>) => apiClient<ApiResponse<{ user: User; courier: Courier }>>("/couriers", { method: "POST", body: payload });
export const getAllCouriers = (params?: Record<string, unknown>) => apiClient<ApiResponse<Courier[]>>("/couriers", { method: "GET", params });
export const getCourierDetails = (id: string) => apiClient<ApiResponse<Courier>>(`/couriers/${encodeURIComponent(id)}`, { method: "GET" });
export const updateCourierProfile = (id: string, payload: Record<string, unknown>) => apiClient<ApiResponse<Courier>>(`/couriers/${encodeURIComponent(id)}`, { method: "PATCH", body: payload });
export const getCourierHistoryAndEarnings = (id: string) => apiClient<ApiResponse<CourierEarnings>>(`/couriers/${encodeURIComponent(id)}/history-earnings`, { method: "GET" });
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\api\hub.api.ts

```ts
import apiClient from "@/lib/apiClient";
import type { ApiResponse, Hub } from "@/types";

export const createHub = (payload: Record<string, unknown>) => apiClient<ApiResponse<Hub>>("/hubs", { method: "POST", body: payload });
export const getAllHubs = (params?: Record<string, unknown>) => apiClient<ApiResponse<Hub[]>>("/hubs", { method: "GET", params });
export const getSingleHub = (id: string) => apiClient<ApiResponse<Hub>>(`/hubs/${encodeURIComponent(id)}`, { method: "GET" });
export const updateHub = (id: string, payload: Record<string, unknown>) => apiClient<ApiResponse<Hub>>(`/hubs/${encodeURIComponent(id)}`, { method: "PATCH", body: payload });
export const deleteHub = (id: string) => apiClient<ApiResponse<Hub>>(`/hubs/${encodeURIComponent(id)}`, { method: "DELETE" });
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\api\payment.api.ts

```ts
import apiClient from "@/lib/apiClient";
import type { ApiResponse, Payment } from "@/types";

type PaymentRequest = { shipmentId: string };
type PaymentCheckout = { paymentUrl: string; shipmentId: string };
export const reconcilePayment = (payload: PaymentRequest) => apiClient<ApiResponse<{ shipmentId: string; status: string }>>("/payments/reconcile", { method: "POST", body: payload });
export const initiatePayment = (payload: PaymentRequest) => apiClient<ApiResponse<PaymentCheckout>>("/payments/initiate", { method: "POST", body: payload });
export const initiateStripePayment = (payload: PaymentRequest) => apiClient<ApiResponse<PaymentCheckout>>("/payments/stripe/initiate", { method: "POST", body: payload });
export const getPayments = (params?: Record<string, unknown>) => apiClient<ApiResponse<Payment[]>>("/payments", { method: "GET", params });
export const getSinglePayment = (id: string) => apiClient<ApiResponse<Payment>>(`/payments/${encodeURIComponent(id)}`, { method: "GET" });
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\api\shipment.api.ts

```ts
import apiClient from "@/lib/apiClient";
import type { ApiResponse, Shipment, PublicShipmentTracking } from "@/types";

export const getShipmentSummary = () => apiClient<ApiResponse<{ totalShipments: number; activeShipments: number; deliveredShipments: number }>>("/shipments/summary");

export const createShipment = (payload: Record<string, unknown>) => apiClient<ApiResponse<Shipment>>("/shipments", { method: "POST", body: payload });
export const getAllShipments = (params?: Record<string, unknown>) => apiClient<ApiResponse<Shipment[]>>("/shipments", { method: "GET", params });
export const getSingleShipment = (id: string) => apiClient<ApiResponse<Shipment>>(`/shipments/${encodeURIComponent(id)}`, { method: "GET" });
export const trackShipment = (trackingId: string) => apiClient<ApiResponse<PublicShipmentTracking>>(`/shipments/track/${encodeURIComponent(trackingId.trim().toUpperCase())}`, { method: "GET" });
export const assignCourier = (id: string, payload: Record<string, unknown>) => apiClient<ApiResponse<Shipment>>(`/shipments/${encodeURIComponent(id)}/assign`, { method: "PATCH", body: payload });
export const updateShipmentStatus = (id: string, payload: Record<string, unknown>) => apiClient<ApiResponse<Shipment>>(`/shipments/${encodeURIComponent(id)}/status`, { method: "PATCH", body: payload });
export const cancelShipment = (id: string) => apiClient<ApiResponse<Shipment>>(`/shipments/${encodeURIComponent(id)}/cancel`, { method: "PATCH" });
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\api\user.api.ts

```ts
import apiClient from "@/lib/apiClient";
import type { ApiResponse, User } from "@/types";

export const getMe = () => apiClient<ApiResponse<User>>("/users/me", { method: "GET" });
export const updateMyProfile = (payload: { name?: string; contactNumber?: string; address?: string }) => apiClient<ApiResponse<User>>("/users/me", { method: "PATCH", body: payload });
export const updateProfileImage = (payload: FormData) => apiClient<ApiResponse<User>>("/users/profile-image", { method: "PATCH", body: payload });
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\(auth)\forgot-password\page.tsx

```tsx
"use client";

import { useUiText } from "@/i18n/use-ui-text";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useForgotPassword } from "@/hooks";
import { AuthValidation } from "@/validation";
import { useForm } from "@tanstack/react-form";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";

export default function ForgotPasswordPage() {
  const ui = useUiText();
  const router = useRouter();
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: AuthValidation.ForgotPasswordZodSchema.shape.body,
    },
    onSubmit: ({ value }) => {
      forgotPassword(value, {
        onSuccess: () => {
          toast.add({
            title: "OTP Sent",
            description: "Check your email for the reset instructions.",
            type: "success",
          });
          const params = new URLSearchParams({ email: value.email });
          router.push(`/reset-password?${params.toString()}`);
        },
        onError: (err) => {
          toast.add({
            title: "Request Failed",
            description: err.message || "Could not process request.",
            type: "error",
          });
        },
      });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4 sm:p-8">
      <div className="w-full max-w-[440px] rounded-2xl bg-background p-6 sm:p-8 shadow-xl ring-1 ring-border/50 backdrop-blur-md">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              {ui("Forgot Password")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {ui(
                "Enter your email address and we will send you a code to reset your password.",
              )}{" "}
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field name="email">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        {ui("Email Address")}
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        placeholder="you@example.com"
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        value={field.state.value}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <Button
                disabled={isPending}
                type="submit"
                className="w-full mt-2"
              >
                {isPending ? (
                  <>
                    <Spinner className="mr-2" /> {ui("Sending OTP...")}{" "}
                  </>
                ) : (
                  ui("Send Reset OTP")
                )}
              </Button>
            </FieldGroup>
          </form>

          <div className="text-center text-sm text-muted-foreground mt-2">
            {ui("Remember your password?")}{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline underline-offset-4"
            >
              {ui("Back to Login")}{" "}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\(auth)\layout.tsx

```tsx
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\(auth)\reset-password\page.tsx

```tsx
"use client";

import { useUiText } from "@/i18n/use-ui-text";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useResetPassword } from "@/hooks";
import { AuthValidation } from "@/validation";
import { useForm } from "@tanstack/react-form";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Eye, EyeClosed } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { Suspense, useEffect, useState } from "react";

function ResetPasswordForm() {
  const ui = useUiText();
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: resetPassword, isPending } = useResetPassword();

  useEffect(() => {
    if (!email) {
      router.push("/forgot-password");
    }
  }, [email, router]);

  const form = useForm({
    defaultValues: {
      email: email,
      otp: "",
      newPassword: "",
    },
    validators: {
      onSubmit: AuthValidation.ResetPasswordZodSchema.shape.body,
    },
    onSubmit: ({ value }) => {
      resetPassword(value, {
        onSuccess: () => {
          toast.add({
            title: "Password Reset",
            description:
              "Your password has been successfully reset. Please login.",
            type: "success",
          });
          router.push("/login");
        },
        onError: (err) => {
          toast.add({
            title: "Reset Failed",
            description: err.message || "Invalid OTP or request failed.",
            type: "error",
          });
        },
      });
    },
  });

  if (!email) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {ui("Reset Password")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ui("Enter the 6-digit OTP sent to")}{" "}
          <span className="font-semibold text-foreground">{email}</span>{" "}
          {ui("and your new password.")}{" "}
        </p>
      </div>

      <form
        method="post"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="otp">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field
                  data-invalid={isInvalid}
                  className="flex flex-col items-center gap-2"
                >
                  <FieldLabel htmlFor={field.name} className="self-start">
                    {ui("OTP Code")}
                  </FieldLabel>
                  <InputOTP
                    maxLength={6}
                    value={field.state.value}
                    onChange={(value) => field.handleChange(value)}
                    onBlur={field.handleBlur}
                    pattern={REGEXP_ONLY_DIGITS}
                    id={field.name}
                    disabled={isPending}
                  >
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot
                        index={0}
                        className="rounded-md border h-12 w-10 text-lg"
                      />
                      <InputOTPSlot
                        index={1}
                        className="rounded-md border h-12 w-10 text-lg"
                      />
                      <InputOTPSlot
                        index={2}
                        className="rounded-md border h-12 w-10 text-lg"
                      />
                      <InputOTPSlot
                        index={3}
                        className="rounded-md border h-12 w-10 text-lg"
                      />
                      <InputOTPSlot
                        index={4}
                        className="rounded-md border h-12 w-10 text-lg"
                      />
                      <InputOTPSlot
                        index={5}
                        className="rounded-md border h-12 w-10 text-lg"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                  {isInvalid && (
                    <FieldError
                      errors={field.state.meta.errors}
                      className="self-start"
                    />
                  )}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="newPassword">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    {ui("New Password")}
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      value={field.state.value}
                      aria-invalid={isInvalid}
                      className="pr-10"
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeClosed className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <Button
            disabled={isPending || form.state.values.otp.length !== 6}
            type="submit"
            className="w-full mt-4"
          >
            {isPending ? (
              <>
                <Spinner className="mr-2" /> {ui("Resetting...")}{" "}
              </>
            ) : (
              ui("Reset Password")
            )}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4 sm:p-8">
      <div className="w-full max-w-[440px] rounded-2xl bg-background p-6 sm:p-8 shadow-xl ring-1 ring-border/50 backdrop-blur-md">
        <Suspense
          fallback={
            <div className="flex h-64 w-full items-center justify-center">
              <Spinner className="size-8 text-primary" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\about\page.tsx

```tsx
import { useUiText } from "@/i18n/use-ui-text";
import type { Metadata } from "next";
import { ShieldCheck, MapPin, Clock3 } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "bn" ? "আমাদের সম্পর্কে | Dropzo" : "About Us | Dropzo",
    description:
      locale === "bn"
        ? "ড্রপজোর লক্ষ্য, স্বপ্ন ও পণ্য পরিবহনব্যবস্থা সম্পর্কে জানুন।"
        : "Learn about Dropzo, our mission, vision and delivery platform.",
  };
}

export default function AboutPage() {
  const ui = useUiText();
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 left-1/3 size-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 size-96 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            {ui("About Courier")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {ui(
              "Delivering trust and reliability across every mile. We are dedicated to providing seamless logistics solutions for businesses and individuals alike.",
            )}{" "}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-16">
          <div className="rounded-3xl border border-white/40 bg-white/60 p-8 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-white/4">
            <h2 className="text-3xl font-bold mb-4">{ui("Our Mission")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {ui(
                "At Dropzo, our mission is to simplify the delivery process through innovative technology and a dedicated network of professionals. We aim to ensure that every parcel, no matter how small or large, reaches its destination safely, securely, and on time.",
              )}{" "}
            </p>
            <h2 className="text-3xl font-bold mb-4">{ui("Our Vision")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {ui(
                "We envision a future where logistics barriers are completely eliminated, making commerce more accessible for everyone. By expanding our hub networks and integrating real-time AI-driven tracking, we strive to become the most trusted logistics partner in the region.",
              )}{" "}
            </p>
          </div>

          <div className="rounded-3xl border border-white/40 bg-white/60 p-8 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-white/4">
            <h3 className="text-xl font-bold mb-6">{ui("Why Choose Us?")}</h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary/15 to-blue-500/15 ring-1 ring-primary/10">
                  <ShieldCheck className="size-5 text-primary" />
                </div>
                <div>
                  <strong className="block">{ui("Fast & Secure")}</strong>
                  <span className="text-sm text-muted-foreground">
                    {ui(
                      "Industry-leading delivery speeds with guaranteed item security.",
                    )}
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary/15 to-blue-500/15 ring-1 ring-primary/10">
                  <MapPin className="size-5 text-primary" />
                </div>
                <div>
                  <strong className="block">{ui("Real-time Tracking")}</strong>
                  <span className="text-sm text-muted-foreground">
                    {ui("Monitor your shipments at every step of the journey.")}
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary/15 to-blue-500/15 ring-1 ring-primary/10">
                  <Clock3 className="size-5 text-primary" />
                </div>
                <div>
                  <strong className="block">{ui("24/7 Support")}</strong>
                  <span className="text-sm text-muted-foreground">
                    {ui(
                      "Dedicated customer service team ready to assist you anytime.",
                    )}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\admin\all-shipments\page.tsx

```tsx
"use client";

import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TablePagination from "@/components/ui/table-pagination";
import { useGetAllShipments } from "@/hooks";
import { useState, useEffect, Suspense } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

function AllShipmentsContent() {
  const ui = useUiText();
  const display = useUiFormat();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialPage = Number(searchParams.get("page")) || 1;
  const initialSearch = searchParams.get("search") || "";

  const [page, setPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const { data, isLoading } = useGetAllShipments({
    page,
    limit: 10,
    searchTerm,
  });
  const shipments = data?.data || [];
  const meta = data?.meta;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", value);
    params.set("page", "1");
    if (!value) params.delete("search");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePageChange: Dispatch<SetStateAction<number>> = (value) => {
    const newPage = typeof value === "function" ? value(page) : value;
    setPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    if (searchTerm) params.set("search", searchTerm);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const urlPage = Number(searchParams.get("page")) || 1;
    const urlSearch = searchParams.get("search") || "";
    if (urlPage !== page) setPage(urlPage);
    if (urlSearch !== searchTerm) setSearchTerm(urlSearch);
  }, [searchParams, page, searchTerm]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {ui("All Shipments")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ui(
            "Monitor all active and completed shipments across the platform.",
          )}{" "}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          placeholder={ui("Search by tracking ID or receiver name...")}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-md"
        />

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{ui("Tracking ID")}</TableHead>
                <TableHead>{ui("Date")}</TableHead>
                <TableHead>{ui("Customer")}</TableHead>
                <TableHead>{ui("Receiver")}</TableHead>
                <TableHead>{ui("Hubs")}</TableHead>
                <TableHead>{ui("Status")}</TableHead>
                <TableHead className="text-right">{ui("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [
                  "placeholder-a",
                  "placeholder-b",
                  "placeholder-c",
                  "placeholder-d",
                  "placeholder-e",
                ].map((key) => (
                  <TableRow key={key}>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-24 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : shipments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {ui("No shipments found.")}{" "}
                  </TableCell>
                </TableRow>
              ) : (
                shipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-mono text-xs font-semibold">
                      {shipment.trackingId}
                    </TableCell>
                    <TableCell>
                      {display.date(new Date(shipment.createdAt))}
                    </TableCell>
                    <TableCell className="truncate max-w-37.5">
                      {shipment.sender?.name || ui("Unknown")}
                    </TableCell>
                    <TableCell className="truncate max-w-37.5">
                      <div className="flex flex-col">
                        <span className="text-sm">{shipment.receiverName}</span>
                        <span className="text-xs text-muted-foreground">
                          {shipment.receiverPhone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="truncate max-w-37.5">
                          {ui("From:")} {shipment.originHub?.name || ui("N/A")}
                        </span>
                        <span className="truncate max-w-37.5">
                          {ui("To:")}{" "}
                          {shipment.destinationHub?.name || ui("N/A")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 tracking-wider">
                        {ui(shipment.status.replace(/_/g, " "))}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {shipment.status === "PENDING" ? (
                        <Button variant="default" size="sm">
                          {ui("Assign Courier")}
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          {ui("View Details")}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {meta && meta.totalPages > 1 && (
          <TablePagination
            page={page}
            totalPages={meta.totalPages}
            handlePageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}

export default function AllShipmentsPage() {
  return (
    <Suspense fallback={<Skeleton className="w-full h-150 rounded-xl" />}>
      <AllShipmentsContent />
    </Suspense>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\admin\audit-logs\page.tsx

```tsx
"use client";

import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TablePagination from "@/components/ui/table-pagination";
import { useState, Suspense } from "react";
import { useGetAuditLogs } from "@/hooks";

function AuditLogsContent() {
  const ui = useUiText();
  const display = useUiFormat();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAuditLogs({ page, limit: 10 });

  const logs = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {ui("System Audit Logs")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ui(
            "View system-wide automated logs, tracking history, and payment events.",
          )}{" "}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{ui("Date & Time")}</TableHead>
                <TableHead>{ui("Action")}</TableHead>
                <TableHead>{ui("Entity Type")}</TableHead>
                <TableHead>{ui("Entity ID")}</TableHead>
                <TableHead>{ui("Details")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [
                  "placeholder-a",
                  "placeholder-b",
                  "placeholder-c",
                  "placeholder-d",
                  "placeholder-e",
                ].map((key) => (
                  <TableRow key={key}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {ui("No logs found.")}{" "}
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {display.date(new Date(log.createdAt), true)}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-md text-xs font-semibold bg-muted">
                        {ui(log.action)}
                      </span>
                    </TableCell>
                    <TableCell>{ui(log.entityType)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.entityId}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-50 truncate">
                      {JSON.stringify(log.details)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {meta && meta.totalPages > 1 && (
          <TablePagination
            page={page}
            totalPages={meta.totalPages}
            handlePageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}

export default function AuditLogsPage() {
  return (
    <Suspense fallback={<Skeleton className="w-full h-150 rounded-xl" />}>
      <AuditLogsContent />
    </Suspense>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\admin\hubs\page.tsx

```tsx
"use client";

import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TablePagination from "@/components/ui/table-pagination";
import { useGetAllHubs } from "@/hooks";
import { MapPin, Plus } from "lucide-react";
import { useState } from "react";

interface IHub {
  id: string;
  name: string;
  location: string;
  address: string;
  createdAt: string;
}

export default function HubsManagementPage() {
  const ui = useUiText();
  const display = useUiFormat();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useGetAllHubs({ page, limit: 10, searchTerm });
  const hubs = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {ui("Hub Management")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {ui(
              "Manage origin and destination hubs for routing shipments.",
            )}{" "}
          </p>
        </div>
        <Button>
          <Plus className="mr-2" /> {ui("Add Hub")}{" "}
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          placeholder={ui("Search hubs...")}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{ui("Hub Name")}</TableHead>
                <TableHead>{ui("Location")}</TableHead>
                <TableHead>{ui("Detailed Address")}</TableHead>
                <TableHead>{ui("Created At")}</TableHead>
                <TableHead className="text-right">{ui("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [
                  "placeholder-a",
                  "placeholder-b",
                  "placeholder-c",
                  "placeholder-d",
                  "placeholder-e",
                ].map((key) => (
                  <TableRow key={key}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-24 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : hubs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {ui("No hubs found.")}{" "}
                  </TableCell>
                </TableRow>
              ) : (
                hubs.map((hub: IHub) => (
                  <TableRow key={hub.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-muted-foreground" />
                        {hub.name}
                      </div>
                    </TableCell>
                    <TableCell>{hub.location}</TableCell>
                    <TableCell className="max-w-62.5 truncate">
                      {hub.address}
                    </TableCell>
                    <TableCell>
                      {display.date(new Date(hub.createdAt))}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm">
                        {ui("Edit")}{" "}
                      </Button>
                      <Button variant="destructive" size="sm">
                        {ui("Delete")}{" "}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {meta && meta.totalPages > 1 && (
          <TablePagination
            page={page}
            totalPages={meta.totalPages}
            handlePageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\admin\layout.tsx

```tsx
import RoleGuard from "@/components/auth/role-guard";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["ADMIN"]}>
      <DashboardShell userRole="ADMIN">{children}</DashboardShell>
    </RoleGuard>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\admin\loading.tsx

```tsx
import { useUiText } from "@/i18n/use-ui-text";
import { Spinner } from "@/components/ui/spinner";

export default function AdminLoading() {
  const ui = useUiText();
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-4">
      <Spinner className="size-8 text-primary" />
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        {ui("Loading dashboard data...")}{" "}
      </p>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\admin\manage-couriers\page.tsx

```tsx
"use client";

import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TablePagination from "@/components/ui/table-pagination";
import { useGetAllCouriers } from "@/hooks";
import { Plus } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

function ManageCouriersContent() {
  const ui = useUiText();
  const display = useUiFormat();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialPage = Number(searchParams.get("page")) || 1;
  const initialSearch = searchParams.get("search") || "";

  const [page, setPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const { data, isLoading } = useGetAllCouriers({
    page,
    limit: 10,
    searchTerm,
  });
  const couriers = data?.data || [];
  const meta = data?.meta;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", value);
    params.set("page", "1");
    if (!value) params.delete("search");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePageChange: Dispatch<SetStateAction<number>> = (value) => {
    const newPage = typeof value === "function" ? value(page) : value;
    setPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    if (searchTerm) params.set("search", searchTerm);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const urlPage = Number(searchParams.get("page")) || 1;
    const urlSearch = searchParams.get("search") || "";
    if (urlPage !== page) setPage(urlPage);
    if (urlSearch !== searchTerm) setSearchTerm(urlSearch);
  }, [searchParams, page, searchTerm]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {ui("Manage Couriers")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {ui(
              "Manage delivery personnel, check availability, and view assigned hubs.",
            )}{" "}
          </p>
        </div>
        <Button>
          <Plus className="mr-2" /> {ui("Add Courier")}{" "}
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          placeholder={ui("Search couriers...")}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{ui("Name")}</TableHead>
                <TableHead>{ui("Email & Phone")}</TableHead>
                <TableHead>{ui("Vehicle")}</TableHead>
                <TableHead>{ui("Availability")}</TableHead>
                <TableHead>{ui("Joined")}</TableHead>
                <TableHead className="text-right">{ui("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [
                  "placeholder-a",
                  "placeholder-b",
                  "placeholder-c",
                  "placeholder-d",
                  "placeholder-e",
                ].map((key) => (
                  <TableRow key={key}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-16 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : couriers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {ui("No couriers found.")}{" "}
                  </TableCell>
                </TableRow>
              ) : (
                couriers.map((courier) => (
                  <TableRow key={courier.id}>
                    <TableCell className="font-medium">
                      {courier.user?.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{courier.user?.email}</span>
                        <span className="text-xs text-muted-foreground">
                          {courier.contactNumber}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {courier.vehicleType ? (
                        <div className="flex flex-col">
                          <span className="text-sm capitalize">
                            {ui(courier.vehicleType)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {courier.vehicleNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          {ui("N/A")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${courier.isAvailable ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
                      >
                        {courier.isAvailable
                          ? ui("Available")
                          : ui("Unavailable")}
                      </span>
                    </TableCell>
                    <TableCell>
                      {display.date(new Date(courier.createdAt))}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        {ui("View")}{" "}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {meta && meta.totalPages > 1 && (
          <TablePagination
            page={page}
            totalPages={meta.totalPages}
            handlePageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}

export default function ManageCouriersPage() {
  return (
    <Suspense fallback={<Skeleton className="w-full h-150 rounded-xl" />}>
      <ManageCouriersContent />
    </Suspense>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\admin\manage-users\page.tsx

```tsx
import { useUiText } from "@/i18n/use-ui-text";
import UserManagementTable from "@/components/modules/admin/user-management-table";

export default function ManageUsersPage() {
  const ui = useUiText();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {ui("Manage Users")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ui(
            "View, filter, and modify user roles and account statuses across the platform.",
          )}{" "}
        </p>
      </div>
      <UserManagementTable />
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\admin\page.tsx

```tsx
import { useUiText } from "@/i18n/use-ui-text";
import AdminOverview from "@/components/modules/admin/admin-overview";

export default function AdminDashboardPage() {
  const ui = useUiText();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {ui("Admin Dashboard")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ui("Overview of platform statistics and recent activities.")}{" "}
        </p>
      </div>
      <AdminOverview />
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\contact\page.tsx

```tsx
import { Link } from "@/i18n/navigation";
import { useUiText } from "@/i18n/use-ui-text";
import { MapPin, Mail, Clock3 } from "lucide-react";

export default function ContactPage() {
  const ui = useUiText();
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-16 sm:px-6">
      <header className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">{ui("Contact Us")}</h1>
        <p className="text-muted-foreground">
          {ui(
            "Contact information is not configured yet. Replace the placeholders before accepting support requests.",
          )}
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        <section className="space-y-3 rounded-3xl border bg-card p-6">
          <MapPin aria-hidden="true" className="text-primary" />
          <h2 className="text-xl font-semibold">{ui("Head Office")}</h2>
          <p>[Company Name]</p>
          <p>[Address]</p>
        </section>
        <section className="space-y-3 rounded-3xl border bg-card p-6">
          <Mail aria-hidden="true" className="text-primary" />
          <h2 className="text-xl font-semibold">{ui("Contact Details")}</h2>
          <p>[Contact Email]</p>
          <p>[Contact Phone]</p>
        </section>
        <section className="space-y-3 rounded-3xl border bg-card p-6">
          <Clock3 aria-hidden="true" className="text-primary" />
          <h2 className="text-xl font-semibold">{ui("Business Hours")}</h2>
          <p>[Business Hours]</p>
        </section>
      </div>
      <aside role="note" className="rounded-xl border p-6">
        <p>
          {ui(
            "Contact form is not available until a verified support address is configured.",
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-5">
          <Link href="/faq" className="text-primary underline">
            {ui("View frequently asked questions")}
          </Link>
          <Link href="/privacy" className="text-primary underline">
            {ui("Read our privacy policy")}
          </Link>
        </div>
      </aside>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\cookies\page.tsx

```tsx
import type { Metadata } from "next";
import LegalDocument from "@/components/layout/legal-document";
import { getLegalDocument } from "@/content/legal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `${getLegalDocument(locale, "cookies").title} | Dropzo`,
    robots: { index: false, follow: true },
  };
}

export default function Page() {
  return <LegalDocument kind="cookies" />;
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\courier\deliveries\page.tsx

```tsx
import { useUiText } from "@/i18n/use-ui-text";
import DeliveryTasks from "@/components/modules/courier/delivery-tasks";

export default function DeliveriesPage() {
  const ui = useUiText();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {ui("My Deliveries")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ui(
            "Manage your assigned shipments and update delivery statuses.",
          )}{" "}
        </p>
      </div>
      <DeliveryTasks />
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\courier\earnings\page.tsx

```tsx
"use client";

import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetMe, useGetCourierHistoryAndEarnings } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, TrendingUp, Activity } from "lucide-react";
import QueryError from "@/components/ui/query-error";

export default function EarningsPage() {
  const ui = useUiText();
  const display = useUiFormat();
  const { data: userData, isLoading: userLoading } = useGetMe();
  const courierId = userData?.data?.courier?.id;

  const { data, isLoading, error, refetch } = useGetCourierHistoryAndEarnings(
    courierId || "",
  );
  const stats = data?.data;

  if (error)
    return (
      <QueryError
        retry={() => {
          void refetch();
        }}
      />
    );

  if (userLoading || isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {ui("Earnings & History")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ui(
            "View your total earnings and delivery performance over time.",
          )}{" "}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              {ui("Total Earnings")}
            </CardTitle>
            <Wallet className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats?.totalEarnings == null
                ? ui("Compensation needs configuration")
                : `৳ ${display.money(stats.totalEarnings)}`}
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              {ui("Completed Deliveries")}
            </CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ui(stats?.completedDeliveries || 0)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              {ui("Performance Rate")}
            </CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ui(stats?.performanceRate ?? 0)}%
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\courier\layout.tsx

```tsx
import RoleGuard from "@/components/auth/role-guard";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import type { ReactNode } from "react";

export default function CourierLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["COURIER"]}>
      <DashboardShell userRole="COURIER">{children}</DashboardShell>
    </RoleGuard>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\courier\loading.tsx

```tsx
import { useUiText } from "@/i18n/use-ui-text";
import { Spinner } from "@/components/ui/spinner";

export default function CourierLoading() {
  const ui = useUiText();
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-4">
      <Spinner className="size-8 text-primary" />
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        {ui("Loading courier dashboard...")}{" "}
      </p>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\courier\page.tsx

```tsx
import { useUiText } from "@/i18n/use-ui-text";
import CourierOverview from "@/components/modules/courier/courier-overview";

export default function CourierDashboardPage() {
  const ui = useUiText();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {ui("Courier Dashboard")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ui("Overview of your deliveries and earnings.")}{" "}
        </p>
      </div>
      <CourierOverview />
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\courier\profile\page.tsx

```tsx
"use client";

import { useUiText } from "@/i18n/use-ui-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useGetMe, useUpdateMyProfile } from "@/hooks";
import { useEffect, useState } from "react";

export default function CourierProfilePage() {
  const ui = useUiText();
  const { data, isLoading } = useGetMe();
  const { mutate: updateProfile, isPending } = useUpdateMyProfile();

  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  useEffect(() => {
    if (data?.data) {
      setName(data.data.name || "");
      setContactNumber(data.data.contactNumber || "");
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(
      { name, contactNumber },
      {
        onSuccess: () =>
          toast.add({ title: "Profile Updated", type: "success" }),
        onError: (err) =>
          toast.add({
            title: "Update Failed",
            description: err.message,
            type: "error",
          }),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {ui("My Profile")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ui("Manage your personal courier profile and settings.")}
        </p>
      </div>
      <Card className="max-w-xl shadow-sm border-muted/20">
        <CardHeader>
          <CardTitle>{ui("Profile Details")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field>
              <FieldLabel>{ui("Full Name")}</FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel>{ui("Email Address")}</FieldLabel>
              <Input
                value={data?.data?.email || ""}
                disabled
                className="bg-muted/50 cursor-not-allowed"
              />
            </Field>
            <Field>
              <FieldLabel>{ui("Contact Number")}</FieldLabel>
              <Input
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                required
              />
            </Field>
            <Button
              type="submit"
              disabled={isPending}
              className="mt-4 w-full sm:w-auto"
            >
              {isPending ? <Spinner className="mr-2" /> : null}
              {ui("Save Changes")}{" "}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\dashboard\layout.tsx

```tsx
import RoleGuard from "@/components/auth/role-guard";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import type { ReactNode } from "react";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["CUSTOMER"]}>
      <DashboardShell userRole="CUSTOMER">{children}</DashboardShell>
    </RoleGuard>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\dashboard\my-shipments\[id]\page.tsx

```tsx
"use client";

import { useUiText } from "@/i18n/use-ui-text";
import { useParams } from "next/navigation";
import { useGetSingleShipment } from "@/hooks";
import { Spinner } from "@/components/ui/spinner";
import QueryError from "@/components/ui/query-error";
import TrackingTimeline from "@/components/modules/shipment-tracking/tracking-timeline";

export default function ShipmentDetailsPage() {
  const ui = useUiText();
  const { id } = useParams<{ id: string }>();
  const result = useGetSingleShipment(id);
  if (result.isPending) return <Spinner />;
  if (result.isError)
    return (
      <QueryError
        retry={() => {
          void result.refetch();
        }}
      />
    );
  const shipment = result.data.data;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{shipment.trackingId}</h1>
      <p>
        {ui(shipment.status.replace(/_/g, " "))} · {ui(shipment.paymentStatus)}
      </p>
      <p>
        {shipment.receiverName} · {shipment.receiverAddress}
      </p>
      <TrackingTimeline trackings={shipment.trackings || []} />
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\dashboard\my-shipments\page.tsx

```tsx
import { useUiText } from "@/i18n/use-ui-text";
import ShipmentHistory from "@/components/modules/customer/shipment-history";

export default function MyShipmentsPage() {
  const ui = useUiText();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {ui("My Shipments")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ui("View and track all your active and past shipments.")}{" "}
        </p>
      </div>
      <ShipmentHistory />
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\dashboard\new-shipment\page.tsx

```tsx
import { useUiText } from "@/i18n/use-ui-text";
import CreateShipmentForm from "@/components/form/create-shipment-form";

export default function NewShipmentPage() {
  const ui = useUiText();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {ui("New Shipment")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ui(
            "Fill in the details below to create a new delivery request.",
          )}{" "}
        </p>
      </div>
      <CreateShipmentForm />
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\dashboard\page.tsx

```tsx
import { useUiText } from "@/i18n/use-ui-text";
import CustomerOverview from "@/components/modules/customer/customer-overview";

export default function DashboardPage() {
  const ui = useUiText();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold tracking-tight">{ui("Dashboard")}</h1>
      <CustomerOverview />
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\dashboard\payments\page.tsx

```tsx
"use client";

import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import { useState } from "react";
import { useGetPayments } from "@/hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import TablePagination from "@/components/ui/table-pagination";

export default function PaymentsPage() {
  const ui = useUiText();
  const display = useUiFormat();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetPayments({ page, limit: 10 });
  const payments = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {ui("Payment History")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ui("View your transaction records and payment statuses.")}{" "}
        </p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{ui("Transaction ID")}</TableHead>
              <TableHead>{ui("Date")}</TableHead>
              <TableHead>{ui("Amount")}</TableHead>
              <TableHead>{ui("Gateway")}</TableHead>
              <TableHead>{ui("Status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [
                "placeholder-a",
                "placeholder-b",
                "placeholder-c",
                "placeholder-d",
                "placeholder-e",
              ].map((key) => (
                <TableRow key={key}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                </TableRow>
              ))
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  {ui("No payment records found.")}{" "}
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-xs">
                    {payment.transactionId || ui("N/A")}
                  </TableCell>
                  <TableCell>
                    {display.date(new Date(payment.createdAt))}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    ৳{display.money(payment.amount)}
                  </TableCell>
                  <TableCell>{ui(payment.paymentGateway)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${payment.status === "PAID" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : payment.status === "FAILED" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}`}
                    >
                      {ui(payment.status)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {meta && meta.totalPages > 1 && (
        <TablePagination
          page={page}
          totalPages={meta.totalPages}
          handlePageChange={setPage}
        />
      )}
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\dashboard\profile\page.tsx

```tsx
"use client";

import { useUiText } from "@/i18n/use-ui-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useGetMe, useUpdateMyProfile } from "@/hooks";
import { useEffect, useState } from "react";

export default function CustomerProfilePage() {
  const ui = useUiText();
  const { data, isLoading } = useGetMe();
  const { mutate: updateProfile, isPending } = useUpdateMyProfile();

  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (data?.data) {
      setName(data.data.name || "");
      setContactNumber(data.data.contactNumber || "");
      setAddress(data.data.customer?.address || "");
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(
      { name, contactNumber, address },
      {
        onSuccess: () =>
          toast.add({ title: "Profile Updated", type: "success" }),
        onError: (err) =>
          toast.add({
            title: "Update Failed",
            description: err.message,
            type: "error",
          }),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {ui("My Profile")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ui("Manage your personal information and settings.")}
        </p>
      </div>
      <Card className="max-w-xl shadow-sm border-muted/20">
        <CardHeader>
          <CardTitle>{ui("Profile Details")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field>
              <FieldLabel>{ui("Full Name")}</FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel>{ui("Email Address")}</FieldLabel>
              <Input
                value={data?.data?.email || ""}
                disabled
                className="bg-muted/50 cursor-not-allowed"
              />
            </Field>
            <Field>
              <FieldLabel>{ui("Contact Number")}</FieldLabel>
              <Input
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel>{ui("Default Address")}</FieldLabel>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={ui("House, Street, City")}
              />
            </Field>
            <Button
              type="submit"
              disabled={isPending}
              className="mt-4 w-full sm:w-auto"
            >
              {isPending ? <Spinner className="mr-2" /> : null}
              {ui("Save Changes")}{" "}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\error.tsx

```tsx
"use client";

import { useUiText } from "@/i18n/use-ui-text";
import { Button } from "@/components/ui/button";
import { TriangleAlertIcon } from "lucide-react";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const ui = useUiText();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex max-w-md flex-col items-center gap-6">
        <div className="rounded-full bg-destructive/10 p-6 ring-1 ring-destructive/20">
          <TriangleAlertIcon className="size-12 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {ui("Something went wrong!")}{" "}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {ui(
              "We encountered an unexpected error while processing your request. Our team has been notified.",
            )}{" "}
          </p>
        </div>
        <div className="flex gap-4 mt-4">
          <Button onClick={() => reset()} variant="default" size="lg">
            {ui("Try again")}{" "}
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            size="lg"
          >
            {ui("Go to Homepage")}{" "}
          </Button>
        </div>
      </div>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\faq\page.tsx

```tsx
import type { Metadata } from "next";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useUiText } from "@/i18n/use-ui-text";

const questions = {
  en: [
    [
      "How do I track a parcel?",
      "Use the tracking ID on the Track Shipment page. Public tracking shows the status and timeline, not recipient contact details.",
    ],
    [
      "How is payment confirmed?",
      "A payment becomes confirmed only after the server verifies it with the provider. A success URL alone is not proof of payment. Use Check Payment to view or recheck the recorded status.",
    ],
    [
      "Can I cancel a shipment?",
      "The customer dashboard offers cancellation only while a shipment is pending and unpaid. Refund and cancellation terms must be completed in [Payment and Refund Policy].",
    ],
    [
      "How do I reset my password?",
      "Use Forgot Password, enter your registered email and follow the verification-code instructions. Never share the code or your password with anyone.",
    ],
    [
      "What are the delivery time and support hours?",
      "Service areas, delivery estimates, restricted goods and support hours are not finalized here. Confirm [Delivery Terms] and [Business Hours] with [Company Name] before booking.",
    ],
    [
      "How do I contact support?",
      "The operator must replace [Contact Email], [Contact Phone] and [Address] on the Contact page. Until then, support messages cannot be submitted through this site.",
    ],
  ],
  bn: [
    [
      "পার্সেল কীভাবে খুঁজব?",
      "পার্সেল অনুসরণের পাতায় অনুসন্ধানসংখ্যা দিন। প্রকাশ্য অনুসরণে অবস্থা ও পথের ইতিহাস দেখা যায়, প্রাপকের যোগাযোগের তথ্য নয়।",
    ],
    [
      "অর্থপ্রদান কীভাবে নিশ্চিত হয়?",
      "সার্ভারে অর্থপ্রদানকারী প্রতিষ্ঠানের সঙ্গে যাচাইয়ের পর অর্থপ্রদান নিশ্চিত হয়। শুধু সফলতার পাতায় যাওয়া প্রমাণ নয়। নথিভুক্ত অবস্থা দেখতে বা আবার যাচাই করতে অর্থপ্রদান যাচাইয়ের বোতাম ব্যবহার করুন।",
    ],
    [
      "পার্সেলের অনুরোধ বাতিল করতে পারব?",
      "পার্সেল অপেক্ষমাণ ও অপরিশোধিত থাকলে গ্রাহকের ড্যাশবোর্ডে বাতিলের সুযোগ থাকে। ফেরত ও বাতিলের শর্ত [Payment and Refund Policy] অংশে পূরণ করতে হবে।",
    ],
    [
      "পাসওয়ার্ড কীভাবে বদলাব?",
      "পাসওয়ার্ড ভুলে যাওয়ার পাতায় নিবন্ধিত ইমেইল দিন এবং যাচাইয়ের সংকেতের নির্দেশনা অনুসরণ করুন। সংকেত বা পাসওয়ার্ড কারও সঙ্গে ভাগ করবেন না।",
    ],
    [
      "সরবরাহের সময় ও সহায়তার সময় কত?",
      "সেবার আওতা, সম্ভাব্য সরবরাহের সময়, নিষিদ্ধ পণ্য ও সহায়তার সময় এখানে চূড়ান্ত নয়। বুকিংয়ের আগে [Company Name] থেকে [Delivery Terms] ও [Business Hours] নিশ্চিত করুন।",
    ],
    [
      "সহায়তার জন্য কীভাবে যোগাযোগ করব?",
      "প্রতিষ্ঠানকে যোগাযোগের পাতায় [Contact Email], [Contact Phone] ও [Address] পূরণ করতে হবে। এর আগে এই সাইট দিয়ে সহায়তার বার্তা পাঠানো যাবে না।",
    ],
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === "bn"
        ? "সচরাচর প্রশ্ন | Dropzo"
        : "Frequently Asked Questions | Dropzo",
  };
}

export default function FaqPage() {
  const locale = useLocale();
  const ui = useUiText();
  return (
    <article className="mx-auto max-w-4xl space-y-8 px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold">{ui("FAQ")}</h1>
      {questions[locale === "bn" ? "bn" : "en"].map(([question, answer]) => (
        <section key={question} className="space-y-3 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">{question}</h2>
          <p className="leading-8 text-muted-foreground">{answer}</p>
        </section>
      ))}
      <nav className="flex flex-wrap gap-5">
        <Link href="/track-shipment" className="underline">
          {ui("Shipment Tracking")}
        </Link>
        <Link href="/contact" className="underline">
          {ui("Contact")}
        </Link>
        <Link href="/terms" className="underline">
          {ui("Terms of Service")}
        </Link>
      </nav>
    </article>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\layout.tsx

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import Providers from "@/providers";
import { Toaster } from "@/components/ui/toast";
import Header from "@/components/layout/public/Header";
import Footer from "@/components/layout/public/Footer";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "bn" ? "Dropzo" : "Dropzo",
    description:
      locale === "bn"
        ? "দ্রুত ও নির্ভরযোগ্য পার্সেল পরিবহনের ব্যবস্থা।"
        : "Fast and reliable courier service platform.",
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={cn("h-full antialiased font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\not-found.tsx

```tsx
import { useUiText } from "@/i18n/use-ui-text";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { SearchXIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const ui = useUiText();
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex max-w-md flex-col items-center gap-6">
        <div className="rounded-full bg-muted p-6 ring-1 ring-border">
          <SearchXIcon className="size-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {ui("Page Not Found")}{" "}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {ui(
              "The page you are looking for doesn't exist or has been moved. Please check the URL or return to the homepage.",
            )}{" "}
          </p>
        </div>
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "mt-4",
          )}
        >
          {ui("Return to Homepage")}{" "}
        </Link>
      </div>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\page.tsx

```tsx
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import FeaturesSection from "@/components/home/features-section";
import HowItWorksSection from "@/components/home/how-it-works-section";
import StatsSection from "@/components/home/stats-section";

export default async function HomePage() {
  const t = await getTranslations("HomePage");

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center pt-24 pb-20">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">{t("title")}</h1>
        <p className="text-muted-foreground max-w-xl mb-10 text-lg">
          {t("description")}
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
            {t("login")}
          </Link>
          <Link href="/register" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            {t("register")}
          </Link>
        </div>
      </main>
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\payment\cancel\page.tsx

```tsx
import { useUiText } from "@/i18n/use-ui-text";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { XCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function PaymentCancelPage() {
  const ui = useUiText();
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex max-w-md flex-col items-center gap-6 p-8 rounded-2xl bg-card shadow-xl ring-1 ring-border/50">
        <div className="rounded-full bg-yellow-100 p-4 dark:bg-yellow-900/30">
          <XCircle className="size-16 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {ui("Payment Cancelled")}{" "}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {ui(
              "You have cancelled the payment process. Your shipment will remain in unpaid status.",
            )}{" "}
          </p>
        </div>
        <Link
          href="/dashboard/payments"
          className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full")}
        >
          {ui("Go to Payments")}{" "}
        </Link>
      </div>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\payment\failure\page.tsx

```tsx
import { useUiText } from "@/i18n/use-ui-text";
import { Button } from "@/components/ui/button";
import { AlertOctagon } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function PaymentFailurePage() {
  const ui = useUiText();
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex max-w-md flex-col items-center gap-6 p-8 rounded-2xl bg-card shadow-xl ring-1 ring-border/50">
        <div className="rounded-full bg-destructive/10 p-4 dark:bg-destructive/20">
          <AlertOctagon className="size-16 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {ui("Payment Failed")}{" "}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {ui(
              "We were unable to process your payment at this time. Please check your credentials or try again with a different payment method.",
            )}{" "}
          </p>
        </div>
        <div className="flex gap-3 w-full mt-4">
          <Button
            render={<Link href="/dashboard/payments" />}
            nativeButton={false}
            variant="outline"
            className="w-full"
          >
            {ui("Back")}{" "}
          </Button>
          <Button
            render={<Link href="/dashboard/payments" />}
            nativeButton={false}
            className="w-full"
          >
            {ui("Try Again")}{" "}
          </Button>
        </div>
      </div>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\payment\success\page.tsx

```tsx
import PaymentStatus from "@/components/modules/payment/payment-status";

export default async function PaymentSuccessPage({ searchParams }: { searchParams: Promise<{ shipmentId?: string }> }) {
  const params = await searchParams;
  const shipmentId = typeof params.shipmentId === "string" && /^[0-9a-f-]{36}$/i.test(params.shipmentId) ? params.shipmentId : "";
  return <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
    <div className="max-w-lg rounded-2xl border bg-card p-8"><PaymentStatus shipmentId={shipmentId} /></div>
  </div>;
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\privacy\page.tsx

```tsx
import type { Metadata } from "next";
import LegalDocument from "@/components/layout/legal-document";
import { getLegalDocument } from "@/content/legal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `${getLegalDocument(locale, "privacy").title} | Dropzo`,
    robots: { index: false, follow: true },
  };
}

export default function Page() {
  return <LegalDocument kind="privacy" />;
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\services\page.tsx

```tsx
import { useUiText } from "@/i18n/use-ui-text";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "bn" ? "আমাদের সেবাসমূহ | Dropzo" : "Our Services | Dropzo",
    description:
      locale === "bn"
        ? "ড্রপজোর পণ্য পরিবহন ও সরবরাহের সেবা সম্পর্কে জানুন।"
        : "Explore delivery and logistics services offered by Dropzo.",
  };
}

export default function ServicesPage() {
  const ui = useUiText();
  const services = [
    {
      id: "standard-delivery",
      title: "Standard Delivery",
      description:
        "Reliable and cost-effective delivery for your everyday parcels. Expected delivery within 2-3 business days across major cities.",
      icon: "📦",
    },
    {
      id: "express-delivery",
      title: "Express Delivery",
      description:
        "Urgent shipments require priority handling. Our express service guarantees next-day delivery for time-sensitive documents and goods.",
      icon: "⚡",
    },
    {
      id: "corporate-logistics",
      title: "Corporate Logistics",
      description:
        "Tailored B2B logistics solutions for businesses of all sizes. Manage bulk shipments easily with our dedicated corporate dashboard.",
      icon: "🏢",
    },
    {
      id: "fragile-handling",
      title: "Fragile Handling",
      description:
        "Specialized care and secure packaging for delicate items. We ensure your fragile goods arrive in pristine condition.",
      icon: "🛡️",
    },
    {
      id: "cash-on-delivery",
      title: "Cash on Delivery (COD)",
      description:
        "Empower your e-commerce business with our seamless COD service. Fast remittance and transparent payment tracking.",
      icon: "💵",
    },
    {
      id: "ecommerce-fulfillment",
      title: "E-commerce Fulfillment",
      description:
        "From warehouse storage to last-mile delivery, we handle the entire supply chain so you can focus on growing your business.",
      icon: "🛒",
    },
  ];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 right-0 size-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 size-96 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            {ui("Our Services")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {ui(
              "Comprehensive logistics solutions designed to meet the unique needs of individuals and modern businesses.",
            )}{" "}
          </p>
        </div>

        <p
          role="note"
          className="mb-8 rounded-xl border p-4 text-muted-foreground"
        >
          {ui(
            "Service availability and delivery terms must be confirmed before booking.",
          )}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              id={service.id}
              className="group flex flex-col p-8 rounded-3xl border border-white/40 bg-white/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-white/4"
            >
              <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/15 to-blue-500/15 text-3xl ring-1 ring-primary/10 transition-transform group-hover:scale-110">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{ui(service.title)}</h3>
              <p className="text-muted-foreground leading-relaxed grow">
                {ui(service.description)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\terms\page.tsx

```tsx
import type { Metadata } from "next";
import LegalDocument from "@/components/layout/legal-document";
import { getLegalDocument } from "@/content/legal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `${getLegalDocument(locale, "terms").title} | Dropzo`,
    robots: { index: false, follow: true },
  };
}

export default function Page() {
  return <LegalDocument kind="terms" />;
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\[locale]\track-shipment\page.tsx

```tsx
import { translateUi } from "@/i18n/ui";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import TrackForm from "@/components/modules/shipment-tracking/track-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "bn" ? "পার্সেল অনুসরণ | Dropzo" : "Track Shipment | Dropzo",
    description:
      locale === "bn"
        ? "অনুসন্ধানসংখ্যা দিয়ে পার্সেলের সর্বশেষ অবস্থা দেখুন।"
        : "Track your parcel using its tracking ID.",
  };
}
export default async function TrackShipmentPage() {
  const locale = await getLocale();
  const ui = (text: string) => translateUi(locale, text);
  const bn = locale === "bn";
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 bg-muted/20">
      <div className="text-center mb-10 max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">
          {bn ? "আপনার পার্সেল খুঁজুন" : ui("Track Your Parcel")}
        </h1>
        <p className="text-muted-foreground">
          {bn
            ? "পার্সেলের বর্তমান অবস্থা জানতে অনুসন্ধানসংখ্যা লিখুন।"
            : ui("Enter your tracking ID to view the latest shipment updates.")}
        </p>
      </div>
      <div className="w-full max-w-xl bg-card border rounded-2xl p-6 shadow-lg">
        <TrackForm />
      </div>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\app\globals.css

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "../styles/shadcn.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-geist-mono);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-destructive: var(--destructive);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
}

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.488 0.243 264.376);
  --primary-foreground: oklch(0.97 0.014 254.604);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --radius: 0.625rem;
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --primary: oklch(0.424 0.199 265.638);
  --primary-foreground: oklch(0.97 0.014 254.604);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  button:not(:disabled), [role="button"]:not(:disabled) {
    cursor: pointer;
  }
  html {
    @apply font-sans;
  }
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\assets\svg\EmptyState.tsx

```tsx
import type * as React from "react";

export default function EmptyState(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="120"
      height="120"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
      <path d="M12 12v.01" />
      <path d="M12 2v.01" />
      <path d="M4.5 5.5v.01" />
      <path d="M19.5 5.5v.01" />
    </svg>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\assets\svg\ErrorIllustration.tsx

```tsx
import type * as React from "react";

export default function ErrorIllustration(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="120"
      height="120"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\assets\svg\Logo.tsx

```tsx
import type * as React from "react";

export default function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_logo)">
        <path
          d="M24 0H16V12.0632C15.9663 14.2434 14.1885 16 12.0005 16H0V24H8.68629C10.808 24 12.8429 23.1571 14.3431 21.6569L21.6569 14.3431C23.1571 12.8429 24 10.808 24 8.68629V0Z"
          fill="url(#paint0_linear_logo)"
        />
        <path
          d="M16 40H24V27.9368C24.0337 25.7566 25.8115 24 27.9995 24H40V16H31.3137C29.192 16 27.1571 16.8429 25.6569 18.3431L18.3431 25.6569C16.8429 27.1571 16 29.192 16 31.3137V40Z"
          fill="url(#paint1_linear_logo)"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_logo"
          x1="20"
          y1="-0.997096"
          x2="20"
          y2="33.7931"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#75D8FC" />
          <stop offset="1" stopColor="#0072E5" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_logo"
          x1="20"
          y1="-0.997096"
          x2="20"
          y2="33.7931"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#75D8FC" />
          <stop offset="1" stopColor="#0072E5" />
        </linearGradient>
        <clipPath id="clip0_logo">
          <rect width="40" height="40" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\auth\access-denied.tsx

```tsx
import { useUiText } from "@/i18n/use-ui-text";
import { ShieldAlert } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function AccessDenied() {
  const ui = useUiText();
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex flex-col items-center gap-6 max-w-md">
        <div className="rounded-full bg-destructive/10 p-6 ring-1 ring-destructive/20">
          <ShieldAlert className="size-12 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {ui("Access Denied")}{" "}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {ui(
              "You do not have the required permissions to view this page. If you believe this is a mistake, please contact your administrator.",
            )}{" "}
          </p>
        </div>
        <Button
          render={<Link href="/" />}
          nativeButton={false}
          variant="default"
          size="lg"
          className="mt-4 w-full sm:w-auto"
        >
          {ui("Return to Homepage")}{" "}
        </Button>
      </div>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\auth\auth-guard.tsx

```tsx
"use client";

import { useGetMe } from "@/hooks";
import { useRouter } from "@/i18n/navigation";
import { getApiErrorStatus } from "@/lib/api-error";
import type { ReactNode } from "react";
import { useEffect } from "react";
import AuthLoading from "./auth-loading";
import AccessDenied from "./access-denied";
import QueryError from "../ui/query-error";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data, isPending, error, refetch } = useGetMe();
  const status = getApiErrorStatus(error);
  useEffect(() => {
    if (status === 401) router.replace("/login");
  }, [status, router]);
  if (isPending || status === 401) return <AuthLoading />;
  if (status === 403) return <AccessDenied />;
  if (error || !data?.data) return <QueryError retry={() => { void refetch(); }} />;
  return <>{children}</>;
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\auth\auth-loading.tsx

```tsx
import { useUiText } from "@/i18n/use-ui-text";
import { LoaderIcon } from "lucide-react";

export default function AuthLoading({
  label = "Authenticating...",
}: {
  label?: string;
}) {
  const ui = useUiText();
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-lg bg-card px-6 py-4 text-card-foreground shadow-lg ring-1 ring-border">
        <LoaderIcon className="size-5 animate-spin text-primary" />
        <span className="font-medium tracking-tight">{ui(label)}</span>
      </div>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\auth\role-guard.tsx

```tsx
"use client";

import { useGetMe } from "@/hooks";
import type { ReactNode } from "react";
import type { UserRole } from "@/types";
import AuthGuard from "./auth-guard";
import AccessDenied from "./access-denied";

export default function RoleGuard({ children, roles }: { children: ReactNode; roles: UserRole[] }) {
  const { data } = useGetMe();
  return <AuthGuard>{data?.data && roles.includes(data.data.role) ? children : <AccessDenied />}</AuthGuard>;
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\dashboard\dashboard-shell.tsx

```tsx
"use client";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./dashboard-sidebar";
import type { ReactNode } from "react";
import type { UserRole } from "@/types";

export default function DashboardShell({
  children,
  userRole,
}: {
  children: ReactNode;
  userRole: UserRole;
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar userRole={userRole} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-md px-4 sticky top-0 z-40">
          <SidebarTrigger className="-ml-1" />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-muted/10">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\dashboard\dashboard-sidebar.tsx

```tsx
"use client";

import { useUiText } from "@/i18n/use-ui-text";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Logo from "@/assets/svg/Logo";
import type { UserRole, SidebarItems } from "@/types";
import { adminRoutes, courierRoutes, customerRoutes } from "@/routes";
import { Link, usePathname } from "@/i18n/navigation";

const sidebarRoutes: Record<UserRole, SidebarItems> = {
  ADMIN: adminRoutes,
  COURIER: courierRoutes,
  CUSTOMER: customerRoutes,
};

export function DashboardSidebar({ userRole }: { userRole: UserRole }) {
  const ui = useUiText();
  const pathname = usePathname();
  const routes: SidebarItems = sidebarRoutes[userRole] || [];

  return (
    <Sidebar>
      <SidebarHeader className="py-4">
        <Link href="/">
          <div className="flex items-center gap-3 px-2">
            <Logo className="size-8" />
            <span className="font-bold tracking-tight text-lg">Dropzo</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {routes.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              {ui(group.title)}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={pathname === item.url}
                    >
                      {ui(item.title)}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\form\create-shipment-form.tsx

```tsx
"use client";

import { useUiText } from "@/i18n/use-ui-text";
import { useForm } from "@tanstack/react-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { ShipmentValidation } from "@/validation";
import { useCreateShipment, useGetAllHubs } from "@/hooks";
import { useRouter } from "@/i18n/navigation";
import { toast } from "../ui/toast";
import { Spinner } from "../ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface Hub {
  id: string;
  name: string;
  location: string;
  address: string;
}

export default function CreateShipmentForm() {
  const ui = useUiText();
  const router = useRouter();
  const { mutate: createShipment, isPending } = useCreateShipment();
  const { data: hubsData, isLoading: hubsLoading } = useGetAllHubs({
    limit: 100,
  });
  const hubs = hubsData?.data || [];

  const form = useForm({
    defaultValues: {
      receiverName: "",
      receiverPhone: "",
      receiverAddress: "",
      weight: 1,
      originHubId: "",
      destinationHubId: "",
    },
    validators: {
      onSubmit: ShipmentValidation.CreateShipmentSchema.shape.body,
    },
    onSubmit: ({ value }) => {
      createShipment(value, {
        onSuccess: () => {
          toast.add({
            title: "Shipment Created",
            description: "Your shipment has been created successfully.",
            type: "success",
          });
          router.push("/dashboard/my-shipments");
        },
        onError: (err) => {
          toast.add({
            title: "Creation Failed",
            description: err.message || "Could not create shipment",
            type: "error",
          });
        },
      });
    },
  });

  return (
    <Card className="max-w-2xl mx-auto shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{ui("Create New Shipment")}</CardTitle>
        <CardDescription>
          {ui(
            "Enter receiver details and select origin/destination hubs to generate a shipment.",
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form.Field name="receiverName">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        {ui("Receiver Name")}
                      </FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder={ui("Alice Smith")}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="receiverPhone">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        {ui("Receiver Phone")}
                      </FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            </div>

            <form.Field name="receiverAddress">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      {ui("Detailed Address")}
                    </FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={ui("House, Road, Area, City")}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="weight">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      {ui("Weight (kg)")}
                    </FieldLabel>
                    <Input
                      id={field.name}
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="100"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(parseFloat(e.target.value) || 0)
                      }
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form.Field name="originHubId">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        {ui("Origin Hub")}
                      </FieldLabel>
                      <select
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={hubsLoading}
                      >
                        <option value="" disabled>
                          {ui("Select origin hub")}
                        </option>
                        {hubs.map((hub: Hub) => (
                          <option key={hub.id} value={hub.id}>
                            {hub.name} ({hub.location})
                          </option>
                        ))}
                      </select>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="destinationHubId">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        {ui("Destination Hub")}
                      </FieldLabel>
                      <select
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={hubsLoading}
                      >
                        <option value="" disabled>
                          {ui("Select destination hub")}
                        </option>
                        {hubs.map((hub: Hub) => (
                          <option key={hub.id} value={hub.id}>
                            {hub.name} ({hub.location})
                          </option>
                        ))}
                      </select>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            </div>

            <Button type="submit" disabled={isPending} className="w-full mt-4">
              {isPending ? <Spinner className="mr-2" /> : null}
              {isPending ? ui("Creating...") : ui("Create Shipment")}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\form\login-form.tsx

```tsx
"use client";

import { useUiText } from "@/i18n/use-ui-text";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "../ui/field";
import { LoginZodSchema } from "@/validation";
import { useState } from "react";
import {
  Eye,
  EyeClosed,
  Mail,
  Lock,
  ShieldCheck,
  Truck,
  UserRound,
} from "lucide-react";
import { useLogin } from "@/hooks";
import { useRouter } from "@/i18n/navigation";
import { toast } from "../ui/toast";
import { Spinner } from "../ui/spinner";
import { Link } from "@/i18n/navigation";
import GoogleLoginComponent from "../modules/google-login/GoogleLogin";

export default function LoginForm() {
  const ui = useUiText();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate: login, isPending: loginPending } = useLogin();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: LoginZodSchema.shape.body,
    },
    onSubmit: ({ value }) => {
      login(value, {
        onSuccess: (res) => {
          queryClient.invalidateQueries({ queryKey: ["user"] });
          toast.add({
            title: "Login Successful",
            description: "Welcome back to Dropzo",
            type: "success",
          });
          const role = res.data.user.role;
          if (role === "ADMIN") router.push("/admin");
          else if (role === "COURIER") router.push("/courier");
          else router.push("/dashboard");
        },
        onError: (err) => {
          toast.add({
            title: "Authentication Failed",
            description: err.message || "Invalid email or password",
            type: "error",
          });
        },
      });
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-blue-600 shadow-lg shadow-primary/30">
          <Lock className="size-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          {ui("Welcome Back 👋")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ui("Login to your account to continue")}
        </p>
      </div>

      <form
        method="post"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="email">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    {ui("Email Address")}
                  </FieldLabel>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="you@example.com"
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      value={field.state.value}
                      autoComplete="email"
                      aria-invalid={isInvalid}
                      className="pl-10"
                    />
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="password">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor={field.name}>
                      {ui("Password")}
                    </FieldLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {ui("Forgot Password?")}{" "}
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      value={field.state.value}
                      autoComplete="current-password"
                      aria-invalid={isInvalid}
                      className="pl-10 pr-10"
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={ui(
                        showPassword ? "Hide password" : "Show password",
                      )}
                    >
                      {showPassword ? (
                        <EyeClosed className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <Button
            disabled={loginPending}
            type="submit"
            className="w-full shadow-lg shadow-primary/20"
          >
            {loginPending ? (
              <>
                <Spinner className="mr-2" /> {ui("Authenticating...")}{" "}
              </>
            ) : (
              ui("Login")
            )}
          </Button>

          {process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN === "true" && (
            <div className="flex flex-col gap-3 pt-2">
              <div className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {ui("One-Click Demo Login")}{" "}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.setFieldValue("email", "admin@courier.com");
                    form.setFieldValue("password", "Admin@12345");
                  }}
                  className="h-auto flex-col gap-1.5 border-border/60 bg-white/40 py-3 backdrop-blur-sm hover:border-primary/40 hover:bg-primary/5 dark:bg-white/3"
                >
                  <ShieldCheck className="size-4 text-primary" /> {ui(
                    "Admin",
                  )}{" "}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.setFieldValue("email", "courier@courier.com");
                    form.setFieldValue("password", "Courier@1234");
                  }}
                  className="h-auto flex-col gap-1.5 border-border/60 bg-white/40 py-3 backdrop-blur-sm hover:border-primary/40 hover:bg-primary/5 dark:bg-white/3"
                >
                  <Truck className="size-4 text-primary" /> {ui("Courier")}{" "}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.setFieldValue("email", "customer@courier.com");
                    form.setFieldValue("password", "Customer@1234");
                  }}
                  className="h-auto flex-col gap-1.5 border-border/60 bg-white/40 py-3 backdrop-blur-sm hover:border-primary/40 hover:bg-primary/5 dark:bg-white/3"
                >
                  <UserRound className="size-4 text-primary" /> {ui(
                    "User",
                  )}{" "}
                </Button>
              </div>
            </div>
          )}
        </FieldGroup>
      </form>

      <FieldSeparator>{ui("Or continue with")}</FieldSeparator>

      <div className="flex justify-center">
        <GoogleLoginComponent />
      </div>

      <div className="text-center text-sm text-muted-foreground mt-2">
        {ui("Don't have an account?")}{" "}
        <Link
          href="/register"
          className="font-semibold text-primary hover:underline underline-offset-4"
        >
          {ui("Create Account")}{" "}
        </Link>
      </div>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\form\register-form.tsx

```tsx
"use client";

import { useUiText } from "@/i18n/use-ui-text";
import { useForm } from "@tanstack/react-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "../ui/field";
import { RegisterCustomerZodSchema } from "@/validation";
import { useState } from "react";
import {
  Eye,
  EyeClosed,
  User,
  Mail,
  Phone,
  Lock,
  UserPlus,
} from "lucide-react";
import { useRegistration } from "@/hooks";
import { useRouter } from "@/i18n/navigation";
import { toast } from "../ui/toast";
import { Spinner } from "../ui/spinner";
import { Link } from "@/i18n/navigation";
import GoogleLoginComponent from "../modules/google-login/GoogleLogin";

interface IRegisterError {
  data?: { message?: string };
  response?: { _data?: { message?: string } };
  message?: string;
}

export default function RegisterForm() {
  const ui = useUiText();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { mutate: register, isPending: registerPending } = useRegistration();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      contactNumber: "" as string | undefined,
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: RegisterCustomerZodSchema.shape.body as never,
    },
    onSubmit: ({ value }) => {
      if (value.password !== value.confirmPassword) {
        toast.add({
          title: "Validation Error",
          description: "Passwords do not match",
          type: "error",
        });
        return;
      }

      const payload = {
        name: value.name,
        email: value.email,
        contactNumber: value.contactNumber || "",
        password: value.password,
      };

      register(payload, {
        onSuccess: () => {
          toast.add({
            title: "Registration Successful",
            description: "Please check your email for the OTP.",
            type: "success",
          });
          const params = new URLSearchParams({ email: value.email });
          router.push(`/verify-account?${params.toString()}`);
        },
        onError: (err: IRegisterError) => {
          const errorMessage =
            err?.data?.message ||
            err?.response?._data?.message ||
            err?.message ||
            "Something went wrong.";
          toast.add({
            title: "Registration Failed",
            description: errorMessage,
            type: "error",
          });
        },
      });
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-blue-600 shadow-lg shadow-primary/30">
          <UserPlus className="size-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          {ui("Create an Account")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ui("Enter your details to get started")}
        </p>
      </div>

      <form
        method="post"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="name">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    {ui("Full Name")}
                  </FieldLabel>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder={ui("John Doe")}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      value={field.state.value}
                      aria-invalid={isInvalid}
                      className="pl-10"
                    />
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="email">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    {ui("Email Address")}
                  </FieldLabel>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="you@example.com"
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      value={field.state.value}
                      aria-invalid={isInvalid}
                      className="pl-10"
                    />
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="contactNumber">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    {ui("Phone Number")}
                  </FieldLabel>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="01XXXXXXXXX"
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      value={field.state.value || ""}
                      aria-invalid={isInvalid}
                      className="pl-10"
                    />
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="password">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      {ui("Password")}
                    </FieldLabel>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id={field.name}
                        name={field.name}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        value={field.state.value}
                        aria-invalid={isInvalid}
                        className="pl-10 pr-10"
                      />
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={ui(
                          showPassword ? "Hide password" : "Show password",
                        )}
                      >
                        {showPassword ? (
                          <EyeClosed className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="confirmPassword">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      {ui("Confirm")}
                    </FieldLabel>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id={field.name}
                        name={field.name}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        value={field.state.value}
                        aria-invalid={isInvalid}
                        className="pl-10"
                      />
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </div>

          <Button
            disabled={registerPending}
            type="submit"
            className="w-full shadow-lg shadow-primary/20"
          >
            {registerPending ? (
              <>
                <Spinner className="mr-2" /> {ui("Creating...")}{" "}
              </>
            ) : (
              ui("Sign Up")
            )}
          </Button>
        </FieldGroup>
      </form>

      <FieldSeparator>{ui("Or continue with")}</FieldSeparator>

      <div className="flex justify-center">
        <GoogleLoginComponent />
      </div>

      <div className="text-center text-sm text-muted-foreground mt-2">
        {ui("Already have an account?")}{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:underline underline-offset-4"
        >
          {ui("Login here")}{" "}
        </Link>
      </div>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\form\verify-account-form.tsx

```tsx
"use client";

import { useUiText } from "@/i18n/use-ui-text";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { useEffect, useState } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useVerifyEmail } from "@/hooks";
import { toast } from "../ui/toast";
import { Spinner } from "../ui/spinner";

export default function VerifyAccountForm() {
  const ui = useUiText();
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);
  const { mutate: verify, isPending } = useVerifyEmail();

  useEffect(() => {
    if (!email) {
      router.push("/login");
    }
  }, [email, router]);

  const handleVerify = () => {
    if (otp.length !== 6) {
      setIsInvalid(true);
      return;
    }

    verify(
      { email, otp },
      {
        onSuccess: () => {
          toast.add({
            title: "Verification Successful",
            description: "Your account is now verified.",
            type: "success",
          });
          router.push("/dashboard");
        },
        onError: (err) => {
          setIsInvalid(true);
          toast.add({
            title: "Verification Failed",
            description: err.message || "Invalid OTP code.",
            type: "error",
          });
        },
      },
    );
  };

  if (!email) return null;

  return (
    <Card className="w-full shadow-lg border-muted/20">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl">{ui("Verify your email")}</CardTitle>
        <CardDescription>
          {ui("We sent a 6-digit code to")}{" "}
          <span className="font-semibold text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center py-6">
        <form
          method="post"
          id="otp-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
        >
          <Field
            data-invalid={isInvalid}
            className="flex flex-col items-center gap-4"
          >
            <FieldLabel htmlFor="otp" className="sr-only">
              {ui("OTP Code")}
            </FieldLabel>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => {
                setOtp(value);
                if (isInvalid) setIsInvalid(false);
              }}
              pattern={REGEXP_ONLY_DIGITS}
              id="otp"
              disabled={isPending}
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot
                  index={0}
                  className="rounded-md border h-12 w-10 text-lg"
                />
                <InputOTPSlot
                  index={1}
                  className="rounded-md border h-12 w-10 text-lg"
                />
                <InputOTPSlot
                  index={2}
                  className="rounded-md border h-12 w-10 text-lg"
                />
                <InputOTPSlot
                  index={3}
                  className="rounded-md border h-12 w-10 text-lg"
                />
                <InputOTPSlot
                  index={4}
                  className="rounded-md border h-12 w-10 text-lg"
                />
                <InputOTPSlot
                  index={5}
                  className="rounded-md border h-12 w-10 text-lg"
                />
              </InputOTPGroup>
            </InputOTP>
            {isInvalid && (
              <FieldError errors={[{ message: "Invalid or expired code" }]} />
            )}
            <FieldDescription className="text-center mt-2">
              {ui("Please enter the code to complete registration")}{" "}
            </FieldDescription>
          </Field>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          form="otp-form"
          type="submit"
          className="w-full"
          disabled={isPending || otp.length !== 6}
        >
          {isPending ? <Spinner className="mr-2" /> : null}
          {isPending ? ui("Verifying...") : ui("Verify Account")}
        </Button>
      </CardFooter>
    </Card>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\home\features-section.tsx

```tsx
import { useUiText } from "@/i18n/use-ui-text";
import { Truck, ShieldCheck, Clock, MapPin } from "lucide-react";

const features = [
  {
    icon: <Truck className="size-8 text-primary" />,
    title: "Fast Delivery",
    description:
      "We ensure your packages reach their destination in the shortest time possible.",
  },
  {
    icon: <ShieldCheck className="size-8 text-primary" />,
    title: "Secure Handling",
    description:
      "Your packages are handled with the utmost care and security at every step.",
  },
  {
    icon: <MapPin className="size-8 text-primary" />,
    title: "Live Tracking",
    description:
      "Track your shipments in real-time from our hubs directly to your doorstep.",
  },
  {
    icon: <Clock className="size-8 text-primary" />,
    title: "24/7 Support",
    description:
      "Our dedicated support team is available around the clock to assist you.",
  },
];

export default function FeaturesSection() {
  const ui = useUiText();
  return (
    <section className="relative overflow-hidden py-20">
      <div className="pointer-events-none absolute top-0 left-1/4 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 size-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="container relative mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {ui("Why Choose Dropzo?")}
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            {ui(
              "We provide top-notch logistics solutions designed for businesses and individuals alike.",
            )}{" "}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group flex flex-col items-center text-center p-8 rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-white/4"
            >
              <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary/15 to-blue-500/15 ring-1 ring-primary/10 transition-transform group-hover:scale-110">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {ui(feature.title)}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {ui(feature.description)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\home\how-it-works-section.tsx

```tsx
import { useUiText } from "@/i18n/use-ui-text";
import { PackagePlus, Truck, Map as MapIcon, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: <PackagePlus className="size-7 text-primary" />,
    title: "Create Shipment",
    description: "Enter package details and destination.",
  },
  {
    icon: <MapIcon className="size-7 text-primary" />,
    title: "Hub Assignment",
    description: "Package is routed through our network.",
  },
  {
    icon: <Truck className="size-7 text-primary" />,
    title: "In Transit",
    description: "Assigned to a courier for delivery.",
  },
  {
    icon: <CheckCircle2 className="size-7 text-primary" />,
    title: "Delivered",
    description: "Successfully handed over to receiver.",
  },
];

export default function HowItWorksSection() {
  const ui = useUiText();
  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {ui("How It Works")}
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            {ui(
              "A simple, streamlined process to get your package from A to B.",
            )}{" "}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 relative">
          <div className="hidden md:block absolute top-10 left-[10%] w-[80%] h-px bg-linear-to-r from-transparent via-border to-transparent -z-10" />
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="flex flex-col items-center text-center"
            >
              <div className="relative flex items-center justify-center size-20 rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] mb-6 dark:border-white/10 dark:bg-white/4">
                {step.icon}
                <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-linear-to-br from-primary to-blue-600 text-xs font-bold text-white shadow-md">
                  {index + 1}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{ui(step.title)}</h3>
              <p className="text-muted-foreground">{ui(step.description)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\home\stats-section.tsx

```tsx
import { useUiText } from "@/i18n/use-ui-text";
export default function StatsSection() {
  const ui = useUiText();
  const stats = [
    { value: "50+", label: "Cities Covered" },
    { value: "10K+", label: "Happy Customers" },
    { value: "99.9%", label: "Delivery Success" },
    { value: "24/7", label: "Customer Support" },
  ];

  return (
    <section className="relative overflow-hidden py-20 bg-linear-to-br from-primary via-primary to-blue-700 text-primary-foreground">
      <div className="pointer-events-none absolute -top-16 -left-16 size-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 size-72 rounded-full bg-white/10 blur-3xl" />
      <div className="container relative mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl"
            >
              <h4 className="text-4xl md:text-5xl font-bold tracking-tight">
                {stat.value}
              </h4>
              <p className="text-primary-foreground/80 font-medium text-lg">
                {ui(stat.label)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\layout\legal-document.tsx

```tsx
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useUiText } from "@/i18n/use-ui-text";
import { getLegalDocument, type LegalKind } from "@/content/legal";

export default function LegalDocument({ kind }: { kind: LegalKind }) {
  const locale = useLocale();
  const ui = useUiText();
  const document = getLegalDocument(locale, kind);
  return (
    <article className="mx-auto max-w-4xl space-y-8 px-4 py-16 sm:px-6">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold sm:text-4xl">{document.title}</h1>
        <aside
          role="note"
          className="rounded-xl border border-amber-400 bg-amber-50 p-5 text-amber-950"
        >
          <h2 className="font-semibold">
            {ui("Draft — not a final legal document")}
          </h2>
          <p className="mt-2">
            {ui(
              "Fill in every placeholder and obtain legal review before publishing this as your final policy.",
            )}
          </p>
        </aside>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold">{ui("Company")}</dt>
            <dd>[Company Name]</dd>
          </div>
          <div>
            <dt className="font-semibold">{ui("Effective date")}</dt>
            <dd>[Effective Date]</dd>
          </div>
          <div>
            <dt className="font-semibold">{ui("Legal address")}</dt>
            <dd>[Address]</dd>
          </div>
          <div>
            <dt className="font-semibold">{ui("Contact")}</dt>
            <dd>[Contact Email]</dd>
          </div>
        </dl>
      </header>
      {document.sections.map((section) => (
        <section key={section.title} className="space-y-3">
          <h2 className="text-xl font-semibold">{section.title}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="leading-8 text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
      <nav
        aria-label={ui("Legal & Support")}
        className="flex flex-wrap gap-5 border-t pt-6"
      >
        <Link href="/terms" className="underline">
          {ui("Terms of Service")}
        </Link>
        <Link href="/privacy" className="underline">
          {ui("Privacy Policy")}
        </Link>
        <Link href="/cookies" className="underline">
          {ui("Cookie Policy")}
        </Link>
        <Link href="/contact" className="underline">
          {ui("Contact")}
        </Link>
      </nav>
    </article>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\layout\public\Footer.tsx

```tsx
import { Link } from "@/i18n/navigation";
import { useUiText } from "@/i18n/use-ui-text";
import Logo from "@/assets/svg/Logo";

const groups = [
  {
    title: "Quick Links",
    links: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About Us" },
      { href: "/services", label: "Services" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Our Services",
    links: [
      { href: "/services#standard-delivery", label: "Standard Delivery" },
      { href: "/services#express-delivery", label: "Express Courier" },
      {
        href: "/services#ecommerce-fulfillment",
        label: "E-commerce Logistics",
      },
      { href: "/contact", label: "Contact and delivery information" },
    ],
  },
  {
    title: "Legal & Support",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/cookies", label: "Cookie Policy" },
      { href: "/faq", label: "FAQ" },
    ],
  },
];

export default function Footer() {
  const ui = useUiText();
  return (
    <footer className="mt-auto w-full border-t bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="size-6" />
              <span className="text-xl font-bold">Dropzo</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {ui(
                "Fast, secure, and reliable parcel delivery services across the nation. We bridge the gap between businesses and their customers.",
              )}
            </p>
          </div>
          {groups.map((group) => (
            <div key={group.title} className="flex flex-col gap-4">
              <h2 className="font-semibold">{ui(group.title)}</h2>
              <nav
                aria-label={ui(group.title)}
                className="flex flex-col gap-3 text-sm text-muted-foreground"
              >
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="transition-colors hover:text-primary"
                  >
                    {ui(link.label)}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t bg-muted/20 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 md:flex-row lg:px-8">
          <p className="text-sm text-muted-foreground">
            © {ui(new Date().getFullYear())}{" "}
            {ui("Dropzo. All rights reserved.")}
          </p>
          <p className="text-sm text-muted-foreground">
            {ui("Designed for secure and fast logistics.")}
          </p>
        </div>
      </div>
    </footer>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\layout\public\Header.tsx

```tsx
"use client";

import Logo from "@/assets/svg/Logo";
import { Button } from "@/components/ui/button";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useGetMe, useLogout } from "@/hooks";
import { toast } from "@/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import type { UserRole } from "@/types";
import { Search, Menu, Globe } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Header() {
  const t = useTranslations("Header");
  const { data, isLoading } = useGetMe();
  const { mutate: logout, isPending } = useLogout();
  const queryClient = useQueryClient();
  const user = data?.data;

  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();

  const dashboardRoute: Record<UserRole, string> = {
    ADMIN: "/admin",
    COURIER: "/courier",
    CUSTOMER: "/dashboard",
  };

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.add({
          title: "Logged Out",
          description: "You have been successfully logged out.",
          type: "success",
        });
        queryClient.removeQueries({ queryKey: ["user"] });
        router.replace("/");
        router.refresh();
      },
      onError: () => {
        toast.add({
          title: "Logout Failed",
          description: "Something went wrong.",
          type: "error",
        });
      },
    });
  };

  const toggleLang = () => {
    const nextLocale = currentLocale === "en" ? "bn" : "en";
    router.replace(
      `${pathname}${window.location.search}${window.location.hash}`,
      { locale: nextLocale },
    );
  };

  return (
    <header className="w-full h-16 border-b bg-background/70 backdrop-blur-xl sticky top-0 z-50 transition-all shadow-sm">
      <div className="flex justify-between items-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 transition-transform hover:scale-105"
        >
          <Logo className="size-8" />
          <span className="font-bold tracking-tight text-xl hidden sm:block bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Dropzo
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link
            href="/services"
            className="hover:text-primary transition-colors"
          >
            {t("services")}
          </Link>
          <Link href="/about" className="hover:text-primary transition-colors">
            {t("about")}
          </Link>
          <Link
            href="/contact"
            className="hover:text-primary transition-colors"
          >
            {t("contact")}
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-3">
          <Button
            variant="outline"
            render={<Link href="/track-shipment" />}
            nativeButton={false}
            className="gap-2 border-primary/20 hover:bg-primary/5"
          >
            <Search className="size-4" /> {t("track")}
          </Button>

          <Button
            variant="ghost"
            onClick={toggleLang}
            className="gap-1 px-2 text-muted-foreground hover:text-foreground"
            aria-label={t("switchLanguage")}
          >
            <Globe className="size-4" />{" "}
            {currentLocale === "bn" ? "English" : "বাংলা"}
          </Button>

          {!isLoading && !user && (
            <>
              <Button
                variant="ghost"
                render={<Link href="/login" />}
                nativeButton={false}
              >
                {t("login")}
              </Button>
              <Button
                render={<Link href="/register" />}
                nativeButton={false}
                className="shadow-md"
              >
                {t("register")}
              </Button>
            </>
          )}

          {!isLoading && user && (
            <>
              <Button
                variant="outline"
                render={<Link href={dashboardRoute[user.role as UserRole]} />}
                nativeButton={false}
              >
                {t("dashboard")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                disabled={isPending}
              >
                {isPending ? t("loggingOut") : t("logout")}
              </Button>
            </>
          )}
        </nav>

        <div className="flex md:hidden items-center gap-2">
          <Button
            variant="outline"
            render={<Link href="/track-shipment" />}
            nativeButton={false}
            className="px-3 border-primary/20"
            aria-label={t("track")}
          >
            <Search className="size-4" />
          </Button>

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  className="px-3"
                  aria-label={t("menu")}
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="text-left">{t("menu")}</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                <Link
                  href="/services"
                  className="text-lg font-medium hover:text-primary"
                >
                  {t("services")}
                </Link>
                <Link
                  href="/about"
                  className="text-lg font-medium hover:text-primary"
                >
                  {t("about")}
                </Link>
                <Link
                  href="/contact"
                  className="text-lg font-medium hover:text-primary"
                >
                  {t("contact")}
                </Link>

                <Button
                  variant="ghost"
                  className="justify-start px-0 text-lg font-medium"
                  onClick={toggleLang}
                  aria-label={t("switchLanguage")}
                >
                  <Globe className="size-5 mr-2" /> {t("language")}
                  {currentLocale === "bn" ? "English" : "বাংলা"}
                </Button>

                <hr className="my-2 border-border" />

                {!isLoading && !user && (
                  <div className="flex flex-col gap-3">
                    <Button
                      variant="outline"
                      render={<Link href="/login" />}
                      nativeButton={false}
                      className="w-full"
                    >
                      {t("login")}
                    </Button>
                    <Button
                      render={<Link href="/register" />}
                      nativeButton={false}
                      className="w-full"
                    >
                      {t("register")}
                    </Button>
                  </div>
                )}

                {!isLoading && user && (
                  <div className="flex flex-col gap-3">
                    <Button
                      variant="outline"
                      render={
                        <Link href={dashboardRoute[user.role as UserRole]} />
                      }
                      nativeButton={false}
                      className="w-full"
                    >
                      {t("dashboard")}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleLogout}
                      disabled={isPending}
                      className="w-full"
                    >
                      {isPending ? t("loggingOut") : t("logout")}
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\modules\admin\admin-overview.tsx

```tsx
"use client";

import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, Truck, Users } from "lucide-react";
import { useGetDashboardStats } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminOverview() {
  const ui = useUiText();
  const display = useUiFormat();
  const { data, isLoading, isError } = useGetDashboardStats();
  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10 text-destructive">
        {ui("Failed to load dashboard statistics.")}{" "}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              {ui("Total Revenue")}
            </CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ৳ {display.money(stats.totalRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              {ui("Total Customers")}
            </CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {display.number(stats.totalCustomers)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              {ui("Total Couriers")}
            </CardTitle>
            <Truck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {display.number(stats.totalCouriers)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              {ui("Total Shipments")}
            </CardTitle>
            <Package className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {display.number(stats.totalShipments)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\modules\admin\user-management-table.tsx

```tsx
"use client";

import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import { useState } from "react";
import {
  useGetAllUsers,
  useUpdateUserRole,
  useUpdateUserStatus,
} from "@/hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import TablePagination from "@/components/ui/table-pagination";

interface IUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function UserManagementTable() {
  const ui = useUiText();
  const display = useUiFormat();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useGetAllUsers({ page, limit: 10, searchTerm });
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateUserStatus();
  const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateUserRole();

  const users = data?.data || [];
  const meta = data?.meta;

  const handleStatusChange = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    updateStatus(
      { id, payload: { status: newStatus } },
      {
        onSuccess: () =>
          toast.add({ title: "Status Updated", type: "success" }),
        onError: (err: Error) =>
          toast.add({
            title: "Update Failed",
            description: err.message,
            type: "error",
          }),
      },
    );
  };

  const handleRoleChange = (id: string, newRole: string) => {
    updateRole(
      { id, payload: { role: newRole } },
      {
        onSuccess: () => toast.add({ title: "Role Updated", type: "success" }),
        onError: (err: Error) =>
          toast.add({
            title: "Update Failed",
            description: err.message,
            type: "error",
          }),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder={ui("Search users...")}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{ui("Name")}</TableHead>
              <TableHead>{ui("Email")}</TableHead>
              <TableHead>{ui("Role")}</TableHead>
              <TableHead>{ui("Status")}</TableHead>
              <TableHead>{ui("Joined")}</TableHead>
              <TableHead className="text-right">{ui("Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [
                "placeholder-a",
                "placeholder-b",
                "placeholder-c",
                "placeholder-d",
                "placeholder-e",
              ].map((key) => (
                <TableRow key={key}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  {ui("No users found.")}{" "}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: IUser) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      disabled={isUpdatingRole || user.role === "SUPER_ADMIN"}
                      className="bg-transparent border border-input rounded-md text-sm p-1 focus:ring-2 focus:ring-primary"
                    >
                      <option value="CUSTOMER">{ui("Customer")}</option>
                      <option value="COURIER">{ui("Courier")}</option>
                      <option value="ADMIN">{ui("Admin")}</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === "ACTIVE" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
                    >
                      {ui(user.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {display.date(new Date(user.createdAt))}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={
                        user.status === "ACTIVE" ? "destructive" : "default"
                      }
                      size="sm"
                      onClick={() => handleStatusChange(user.id, user.status)}
                      disabled={isUpdatingStatus || user.role === "SUPER_ADMIN"}
                    >
                      {user.status === "ACTIVE" ? ui("Block") : ui("Unblock")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {meta && meta.totalPages > 1 && (
        <TablePagination
          page={page}
          totalPages={meta.totalPages}
          handlePageChange={setPage}
        />
      )}
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\modules\courier\courier-overview.tsx

```tsx
"use client";

import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageCheck, Wallet } from "lucide-react";
import { useGetMe, useGetCourierHistoryAndEarnings } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourierOverview() {
  const ui = useUiText();
  const display = useUiFormat();
  const { data: userData, isLoading: isUserLoading } = useGetMe();
  const courierId = userData?.data?.courier?.id;

  const { data: statsData, isLoading: isStatsLoading } =
    useGetCourierHistoryAndEarnings(courierId || "");
  const stats = statsData?.data;

  const isLoading = isUserLoading || isStatsLoading;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border-muted/20 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">
            {ui("Total Deliveries")}
          </CardTitle>
          <PackageCheck className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {ui(stats?.completedDeliveries || 0)}
          </div>
        </CardContent>
      </Card>
      <Card className="border-muted/20 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">
            {ui("Total Earnings")}
          </CardTitle>
          <Wallet className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.totalEarnings == null
              ? ui("Compensation needs configuration")
              : `৳ ${display.money(stats.totalEarnings)}`}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\modules\courier\delivery-tasks.tsx

```tsx
"use client";

import { useUiText } from "@/i18n/use-ui-text";
import { useState } from "react";
import { useGetAllShipments, useUpdateShipmentStatus } from "@/hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import QueryError from "@/components/ui/query-error";
import TablePagination from "@/components/ui/table-pagination";
import { getApiErrorMessage } from "@/lib/api-error";
import type { ShipmentStatus } from "@/types";

const labels: Partial<Record<ShipmentStatus, string>> = {
  PICKED_UP: "Mark Picked Up",
  AT_ORIGIN_HUB: "Arrived at Origin Hub",
  IN_TRANSIT: "Start Hub Transfer",
  AT_DESTINATION_HUB: "Arrived at Destination Hub",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Mark Delivered",
  DELIVERY_FAILED: "Delivery Failed",
  RETURNED: "Mark Returned",
};
export default function DeliveryTasks() {
  const ui = useUiText();
  const [page, setPage] = useState(1);
  const { data, isPending, error, refetch } = useGetAllShipments({
    page,
    limit: 10,
  });
  const { mutate: updateStatus, isPending: updating } =
    useUpdateShipmentStatus();
  if (error)
    return (
      <QueryError
        retry={() => {
          void refetch();
        }}
      />
    );
  if (isPending) return <Spinner />;
  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{ui("Tracking ID")}</TableHead>
              <TableHead>{ui("Receiver")}</TableHead>
              <TableHead>{ui("Address")}</TableHead>
              <TableHead>{ui("Status")}</TableHead>
              <TableHead>{ui("Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.length ? (
              data.data.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell className="font-mono">
                    {shipment.trackingId}
                  </TableCell>
                  <TableCell>{shipment.receiverName}</TableCell>
                  <TableCell>{shipment.receiverAddress}</TableCell>
                  <TableCell>
                    {ui(shipment.status.replace(/_/g, " "))}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {shipment.allowedNextStatuses.map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={
                            status === "DELIVERY_FAILED"
                              ? "destructive"
                              : "outline"
                          }
                          disabled={updating}
                          onClick={() =>
                            updateStatus(
                              { id: shipment.id, payload: { status } },
                              {
                                onSuccess: () =>
                                  toast.add({
                                    title: "Status Updated",
                                    type: "success",
                                  }),
                                onError: (failure) =>
                                  toast.add({
                                    title: "Update Failed",
                                    description: getApiErrorMessage(failure),
                                    type: "error",
                                  }),
                              },
                            )
                          }
                        >
                          {ui(labels[status] || status.replace(/_/g, " "))}
                        </Button>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>
                  {ui("No delivery tasks found.")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {data?.meta && data.meta.totalPages > 1 && (
        <TablePagination
          page={page}
          totalPages={data.meta.totalPages}
          handlePageChange={setPage}
        />
      )}
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\modules\customer\customer-overview.tsx

```tsx
"use client";

import { useUiText } from "@/i18n/use-ui-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, CheckCircle } from "lucide-react";
import { useShipmentSummary } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import QueryError from "@/components/ui/query-error";

export default function CustomerOverview() {
  const ui = useUiText();
  const router = useRouter();
  const { data, isLoading, error, refetch } = useShipmentSummary();
  const totalShipments = data?.data.totalShipments ?? 0;
  const pendingShipments = data?.data.activeShipments ?? 0;
  const deliveredShipments = data?.data.deliveredShipments ?? 0;
  if (error)
    return (
      <QueryError
        retry={() => {
          void refetch();
        }}
      />
    );

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => router.push("/dashboard/new-shipment")}>
          {ui("+ Create Shipment")}{" "}
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              {ui("Total Shipments")}
            </CardTitle>
            <Package className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ui(totalShipments)}</div>
          </CardContent>
        </Card>
        <Card className="border-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              {ui("Active & Pending")}
            </CardTitle>
            <Truck className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ui(pendingShipments)}</div>
          </CardContent>
        </Card>
        <Card className="border-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              {ui("Delivered")}
            </CardTitle>
            <CheckCircle className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ui(deliveredShipments)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\modules\customer\shipment-history.tsx

```tsx
"use client";

import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import { useState } from "react";
import {
  useGetAllShipments,
  useGetSingleShipment,
  useCancelShipment,
  useInitiatePayment,
} from "@/hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import QueryError from "@/components/ui/query-error";
import TablePagination from "@/components/ui/table-pagination";
import TrackingTimeline from "../shipment-tracking/tracking-timeline";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getApiErrorMessage } from "@/lib/api-error";
import { Link } from "@/i18n/navigation";

export default function ShipmentHistory() {
  const ui = useUiText();
  const display = useUiFormat();
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState("");
  const { data, isPending, error, refetch } = useGetAllShipments({
    page,
    limit: 10,
  });
  const details = useGetSingleShipment(selectedId);
  const { mutate: cancel, isPending: canceling } = useCancelShipment();
  const { mutate: initiate, isPending: paying } = useInitiatePayment();
  if (error)
    return (
      <QueryError
        retry={() => {
          void refetch();
        }}
      />
    );
  if (isPending) return <Spinner />;
  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{ui("Tracking ID")}</TableHead>
              <TableHead>{ui("Date")}</TableHead>
              <TableHead>{ui("Receiver")}</TableHead>
              <TableHead>{ui("Price")}</TableHead>
              <TableHead>{ui("Status")}</TableHead>
              <TableHead>{ui("Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.length ? (
              data.data.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell className="font-mono">
                    {shipment.trackingId}
                  </TableCell>
                  <TableCell>
                    {display.date(new Date(shipment.createdAt))}
                  </TableCell>
                  <TableCell>{shipment.receiverName}</TableCell>
                  <TableCell>৳{display.money(shipment.price)}</TableCell>
                  <TableCell>
                    {ui(shipment.status.replace(/_/g, " "))}
                    <p className="text-xs">{ui(shipment.paymentStatus)}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {!["PAID", "REFUNDED"].includes(shipment.paymentStatus) &&
                        !["CANCELLED", "RETURNED"].includes(
                          shipment.status,
                        ) && (
                          <Button
                            size="sm"
                            disabled={paying || canceling}
                            onClick={() =>
                              initiate(
                                { shipmentId: shipment.id },
                                {
                                  onSuccess: (response) => {
                                    const url = new URL(
                                      response.data.paymentUrl,
                                    );
                                    if (url.protocol !== "https:") return;
                                    window.location.assign(url.href);
                                  },
                                  onError: (failure) =>
                                    toast.add({
                                      title: "Payment Failed",
                                      description: getApiErrorMessage(failure),
                                      type: "error",
                                    }),
                                },
                              )
                            }
                          >
                            {ui("Pay Now")}
                          </Button>
                        )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedId(shipment.id)}
                      >
                        {ui("Track")}
                      </Button>
                      {shipment.paymentStatus === "UNPAID" && (
                        <Link
                          className="text-sm underline"
                          href={`/payment/success?shipmentId=${shipment.id}`}
                        >
                          {ui("Check Payment")}
                        </Link>
                      )}
                      {shipment.status === "PENDING" &&
                        shipment.paymentStatus !== "PAID" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={canceling || paying}
                            onClick={() =>
                              cancel(shipment.id, {
                                onSuccess: () =>
                                  toast.add({
                                    title: "Shipment Cancelled",
                                    type: "success",
                                  }),
                                onError: (failure) =>
                                  toast.add({
                                    title: "Cancellation Failed",
                                    description: getApiErrorMessage(failure),
                                    type: "error",
                                  }),
                              })
                            }
                          >
                            {ui("Cancel")}
                          </Button>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>{ui("No shipments found.")}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {data?.meta && data.meta.totalPages > 1 && (
        <TablePagination
          page={page}
          totalPages={data.meta.totalPages}
          handlePageChange={setPage}
        />
      )}
      <Dialog
        open={!!selectedId}
        onOpenChange={(open) => {
          if (!open) setSelectedId("");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{ui("Shipment Tracking")}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {details.isError ? (
              <QueryError
                retry={() => {
                  void details.refetch();
                }}
              />
            ) : details.isFetching ? (
              <Spinner />
            ) : (
              <TrackingTimeline
                trackings={details.data?.data.trackings || []}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\modules\google-login\GoogleLogin.tsx

```tsx
"use client";

import { toast } from "@/components/ui/toast";
import { useGoogleOAuth } from "@/hooks";
import { useRouter } from "@/i18n/navigation";
import { getApiErrorMessage } from "@/lib/api-error";
import { GoogleLogin } from "@react-oauth/google";

export default function GoogleLoginComponent() {
  const router = useRouter();
  const { mutate: googleLogin, isPending } = useGoogleOAuth();
  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return null;
  return <div aria-busy={isPending}><GoogleLogin theme="outline" shape="pill" text="continue_with"
    onSuccess={({ credential }) => {
      if (!credential || isPending) return;
      googleLogin({ idToken: credential }, {
        onSuccess: result => {
          const role = result.data.user.role;
          toast.add({ title: "Logged in Successfully", type: "success" });
          router.replace(role === "ADMIN" ? "/admin" : role === "COURIER" ? "/courier" : "/dashboard");
        },
        onError: error => toast.add({ title: "Google Login Failed", description: getApiErrorMessage(error), type: "error" }),
      });
    }}
    onError={() => toast.add({ title: "Google Login Failed", type: "error" })}
  /></div>;
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\modules\payment\payment-status.tsx

```tsx
"use client";

import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { getSingleShipment, reconcilePayment } from "@/api";
import { Link } from "@/i18n/navigation";
import { getApiErrorStatus, getApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import QueryError from "@/components/ui/query-error";

export default function PaymentStatus({ shipmentId }: { shipmentId: string }) {
  const ui = useUiText();
  const display = useUiFormat();
  const bn = useLocale() === "bn";
  const queryClient = useQueryClient();
  const [checking, setChecking] = useState(true);
  const result = useQuery({
    queryKey: ["shipments", shipmentId],
    queryFn: () => getSingleShipment(shipmentId),
    enabled: !!shipmentId,
    retry: false,
    staleTime: 0,
    refetchInterval: (query) =>
      checking &&
      query.state.data?.data.paymentStatus !== "PAID" &&
      !query.state.error
        ? 2000
        : false,
  });
  const paid = result.data?.data.paymentStatus === "PAID";
  const verification = useMutation({
    mutationFn: () => reconcilePayment({ shipmentId }),
    onSuccess: () => {
      void result.refetch();
    },
  });
  useEffect(() => {
    const timer = setTimeout(() => setChecking(false), 45000);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (paid) {
      void queryClient.invalidateQueries({ queryKey: ["payments"] });
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    }
  }, [paid, queryClient]);
  if (!shipmentId)
    return (
      <p role="alert">
        {bn
          ? "অর্থপ্রদান যাচাই করার পরিচয়সংখ্যা নেই।"
          : ui("No shipment was provided for payment verification.")}
      </p>
    );
  if (getApiErrorStatus(result.error) === 401)
    return (
      <Link href="/login">
        {bn
          ? "অর্থপ্রদানের অবস্থা দেখতে প্রবেশ করুন"
          : ui("Sign in to view payment status")}
      </Link>
    );
  if (result.isError)
    return (
      <QueryError
        retry={() => {
          void result.refetch();
        }}
      />
    );
  if (result.isPending) return <Spinner />;
  return (
    <div className="space-y-4" aria-live="polite">
      <h1 className="text-3xl font-bold">
        {paid
          ? bn
            ? "অর্থপ্রদান নিশ্চিত হয়েছে"
            : ui("Payment Confirmed")
          : bn
            ? "অর্থপ্রদান এখনও নিশ্চিত হয়নি"
            : ui("Payment Not Yet Confirmed")}
      </h1>
      <p>
        {paid
          ? bn
            ? "সার্ভারে আপনার অর্থপ্রদানের নথি সংরক্ষিত হয়েছে।"
            : ui("Your payment has been verified and recorded.")
          : bn
            ? "অর্থপ্রদানকারী প্রতিষ্ঠানের যাচাইয়ের জন্য অপেক্ষা করছি।"
            : ui("Awaiting verified payment confirmation from the provider.")}
      </p>
      <p className="font-mono">
        {result.data.data.trackingId} · {ui(result.data.data.paymentStatus)}
      </p>
      {!paid && (
        <Button
          variant="outline"
          disabled={result.isFetching || verification.isPending}
          onClick={() => verification.mutate()}
        >
          {bn ? "আবার যাচাই করুন" : ui("Check again")}
        </Button>
      )}
      {verification.isError && (
        <p role="alert">
          {display.error(getApiErrorMessage(verification.error))}
        </p>
      )}
      <p>
        <Link href="/dashboard/my-shipments">
          {bn ? "পার্সেলের তালিকায় যান" : ui("View My Shipments")}
        </Link>
      </p>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\modules\shipment-tracking\track-form.tsx

```tsx
"use client";

import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { trackShipment } from "@/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import TrackingTimeline from "./tracking-timeline";

export default function TrackForm() {
  const ui = useUiText();
  const display = useUiFormat();
  const bn = useLocale() === "bn";
  const [input, setInput] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const result = useQuery({
    queryKey: ["public-tracking", trackingId],
    queryFn: () => trackShipment(trackingId),
    enabled: !!trackingId,
    retry: false,
  });
  return (
    <div className="space-y-6">
      <form
        className="flex flex-col sm:flex-row gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const value = input.trim().toUpperCase();
          if (!/^TRK-[A-Z0-9-]{4,76}$/.test(value)) return;
          if (trackingId === value) void result.refetch();
          else setTrackingId(value);
        }}
      >
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          required
          maxLength={80}
          pattern={"TRK-[A-Za-z0-9\\-]{4,76}"}
          placeholder="TRK-..."
          aria-label={bn ? "পার্সেলের অনুসন্ধানসংখ্যা" : "Tracking ID"}
        />
        <Button type="submit" disabled={result.isFetching}>
          {result.isFetching ? <Spinner /> : bn ? "খুঁজুন" : ui("Track")}
        </Button>
      </form>
      {result.isError && (
        <p role="alert">
          {display.error(
            getApiErrorMessage(
              result.error,
              bn ? "পার্সেলের তথ্য পাওয়া যায়নি।" : "Tracking unavailable",
            ),
          )}
        </p>
      )}
      {result.data?.data && (
        <div aria-live="polite">
          <p className="font-semibold mb-4">{result.data.data.trackingId}</p>
          <TrackingTimeline trackings={result.data.data.trackings} />
        </div>
      )}
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\modules\shipment-tracking\tracking-timeline.tsx

```tsx
"use client";

import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface TrackingEvent {
  id: string;
  status: string;
  note?: string | null;
  createdAt: string;
}

interface TrackingTimelineProps {
  trackings: TrackingEvent[];
}

export default function TrackingTimeline({ trackings }: TrackingTimelineProps) {
  const ui = useUiText();
  const display = useUiFormat();
  if (!trackings || trackings.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        {ui("No tracking information available yet.")}
      </div>
    );
  }

  const sortedTrackings = [...trackings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="relative pl-6 border-l-2 border-muted space-y-8 my-4">
      {sortedTrackings.map((event, index) => {
        const isLatest = index === 0;
        return (
          <div key={event.id} className="relative">
            <span className="absolute -left-[35px] bg-background">
              {isLatest ? (
                <CheckCircle2 className="size-6 text-primary bg-background rounded-full" />
              ) : (
                <Circle className="size-6 text-muted-foreground bg-background rounded-full" />
              )}
            </span>
            <div className="flex flex-col gap-1">
              <h4
                className={`font-semibold text-sm ${isLatest ? "text-foreground" : "text-muted-foreground"}`}
              >
                {ui(event.status.replace(/_/g, " "))}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                <span>{display.date(new Date(event.createdAt), true)}</span>
              </div>
              {event.note && (
                <p className="text-sm mt-1 text-muted-foreground border-l-2 pl-3 ml-1 border-muted">
                  {event.note}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\ui\button.tsx

```tsx
"use client"

import type * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cn } from "@/lib/utils"
import { buttonVariants, type ButtonVariantsProps } from "@/components/ui/button-variants"

export type ButtonProps = React.ComponentProps<typeof ButtonPrimitive> & ButtonVariantsProps

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\ui\card.tsx

```tsx
import type * as React from "react"
import { cn } from "@/lib/utils"

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-spacing)", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-xl border-t bg-muted/50 p-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\ui\dialog.tsx

```tsx
"use client";

import { useUiText } from "@/i18n/use-ui-text";
import type * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
}) {
  const ui = useUiText();
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-2 right-2"
                size="icon-sm"
              />
            }
          >
            <XIcon />
            <span className="sr-only">{ui("Close")}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  const ui = useUiText();
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          {ui("Close")}{" "}
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-base leading-none font-medium", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\ui\field.tsx

```tsx
"use client";

import { useUiFormat } from "@/i18n/use-ui-text";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

import { Label } from "@/components/ui/label";

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className,
      )}
      {...props}
    />
  );
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-1.5 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base",
        className,
      )}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-5 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        className,
      )}
      {...props}
    />
  );
}

const fieldVariants = cva(
  "group/field flex w-full gap-2 data-[invalid=true]:text-destructive",
  {
    variants: {
      orientation: {
        vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
        horizontal:
          "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        responsive:
          "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  },
);

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"fieldset"> & VariantProps<typeof fieldVariants>) {
  return (
    <fieldset
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "group/field-content flex flex-1 flex-col gap-0.5 leading-snug",
        className,
      )}
      {...props}
    />
  );
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border has-[>[data-slot=field]]:not-has-[:disabled,[data-disabled]]:hover:bg-muted/50 has-[>[data-slot=field]]:has-[:focus-visible]:border-ring has-[>[data-slot=field]]:has-[:focus-visible]:ring-3 has-[>[data-slot=field]]:has-[:focus-visible]:ring-ring/50 *:data-[slot=field]:p-2.5 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-2 text-sm font-medium group-data-[disabled=true]/field:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-left text-sm leading-normal font-normal text-muted-foreground group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
        "last:mt-0 nth-last-2:-mt-1",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className,
      )}
      {...props}
    />
  );
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode;
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
        className,
      )}
      {...props}
    />
  );
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>;
}) {
  const display = useUiFormat();
  const content = (() => {
    if (children) {
      return typeof children === "string" ? display.error(children) : children;
    }

    if (!errors?.length) {
      return null;
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ];

    if (uniqueErrors?.length === 1) {
      return display.error(uniqueErrors[0]?.message);
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map(
          (error) =>
            error?.message && (
              <li key={error.message}>{display.error(error.message)}</li>
            ),
        )}
      </ul>
    );
  })();

  if (!content) {
    return null;
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("text-sm font-normal text-destructive", className)}
      {...props}
    >
      {content}
    </div>
  );
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
};
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\ui\input-otp.tsx

```tsx
"use client"

import * as React from "react"
import { cn } from "cn"
import { OTPInput, OTPInputContext } from "input-otp"
import { MinusIcon } from "lucide-react"

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "cn-input-otp flex items-center has-disabled:opacity-50",
        containerClassName
      )}
      spellCheck={false}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn(
        "flex items-center rounded-lg has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "relative flex size-8 items-center justify-center border-y border-r border-input text-sm transition-all outline-none first:rounded-l-lg first:border-l last:rounded-r-lg aria-invalid:border-destructive data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-3 data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 dark:bg-input/30 dark:data-[active=true]:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      className="flex items-center [&_svg:not([class*='size-'])]:size-4"
      aria-hidden="true"
      {...props}
    >
      <MinusIcon
      />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\ui\input.tsx

```tsx
"use client"

import type * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\ui\label.tsx

```tsx
"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

function Label({ className, htmlFor, children, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      htmlFor={htmlFor}
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    >{children}</label>
  )
}

export { Label }
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\ui\pagination.tsx

```tsx
import { useUiText } from "@/i18n/use-ui-text";
import type * as React from "react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  const ui = useUiText();
  return (
    <nav
      aria-label={ui("pagination")}
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">;

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      variant={isActive ? "outline" : "ghost"}
      size={size}
      className={cn(className)}
      nativeButton={false}
      render={
        <a
          aria-current={isActive ? "page" : undefined}
          data-slot="pagination-link"
          data-active={isActive}
          {...props}
        />
      }
    />
  );
}

function PaginationPrevious({
  className,
  text = "Previous",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  const ui = useUiText();
  return (
    <PaginationLink
      aria-label={ui("Go to previous page")}
      size="default"
      className={cn("pl-1.5!", className)}
      {...props}
    >
      <ChevronLeftIcon data-icon="inline-start" />
      <span className="hidden sm:block">{ui(text)}</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  text = "Next",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  const ui = useUiText();
  return (
    <PaginationLink
      aria-label={ui("Go to next page")}
      size="default"
      className={cn("pr-1.5!", className)}
      {...props}
    >
      <span className="hidden sm:block">{ui(text)}</span>
      <ChevronRightIcon data-icon="inline-end" />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const ui = useUiText();
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">{ui("More pages")}</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\ui\query-error.tsx

```tsx
"use client";

import { useUiText } from "@/i18n/use-ui-text";
import { useLocale } from "next-intl";
import { Button } from "./button";

export default function QueryError({ retry }: { retry: () => void }) {
  const ui = useUiText();
  const bn = useLocale() === "bn";
  return (
    <div role="alert" className="rounded-xl border p-6 text-center space-y-3">
      <p>
        {bn
          ? "তথ্য আনা যায়নি। আবার চেষ্টা করুন।"
          : ui("Unable to load this information. Please try again.")}
      </p>
      <Button variant="outline" onClick={retry}>
        {bn ? "আবার চেষ্টা করুন" : ui("Try again")}
      </Button>
    </div>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\ui\sheet.tsx

```tsx
"use client";

import { useUiText } from "@/i18n/use-ui-text";
import type * as React from "react";
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/10 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
}) {
  const ui = useUiText();
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-10 data-[side=bottom]:data-starting-style:translate-y-10 data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:translate-x-10 data-[side=left]:data-starting-style:translate-x-10 data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-10 data-[side=right]:data-starting-style:translate-x-10 data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:translate-y-10 data-[side=top]:data-starting-style:translate-y-10 data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-3 right-3"
                size="icon-sm"
              />
            }
          >
            <XIcon />
            <span className="sr-only">{ui("Close")}</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-0.5 p-4", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-base font-medium text-foreground", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\ui\sidebar.tsx

```tsx
"use client";

import { useUiText } from "@/i18n/use-ui-text";
import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PanelLeftIcon } from "lucide-react";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...style,
          } as React.CSSProperties
        }
        className={cn(
          "group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  dir,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const ui = useUiText();
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          dir={dir}
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{ui("Sidebar")}</SheetTitle>
            <SheetDescription>
              {ui("Displays the mobile sidebar.")}
            </SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="group peer hidden text-sidebar-foreground md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
        )}
      />
      <div
        data-slot="sidebar-container"
        data-side={side}
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:-left-(--sidebar-width) md:flex",
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="flex size-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:shadow-sm group-data-[variant=floating]:ring-1 group-data-[variant=floating]:ring-sidebar-border"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const ui = useUiText();
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      className={cn(className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">{ui("Toggle Sidebar")}</span>
    </Button>
  );
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const ui = useUiText();
  const { toggleSidebar } = useSidebar();

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label={ui("Toggle Sidebar")}
      tabIndex={-1}
      onClick={toggleSidebar}
      title={ui("Toggle Sidebar")}
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:inset:s-1/2 after:w-0.5 hover:after:bg-sidebar-border sm:flex ltr:-translate-x-1/2 rtl:-translate-x-1/2",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-sidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className,
      )}
      {...props}
    />
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "relative flex w-full flex-1 flex-col bg-background md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className,
      )}
      {...props}
    />
  );
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("h-8 w-full bg-background shadow-none", className)}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "no-scrollbar flex min-h-0 flex-1 flex-col gap-0 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div"> & React.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "sidebar-group-label",
      sidebar: "group-label",
    },
  });
}

function SidebarGroupAction({
  className,
  render,
  ...props
}: useRender.ComponentProps<"button"> & React.ComponentProps<"button">) {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(
          "absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "sidebar-group-action",
      sidebar: "group-action",
    },
  });
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-0", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button group/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function SidebarMenuButton({
  render,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: useRender.ComponentProps<"button"> &
  React.ComponentProps<"button"> & {
    isActive?: boolean;
    tooltip?: string | React.ComponentProps<typeof TooltipContent>;
  } & VariantProps<typeof sidebarMenuButtonVariants>) {
  const { isMobile, state } = useSidebar();
  const comp = useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(sidebarMenuButtonVariants({ variant, size }), className),
      },
      props,
    ),
    render: !tooltip ? render : <TooltipTrigger render={render} />,
    state: {
      slot: "sidebar-menu-button",
      sidebar: "menu-button",
      size,
      active: isActive,
    },
  });

  if (!tooltip) {
    return comp;
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      {comp}
      <TooltipContent hidden={state !== "collapsed" || isMobile} {...tooltip} />
    </Tooltip>
  );
}

function SidebarMenuAction({
  className,
  render,
  showOnHover = false,
  ...props
}: useRender.ComponentProps<"button"> &
  React.ComponentProps<"button"> & {
    showOnHover?: boolean;
  }) {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(
          "absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-transform group-data-[collapsible=icon]:hidden peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0",
          showOnHover &&
            "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-data-active/menu-button:text-sidebar-accent-foreground aria-expanded:opacity-100 md:opacity-0",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "sidebar-menu-action",
      sidebar: "menu-action",
    },
  });
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium text-sidebar-foreground tabular-nums select-none group-data-[collapsible=icon]:hidden peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 peer-data-active/menu-button:text-sidebar-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean;
}) {
  const [width] = React.useState(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  });

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5 group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  );
}

function SidebarMenuSubButton({
  render,
  size = "md",
  isActive = false,
  className,
  ...props
}: useRender.ComponentProps<"a"> &
  React.ComponentProps<"a"> & {
    size?: "sm" | "md";
    isActive?: boolean;
  }) {
  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        className: cn(
          "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground ring-sidebar-ring outline-hidden group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[size=md]:text-sm data-[size=sm]:text-xs data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "sidebar-menu-sub-button",
      sidebar: "menu-sub-button",
      size,
      active: isActive,
    },
  });
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\ui\spinner.tsx

```tsx
import { useUiText } from "@/i18n/use-ui-text";
import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  const ui = useUiText();
  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label={ui("Loading")}
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\ui\table-pagination.tsx

```tsx
import { useUiText } from "@/i18n/use-ui-text";
import type { Dispatch, SetStateAction } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

const getButtonArray = (
  totalPages: number,
  page: number,
): (number | "ellipsis-start" | "ellipsis-end")[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-start", totalPages];
  }

  if (page >= totalPages - 3) {
    return [
      1,
      "ellipsis-start",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis-start",
    page - 1,
    page,
    page + 1,
    "ellipsis-end",
    totalPages,
  ];
};

interface Props {
  totalPages: number;
  handlePageChange: Dispatch<SetStateAction<number>>;
  page: number;
}

export default function TablePagination({
  totalPages,
  handlePageChange,
  page,
}: Props) {
  const ui = useUiText();
  const goToPage = (page: number) => {
    handlePageChange(page);
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => goToPage(page - 1)}
            aria-disabled={page === 1}
            className={
              page === 1 ? "pointer-events-none opacity-50" : undefined
            }
          />
        </PaginationItem>
        {getButtonArray(totalPages, page).map((item) =>
          typeof item === "string" ? (
            <PaginationItem key={item}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                onClick={() => handlePageChange(item as number)}
                isActive={page === item}
              >
                {ui(item)}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            onClick={() => goToPage(page + 1)}
            aria-disabled={page === totalPages}
            className={
              page === totalPages ? "pointer-events-none opacity-50" : undefined
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\ui\table.tsx

```tsx
"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\ui\toast.tsx

```tsx
"use client";

import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import type * as React from "react";
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  XIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const toast = ToastPrimitive.createToastManager();

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />;
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />;
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  const ui = useUiText();
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      aria-label={ui("Notifications")}
      className={cn(
        "pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full",
        className,
      )}
      {...props}
    />
  );
}

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        "group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom rounded-2xl border bg-popover text-popover-foreground shadow-lg will-change-transform outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
        "h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]",
        "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
        "data-limited:opacity-0 data-starting-style:[transform:translateY(150%)]",
        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
        "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        className,
      )}
      {...props}
    />
  );
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        "flex h-full items-center gap-3 overflow-hidden p-4 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  );
}

function ToastDescription({
  className,
  ...props
}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function ToastAction({
  className,
  render = <Button variant="outline" size="sm" />,
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn("shrink-0", className)}
      {...props}
    />
  );
}

function ToastClose({
  className,
  children,
  render = <Button variant="ghost" size="icon-sm" />,
  ...props
}: ToastPrimitive.Close.Props) {
  const ui = useUiText();
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label={ui("Close toast")}
      render={render}
      className={cn(
        "relative shrink-0 text-muted-foreground after:absolute after:-inset-2 after:content-[''] hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children ?? <XIcon aria-hidden="true" />}
    </ToastPrimitive.Close>
  );
}

function ToastIcon({ type }: { type: string | undefined }) {
  let icon: React.ReactNode = null;

  if (type === "success") {
    icon = <CircleCheckIcon aria-hidden="true" />;
  }

  if (type === "info") {
    icon = <InfoIcon aria-hidden="true" />;
  }

  if (type === "warning") {
    icon = <TriangleAlertIcon aria-hidden="true" />;
  }

  if (type === "error") {
    icon = <OctagonXIcon className="text-destructive" aria-hidden="true" />;
  }

  if (type === "loading") {
    icon = <Loader2Icon className="animate-spin" aria-hidden="true" />;
  }

  if (!icon) {
    return null;
  }

  return (
    <span
      data-slot="toast-icon"
      className="shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"
    >
      {icon}
    </span>
  );
}

function ToastList() {
  const ui = useUiText();
  const display = useUiFormat();
  const { toasts } = ToastPrimitive.useToastManager();

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem}>
      <ToastContent>
        <ToastIcon type={toastItem.type} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastTitle>
            {typeof toastItem.title === "string"
              ? ui(toastItem.title)
              : toastItem.title}
          </ToastTitle>
          <ToastDescription>
            {typeof toastItem.description === "string"
              ? toastItem.type === "error"
                ? display.error(toastItem.description)
                : ui(toastItem.description)
              : toastItem.description}
          </ToastDescription>
        </div>
        <ToastAction />
        <ToastClose />
      </ToastContent>
    </Toast>
  ));
}

function Toaster({
  children,
  toastManager = toast,
  ...props
}: ToastPrimitive.Provider.Props) {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}

const createToastManager = ToastPrimitive.createToastManager;
const useToastManager = ToastPrimitive.useToastManager;

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  toast,
  useToastManager,
};
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\components\ui\tooltip.tsx

```tsx
"use client"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { cn } from "@/lib/utils"

function TooltipProvider({ delay = 0, ...props }: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider delay={delay} {...props} />
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root {...props} />
}

function TooltipTrigger({ className, ...props }: TooltipPrimitive.Trigger.Props) {
  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      className={cn(className)}
      {...props}
    />
  )
}

function TooltipContent({
  className,
  ...props
}: TooltipPrimitive.Popup.Props) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner sideOffset={4}>
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
          )}
          {...props}
        />
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\content\legal.ts

```ts
export type LegalKind = "terms" | "privacy" | "cookies";
type Section = { title: string; paragraphs: string[] };
type Document = { title: string; sections: Section[] };

const documents: Record<"en" | "bn", Record<LegalKind, Document>> = {
  en: {
    terms: {
      title: "Terms of Service",
      sections: [
        {
          title: "1. Operator and scope",
          paragraphs: [
            "[Company Name], located at [Address], operates this courier platform. These draft terms cover account access, parcel booking, tracking and payment. Effective date: [Effective Date]. Contact: [Contact Email].",
          ],
        },
        {
          title: "2. Accounts and eligibility",
          paragraphs: [
            "Provide accurate account details, keep credentials and verification codes private, and report unauthorized access. Eligibility and age requirements: [Age Requirement]. Administrative and courier accounts require authorization from the operator.",
          ],
        },
        {
          title: "3. Parcel booking and responsibilities",
          paragraphs: [
            "Provide accurate recipient details, weight, addresses and hub selections. Ensure you are entitled to share recipient information and that the parcel is lawfully transportable and suitably packaged.",
            "Service areas, delivery estimates, restricted goods, packaging requirements and failed-delivery procedures: [Delivery Terms]. Confirm these details before booking; a tracking update is not a delivery guarantee.",
          ],
        },
        {
          title: "4. Prices, payments and refunds",
          paragraphs: [
            "Review the displayed charge before paying. A payment is confirmed only after provider verification and a recorded paid status; visiting a success URL alone does not confirm payment.",
            "Stripe or bKash may process payments when configured. Applicable charges, taxes, cancellations, refunds, cash-on-delivery arrangements and settlement times: [Payment and Refund Policy]. Provider terms may also apply. Do not submit card or wallet credentials through support messages.",
          ],
        },
        {
          title: "5. Acceptable use",
          paragraphs: [
            "Do not use the service for unlawful parcels, fraud, impersonation, unauthorized access, interference with tracking or payments, or disclosure of another person's private information. Access may be restricted to protect the service, subject to applicable law and [Account Suspension and Appeal Process].",
          ],
        },
        {
          title: "6. Service limitations and complaints",
          paragraphs: [
            "Delivery may be affected by route conditions, incomplete recipient information or external service interruptions. Loss, damage, delays, insurance, compensation limits and the complaint procedure must be set out in [Liability and Claims Policy]. This draft does not waive mandatory consumer rights or create a blanket exclusion of liability.",
          ],
        },
        {
          title: "7. Data, ownership and changes",
          paragraphs: [
            "Personal information is described in the Privacy Policy and Cookie Policy. Platform materials belong to their respective owners; using the platform does not transfer ownership of them.",
            "Material changes, notice periods and any account-closure procedure: [Policy Change and Termination Process]. State the applicable law and dispute process only after review: [Jurisdiction and Dispute Resolution].",
          ],
        },
        {
          title: "8. Before final publication",
          paragraphs: [
            "Replace all bracketed placeholders, confirm actual operating practices, publish verified contact information and obtain legal review for the territories served. This is a working draft, not a representation of legal compliance.",
          ],
        },
      ],
    },
    privacy: {
      title: "Privacy Policy",
      sections: [
        {
          title: "1. Who handles your information",
          paragraphs: [
            "[Company Name], [Address], is responsible for the platform's handling of personal information. Contact [Contact Email] for privacy questions. Effective date: [Effective Date]. Privacy representative, if required: [Privacy Contact].",
          ],
        },
        {
          title: "2. Information collected and its sources",
          paragraphs: [
            "Account information may include name, email, phone, address, password hash and verification or session records. Optional profile images and courier contact, vehicle and hub information are handled when supplied.",
            "Parcel information includes sender references, recipient name, phone, delivery address, weight, selected hubs and tracking history. Recipient details are supplied by the sender. Payment records contain amount, provider, payment status and transaction references.",
            "Security and activity records can include request metadata and administrative audit events. Complete the deployment-specific inventory here: [Data Inventory and Sources].",
          ],
        },
        {
          title: "3. Why information is used",
          paragraphs: [
            "Information is used to authenticate accounts, arrange and track deliveries, reconcile payments, send verification or password-reset messages, support users and investigate misuse. Required booking details are needed to fulfill a delivery request.",
            "Specify the legal basis for each purpose under the law that actually applies: [Purpose and Lawful Basis Schedule]. Optional marketing, analytics or automated decision-making must be described separately before activation: [Optional Processing Details].",
          ],
        },
        {
          title: "4. Sharing and external providers",
          paragraphs: [
            "Authorized staff and assigned couriers receive information needed for their duties. Configured payment providers, email delivery, image storage, hosting, databases and other infrastructure services may process necessary information.",
            "Identify each active provider, what it receives, processing locations and applicable safeguards: [Processors and International Transfers]. Avoid listing an integration as active unless it is configured and used.",
          ],
        },
        {
          title: "5. Public tracking and security",
          paragraphs: [
            "Public tracking is designed to expose shipment status and history rather than recipient contact details. Keep tracking identifiers private. Authentication uses session cookies and access controls; technical measures reduce risk but cannot guarantee absolute security.",
            "State incident reporting, notification requirements and operational safeguards after review: [Security and Incident Process].",
          ],
        },
        {
          title: "6. Storage and deletion",
          paragraphs: [
            "Retention and deletion schedules for account, parcel, payment, image, verification, security and audit records: [Retention Schedule]. State any legal recordkeeping obligations, backup deletion delays and account-deletion process. Do not claim data is automatically deleted until that process is implemented and verified.",
          ],
        },
        {
          title: "7. Your choices and requests",
          paragraphs: [
            "You can update available profile fields and contact [Contact Email] to request access, correction, deletion or other rights available under applicable law. Explain identity checks, response times, consent withdrawal, limitations and how to appeal: [Rights Request Procedure].",
            "Privacy complaints and the appropriate regulator, if applicable: [Complaint Process and Supervisory Authority]. Requests may require retention of records where the applicable law requires it.",
          ],
        },
        {
          title: "8. Cookies, age requirements and updates",
          paragraphs: [
            "See the Cookie Policy for session cookies and browser preferences. Eligibility and handling of children's information: [Age Requirement and Children's Privacy]. Changes will be announced through [Privacy Change Notification Process].",
            "Fill every placeholder, verify the actual data flows and seek legal review before adopting this document as a final policy. No jurisdiction-specific compliance claim is made by this draft.",
          ],
        },
      ],
    },
    cookies: {
      title: "Cookie Policy",
      sections: [
        {
          title: "1. Authentication cookies",
          paragraphs: [
            "The backend uses accessToken and refreshToken cookies for signed-in sessions. Production settings should use HTTPS with Secure and HttpOnly protections. Cookie lifetimes and scope: [Cookie Lifetime and Domain Inventory]. These values must match the deployed authentication configuration.",
          ],
        },
        {
          title: "2. Interface preferences",
          paragraphs: [
            "The sidebar_state cookie remembers the dashboard sidebar preference. Locale routing and any locale cookie depend on the deployed language configuration. Record exact names, purposes, durations and providers: [Cookie Inventory].",
          ],
        },
        {
          title: "3. External services and consent",
          paragraphs: [
            "Optional Google sign-in and configured payment services may use their own storage or cookies. Review the actual provider inventory and consent obligations in [Third-party Cookie and Consent Assessment].",
            "Do not enable non-essential analytics or advertising before documenting their purposes and implementing any consent required by the applicable law. This draft does not certify that optional cookies are absent.",
          ],
        },
        {
          title: "4. Managing storage",
          paragraphs: [
            "You can clear or block cookies using browser settings. Blocking session cookies can prevent sign-in and authenticated functions from working. Contact [Contact Email] at [Company Name], [Address], for questions. Effective date: [Effective Date].",
          ],
        },
      ],
    },
  },
  bn: {
    terms: {
      title: "ব্যবহারের শর্তাবলী",
      sections: [
        {
          title: "১. পরিচালনাকারী ও প্রযোজ্য সেবা",
          paragraphs: [
            "[Address] ঠিকানায় অবস্থিত [Company Name] এই পার্সেল পরিবহনব্যবস্থা পরিচালনা করে। অ্যাকাউন্ট ব্যবহার, পার্সেলের অনুরোধ, অনুসরণ ও অর্থপ্রদান এই খসড়ার আওতায় পড়ে। কার্যকর হওয়ার তারিখ: [Effective Date]। যোগাযোগ: [Contact Email]।",
          ],
        },
        {
          title: "২. অ্যাকাউন্ট ও যোগ্যতা",
          paragraphs: [
            "অ্যাকাউন্টের সঠিক তথ্য দিন, পাসওয়ার্ড ও যাচাইয়ের সংকেত গোপন রাখুন এবং অননুমোদিত ব্যবহার জানিয়ে দিন। বয়স ও ব্যবহারের যোগ্যতা: [Age Requirement]। প্রশাসক ও বাহকের অ্যাকাউন্টের জন্য প্রতিষ্ঠানের অনুমোদন প্রয়োজন।",
          ],
        },
        {
          title: "৩. পার্সেলের অনুরোধ ও দায়িত্ব",
          paragraphs: [
            "প্রাপকের পরিচয়, ফোন, ঠিকানা, ওজন ও হাবের সঠিক তথ্য দিন। প্রাপকের তথ্য দেওয়ার বৈধ অধিকার, পণ্যের বৈধতা ও উপযুক্ত মোড়ক নিশ্চিত করুন।",
            "সেবার আওতা, সম্ভাব্য সরবরাহের সময়, নিষিদ্ধ পণ্য, মোড়কের নিয়ম ও ব্যর্থ সরবরাহের ব্যবস্থা: [Delivery Terms]। বুকিংয়ের আগে এগুলো নিশ্চিত করুন। অনুসরণের হালনাগাদ তথ্য সরবরাহের নিশ্চয়তা নয়।",
          ],
        },
        {
          title: "৪. মূল্য, অর্থপ্রদান ও ফেরত",
          paragraphs: [
            "পরিশোধের আগে প্রদর্শিত মূল্য যাচাই করুন। অর্থপ্রদানকারী প্রতিষ্ঠানের যাচাই এবং সার্ভারে পরিশোধিত অবস্থা নথিভুক্ত হওয়ার পরেই অর্থপ্রদান নিশ্চিত হয়। সফলতার পাতায় প্রবেশ করলেই অর্থপ্রদান নিশ্চিত হয় না।",
            "চালু থাকলে Stripe বা bKash অর্থপ্রদান প্রক্রিয়া সম্পন্ন করতে পারে। মূল্য, কর, বাতিল, টাকা ফেরত, পণ্য হাতে পেয়ে মূল্য পরিশোধ ও নিষ্পত্তির সময়: [Payment and Refund Policy]। সংশ্লিষ্ট প্রতিষ্ঠানের শর্তও প্রযোজ্য হতে পারে। সহায়তার বার্তায় কার্ড বা ওয়ালেটের গোপন তথ্য দেবেন না।",
          ],
        },
        {
          title: "৫. গ্রহণযোগ্য ব্যবহার",
          paragraphs: [
            "অবৈধ পণ্য, প্রতারণা, পরিচয় জালিয়াতি, অননুমোদিত প্রবেশ, পার্সেল বা অর্থপ্রদানের তথ্য বিকৃতি এবং অন্যের ব্যক্তিগত তথ্য প্রকাশের জন্য সেবা ব্যবহার করবেন না। সুরক্ষার জন্য প্রযোজ্য আইন ও [Account Suspension and Appeal Process] অনুযায়ী প্রবেশ সীমিত করা হতে পারে।",
          ],
        },
        {
          title: "৬. সীমাবদ্ধতা ও অভিযোগ",
          paragraphs: [
            "পথের পরিস্থিতি, অসম্পূর্ণ প্রাপকের তথ্য বা বাইরের সেবার সমস্যায় সরবরাহ বাধাগ্রস্ত হতে পারে। ক্ষতি, বিলম্ব, বিমা, ক্ষতিপূরণের সীমা ও অভিযোগের পদ্ধতি লিখুন: [Liability and Claims Policy]। এই খসড়া বাধ্যতামূলক ভোক্তা অধিকার বাতিল করে না এবং সব দায় থেকে অব্যাহতি দেয় না।",
          ],
        },
        {
          title: "৭. তথ্য, মালিকানা ও পরিবর্তন",
          paragraphs: [
            "ব্যক্তিগত তথ্যের ব্যবহার গোপনীয়তার নীতি ও কুকির নীতিতে বর্ণিত। ব্যবস্থার উপকরণের মালিকানা সংশ্লিষ্ট মালিকের; ব্যবহার করলে মালিকানা হস্তান্তর হয় না।",
            "গুরুত্বপূর্ণ পরিবর্তন জানানো, নোটিশ ও অ্যাকাউন্ট বন্ধের পদ্ধতি: [Policy Change and Termination Process]। পর্যালোচনার পরে প্রযোজ্য আইন ও বিরোধ নিষ্পত্তি লিখুন: [Jurisdiction and Dispute Resolution]।",
          ],
        },
        {
          title: "৮. চূড়ান্ত প্রকাশের আগে",
          paragraphs: [
            "বন্ধনীর সব প্লেসহোল্ডার পূরণ করুন, বাস্তব পরিচালনার নিয়ম যাচাই করুন, সঠিক যোগাযোগের তথ্য দিন এবং সেবার আওতাভুক্ত এলাকার জন্য আইনি পর্যালোচনা করান। এটি কাজের খসড়া, আইন মেনে চলার প্রত্যয়ন নয়।",
          ],
        },
      ],
    },
    privacy: {
      title: "গোপনীয়তার নীতি",
      sections: [
        {
          title: "১. তথ্য পরিচালনার দায়িত্ব",
          paragraphs: [
            "[Company Name], [Address], এই ব্যবস্থায় ব্যক্তিগত তথ্য পরিচালনার জন্য দায়ী। গোপনীয়তা নিয়ে যোগাযোগ: [Contact Email]। কার্যকর হওয়ার তারিখ: [Effective Date]। প্রয়োজন হলে গোপনীয়তার প্রতিনিধি: [Privacy Contact]।",
          ],
        },
        {
          title: "২. সংগৃহীত তথ্য ও উৎস",
          paragraphs: [
            "অ্যাকাউন্টের তথ্যে নাম, ইমেইল, ফোন, ঠিকানা, পাসওয়ার্ডের হ্যাশ এবং যাচাই বা সেশনের নথি থাকতে পারে। দেওয়া হলে ঐচ্ছিক প্রোফাইল ছবি, বাহকের যোগাযোগ, যানবাহন ও হাবের তথ্য পরিচালিত হয়।",
            "পার্সেলের তথ্যে প্রেরকের পরিচয়, প্রাপকের নাম, ফোন, ঠিকানা, ওজন, নির্বাচিত হাব ও পথের ইতিহাস থাকে। প্রাপকের তথ্য প্রেরক দেন। অর্থপ্রদানের নথিতে পরিমাণ, মাধ্যম, অবস্থা ও লেনদেনের পরিচয় থাকে।",
            "নিরাপত্তা ও কার্যক্রমের নথিতে অনুরোধের কারিগরি তথ্য ও প্রশাসনিক ঘটনা থাকতে পারে। বাস্তব ব্যবস্থার তথ্যের পূর্ণ তালিকা লিখুন: [Data Inventory and Sources]।",
          ],
        },
        {
          title: "৩. তথ্য ব্যবহারের উদ্দেশ্য",
          paragraphs: [
            "অ্যাকাউন্ট যাচাই, পার্সেল পাঠানো ও অনুসরণ, অর্থপ্রদান যাচাই, নিবন্ধন বা পাসওয়ার্ড বদলানোর বার্তা পাঠানো, সহায়তা ও অপব্যবহার শনাক্ত করতে তথ্য ব্যবহার করা হয়। সরবরাহের অনুরোধ সম্পন্ন করতে প্রয়োজনীয় তথ্য দিতে হয়।",
            "যে আইন বাস্তবে প্রযোজ্য, সে অনুযায়ী প্রতিটি উদ্দেশ্যের বৈধ ভিত্তি লিখুন: [Purpose and Lawful Basis Schedule]। ঐচ্ছিক প্রচার, ব্যবহার বিশ্লেষণ বা স্বয়ংক্রিয় সিদ্ধান্ত চালুর আগে আলাদা বিবরণ দিন: [Optional Processing Details]।",
          ],
        },
        {
          title: "৪. তথ্য ভাগ করা ও বাইরের সেবা",
          paragraphs: [
            "অনুমোদিত কর্মী ও নির্ধারিত বাহক তাঁদের কাজের প্রয়োজনীয় তথ্য পান। চালু থাকা অর্থপ্রদান, ইমেইল, ছবি সংরক্ষণ, হোস্টিং, ডেটাবেস ও অবকাঠামোর সেবা প্রয়োজনীয় তথ্য প্রক্রিয়াকরণ করতে পারে।",
            "প্রতিটি চালু প্রতিষ্ঠানের নাম, প্রাপ্ত তথ্য, প্রক্রিয়াকরণের দেশ ও সুরক্ষাব্যবস্থা লিখুন: [Processors and International Transfers]। কোনো সংযোগ বাস্তবে চালু ও ব্যবহৃত না হলে তাকে সক্রিয় বলে লিখবেন না।",
          ],
        },
        {
          title: "৫. প্রকাশ্য অনুসরণ ও নিরাপত্তা",
          paragraphs: [
            "প্রকাশ্য অনুসরণে প্রাপকের যোগাযোগের তথ্যের বদলে পার্সেলের অবস্থা ও ইতিহাস দেখানোর ব্যবস্থা রয়েছে। অনুসন্ধানসংখ্যা গোপন রাখুন। পরিচয় যাচাইয়ে সেশন কুকি ও প্রবেশের নিয়ন্ত্রণ ব্যবহৃত হয়। নিরাপত্তাব্যবস্থা ঝুঁকি কমায়, সম্পূর্ণ নিরাপত্তার নিশ্চয়তা দেয় না।",
            "ঘটনা জানানো, প্রযোজ্য বিজ্ঞপ্তি ও পরিচালনাগত সুরক্ষাব্যবস্থা পর্যালোচনা করে লিখুন: [Security and Incident Process]।",
          ],
        },
        {
          title: "৬. সংরক্ষণ ও মুছে ফেলা",
          paragraphs: [
            "অ্যাকাউন্ট, পার্সেল, অর্থপ্রদান, ছবি, যাচাই, নিরাপত্তা ও কার্যক্রমের তথ্য রাখার সময় এবং মুছে ফেলার নিয়ম: [Retention Schedule]। আইনগত সংরক্ষণ, ব্যাকআপ মোছার বিলম্ব ও অ্যাকাউন্ট মুছে ফেলার পদ্ধতি লিখুন। ব্যবস্থা তৈরি ও যাচাই না হওয়া পর্যন্ত স্বয়ংক্রিয়ভাবে তথ্য মুছে ফেলার দাবি করবেন না।",
          ],
        },
        {
          title: "৭. আপনার পছন্দ ও অনুরোধ",
          paragraphs: [
            "উপলব্ধ প্রোফাইলের ঘরগুলো বদলাতে পারেন। প্রযোজ্য আইনে তথ্য দেখা, সংশোধন, মুছে ফেলা বা অন্য অধিকার প্রয়োগের জন্য [Contact Email] ঠিকানায় অনুরোধ করুন। পরিচয় যাচাই, উত্তর দেওয়ার সময়, সম্মতি প্রত্যাহার, সীমাবদ্ধতা ও আপিলের পদ্ধতি: [Rights Request Procedure]।",
            "গোপনীয়তার অভিযোগ ও প্রযোজ্য নিয়ন্ত্রক কর্তৃপক্ষ: [Complaint Process and Supervisory Authority]। প্রযোজ্য আইন অনুযায়ী কিছু নথি সংরক্ষণ করা প্রয়োজন হতে পারে।",
          ],
        },
        {
          title: "৮. কুকি, বয়স ও পরিবর্তন",
          paragraphs: [
            "সেশন কুকি ও ব্রাউজারের পছন্দের জন্য কুকির নীতি দেখুন। বয়সের যোগ্যতা ও শিশুদের তথ্যের নিয়ম: [Age Requirement and Children's Privacy]। নীতির পরিবর্তন জানানোর পদ্ধতি: [Privacy Change Notification Process]।",
            "চূড়ান্ত নীতি হিসেবে গ্রহণের আগে সব প্লেসহোল্ডার পূরণ, বাস্তব তথ্যের প্রবাহ যাচাই ও আইনি পর্যালোচনা করুন। এই খসড়া কোনো নির্দিষ্ট দেশের আইন মেনে চলার নিশ্চয়তা দেয় না।",
          ],
        },
      ],
    },
    cookies: {
      title: "কুকির নীতি",
      sections: [
        {
          title: "১. পরিচয় যাচাইয়ের কুকি",
          paragraphs: [
            "ব্যাকএন্ডে অ্যাকাউন্টের সেশনের জন্য accessToken ও refreshToken কুকি ব্যবহৃত হয়। প্রোডাকশনে HTTPS এবং Secure ও HttpOnly সুরক্ষা প্রয়োগ করা উচিত। কুকির মেয়াদ ও আওতা: [Cookie Lifetime and Domain Inventory]। প্রকাশিত তথ্যের সঙ্গে বাস্তব কনফিগারেশন মিলতে হবে।",
          ],
        },
        {
          title: "২. পর্দার পছন্দ",
          paragraphs: [
            "sidebar_state কুকি ড্যাশবোর্ডের পাশের মেনুর পছন্দ মনে রাখে। ভাষার পথ ও ভাষা-সংক্রান্ত কুকি বাস্তব ভাষা-কনফিগারেশনের ওপর নির্ভর করে। নাম, উদ্দেশ্য, মেয়াদ ও সেবাদাতার পূর্ণ তালিকা: [Cookie Inventory]।",
          ],
        },
        {
          title: "৩. বাইরের সেবা ও সম্মতি",
          paragraphs: [
            "ঐচ্ছিক গুগল প্রবেশ ও চালু অর্থপ্রদানের সেবা নিজস্ব কুকি বা সংরক্ষণ ব্যবহার করতে পারে। বাস্তব তালিকা ও সম্মতির প্রয়োজন পর্যালোচনা করুন: [Third-party Cookie and Consent Assessment]।",
            "অপ্রয়োজনীয় ব্যবহার-বিশ্লেষণ বা বিজ্ঞাপন চালুর আগে উদ্দেশ্য লিখুন এবং প্রযোজ্য আইনে দরকার হলে সম্মতির ব্যবস্থা করুন। এই খসড়া ঐচ্ছিক কুকি নেই বলে প্রত্যয়ন করে না।",
          ],
        },
        {
          title: "৪. সংরক্ষণ নিয়ন্ত্রণ",
          paragraphs: [
            "ব্রাউজারের সেটিংস দিয়ে কুকি মুছতে বা বন্ধ করতে পারেন। সেশনের কুকি বন্ধ করলে প্রবেশ ও অনুমতিনির্ভর কাজ বন্ধ হতে পারে। প্রশ্নের জন্য [Company Name], [Address], [Contact Email] ঠিকানায় যোগাযোগ করুন। কার্যকর হওয়ার তারিখ: [Effective Date]।",
          ],
        },
      ],
    },
  },
};

export function getLegalDocument(locale: string, kind: LegalKind) {
  return documents[locale === "bn" ? "bn" : "en"][kind];
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\hooks\auth.hook.ts

```ts
import { forgotPassword, googleOAuth, registerCustomer, resetPassword, userLogin, userLogout, verifyEmail } from "@/api";
import { clearAccessToken } from "@/lib/auth-token";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function useSessionMutation<TPayload, TResult>(mutationFn: (payload: TPayload) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => { clearAccessToken(); queryClient.clear(); } });
}
export const useRegistration = () => useMutation({ mutationFn: registerCustomer });
export const useVerifyEmail = () => useSessionMutation(verifyEmail);
export const useLogin = () => useSessionMutation(userLogin);
export const useGoogleOAuth = () => useSessionMutation(googleOAuth);
export const useForgotPassword = () => useMutation({ mutationFn: forgotPassword });
export const useResetPassword = () => useSessionMutation(resetPassword);
export const useLogout = () => useSessionMutation(userLogout);
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\hooks\shipment.hook.ts

```ts
import {
  assignCourier,
  cancelShipment,
  createShipment,
  getAllShipments,
  getSingleShipment,
  getShipmentSummary,
  updateShipmentStatus,
} from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCreateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createShipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useGetAllShipments(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["shipments", params],
    queryFn: () => getAllShipments(params),
  });
}

export function useGetSingleShipment(id: string) {
  return useQuery({
    queryKey: ["shipments", id],
    queryFn: () => getSingleShipment(id),
    enabled: !!id,
  });
}

export function useAssignCourier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      assignCourier(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["couriers"] });
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["shipments", variables.id] });
    },
  });
}

export function useUpdateShipmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      updateShipmentStatus(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["couriers"] });
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["shipments", variables.id] });
    },
  });
}

export function useCancelShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelShipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useShipmentSummary() {
  return useQuery({ queryKey: ["shipments", "summary"], queryFn: getShipmentSummary });
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\i18n\navigation.ts

```ts
import { createNavigation } from "next-intl/navigation";

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation({
  locales: ["en", "bn"], defaultLocale: "en",
});
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\i18n\ui.ts

```ts
import bengali from "../../messages/ui.bn.json";

const messages: Record<string, string> = bengali;

export function translateUi(
  locale: string,
  text: string | number | null | undefined,
): string {
  if (text == null) return "";
  if (typeof text === "number")
    return new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-US").format(
      text,
    );
  return locale === "bn" ? (messages[text] ?? text) : text;
}

export function translateError(
  locale: string,
  message: string | null | undefined,
): string {
  if (!message) return translateUi(locale, "Unable to complete this request");
  if (locale !== "bn" || /[\u0980-\u09ff]/.test(message)) return message;
  return (
    messages[message] ?? "অনুরোধটি সম্পন্ন করা যায়নি। তথ্য যাচাই করে আবার চেষ্টা করুন।"
  );
}

export function formatUiDate(
  locale: string,
  value: Date | string,
  includeTime = false,
): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return translateUi(locale, "N/A");
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "Asia/Dhaka",
    ...(includeTime ? ({ hour: "2-digit", minute: "2-digit" } as const) : {}),
  }).format(date);
}

export function formatUiNumber(
  locale: string,
  value: string | number,
  money = false,
): string {
  const number = Number(value);
  if (!Number.isFinite(number)) return translateUi(locale, "N/A");
  return new Intl.NumberFormat(
    locale === "bn" ? "bn-BD" : "en-US",
    money
      ? {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      : {},
  ).format(number);
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\i18n\use-ui-text.ts

```ts
import { useLocale } from "next-intl";
import {
  formatUiDate,
  formatUiNumber,
  translateError,
  translateUi,
} from "./ui";

export function useUiText() {
  const locale = useLocale();
  return (text: string | number | null | undefined) =>
    translateUi(locale, text);
}

export function useUiFormat() {
  const locale = useLocale();
  return {
    date: (value: Date | string, includeTime = false) =>
      formatUiDate(locale, value, includeTime),
    number: (value: string | number) => formatUiNumber(locale, value),
    money: (value: string | number) => formatUiNumber(locale, value, true),
    error: (message: string | null | undefined) =>
      translateError(locale, message),
  };
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\lib\api-error.ts

```ts
import type { FetchError } from "ofetch";

export function getApiErrorStatus(error: unknown): number | undefined {
  return (error as FetchError | undefined)?.response?.status;
}
export function getApiErrorMessage(error: unknown, fallback = "Unable to complete this request"): string {
  const data = (error as FetchError<{ message?: string }> | undefined)?.data;
  return typeof data?.message === "string" ? data.message : fallback;
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\lib\apiClient.ts

```ts
import { ofetch, type FetchOptions, type FetchError } from "ofetch";

const transport = ofetch.create({
  baseURL: "/api/backend",
  credentials: "include",
  retry: 0,
  timeout: 20000,
  headers: { "X-Courier-Client": "1" },
});
const publicAuthPaths = new Set(["/auth/login", "/auth/register", "/auth/verify-email", "/auth/refresh-token", "/auth/google", "/auth/forgot-password", "/auth/reset-password", "/auth/logout"]);
let refreshPromise: Promise<unknown> | null = null;

export default async function apiClient<T = unknown>(request: string, options: FetchOptions<"json"> = {}): Promise<T> {
  try {
    return await transport<T>(request, options);
  } catch (error) {
    const failure = error as FetchError;
    if (failure.response?.status !== 401 || publicAuthPaths.has(request) || request.startsWith("/shipments/track/")) throw error;
    if (!refreshPromise) {
      refreshPromise = transport("/auth/refresh-token", { method: "POST" }).finally(() => { refreshPromise = null; });
    }
    await refreshPromise;
    return transport<T>(request, options);
  }
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\lib\auth-token.ts

```ts
export const clearAccessToken = () => {
  if (typeof window !== "undefined") localStorage.removeItem("accessToken");
};
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\providers\google-auth.provider.tsx

```tsx
"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { useLocale } from "next-intl";
import type { ReactNode } from "react";

export default function GoogleAuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const locale = useLocale();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId} locale={locale}>
      {children}
    </GoogleOAuthProvider>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\providers\index.tsx

```tsx
"use client";

import type { ReactNode } from "react";
import QueryProvider from "./query.provider";
import GoogleAuthProvider from "./google-auth.provider";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <GoogleAuthProvider>
      <QueryProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </QueryProvider>
    </GoogleAuthProvider>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\providers\query.provider.tsx

```tsx
"use client";

import { isServer, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined ;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}

export default function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\proxy.ts

```ts
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware({ locales: ["en", "bn"], defaultLocale: "en" });

export function proxy(request: NextRequest) {
  return intlMiddleware(request);
}
export const config = { matcher: ["/((?!api|_next|.*\\..*).*)"] };
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\routes\admin.routes.ts

```ts
import type { SidebarItems } from "@/types";

const prefix = "/admin";

export const adminRoutes: SidebarItems = [
  {
    title: "Management",
    items: [
      {
        title: "Overview",
        url: `${prefix}`,
      },
      {
        title: "Manage Users",
        url: `${prefix}/manage-users`,
      },
      {
        title: "Manage Couriers",
        url: `${prefix}/manage-couriers`,
      },
      {
        title: "Hubs",
        url: `${prefix}/hubs`,
      },
      {
        title: "All Shipments",
        url: `${prefix}/all-shipments`,
      },
    ],
  },
];
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\routes\courier.routes.ts

```ts
import type { SidebarItems } from "@/types";

const prefix = "/courier";

export const courierRoutes: SidebarItems = [
  {
    title: "Delivery Management",
    items: [
      {
        title: "Overview",
        url: `${prefix}`,
      },
      {
        title: "My Deliveries",
        url: `${prefix}/deliveries`,
      },
      {
        title: "Earnings",
        url: `${prefix}/earnings`,
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        title: "Profile",
        url: `${prefix}/profile`,
      },
    ],
  },
];
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\routes\customer.routes.ts

```ts
import type { SidebarItems } from "@/types";

const prefix = "/dashboard";

export const customerRoutes: SidebarItems = [
  {
    title: "Shipments",
    items: [
      {
        title: "Overview",
        url: `${prefix}`,
      },
      {
        title: "New Shipment",
        url: `${prefix}/new-shipment`,
      },
      {
        title: "My Shipments",
        url: `${prefix}/my-shipments`,
      },
    ],
  },
  {
    title: "Billing & Settings",
    items: [
      {
        title: "Payments",
        url: `${prefix}/payments`,
      },
      {
        title: "Profile",
        url: `${prefix}/profile`,
      },
    ],
  },
];
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\styles\shadcn.css

```css
@theme inline {
  @keyframes accordion-down {
    from {
      height: 0;
    }
    to {
      height: var(
        --radix-accordion-content-height,
        var(--accordion-panel-height, auto)
      );
    }
  }

  @keyframes accordion-up {
    from {
      height: var(
        --radix-accordion-content-height,
        var(--accordion-panel-height, auto)
      );
    }
    to {
      height: 0;
    }
  }
}


@custom-variant data-open {
  &:where([data-state="open"]),
  &:where([data-open]:not([data-open="false"])) {
    @slot;
  }
}

@custom-variant data-closed {
  &:where([data-state="closed"]),
  &:where([data-closed]:not([data-closed="false"])) {
    @slot;
  }
}

@custom-variant data-checked {
  &:where([data-state="checked"]),
  &:where([data-checked]:not([data-checked="false"])) {
    @slot;
  }
}

@custom-variant data-unchecked {
  &:where([data-state="unchecked"]),
  &:where([data-unchecked]:not([data-unchecked="false"])) {
    @slot;
  }
}

@custom-variant data-selected {
  &:where([data-selected="true"]) {
    @slot;
  }
}

@custom-variant data-disabled {
  &:where([data-disabled="true"]),
  &:where([data-disabled]:not([data-disabled="false"])) {
    @slot;
  }
}

@custom-variant data-active {
  &:where([data-state="active"]),
  &:where([data-active]:not([data-active="false"])) {
    @slot;
  }
}

@custom-variant data-horizontal {
  &:where([data-orientation="horizontal"]) {
    @slot;
  }
}

@custom-variant data-vertical {
  &:where([data-orientation="vertical"]) {
    @slot;
  }
}

@utility no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}


@property --scroll-fade-t {
  syntax: "<length-percentage>";
  inherits: false;
  initial-value: 0px;
}
@property --scroll-fade-b {
  syntax: "<length-percentage>";
  inherits: false;
  initial-value: 0px;
}
@property --scroll-fade-s {
  syntax: "<length-percentage>";
  inherits: false;
  initial-value: 0px;
}
@property --scroll-fade-e {
  syntax: "<length-percentage>";
  inherits: false;
  initial-value: 0px;
}
@property --scroll-fade-mask {
  syntax: "*";
  inherits: false;
}

@theme inline {
  @keyframes scroll-fade-reveal-t {
    from {
      --scroll-fade-t: 0px;
    }
    to {
      --scroll-fade-t: var(--_scroll-fade-size-t, var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10))));
    }
  }
  @keyframes scroll-fade-reveal-b {
    from {
      --scroll-fade-b: var(--_scroll-fade-size-b, var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10))));
    }
    to {
      --scroll-fade-b: 0px;
    }
  }
  @keyframes scroll-fade-reveal-s {
    from {
      --scroll-fade-s: 0px;
    }
    to {
      --scroll-fade-s: var(--_scroll-fade-size-s, var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10))));
    }
  }
  @keyframes scroll-fade-reveal-e {
    from {
      --scroll-fade-e: var(--_scroll-fade-size-e, var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10))));
    }
    to {
      --scroll-fade-e: 0px;
    }
  }
}

@utility scroll-fade {
  --_scroll-fade-size-t: var(
    --scroll-fade-t-size,
    var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10)))
  );
  --_scroll-fade-size-b: var(
    --scroll-fade-b-size,
    var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10)))
  );
  --scroll-fade-block: linear-gradient(
    to bottom,
    transparent 0,
    #000 var(--scroll-fade-t, 0px),
    #000 calc(100% - var(--scroll-fade-b, 0px)),
    transparent 100%
  );
  -webkit-mask-image: var(--scroll-fade-mask, var(--scroll-fade-block));
  mask-image: var(--scroll-fade-mask, var(--scroll-fade-block));
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;

  @supports (animation-timeline: scroll()) {
    animation:
      scroll-fade-reveal-t 1ms ease-in-out,
      scroll-fade-reveal-b 1ms ease-in-out;
    animation-timeline: scroll(self y), scroll(self y);
    animation-range:
      0 var(--scroll-fade-reveal, calc(var(--spacing) * 24)),
      calc(100% - var(--scroll-fade-reveal, calc(var(--spacing) * 24))) 100%;
    animation-fill-mode: both;
  }

  @supports not (animation-timeline: scroll()) {
    --scroll-fade-t: var(--_scroll-fade-size-t);
    --scroll-fade-b: var(--_scroll-fade-size-b);
  }
}

@utility scroll-fade-y {
  --_scroll-fade-size-t: var(
    --scroll-fade-t-size,
    var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10)))
  );
  --_scroll-fade-size-b: var(
    --scroll-fade-b-size,
    var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10)))
  );
  --scroll-fade-block: linear-gradient(
    to bottom,
    transparent 0,
    #000 var(--scroll-fade-t, 0px),
    #000 calc(100% - var(--scroll-fade-b, 0px)),
    transparent 100%
  );
  -webkit-mask-image: var(--scroll-fade-mask, var(--scroll-fade-block));
  mask-image: var(--scroll-fade-mask, var(--scroll-fade-block));
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;

  @supports (animation-timeline: scroll()) {
    animation:
      scroll-fade-reveal-t 1ms ease-in-out,
      scroll-fade-reveal-b 1ms ease-in-out;
    animation-timeline: scroll(self y), scroll(self y);
    animation-range:
      0 var(--scroll-fade-reveal, calc(var(--spacing) * 24)),
      calc(100% - var(--scroll-fade-reveal, calc(var(--spacing) * 24))) 100%;
    animation-fill-mode: both;
  }

  @supports not (animation-timeline: scroll()) {
    --scroll-fade-t: var(--_scroll-fade-size-t);
    --scroll-fade-b: var(--_scroll-fade-size-b);
  }
}

@utility scroll-fade-x {
  --_scroll-fade-size-s: var(
    --scroll-fade-s-size,
    var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10)))
  );
  --_scroll-fade-size-e: var(
    --scroll-fade-e-size,
    var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10)))
  );
  --scroll-fade-inline: linear-gradient(
    to right,
    transparent 0,
    #000 var(--scroll-fade-s, 0px),
    #000 calc(100% - var(--scroll-fade-e, 0px)),
    transparent 100%
  );
  &:where([dir="rtl"], [dir="rtl"] *) {
    --scroll-fade-inline: linear-gradient(
      to left,
      transparent 0,
      #000 var(--scroll-fade-s, 0px),
      #000 calc(100% - var(--scroll-fade-e, 0px)),
      transparent 100%
    );
  }
  -webkit-mask-image: var(--scroll-fade-mask, var(--scroll-fade-inline));
  mask-image: var(--scroll-fade-mask, var(--scroll-fade-inline));
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;

  @supports (animation-timeline: scroll()) {
    animation:
      scroll-fade-reveal-s 1ms ease-in-out,
      scroll-fade-reveal-e 1ms ease-in-out;
    animation-timeline: scroll(self inline), scroll(self inline);
    animation-range:
      0 var(--scroll-fade-reveal, calc(var(--spacing) * 24)),
      calc(100% - var(--scroll-fade-reveal, calc(var(--spacing) * 24))) 100%;
    animation-fill-mode: both;
  }

  @supports not (animation-timeline: scroll()) {
    --scroll-fade-s: var(--_scroll-fade-size-s);
    --scroll-fade-e: var(--_scroll-fade-size-e);
  }
}

@utility scroll-fade-t {
  --_scroll-fade-size-t: var(
    --scroll-fade-t-size,
    var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10)))
  );
  --scroll-fade-mask: linear-gradient(
    to bottom,
    transparent 0,
    #000 var(--scroll-fade-t, 0px),
    #000 100%
  );
  -webkit-mask-image: var(--scroll-fade-mask);
  mask-image: var(--scroll-fade-mask);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;

  @supports (animation-timeline: scroll()) {
    animation: scroll-fade-reveal-t 1ms ease-in-out;
    animation-timeline: scroll(self y);
    animation-range: 0 var(--scroll-fade-reveal, calc(var(--spacing) * 24));
    animation-fill-mode: both;
  }

  @supports not (animation-timeline: scroll()) {
    --scroll-fade-t: var(--_scroll-fade-size-t);
  }
}

@utility scroll-fade-b {
  --_scroll-fade-size-b: var(
    --scroll-fade-b-size,
    var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10)))
  );
  --scroll-fade-mask: linear-gradient(
    to bottom,
    #000 0,
    #000 calc(100% - var(--scroll-fade-b, 0px)),
    transparent 100%
  );
  -webkit-mask-image: var(--scroll-fade-mask);
  mask-image: var(--scroll-fade-mask);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;

  @supports (animation-timeline: scroll()) {
    animation: scroll-fade-reveal-b 1ms ease-in-out;
    animation-timeline: scroll(self y);
    animation-range: calc(
        100% - var(--scroll-fade-reveal, calc(var(--spacing) * 24))
      )
      100%;
    animation-fill-mode: both;
  }

  @supports not (animation-timeline: scroll()) {
    --scroll-fade-b: var(--_scroll-fade-size-b);
  }
}

@utility scroll-fade-l {
  --_scroll-fade-size-s: var(
    --scroll-fade-s-size,
    var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10)))
  );
  --scroll-fade-mask: linear-gradient(
    to right,
    transparent 0,
    #000 var(--scroll-fade-s, 0px),
    #000 100%
  );
  -webkit-mask-image: var(--scroll-fade-mask);
  mask-image: var(--scroll-fade-mask);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;

  @supports (animation-timeline: scroll()) {
    animation: scroll-fade-reveal-s 1ms ease-in-out;
    animation-timeline: scroll(self x);
    animation-range: 0 var(--scroll-fade-reveal, calc(var(--spacing) * 24));
    animation-fill-mode: both;
  }

  @supports not (animation-timeline: scroll()) {
    --scroll-fade-s: var(--_scroll-fade-size-s);
  }
}

@utility scroll-fade-r {
  --_scroll-fade-size-e: var(
    --scroll-fade-e-size,
    var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10)))
  );
  --scroll-fade-mask: linear-gradient(
    to right,
    #000 0,
    #000 calc(100% - var(--scroll-fade-e, 0px)),
    transparent 100%
  );
  -webkit-mask-image: var(--scroll-fade-mask);
  mask-image: var(--scroll-fade-mask);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;

  @supports (animation-timeline: scroll()) {
    animation: scroll-fade-reveal-e 1ms ease-in-out;
    animation-timeline: scroll(self x);
    animation-range: calc(
        100% - var(--scroll-fade-reveal, calc(var(--spacing) * 24))
      )
      100%;
    animation-fill-mode: both;
  }

  @supports not (animation-timeline: scroll()) {
    --scroll-fade-e: var(--_scroll-fade-size-e);
  }
}

@utility scroll-fade-s {
  --_scroll-fade-size-s: var(
    --scroll-fade-s-size,
    var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10)))
  );
  --scroll-fade-mask: linear-gradient(
    to right,
    transparent 0,
    #000 var(--scroll-fade-s, 0px),
    #000 100%
  );
  &:where([dir="rtl"], [dir="rtl"] *) {
    --scroll-fade-mask: linear-gradient(
      to left,
      transparent 0,
      #000 var(--scroll-fade-s, 0px),
      #000 100%
    );
  }
  -webkit-mask-image: var(--scroll-fade-mask);
  mask-image: var(--scroll-fade-mask);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;

  @supports (animation-timeline: scroll()) {
    animation: scroll-fade-reveal-s 1ms ease-in-out;
    animation-timeline: scroll(self inline);
    animation-range: 0 var(--scroll-fade-reveal, calc(var(--spacing) * 24));
    animation-fill-mode: both;
  }

  @supports not (animation-timeline: scroll()) {
    --scroll-fade-s: var(--_scroll-fade-size-s);
  }
}

@utility scroll-fade-e {
  --_scroll-fade-size-e: var(
    --scroll-fade-e-size,
    var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10)))
  );
  --scroll-fade-mask: linear-gradient(
    to right,
    #000 0,
    #000 calc(100% - var(--scroll-fade-e, 0px)),
    transparent 100%
  );
  &:where([dir="rtl"], [dir="rtl"] *) {
    --scroll-fade-mask: linear-gradient(
      to left,
      #000 0,
      #000 calc(100% - var(--scroll-fade-e, 0px)),
      transparent 100%
    );
  }
  -webkit-mask-image: var(--scroll-fade-mask);
  mask-image: var(--scroll-fade-mask);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;

  @supports (animation-timeline: scroll()) {
    animation: scroll-fade-reveal-e 1ms ease-in-out;
    animation-timeline: scroll(self inline);
    animation-range: calc(
        100% - var(--scroll-fade-reveal, calc(var(--spacing) * 24))
      )
      100%;
    animation-fill-mode: both;
  }

  @supports not (animation-timeline: scroll()) {
    --scroll-fade-e: var(--_scroll-fade-size-e);
  }
}

@utility scroll-fade-* {
  --scroll-fade-size: calc(var(--spacing) * --value(integer));
  --scroll-fade-size: --value([length], [percentage]);
}

@utility scroll-fade-t-* {
  --scroll-fade-t-size: calc(var(--spacing) * --value(integer));
  --scroll-fade-t-size: --value([length], [percentage]);
}

@utility scroll-fade-b-* {
  --scroll-fade-b-size: calc(var(--spacing) * --value(integer));
  --scroll-fade-b-size: --value([length], [percentage]);
}

@utility scroll-fade-s-* {
  --scroll-fade-s-size: calc(var(--spacing) * --value(integer));
  --scroll-fade-s-size: --value([length], [percentage]);
}

@utility scroll-fade-e-* {
  --scroll-fade-e-size: calc(var(--spacing) * --value(integer));
  --scroll-fade-e-size: --value([length], [percentage]);
}

@utility scroll-fade-none {
  --scroll-fade-mask: none;
}


@property --shimmer-angle {
  syntax: "<angle>";
  inherits: true;
  initial-value: 20deg;
}
@property --shimmer-image {
  syntax: "*";
  inherits: false;
}
@property --shimmer-text-fill {
  syntax: "*";
  inherits: false;
}

@theme inline {
  @keyframes tw-shimmer {
    from {
      background-position: 100% 0;
    }
    to {
      background-position: 0 0;
    }
  }
}

@utility shimmer {
  --_spread: var(--shimmer-spread, calc(3ch + 40px));
  --_base: currentColor;
  --_highlight: var(
    --shimmer-color,
    oklch(from currentColor l c h / calc(alpha* 0.2))
  );

  background-image: var(
    --shimmer-image,
    linear-gradient(
      calc(90deg + var(--shimmer-angle)),
      var(--_base) calc(50% - var(--_spread)),
      color-mix(in oklch, var(--_highlight), var(--_base) 50%)
        calc(50% - var(--_spread) * 0.5),
      var(--_highlight) 50%,
      color-mix(in oklch, var(--_highlight), var(--_base) 50%)
        calc(50% + var(--_spread) * 0.5),
      var(--_base) calc(50% + var(--_spread))
    )
  );
  background-repeat: no-repeat;
  background-size: calc(200% + var(--_spread) * 2) 100%;
  background-position: 0 0;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: var(--shimmer-text-fill, transparent);
  animation: tw-shimmer var(--shimmer-duration, 2s) linear infinite;

  @variant dark {
    --_highlight: var(
      --shimmer-color,
      oklch(from currentColor max(0.8, calc(l + 0.4)) c h / calc(alpha + 0.4))
    );
  }

  &:where([dir="rtl"], [dir="rtl"] *) {
    animation-direction: reverse;
  }
}

@utility shimmer-once {
  animation-iteration-count: 1;
}

@utility shimmer-reverse {
  animation-direction: reverse;
}

@utility shimmer-none {
  --shimmer-image: none;
  --shimmer-text-fill: currentColor;
}

@utility shimmer-color-* {
  --shimmer-color: --value(--color, [color]);
  --shimmer-color: color-mix(
    in oklch,
    --value(--color, [color]) calc(--modifier(integer) * 1%),
    transparent
  );
}

@utility shimmer-duration-* {
  --shimmer-duration: calc(--value(integer) * 1ms);
}

@utility shimmer-spread-* {
  --shimmer-spread: calc(var(--spacing) * --value(integer));
  --shimmer-spread: --value([length], [percentage]);
}

@utility shimmer-angle-* {
  --shimmer-angle: calc(--value(integer) * 1deg);
}

@media (prefers-reduced-motion: reduce) {
  .shimmer {
    animation: none;
    background-image: none;
    -webkit-text-fill-color: currentColor;
  }
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\types\admin.type.ts

```ts
import type { User } from "./user.type";

export interface DashboardStats {
  totalCustomers: number;
  totalCouriers: number;
  totalShipments: number;
  totalRevenue: number;
  shipmentsByStatus: Array<{
    status: string;
    _count: { status: number };
  }>;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  entityId: string;
  entityType: string;
  details?: Record<string, unknown> | null;
  user?: User | null;
  createdAt: string;
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\types\auth.type.ts

```ts
import type { User, UserRole, Customer } from "./user.type";

export interface LoginResponse {
  user: User;
  role: UserRole;
  needPasswordChange?: boolean;
}
export interface VerifyEmailResponse extends LoginResponse {
  customer?: Customer;
}
export interface LoginPayload {
  email: string;
  password: string;
}
export interface RegistrationPayload extends LoginPayload {
  name: string;
  contactNumber?: string;
}
export interface VerifyEmailPayload {
  email: string;
  otp: string;
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\types\courier.type.ts

```ts
import type { Hub } from "./hub.type";
import type { User } from "./user.type";

export interface Courier {
  id: string;
  userId: string;
  contactNumber: string;
  vehicleType?: string | null;
  vehicleNumber?: string | null;
  isAvailable: boolean;
  currentHubId?: string | null;
  user?: User;
  hub?: Hub;
  createdAt: string;
  updatedAt: string;
}

export interface CourierEarnings {
  totalEarnings: number | null;
  totalShipments: number;
  completedDeliveries: number;
  performanceRate: number;
  compensationConfigured: boolean;
  shipments: import("./shipment.type").Shipment[];
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\types\payment.type.ts

```ts
export type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
export type PaymentGateway = "BKASH" | "STRIPE" | "SSLCOMMERZ";

export interface Payment {
  id: string;
  shipmentId: string;
  amount: number | string;
  currency: string;
  paymentGateway: PaymentGateway;
  transactionId?: string | null;
  status: PaymentStatus;
  payerReference?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\types\shipment.type.ts

```ts
import type { Hub } from "./hub.type";
import type { Payment } from "./payment.type";
import type { User } from "./user.type";

export type ShipmentStatus =
  | "PENDING"
  | "ASSIGNED"
  | "PICKED_UP"
  | "AT_ORIGIN_HUB"
  | "IN_TRANSIT"
  | "AT_DESTINATION_HUB"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "DELIVERY_FAILED"
  | "RETURNED"
  | "CANCELLED";

export interface ShipmentTracking {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  hubId?: string | null;
  location?: string | null;
  note?: string | null;
  updatedById?: string | null;
  createdAt: string;
}

export interface Shipment {
  id: string;
  trackingId: string;
  senderId: string;
  courierId?: string | null;
  originHubId?: string | null;
  destinationHubId?: string | null;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  weight: number | string;
  price: number | string;
  status: ShipmentStatus;
  estimatedDelivery?: string | null;
  sender?: User;
  courier?: User | null;
  originHub?: Hub | null;
  destinationHub?: Hub | null;
  payment?: Payment | null;
  trackings?: ShipmentTracking[];
  paymentStatus: import("./payment.type").PaymentStatus;
  allowedNextStatuses: ShipmentStatus[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicShipmentTracking {
  trackingId: string;
  status: ShipmentStatus;
  estimatedDelivery?: string | null;
  trackings: Pick<ShipmentTracking, "id" | "status" | "createdAt">[];
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\types\sidebar.type.ts

```ts
import type { ReactNode } from "react";

export interface SidebarItem {
  title: string;
  url: string;
  isActive?: boolean;
  icon?: ReactNode;
}

export interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

export type SidebarItems = SidebarGroup[];
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\types\user.type.ts

```ts
export type UserRole = "ADMIN" | "COURIER" | "CUSTOMER";
export type UserStatus = "ACTIVE" | "BLOCKED" | "DELETED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  contactNumber?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: Customer | null;
  courier?: import("./courier.type").Courier | null;
}

export interface Customer {
  id: string;
  userId: string;
  contactNumber?: string | null;
  address?: string | null;
  user?: User;
  createdAt: string;
  updatedAt: string;
}
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\src\validation\auth.validation.ts

```ts
import { z } from "zod";

export const RegisterCustomerZodSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(255),
    email: z.string().email("Invalid email address"),
    contactNumber: z
      .string()
      .regex(/^(?:\+?880|0)1[3-9]\d{8}$/, "Invalid phone number")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be at most 72 characters")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
});

export const LoginZodSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const ForgotPasswordZodSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

export const ResetPasswordZodSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be at most 72 characters")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
  }),
});
```



## D:\NEXT_LEVEL_WEB_DEV\assignment\courier-frontend\tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "**/*.mts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    ".next/dev",
    "e2e"
  ]
}
```

নথির সমাপ্তি।
