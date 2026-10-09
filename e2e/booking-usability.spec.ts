import { test, expect, type Page } from "@playwright/test";

const pickup = "22222222-2222-4222-8222-222222222222";
const delivery = "33333333-3333-4333-8333-333333333333";
const hub = {
  id: "44444444-4444-4444-8444-444444444444",
  name: "ঢাকা নর্থ হাব",
  location: "ঢাকা",
  address: "Dropzo ঢাকা নর্থ হাব, লাভ রোড, মিরপুর ২, ঢাকা-১২১৬।",
  createdAt: "2026-10-09T00:00:00.000Z",
};
const quote = {
  baseCharge: "60",
  extraWeightCharge: "0",
  pickupFee: "0",
  deliveryCharge: "60",
  codFee: "0",
  merchantPayable: "0.06",
  deliveryDays: 1,
  serviceType: "NEXT_DAY",
  rateUpdatedAt: "2026-10-09T00:00:00.000Z",
  originHub: hub,
};
async function setup(page: Page, role = "CUSTOMER") {
  await page.route("**/api/backend/**", (route) => {
    const path = new URL(route.request().url()).pathname.replace(
      "/api/backend",
      "",
    );
    const data =
      path === "/users/me"
        ? {
            id: pickup,
            name: "Customer",
            email: "test@example.test",
            role,
            status: "ACTIVE",
            emailVerified: true,
          }
        : path === "/operations/coverage"
          ? [
              {
                id: pickup,
                name: "মিরপুর",
                district: "ঢাকা",
                upazila: "ঢাকা মহানগর",
                pickupEnabled: true,
                dropoffEnabled: true,
                deliveryEnabled: true,
              },
              {
                id: delivery,
                name: "ধানমন্ডি",
                district: "ঢাকা",
                upazila: "ঢাকা মহানগর",
                pickupEnabled: true,
                dropoffEnabled: true,
                deliveryEnabled: true,
              },
            ]
          : path === "/operations/quote"
            ? quote
            : path === "/operations/mine"
              ? { business: null, application: null, collections: [] }
              : path === "/hubs"
                ? [
                    hub,
                    {
                      ...hub,
                      id: delivery,
                      name: "Custom Hub",
                      location: "Custom Location",
                      address: "Unlisted address, Road 5",
                    },
                  ]
                : path === "/admin/dashboard-stats"
                  ? {
                      totalRevenue: 321.5,
                      totalCustomers: 13,
                      totalCouriers: 19,
                      totalShipments: 27,
                      shipmentsByStatus: [],
                    }
                  : {};
    return route.fulfill({
      json: {
        success: true,
        data,
        meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
      },
    });
  });
}
async function fill(page: Page, cod = "0.06") {
  await page.locator('select[name="pickupAreaId"]').selectOption(pickup);
  await page.locator('select[name="receiverAreaId"]').selectOption(delivery);
  for (const [name, value] of [
    ["senderPhone", "01812345678"],
    ["pickupAddress", "Mirpur pickup address"],
    ["receiverName", "Receiver"],
    ["receiverPhone", "01712345678"],
    ["receiverAddress", "Dhanmondi receiver address"],
    ["declaredValue", "100"],
    ["codAmount", cod],
    [
      "requestedPickupAt",
      new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    ],
  ])
    await page.locator('input[name="' + name + '"]').fill(value);
  await page.locator('select[name="serviceType"]').selectOption("NEXT_DAY");
}
for (const width of [390, 1366]) {
  test(
    "booking labels and batched autofill retain area selections at " + width,
    async ({ page }) => {
      await setup(page);
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/en/dashboard/new-shipment");
      await fill(page);
      await page.locator('label[for$="-receiverName"]').click();
      await expect(
        page.getByRole("textbox", { name: "Receiver name", exact: true }),
      ).toBeFocused();
      await expect(page.locator('input[name="receiverName"]')).toHaveAttribute(
        "autocomplete",
        "section-recipient name",
      );
      await expect(page.locator('input[name="pickupAddress"]')).toHaveAttribute(
        "autocomplete",
        "section-sender street-address",
      );
      await page.evaluate(() => {
        const setter = Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value",
        )!.set!;
        for (const [name, value] of [
          ["receiverName", "Autofill Receiver"],
          ["pickupAddress", "Autofill pickup address"],
          ["receiverAddress", "Autofill delivery address"],
        ]) {
          const field = document.querySelector<HTMLInputElement>(
            'input[name="' + name + '"]',
          )!;
          setter.call(field, value);
          field.dispatchEvent(new Event("input", { bubbles: true }));
        }
        const mode = document.querySelector<HTMLSelectElement>(
          'select[name="pickupMode"]',
        )!;
        mode.dispatchEvent(new Event("change", { bubbles: true }));
      });
      await expect(page.locator('input[name="receiverName"]')).toHaveValue(
        "Autofill Receiver",
      );
      await expect(page.locator('input[name="pickupAddress"]')).toHaveValue(
        "Autofill pickup address",
      );
      await expect(page.locator('input[name="receiverAddress"]')).toHaveValue(
        "Autofill delivery address",
      );
      await expect(page.locator('select[name="pickupAreaId"]')).toHaveValue(
        pickup,
      );
      await expect(page.locator('select[name="receiverAreaId"]')).toHaveValue(
        delivery,
      );
      await page.locator('select[name="pickupMode"]').selectOption("BRANCH");
      await expect(page.locator('select[name="pickupAreaId"]')).toHaveValue("");
      await page.locator('select[name="pickupAreaId"]').selectOption(pickup);
      await page
        .getByRole("button", { name: "Review cost before booking" })
        .click();
      await expect(
        page.getByText(
          "Dropzo Dhaka North Hub, Love Road, Mirpur 2, Dhaka-1216.",
          { exact: false },
        ),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    },
  );
}
for (const locale of ["en", "bn"]) {
  test(
    "COD approval failure is actionable and retains the booking in " + locale,
    async ({ page }) => {
      await setup(page);
      await page.route("**/api/backend/shipments", (route) =>
        route.fulfill({
          status: 409,
          json: {
            success: false,
            message: "Approved business account required for COD",
          },
        }),
      );
      await page.goto("/" + locale + "/dashboard/new-shipment");
      await fill(page);
      await page
        .getByRole("button", {
          name:
            locale === "en"
              ? "Review cost before booking"
              : "বুকিংয়ের আগে মাশুল দেখুন",
        })
        .click();
      await page.getByRole("checkbox").check();
      await page
        .getByRole("button", {
          name: locale === "en" ? "Confirm booking" : "বুকিং নিশ্চিত করুন",
        })
        .click();
      await expect(page.locator("main").getByRole("alert")).toContainText(
        locale === "en"
          ? "approved business account"
          : "অনুমোদিত ব্যবসায়িক অ্যাকাউন্ট",
      );
      await expect(
        page.getByRole("link", {
          name:
            locale === "en" ? "View business approval" : "ব্যবসায়িক অনুমোদন দেখুন",
          exact: true,
        }),
      ).toBeVisible();
      await expect(page.locator('select[name="pickupAreaId"]')).toHaveValue(
        pickup,
      );
      await expect(page.locator('input[name="receiverName"]')).toHaveValue(
        "Receiver",
      );
      await expect(page.locator('input[name="codAmount"]')).toHaveValue("0.06");
    },
  );
  test(
    "approved hub names and full addresses use " + locale,
    async ({ page }) => {
      await setup(page, "ADMIN");
      await page.goto("/" + locale + "/admin/hubs");
      const row = page
        .getByRole("row")
        .filter({ hasText: locale === "en" ? "Dhaka North Hub" : "ঢাকা নর্থ হাব" });
      await expect(row).toContainText(
        locale === "en" ? "Dhaka-1216." : "ঢাকা-১২১৬।",
      );
      await expect(row).toContainText(
        locale === "en" ? "Love Road, Mirpur 2" : "লাভ রোড, মিরপুর ২",
      );
      if (locale === "en")
        await expect(row).not.toContainText(/[\u0980-\u09ff]/);
      await expect(
        page.getByRole("row").filter({ hasText: "Custom Hub" }),
      ).toContainText("Unlisted address, Road 5");
    },
  );
}
test("changed pricing requires a new quote and fresh consent without losing fields", async ({
  page,
}) => {
  await setup(page);
  let quoteRequests = 0,
    bookingRequests = 0;
  await page.route("**/api/backend/operations/quote", (route) => {
    quoteRequests++;
    return route.fulfill({
      json: {
        success: true,
        data: { ...quote, deliveryCharge: quoteRequests > 1 ? "75" : "60" },
      },
    });
  });
  await page.route("**/api/backend/shipments", (route) => {
    bookingRequests++;
    return route.fulfill({
      status: 409,
      json: { success: false, message: "Pricing changed; review a new quote" },
    });
  });
  await page.goto("/en/dashboard/new-shipment");
  await fill(page, "0");
  await page
    .getByRole("button", { name: "Review cost before booking" })
    .click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Confirm booking" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Pricing or the confirmed service changed",
  );
  await page.getByRole("button", { name: "Review updated cost" }).click();
  await expect(page.getByRole("checkbox")).not.toBeChecked();
  await expect(
    page.getByRole("button", { name: "Confirm booking" }),
  ).toBeDisabled();
  await expect(
    page.getByText("Total delivery fee:", { exact: false }),
  ).toContainText("75.00");
  await expect(page.locator('input[name="receiverName"]')).toHaveValue(
    "Receiver",
  );
  expect(quoteRequests).toBe(2);
  expect(bookingRequests).toBe(1);
});
test("Team closes on navigation, same-page selection, outside click and Escape", async ({
  page,
}) => {
  await setup(page);
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto("/en");
  const menu = page.locator(".team-menu");
  await menu.locator("summary").click();
  await menu.getByRole("link", { name: "Join our team" }).click();
  await expect(page).toHaveURL(/courier-apply/);
  await expect(menu).not.toHaveAttribute("open");
  await menu.locator("summary").click();
  await menu.getByRole("link", { name: "Join our team" }).click();
  await expect(menu).not.toHaveAttribute("open");
  await menu.locator("summary").click();
  await page
    .getByRole("heading", { name: "Delivery worker application" })
    .click();
  await expect(menu).not.toHaveAttribute("open");
  await menu.locator("summary").click();
  await page.keyboard.press("Escape");
  await expect(menu).not.toHaveAttribute("open");
  await expect(menu.locator("summary")).toBeFocused();
});
test("mobile staff link closes even when only the query changes", async ({
  page,
}) => {
  await setup(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/login");
  const menu = page.locator(".mobile-menu");
  await menu.locator("summary").click();
  await menu.getByRole("link", { name: "Staff sign in" }).click();
  await expect(page).toHaveURL(/login\?staff=1/);
  await expect(menu).not.toHaveAttribute("open");
});
test("business review destination is explicit without changing approval", async ({
  page,
}) => {
  await setup(page);
  await page.goto("/en/merchant-register");
  await expect(
    page.getByText("Submit for review saves your application", {
      exact: false,
    }),
  ).toContainText("Admin → Operations");
  await expect(
    page.getByText("Submit for review saves your application", {
      exact: false,
    }),
  ).toContainText("does not send an email or transfer money");
});
test("admin statistics render API values rather than screenshot constants", async ({
  page,
}) => {
  await setup(page, "ADMIN");
  await page.goto("/en/admin");
  for (const value of ["321.50", "13", "19", "27"])
    await expect(
      page.locator("main").getByText(value, { exact: value !== "321.50" }),
    ).toBeVisible();
  await expect(page.locator("main")).not.toContainText("1,800.00");
});
