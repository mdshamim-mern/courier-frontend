import { test, expect, type Page } from "@playwright/test";
import { setSession } from "./support/session";

for (const locale of ["en", "bn"]) {
  for (const ledger of [true, false]) {
    test(`courier refresh fetches changed and unchanged ${ledger ? "ledger" : "earnings"} data in ${locale}`, async ({
      page,
    }) => {
      await mock(page);
      let requests = 0;
      let release: (() => void) | undefined;
      let blocked = false;
      const endpoint = ledger
        ? "**/api/backend/operations/mine"
        : "**/api/backend/couriers/*/history-earnings";
      await page.route(endpoint, async (route) => {
        requests++;
        if (blocked)
          await new Promise<void>((resolve) => {
            release = resolve;
          });
        const amount = requests > 1 ? "999" : "1500";
        return route.fulfill({
          json: {
            success: true,
            data: ledger
              ? {
                  collections: [],
                  totals: {
                    ...totals,
                    collected: amount,
                    heldByWorker: amount,
                  },
                }
              : {
                  totalEarnings: requests > 1 ? 999 : 240,
                  completedDeliveries: 6,
                  performanceRate: 75,
                  totalShipments: 9,
                  shipments: [],
                },
          },
        });
      });
      await page.goto(
        `/${locale}/courier/${ledger ? "collections" : "earnings"}`,
      );
      const label = ledger
        ? locale === "en"
          ? "Refresh ledger"
          : "হিসাব হালনাগাদ করুন"
        : locale === "en"
          ? "Refresh earnings"
          : "হালনাগাদ করুন";
      const button = page.getByRole("button", { name: label, exact: true });
      await expect(button).toBeEnabled();
      const initial = requests;
      blocked = true;
      await button.click();
      await expect.poll(() => requests).toBe(initial + 1);
      await expect(button).toBeDisabled();
      await expect(button).toHaveAttribute("aria-busy", "true");
      await expect(
        page.locator("[data-courier-header]").getByRole("status"),
      ).toContainText(
        locale === "en" ? "Fetching the latest" : "সর্বশেষ তথ্য আনা হচ্ছে",
      );
      blocked = false;
      release?.();
      await expect(button).toBeEnabled();
      await expect(
        page.locator("[data-courier-header]").getByRole("status"),
      ).toContainText(
        locale === "en" ? "Latest server data loaded" : "সর্বশেষ তথ্য আনা হয়েছে",
      );
      await expect(
        page.locator("[data-courier-metric]").nth(ledger ? 2 : 0),
      ).toContainText(locale === "en" ? "999.00" : "৯৯৯.০০");
      await button.click();
      await expect.poll(() => requests).toBe(initial + 2);
      await expect(
        page.locator("[data-courier-header]").getByRole("status"),
      ).toContainText(
        locale === "en" ? "Values remain unchanged" : "অঙ্ক অপরিবর্তিত থাকবে",
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 1,
        ),
      ).toBe(true);
    });
  }
}

for (const ledger of [true, false]) {
  test(`courier refresh reports ${ledger ? "ledger" : "earnings"} failure and recovers on retry`, async ({
    page,
  }) => {
    await mock(page);
    let fail = false;
    const endpoint = ledger
      ? "**/api/backend/operations/mine"
      : "**/api/backend/couriers/*/history-earnings";
    await page.route(endpoint, (route) =>
      route.fulfill({
        status: fail ? 503 : 200,
        json: fail
          ? { success: false, message: "Refresh temporarily unavailable" }
          : {
              success: true,
              data: ledger
                ? { totals, collections: [] }
                : {
                    totalEarnings: 240,
                    completedDeliveries: 6,
                    totalShipments: 9,
                    performanceRate: 75,
                    shipments: [],
                  },
            },
      }),
    );
    await page.goto(`/en/courier/${ledger ? "collections" : "earnings"}`);
    const button = page.getByRole("button", {
      name: ledger ? "Refresh ledger" : "Refresh earnings",
      exact: true,
    });
    await expect(button).toBeEnabled();
    fail = true;
    await button.click();
    await expect(
      page.locator("[data-courier-header]").getByRole("alert"),
    ).toContainText("Refresh temporarily unavailable");
    await expect(
      page.locator("[data-courier-header]").getByRole("status"),
    ).toHaveCount(0);
    await expect(button).toBeEnabled();
    fail = false;
    await button.click();
    await expect(
      page.locator("[data-courier-header]").getByRole("status"),
    ).toContainText("Latest server data loaded");
    await expect(
      page.locator("[data-courier-header]").getByRole("alert"),
    ).toHaveCount(0);
  });
}

