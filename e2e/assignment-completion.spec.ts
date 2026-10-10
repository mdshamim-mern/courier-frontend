import { test, expect } from "@playwright/test";
import { setSession } from "./support/session";

test("protected routes reject missing and forged sessions before rendering", async ({ page }) => {
  await page.goto("/en/admin/hubs");
  await expect(page).toHaveURL(/login\?next=/);
  await page.context().addCookies([{name: "accessToken", value: "forged-admin", url: "http://localhost:3100"}]);
  await page.goto("/bn/admin");
  await expect(page).toHaveURL(/\/bn\/login/);
});

test("server role enforcement redirects a customer away from admin", async ({ page }) => {
  await setSession(page, "CUSTOMER");
  await page.route("**/api/backend/**", route => route.fulfill({ json: {success: true, data: {role: "CUSTOMER", status: "ACTIVE"}} }));
  await page.goto("/en/admin");
  await expect(page).toHaveURL(/\/en\/dashboard$/);
});

for (const [label, role, destination] of [["Admin", "ADMIN", "admin"], ["Courier", "COURIER", "courier"], ["User", "CUSTOMER", "dashboard"]]) {
  test("one click authenticates " + role, async ({page}) => {
    let loggedIn = false, logins = 0;
    await page.route("**/api/backend/**", async route => {
      const path = new URL(route.request().url()).pathname;
      if (path.endsWith("/auth/login")) {
        logins++;
        expect(route.request().postDataJSON().email).toBe(role === "ADMIN" ? "admin@courier.com" : role === "COURIER" ? "courier@courier.com" : "customer@courier.com");
        loggedIn = true;
        await setSession(page, role);
        return route.fulfill({json: {success: true, data: {user: {role}}}});
      }
      if (path.endsWith("/users/me")) return route.fulfill({status: loggedIn ? 200 : 401, json: {success: loggedIn, data: loggedIn ? {role, status: "ACTIVE", courier: {id: "11111111-1111-4111-8111-111111111111"}} : undefined}});
      return route.fulfill({json: {success: true, data: {shipmentsByStatus: [], monthlyRevenue: [], totalShipments: 0}}});
    });
    await page.goto("/en/login");
    await page.locator("form").getByRole("button", {name: label, exact: true}).click();
    await expect(page).toHaveURL(new RegExp("/en/" + destination + "$"));
    expect(logins).toBe(1);
  });
}

test("coverage search survives reload and a bookmarked query", async ({page}) => {
  await page.route("**/api/backend/**", route => route.fulfill({json: {success: true, data: new URL(route.request().url()).pathname.endsWith("/coverage") ? [{id: "area", name: "Mirpur", district: "Dhaka", upazila: "Dhaka Metropolitan", pickupEnabled: true, deliveryEnabled: true}] : undefined}, status: new URL(route.request().url()).pathname.endsWith("/users/me") ? 401 : 200}));
  await page.goto("/en/coverage?search=Mirpur");
  await expect(page.getByRole("searchbox")).toHaveValue("Mirpur");
  await page.getByRole("searchbox").fill("Dhaka");
  await expect(page).toHaveURL(/search=Dhaka/);
  await page.reload();
  await expect(page.getByRole("searchbox")).toHaveValue("Dhaka");
});

test("payment history exposes a retry error instead of a misleading empty list", async ({page}) => {
  await setSession(page, "CUSTOMER");
  await page.route("**/api/backend/**", route => route.fulfill(new URL(route.request().url()).pathname.endsWith("/users/me") ? {json: {success: true, data: {role: "CUSTOMER", status: "ACTIVE"}}} : {status: 503, json: {success: false, message: "Provider unavailable"}}));
  await page.goto("/en/dashboard/payments");
  await expect(page.getByRole("button", {name: "Try again"})).toBeVisible();
  await expect(page.getByText("No payments found", {exact: true})).toHaveCount(0);
});

test("public pages have unique metadata and generated social artwork", async ({page, request}) => {
  const titles = new Set<string>();
  for (const path of ["", "/contact", "/pricing", "/coverage", "/merchant-register", "/courier-apply"]) {
    await page.goto("/en" + path);
    titles.add(await page.title());
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Dropzo/);
    await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute("content", /opengraph-image/);
  }
  expect(titles.size).toBe(6);
  const response = await request.get("/en/opengraph-image");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
});

test("charts render database response values and exclude product COD", async ({page}) => {
  await setSession(page, "ADMIN");
  await page.route("**/api/backend/**", route => route.fulfill({json: {success: true, data: new URL(route.request().url()).pathname.endsWith("/users/me") ? {role: "ADMIN", status: "ACTIVE"} : {totalRevenue: 456, totalCustomers: 2, totalCouriers: 3, totalShipments: 7, shipmentsByStatus: [{status: "DELIVERED", _count: {status: 7}}], monthlyRevenue: [{month: "2026-10", amount: 456}]}}}));
  await page.goto("/en/admin");
  await expect(page.getByRole("img", {name: /2026-10: BDT 456/})).toBeVisible();
  await expect(page.getByText("PAID delivery fees by month in Asia/Dhaka. Excludes product COD.")).toBeVisible();
});
