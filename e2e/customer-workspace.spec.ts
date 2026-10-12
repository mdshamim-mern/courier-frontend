import { test, expect, type Page } from "@playwright/test";
import { setSession } from "./support/session";

const id = "11111111-1111-4111-8111-111111111111";
async function fixture(page: Page) {
  await setSession(page, "CUSTOMER");
  await page.route("**/api/backend/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    let data: unknown = [];
    if (path.endsWith("/users/me"))
      data = {
        id,
        name: "Test Customer",
        email: "customer@example.test",
        role: "CUSTOMER",
        status: "ACTIVE",
        contactNumber: "01700112233",
        customer: { address: "Dhaka" },
      };
    if (path.endsWith("/shipments/summary"))
      data = { totalShipments: 14, activeShipments: 11, deliveredShipments: 3 };
    if (path.endsWith("/operations/mine"))
      data = {
        collections: [],
        totals: {
          expected: "1500",
          collected: "1000",
          awaitingCollection: "500",
          heldByWorker: "500",
          payable: "1000",
          paid: "500",
          pending: "500",
        },
      };
    if (path.endsWith("/shipments"))
      data = [
        {
          id,
          trackingId: "TRK-CUSTOMER1234",
          receiverName: "Test Receiver",
          createdAt: "2026-10-10T00:00:00Z",
          price: "75",
          status: "PENDING",
          paymentStatus: "UNPAID",
        },
      ];
    if (path.endsWith(`/shipments/${id}`))
      data = {
        id,
        trackingId: "TRK-CUSTOMER1234",
        createdAt: "2026-10-10T00:00:00Z",
        status: "PENDING",
        paymentStatus: "UNPAID",
        receiverName: "Test Receiver",
        receiverPhone: "01700112233",
        receiverAddress: "Mirpur, Dhaka",
        pickupAddress: "Dhanmondi, Dhaka",
        senderPhone: "01865111111",
        price: "75",
        weight: 2,
        trackings: [
          { id: "event", status: "PENDING", createdAt: "2026-10-10T00:00:00Z" },
        ],
      };
    if (path.endsWith("/payments"))
      data = [
        {
          id,
          transactionId: "cs_test_" + "a".repeat(100),
          createdAt: "2026-10-10T00:00:00Z",
          amount: "75",
          paymentGateway: "STRIPE",
          status: "PAID",
        },
      ];
    if (path.endsWith("/coverage"))
      data = [
        {
          id,
          name: "Mirpur",
          district: "Dhaka",
          upazila: "Dhaka Metropolitan",
          pickupEnabled: true,
          deliveryEnabled: true,
        },
      ];
    return route.fulfill({
      json: {
        success: true,
        data,
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    });
  });
}

for (const locale of ["en", "bn"])
  for (const width of [360, 768, 1366]) {
    test(`customer workspace ${locale} responsive ${width}`, async ({
      page,
    }, info) => {
      await fixture(page);
      await page.setViewportSize({ width, height: 900 });
      for (const suffix of [
        "",
        "/business",
        "/collections",
        "/bulk",
        "/new-shipment",
        "/my-shipments",
        "/payments",
        "/profile",
      ]) {
        await page.goto(`/${locale}/dashboard${suffix}`);
        await expect(page.locator(".customer-hero h1")).toBeVisible();
        await expect(page.locator(".customer-page-body")).not.toContainText(
          "Loading data",
        );
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await expect(page.locator(".customer-help a")).toHaveAttribute(
          "href",
          `/${locale}/contact`,
        );
        expect(
          await page
            .locator(".customer-hero")
            .evaluate((el) => getComputedStyle(el).backdropFilter),
        ).toContain("blur");
        if (suffix === "/payments" || suffix === "")
          await page.screenshot({
            path: info.outputPath(
              `customer-${locale}-${width}-${suffix ? "payments" : "overview"}.png`,
            ),
            fullPage: true,
          });
      }
    });
  }

test("customer refresh, shipment tracking and CSV download are wired", async ({
  page,
}) => {
  await fixture(page);
  await page.goto("/en/dashboard");
  const overview = page.waitForResponse((r) =>
    r.url().includes("/shipments/summary"),
  );
  await page
    .getByRole("button", { name: "Refresh overview", exact: true })
    .click();
  await overview;
  await expect(page.getByText(/Latest server data loaded at/)).toBeVisible();
  await page.goto("/en/dashboard/collections");
  const ledger = page.waitForResponse((r) =>
    r.url().includes("/operations/mine"),
  );
  await page
    .getByRole("button", { name: "Refresh ledger", exact: true })
    .click();
  await ledger;
  await expect(page.getByText(/Latest server data loaded at/)).toBeVisible();
  await expect(page.locator(".customer-cash-metric")).toHaveCount(7);
  await page.goto("/en/dashboard/my-shipments");
  await expect(
    page.getByRole("link", { name: "TRK-CUSTOMER1234" }),
  ).toHaveAttribute("href", `/en/dashboard/my-shipments/${id}`);
  await page.getByRole("button", { name: "Track", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("PENDING");
  await page.goto(`/en/dashboard/my-shipments/${id}`);
  await expect(
    page.getByRole("heading", { name: "TRK-CUSTOMER1234", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Print receipt and label" }),
  ).toBeVisible();
  await page.goto("/en/dashboard/bulk");
  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download blank CSV template" }).click();
  expect((await download).suggestedFilename()).toBe(
    "dropzo-booking-template.csv",
  );
  await expect(
    page.getByRole("link", { name: "Find area IDs" }),
  ).toHaveAttribute("href", "/en/coverage");
});

test("customer profile sends valid fields and blocks invalid phone numbers", async ({
  page,
}) => {
  await fixture(page);
  let body: unknown;
  await page.route("**/api/backend/users/me", (route) => {
    if (route.request().method() === "PATCH") {
      body = route.request().postDataJSON();
      return route.fulfill({ json: { success: true, data: {} } });
    }
    return route.fulfill({
      json: {
        success: true,
        data: {
          id,
          name: "Test Customer",
          email: "customer@example.test",
          role: "CUSTOMER",
          contactNumber: "01700112233",
          customer: { address: "Dhaka" },
        },
      },
    });
  });
  await page.goto("/en/dashboard/profile");
  await page.getByLabel("Full Name", { exact: true }).fill("Updated Customer");
  await page.getByLabel("Contact Number", { exact: true }).fill("invalid");
  await page.getByRole("button", { name: "Save Changes", exact: true }).click();
  await expect(page.locator('input[name="contactNumber"]')).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  expect(body).toBeUndefined();
  await page.getByLabel("Contact Number", { exact: true }).fill("01700112233");
  await page
    .getByLabel("Default Address", { exact: true })
    .fill("Mirpur 10, Dhaka");
  const save = page.waitForResponse((r) => r.request().method() === "PATCH");
  await page.getByRole("button", { name: "Save Changes", exact: true }).click();
  await save;
  expect(body).toEqual({
    name: "Updated Customer",
    contactNumber: "01700112233",
    address: "Mirpur 10, Dhaka",
  });
  await expect(
    page.getByText("Profile Updated", { exact: true }),
  ).toBeVisible();
});

test("desktop navbar highlights current route and closes Team after selection", async ({
  page,
}) => {
  await fixture(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/about");
  const nav = page.getByRole("navigation", {
    name: "Main navigation",
    exact: true,
  });
  await expect(
    nav.getByRole("link", { name: "About", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.locator(".team-menu summary").click();
  await nav.getByRole("link", { name: "Join our team", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/courier-apply$/);
  await expect(page.locator(".team-menu")).not.toHaveAttribute("open", "");
});