const courierId = "11111111-1111-4111-8111-111111111111";
const shipmentId = "22222222-2222-4222-8222-222222222222";
const user = {
  id: "33333333-3333-4333-8333-333333333333",
  name: "Courier Design Tester",
  email: "courier-design-test-with-a-long-email@example.test",
  role: "COURIER",
  status: "ACTIVE",
  contactNumber: "01712345678",
  courier: {
    id: courierId,
    isAvailable: true,
    vehicleType: "BICYCLE",
    vehicleNumber: "TEST-123",
  },
};
const shipment = {
  id: shipmentId,
  trackingId: "TRK-COURIER-DESIGN-TEST",
  receiverName: "Test Receiver",
  receiverPhone: "01700112233",
  receiverAddress:
    "Mirpur 10, Circle, Dhaka-1216. " + "Detailed address ".repeat(10),
  pickupAddress: "Road 27, Dhanmondi, Dhaka-1209.",
  senderPhone: "01865111111",
  price: "60",
  weight: 1,
  codAmount: "1500",
  status: "OUT_FOR_DELIVERY",
  paymentStatus: "PAID",
  allowedNextStatuses: ["DELIVERED", "DELIVERY_FAILED"],
  createdAt: "2026-10-09T04:00:00.000Z",
  trackings: [],
};
const totals = {
  expected: "4500",
  collected: "1500",
  heldByWorker: "1500",
  awaitingCollection: "3000",
  payable: "1485",
  paid: "0",
  pending: "1485",
};
async function mock(page: Page) {
  await setSession(page, "COURIER");
  await page.route("**/api/backend/**", (route) => {
    const path = new URL(route.request().url()).pathname.replace(
      "/api/backend",
      "",
    );
    const data =
      path === "/users/me"
        ? user
        : path.endsWith("/history-earnings")
          ? {
              totalEarnings: 240,
              totalShipments: 9,
              completedDeliveries: 6,
              performanceRate: 75,
              compensationConfigured: true,
              shipments: [shipment],
            }
          : path === "/operations/mine"
            ? {
                totals,
                collections: [
                  {
                    id: "cash-test",
                    shipmentId,
                    merchantId: "merchant-test",
                    courierId,
                    amount: "1500",
                    fee: "15",
                    payable: "1485",
                    status: "COLLECTED",
                    createdAt: shipment.createdAt,
                    receiptReference: "TEST-RECEIPT-" + "1234567890".repeat(6),
                  },
                ],
              }
            : path === "/shipments"
              ? [shipment]
              : path.startsWith("/shipments/")
                ? shipment
                : {};
    return route.fulfill({
      json: {
        success: true,
        data,
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    });
  });
}

for (const locale of ["en", "bn"]) {
  for (const width of [360, 768, 1366]) {
    test(`courier glass workspace is responsive in ${locale} at ${width}px`, async ({
      page,
    }) => {
      test.setTimeout(90000);
      await mock(page);
      await page.setViewportSize({ width, height: 900 });
      for (const route of [
        "",
        "/collections",
        "/deliveries",
        "/earnings",
        "/profile",
      ]) {
        await page.goto(`/${locale}/courier${route}`);
        await expect(page.locator("[data-courier-header]")).toBeVisible();
        await expect(page.locator("[data-courier-workspace] h1")).toHaveCount(
          1,
        );
        if (route === "/profile")
          await expect(page.locator('input[name="name"]')).toHaveValue(
            user.name,
          );
        else if (route === "/deliveries")
          await expect(page.locator("[data-courier-task]")).toBeVisible();
        else
          await expect(
            page.locator("[data-courier-metric]").first(),
          ).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth + 1,
          ),
          route,
        ).toBe(true);
        expect(
          await page
            .locator("[data-courier-header]")
            .evaluate((node) => getComputedStyle(node).backdropFilter),
        ).not.toBe("none");
        await page.screenshot({
          path: `test-results/courier-${locale}-${width}-${route.slice(1) || "overview"}.png`,
          fullPage: true,
        });
        if (route === "/deliveries") {
          await page
            .getByRole("button", {
              name: locale === "en" ? "Mark Delivered" : "সরবরাহ সম্পন্ন করুন",
              exact: true,
            })
            .click();
          await expect(page.locator("canvas")).toBeVisible();
          expect(
            await page.evaluate(
              () =>
                document.documentElement.scrollWidth <= window.innerWidth + 1,
            ),
            "recipient proof form",
          ).toBe(true);
        }
      }
    });
  }
}

