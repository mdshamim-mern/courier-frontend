import { setSession } from "./support/session";
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
  const initial = handler("/users/me");
  const profile = initial.data as { role?: string } | undefined;
  await setSession(page, profile?.role || (initial.status === 503 ? "unavailable" : "GUEST"));
  await page.route("**/api/backend/**", async (route) => {
    const path = new URL(route.request().url()).pathname.replace(
      "/api/backend",
      "",
    );
    const response = handler(path);
    if (path === "/auth/login") { const data = response.data as { user?: { role?: string }; role?: string }; await setSession(page, data?.user?.role || data?.role || "GUEST"); }
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
  await expect(page.locator("body")).toContainText("Session verification unavailable");
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
    page.locator("main").getByText("Payment pending provider verification", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Payment Confirmed", exact: true }),
  ).toHaveCount(0);
});
