import { test, expect, type Page } from "@playwright/test";
const id = "11111111-1111-4111-8111-111111111111";
const hubId = "22222222-2222-4222-8222-222222222222";
const at = "2026-10-10T00:00:00.000Z";
async function setup(page: Page, rejectDelete = false) {
  let hubs = [
    {
      id: hubId,
      name: "ঢাকা নর্থ হাব",
      location: "ঢাকা",
      address: "Dropzo ঢাকা নর্থ হাব, লাভ রোড, মিরপুর ২, ঢাকা-১২১৬।",
      createdAt: at,
    },
  ];
  let couriers = [
    {
      id,
      userId: id,
      user: { id, name: "Rahim Uddin", email: "rahim.courier151@example.com" },
      contactNumber: "01700112233",
      vehicleType: "Motorcycle",
      vehicleNumber: "DHAKA-H-11-2233",
      isAvailable: true,
      currentHubId: hubId,
      hub: hubs[0],
      createdAt: at,
    },
  ];
  let users = [
    {
      id,
      name: "Checkout Verification 206e70b8-082e-4112-8972-18585f3bbc08",
      email: "checkout-206e70b8-082e-4112-8972-18585f3bbc08@integration.test",
      role: "CUSTOMER",
      status: "ACTIVE",
      createdAt: at,
    },
  ];
  const writes: Array<{
    path: string;
    method: string;
    body: Record<string, unknown>;
  }> = [];
  await page.route("**/api/backend/**", async (route) => {
    const path = new URL(route.request().url()).pathname.replace(
        "/api/backend",
        "",
      ),
      method = route.request().method();
    const body = method === "GET" ? {} : route.request().postDataJSON() || {};
    if (method !== "GET") writes.push({ path, method, body });
    if (method === "DELETE" && rejectDelete)
      return route.fulfill({
        status: 409,
        json: {
          success: false,
          message:
            "Hub is in use. Reassign its service areas, couriers and shipments before deletion.",
        },
      });
    if (path === "/hubs" && method === "POST")
      hubs = [...hubs, { ...hubs[0], ...body, id }];
    if (path === "/hubs/" + hubId && method === "PATCH")
      hubs = hubs.map((hub) => ({ ...hub, ...body }));
    if (path === "/hubs/" + hubId && method === "DELETE") hubs = [];
    if (path === "/couriers/" + id && method === "PATCH")
      couriers = couriers.map((courier) => ({ ...courier, ...body }));
    if (path === "/admin/users/" + id + "/status")
      users = users.map((user) => ({ ...user, ...body }));
    let data: unknown = [];
    if (path === "/users/me")
      data = {
        id: hubId,
        name: "Administrator",
        email: "admin@example.test",
        role: "ADMIN",
        status: "ACTIVE",
      };
    else if (path === "/hubs") data = hubs;
    else if (path === "/hubs/" + hubId) data = hubs[0];
    else if (path === "/couriers") data = couriers;
    else if (path.endsWith("/history-earnings"))
      data = {
        totalShipments: 3,
        completedDeliveries: 2,
        shipments: [],
        totalEarnings: null,
      };
    else if (path === "/couriers/" + id) data = couriers[0];
    else if (path === "/admin/users") data = users;
    else if (path === "/admin/dashboard-stats")
      data = {
        totalCustomers: 4,
        totalCouriers: 7,
        totalShipments: 22,
        totalRevenue: 1800,
        shipmentsByStatus: [],
      };
    else if (path === "/operations/admin")
      data = {
        areas: [
          {
            id: hubId,
            name: "মিরপুর",
            district: "ঢাকা",
            upazila: "ঢাকা মহানগর",
            hubId,
            pickupEnabled: true,
            dropoffEnabled: true,
            deliveryEnabled: true,
          },
        ],
        rates: [],
        businesses: [],
        applications: [],
        collections: [],
        payoutAccounts: [],
        couriers: [],
      };
    else if (path === "/audit-logs")
      data = [
        {
          id,
          action: "CREATE_SHIPMENT",
          entityType: "SHIPMENT",
          entityId: id,
          details: { status: "PENDING" },
          createdAt: at,
        },
      ];
    return route.fulfill({
      json: {
        success: true,
        data,
        meta: {
          page: 1,
          total: Array.isArray(data) ? data.length : 1,
          totalPages: 1,
        },
      },
    });
  });
  return writes;
}
test("retained checkout fixture is marked and long account fields fit a mobile card", async ({
  page,
}) => {
  await setup(page);
  await page.setViewportSize({ width: 360, height: 850 });
  await page.goto("/en/admin/manage-users");
  await expect(page.getByText("Test record", { exact: true })).toBeVisible();
  await expect(
    page.getByText(
      "checkout-206e70b8-082e-4112-8972-18585f3bbc08@integration.test",
      { exact: true },
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "View", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("User details");
  await expect(page.getByRole("dialog")).toContainText("integration.test");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("courier View fetches profile and history; Edit persists availability", async ({
  page,
}) => {
  const writes = await setup(page);
  await page.goto("/en/admin/manage-couriers");
  await page.getByRole("button", { name: "View", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Total assigned parcels");
  await expect(dialog).toContainText("Dhaka North Hub");
  await dialog.getByRole("button", { name: "Edit", exact: true }).click();
  await dialog.getByLabel("Available", { exact: true }).uncheck();
  await dialog
    .getByRole("button", { name: "Save courier", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Courier saved");
  expect(
    writes.some(
      (write) =>
        write.path === "/couriers/" + id &&
        write.method === "PATCH" &&
        write.body.isAvailable === false,
    ),
  ).toBe(true);
  await expect(page.getByRole("cell", { name: /Unavailable/ })).toBeVisible();
});
test("Add Courier submits the existing verified admin creation endpoint", async ({
  page,
}) => {
  const writes = await setup(page);
  await page.goto("/en/admin/manage-couriers");
  await page.getByRole("button", { name: "Add Courier", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Name", { exact: true }).fill("Test Worker");
  await dialog.getByLabel("Email", { exact: true }).fill("worker@example.test");
  await dialog.getByLabel("Phone", { exact: true }).fill("01700112233");
  await dialog
    .getByLabel("Initial password", { exact: true })
    .fill("Test-Password-123!");
  await dialog
    .getByRole("button", { name: "Save courier", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Courier saved");
  expect(
    writes.some(
      (write) =>
        write.path === "/couriers" &&
        write.method === "POST" &&
        write.body.email === "worker@example.test",
    ),
  ).toBe(true);
});
test("hub View, Edit and Add call real CRUD paths and refresh visible data", async ({
  page,
}) => {
  const writes = await setup(page);
  await page.goto("/en/admin/hubs");
  await page.getByRole("button", { name: "View", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Love Road, Mirpur 2");
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  let dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Detailed Address", { exact: true })
    .fill("Updated hub test address");
  await dialog.getByRole("button", { name: "Save hub", exact: true }).click();
  await expect(
    page.getByRole("cell", { name: "Updated hub test address", exact: true }),
  ).toBeVisible();
  expect(
    writes.some(
      (write) =>
        write.path === "/hubs/" + hubId &&
        write.method === "PATCH" &&
        write.body.address === "Updated hub test address",
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Add Hub", exact: true }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Hub Name", { exact: true }).fill("New test hub");
  await dialog.getByLabel("Location", { exact: true }).fill("Dhaka");
  await dialog
    .getByLabel("Detailed Address", { exact: true })
    .fill("New test hub address");
  await dialog.getByRole("button", { name: "Save hub", exact: true }).click();
  await expect(
    page.getByRole("cell", { name: /New test hub/ }).first(),
  ).toBeVisible();
  expect(
    writes.some((write) => write.path === "/hubs" && write.method === "POST"),
  ).toBe(true);
});
test("hub Delete requires confirmation and archives the selected unused hub", async ({
  page,
}) => {
  const writes = await setup(page);
  await page.goto("/en/admin/hubs");
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(writes).toHaveLength(0);
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("dialog").getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Confirm deletion", exact: true })
    .click();
  await expect(page.getByText("No hubs found.", { exact: true })).toBeVisible();
  expect(
    writes.some(
      (write) => write.path === "/hubs/" + hubId && write.method === "DELETE",
    ),
  ).toBe(true);
});
test("hub deletion conflict retains the record and exposes a useful error", async ({
  page,
}) => {
  await setup(page, true);
  await page.goto("/en/admin/hubs");
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("dialog").getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Confirm deletion", exact: true })
    .click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "Hub is in use",
  );
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Cancel", exact: true })
    .click();
  await expect(
    page.getByRole("row").filter({ hasText: "Dhaka North Hub" }),
  ).toBeVisible();
});
test("user Block does not mutate until explicitly confirmed", async ({
  page,
}) => {
  const writes = await setup(page);
  await page.goto("/en/admin/manage-users");
  await page.getByRole("button", { name: "Block", exact: true }).click();
  expect(writes).toHaveLength(0);
  await page.getByRole("dialog").getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Confirm change", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Access updated");
  expect(
    writes.some(
      (write) =>
        write.path === "/admin/users/" + id + "/status" &&
        write.body.status === "BLOCKED",
    ),
  ).toBe(true);
});
test("operation area Edit brings the populated form into view and sends PATCH", async ({
  page,
}) => {
  const writes = await setup(page);
  await page.goto("/en/admin/operations");
  await page
    .getByRole("button", { name: "Edit area: Mirpur", exact: true })
    .click();
  await expect(page.getByLabel("Area name", { exact: true })).toHaveValue(
    "মিরপুর",
  );
  await page.getByLabel("Area name", { exact: true }).fill("Updated area");
  await page
    .locator("#service-areas form")
    .getByRole("button", { name: "Save", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Saved." }),
  ).toBeVisible();
  expect(
    writes.some(
      (write) =>
        write.path === "/operations/areas/" + hubId &&
        write.method === "PATCH" &&
        write.body.name === "Updated area",
    ),
  ).toBe(true);
});
for (const locale of ["en", "bn"])
  for (const width of [360, 768, 1366]) {
    test(`all admin pages stay responsive in ${locale} at ${width}px`, async ({
      page,
    }, info) => {
      await setup(page);
      await page.setViewportSize({ width, height: 900 });
      for (const route of [
        "",
        "/manage-users",
        "/manage-couriers",
        "/hubs",
        "/operations",
        "/all-shipments",
        "/audit-logs",
      ]) {
        await page.goto(`/${locale}/admin${route}`);
        await expect(page.locator(".dashboard-content h1")).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        if (["/hubs", "/manage-users", "/manage-couriers"].includes(route)) {
          await expect(page.locator("tbody tr").first()).toBeVisible();
          const bounds = await page.locator("tbody tr").first().boundingBox();
          expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
        }
        if (route === "/hubs" && width !== 768)
          await page.screenshot({
            path: info.outputPath(`admin-hubs-${locale}-${width}.png`),
            fullPage: true,
          });
      }
    });
  }