test("courier glass profile saves bound fields and rejects invalid phone numbers", async ({
  page,
}) => {
  await mock(page);
  const writes: unknown[] = [];
  let profile = { ...user };
  await page.route("**/api/backend/users/me", (route) => {
    if (route.request().method() === "PATCH") {
      const body = route.request().postDataJSON();
      writes.push(body);
      profile = { ...profile, ...body };
    }
    return route.fulfill({ json: { success: true, data: profile } });
  });
  await page.goto("/en/courier/profile");
  await expect(page.getByLabel("Full Name", { exact: true })).toHaveValue(
    user.name,
  );
  await expect(
    page.getByLabel("Email Address", { exact: true }),
  ).toBeDisabled();
  await page.getByLabel("Full Name", { exact: true }).fill("Updated Courier");
  await page.getByLabel("Contact Number", { exact: true }).fill("123");
  await page.getByRole("button", { name: "Save Changes", exact: true }).click();
  await expect(
    page.getByLabel("Contact Number", { exact: true }),
  ).toHaveAttribute("aria-invalid", "true");
  expect(writes).toEqual([]);
  await page.getByLabel("Contact Number", { exact: true }).fill("01812345678");
  await page.getByRole("button", { name: "Save Changes", exact: true }).click();
  await expect
    .poll(() => writes)
    .toEqual([{ name: "Updated Courier", contactNumber: "01812345678" }]);
  await expect(
    page.getByRole("heading", { name: "Updated Courier", exact: true }),
  ).toBeVisible();
});

test("courier glass earnings and cash ledger show distinct server totals", async ({
  page,
}) => {
  await mock(page);
  await page.goto("/en/courier/earnings");
  const earnings = page.locator("[data-courier-metric]").filter({
    has: page.getByRole("heading", { name: "Total Earnings", exact: true }),
  });
  await expect(earnings).toContainText("240.00");
  await expect(
    page.getByRole("link", { name: shipment.trackingId, exact: true }),
  ).toHaveAttribute("href", `/en/courier/shipments/${shipmentId}`);
  await page.goto("/en/courier/collections");
  await expect(page.locator("[data-courier-metric]")).toHaveCount(7);
  await expect(
    page
      .locator("[data-courier-metric]")
      .filter({ hasText: "Cash held by workers" }),
  ).toContainText("1,500.00");
  await expect(page.locator("[data-courier-collection]")).toContainText(
    "1,485.00",
  );
  await expect(page.locator("[data-courier-collection]")).toContainText(
    "Collected by worker",
  );
  await expect(page.locator("[data-courier-workspace]")).toContainText(
    "these cards do not send money",
  );
});

test("courier glass missing compensation is not fabricated income", async ({
  page,
}) => {
  await mock(page);
  await page.route("**/api/backend/couriers/*/history-earnings", (route) =>
    route.fulfill({
      json: {
        success: true,
        data: {
          totalEarnings: null,
          totalShipments: 9,
          completedDeliveries: 6,
          performanceRate: 75,
          compensationConfigured: false,
          shipments: [],
        },
      },
    }),
  );
  await page.goto("/en/courier/earnings");
  await expect(page.locator("[data-courier-metric]").first()).toContainText(
    "Compensation needs configuration",
  );
  await expect(page.locator("[data-courier-workspace]")).toContainText(
    "No delivery history recorded.",
  );
});

test("courier glass ledger error can retry without presenting an empty success", async ({
  page,
}) => {
  await mock(page);
  let fail = true;
  await page.route("**/api/backend/operations/mine", (route) =>
    route.fulfill({
      status: fail ? 503 : 200,
      json: fail
        ? { success: false, message: "Test outage" }
        : { success: true, data: { collections: [], totals } },
    }),
  );
  await page.goto("/en/courier/collections");
  await expect(
    page.getByRole("button", { name: "Try again", exact: true }),
  ).toBeVisible();
  await expect(page.locator("[data-courier-workspace]")).not.toContainText(
    "No cash collections recorded.",
  );
  fail = false;
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.locator("[data-courier-workspace]")).toContainText(
    "No cash collections recorded.",
  );
  await expect(page.locator("[data-courier-metric]")).toHaveCount(7);
});

test("courier glass task filter and search persist in the URL", async ({
  page,
}) => {
  await mock(page);
  await page.goto("/en/courier/deliveries");
  await page.getByLabel("Task filter", { exact: true }).selectOption("PICKUP");
  await expect(page).toHaveURL(/task=PICKUP/);
  await page
    .getByRole("textbox", { name: "Search parcel", exact: true })
    .fill("TRK-COURIER");
  await expect(page).toHaveURL(/search=TRK-COURIER/);
  await page.reload();
  await expect(page.getByLabel("Task filter", { exact: true })).toHaveValue(
    "PICKUP",
  );
  await expect(
    page.getByRole("textbox", { name: "Search parcel", exact: true }),
  ).toHaveValue("TRK-COURIER");
});
