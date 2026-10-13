import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { setSession } from "./support/session";

async function guest(page: Page) {
  await setSession(page, "GUEST");
  await page.route("**/api/backend/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/users/me") || path.includes("/auth/"))
      return route.fulfill({
        status: 401,
        json: { success: false, message: "Not authenticated" },
      });
    return route.fulfill({ json: { success: true, data: [] } });
  });
}
test("the first home hero remains byte-for-byte unchanged", () => {
  const source = readFileSync(
    "src/components/home/parcel-hero.tsx",
    "utf8",
  ).replace(/\r\n/g, "\n");
  const hero = source.match(
    /<section className="hero-panel">[\s\S]*?<\/section>/,
  )?.[0];
  expect(hero).toBeTruthy();
  expect(createHash("sha256").update(hero!).digest("hex")).toBe(
    "1d55b477b9c82fc6f550c77139e6b3de50aaf900eeb71a962606026fa9e31d63",
  );
});
test("home hero and footer are readable before JavaScript runs", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("http://localhost:3100/en");
    await expect(page.locator(".hero-panel h1")).toHaveText(
      "Send a parcel. Follow every step.",
    );
    await expect(page.locator("footer")).toContainText(
      "Your next delivery starts here",
    );
    await expect(page.locator(".home-process-card")).toHaveCount(4);
  } finally {
    await context.close();
  }
});
test("public homepage does not load the Google sign-in SDK", async ({
  page,
}) => {
  await guest(page);
  const googleRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().startsWith("https://accounts.google.com/gsi/"))
      googleRequests.push(request.url());
  });
  await page.goto("/en");
  await expect(page.locator(".home-network-card strong")).toHaveText([
    "0",
    "0",
    "0",
    "0",
  ]);
  await expect(
    page.locator('script[src*="accounts.google.com/gsi/"]'),
  ).toHaveCount(0);
  expect(googleRequests).toEqual([]);
});
for (const locale of ["en", "bn"])
  for (const width of [360, 1366]) {
    test(`home lower sections, footer and auth ${locale} at ${width}`, async ({
      page,
    }, info) => {
      await guest(page);
      await page.setViewportSize({ width, height: 900 });
      for (const suffix of ["", "/login", "/register"]) {
        await page.goto(`/${locale}${suffix}`);
        await expect(page.locator("main h1")).toBeVisible();
        if (!suffix) {
          await expect(page.locator(".hero-panel")).toBeVisible();
          await expect(page.locator(".home-process-card")).toHaveCount(4);
          await expect(page.locator(".home-team-actions a")).toHaveCount(2);
        } else {
          await expect(page.locator(".auth-form-panel")).toBeVisible();
          await expect(page.locator('input[name="email"]')).toHaveAttribute(
            "autocomplete",
            "email",
          );
        }
        await expect
          .poll(() =>
            page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
          )
          .toBe(true);
        await page.screenshot({
          path: info.outputPath(
            `${locale}-${width}-${suffix.slice(1) || "home"}.png`,
          ),
          fullPage: true,
        });
      }
      await page
        .locator("footer")
        .screenshot({ path: info.outputPath(`${locale}-${width}-footer.png`) });
    });
  }
test("password visibility and login failure retain working controls", async ({
  page,
}) => {
  await guest(page);
  await page.goto("/en/login?next=%2Fdashboard%2Fnew-shipment");
  await page
    .getByLabel("Email Address", { exact: true })
    .fill("user@example.test");
  await page.getByLabel("Password", { exact: true }).fill("TestPass@123");
  await page
    .getByRole("button", { name: "Show password", exact: true })
    .click();
  await expect(page.locator('input[name="password"]')).toHaveAttribute(
    "type",
    "text",
  );
  await expect(
    page.getByRole("button", { name: "Hide password", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "Hide password", exact: true })
    .click();
  await expect(page.locator('input[name="password"]')).toHaveAttribute(
    "type",
    "password",
  );
  await expect(
    page.getByRole("link", { name: "Create Account", exact: true }),
  ).toHaveAttribute("href", "/en/register?next=%2Fdashboard%2Fnew-shipment");
  await page.route("**/api/backend/auth/login", (route) =>
    route.fulfill({
      status: 400,
      json: { success: false, message: "Invalid email or password" },
    }),
  );
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(
    page.getByText("Authentication Failed", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Login", exact: true }),
  ).toBeEnabled();
  await expect(page.getByLabel("Email Address", { exact: true })).toHaveValue(
    "user@example.test",
  );
});
test("registration validates confirmation and preserves verification destination", async ({
  page,
}) => {
  await guest(page);
  let requests = 0;
  await page.route("**/api/backend/auth/register", (route) => {
    requests++;
    expect(route.request().postDataJSON()).toEqual({
      name: "Test Customer",
      email: "new@example.test",
      contactNumber: "01700112233",
      password: "TestPass@123",
    });
    return route.fulfill({ json: { success: true, data: null } });
  });
  await page.goto("/en/register?next=%2Fdashboard%2Fnew-shipment");
  await page.getByLabel("Full Name", { exact: true }).fill("Test Customer");
  await page
    .getByLabel("Email Address", { exact: true })
    .fill("new@example.test");
  await page.getByLabel("Phone Number", { exact: true }).fill("01700112233");
  await page.getByLabel("Password", { exact: true }).fill("TestPass@123");
  await page.getByLabel("Confirm", { exact: true }).fill("WrongPass@123");
  await page.getByRole("button", { name: "Sign Up", exact: true }).click();
  await expect(
    page.getByText("Passwords do not match", { exact: true }),
  ).toBeVisible();
  expect(requests).toBe(0);
  await page.getByLabel("Confirm", { exact: true }).fill("TestPass@123");
  await page.getByRole("button", { name: "Sign Up", exact: true }).click();
  await expect(page).toHaveURL(
    /\/en\/verify-account\?email=new%40example.test&next=%2Fdashboard%2Fnew-shipment$/,
  );
  expect(requests).toBe(1);
});
test("footer has genuine route links and its back-to-top button scrolls", async ({
  page,
}) => {
  await guest(page);
  await page.goto("/en");
  const footer = page.locator("footer");
  await expect(
    footer.getByRole("link", { name: "Track a parcel", exact: true }),
  ).toHaveAttribute("href", "/en/track-shipment");
  await expect(
    footer.getByRole("link", { name: "Estimate delivery cost", exact: true }),
  ).toHaveAttribute("href", "/en/pricing");
  await footer
    .getByRole("button", { name: "Back to top", exact: true })
    .click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
});
