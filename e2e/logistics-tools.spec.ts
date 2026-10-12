import { test, expect, type Page } from "@playwright/test";
import { setSession } from "./support/session";

const id = "11111111-1111-4111-8111-111111111111";
const shipment = {
  id,
  trackingId: "TRK-" + "A".repeat(32),
  status: "PENDING",
  paymentStatus: "UNPAID",
  createdAt: "2026-10-12T09:06:00Z",
  price: "75",
  weight: 2,
  codAmount: "0",
  receiverName: "Private Recipient",
  receiverPhone: "01700112233",
  receiverAddress: "Mirpur, Dhaka",
  pickupAddress: "Dhanmondi, Dhaka",
  senderPhone: "01865111111",
  trackings: [
    {
      id: "event",
      status: "PENDING",
      createdAt: "2026-10-12T09:06:00Z",
      note: "Shipment created",
    },
  ],
  priceBreakdown: {
    baseCharge: "60",
    extraWeightCharge: "15",
    pickupFee: "0",
    deliveryCharge: "75",
    codFee: "0",
    merchantPayable: "0",
    deliveryDays: 2,
    serviceType: "STANDARD",
  },
};
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
      };
    if (path.endsWith("/coverage"))
      data = [
        {
          id,
          name: "Dhanmondi",
          district: "Dhaka",
          upazila: "Dhaka Metropolitan",
          pickupEnabled: true,
          dropoffEnabled: true,
          deliveryEnabled: true,
        },
      ];
    if (path.endsWith("/quote")) data = shipment.priceBreakdown;
    if (path.endsWith(`/shipments/${id}`) || path.includes("/shipments/track/"))
      data = shipment;
    return route.fulfill({ json: { success: true, data } });
  });
}
for (const locale of ["en", "bn"])
  for (const width of [360, 1366]) {
    test(`logistics tools and receipt ${locale} at ${width}`, async ({
      page,
    }, info) => {
      await fixture(page);
      await page.setViewportSize({ width, height: 900 });
      for (const suffix of [
        "track-shipment",
        "pricing",
        "coverage",
        `dashboard/my-shipments/${id}`,
      ]) {
        await page.goto(`/${locale}/${suffix}`);
        await expect(page.locator("main h1")).toBeVisible();
        await expect(
          page.locator("main").getByText("Loading data", { exact: true }),
        ).toHaveCount(0);
        await expect
          .poll(() =>
            page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
          )
          .toBe(true);
        if (suffix.includes(id)) {
          await expect(page.locator(".receipt-document")).toContainText(
            shipment.receiverName,
          );
          await expect(page.locator("canvas")).toHaveAttribute("role", "img");
          await expect
            .poll(() =>
              page
                .locator("canvas")
                .evaluate((c: HTMLCanvasElement) => c.width),
            )
            .toBe(160);
        }
        await page.screenshot({
          path: info.outputPath(
            `${locale}-${width}-${suffix.includes(id) ? "receipt" : suffix}.png`,
          ),
          fullPage: true,
        });
      }
    });
  }
test("public tracking keeps private fields out and calculator displays server charges", async ({
  page,
}) => {
  await fixture(page);
  await page.goto("/en/track-shipment");
  await page
    .getByRole("textbox", { name: "Tracking ID" })
    .fill(shipment.trackingId);
  await page.getByRole("button", { name: "Track", exact: true }).click();
  await expect(page.locator(".tracking-result-heading")).toContainText(
    shipment.trackingId,
  );
  await expect(
    page.getByText(shipment.receiverName, { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText(shipment.receiverPhone, { exact: true }),
  ).toHaveCount(0);
  await page.goto("/en/pricing");
  await page
    .getByRole("combobox", { name: "Pickup area", exact: true })
    .selectOption(id);
  await page
    .getByRole("combobox", { name: "Delivery area", exact: true })
    .selectOption(id);
  await page
    .getByRole("spinbutton", { name: "Weight (kg)", exact: true })
    .fill("2");
  const request = page.waitForRequest((r) =>
    r.url().endsWith("/operations/quote"),
  );
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  expect((await request).postDataJSON()).toMatchObject({
    pickupAreaId: id,
    receiverAreaId: id,
    weight: 2,
  });
  await expect(page.locator(".quote-total")).toContainText("75.00");
  await expect(
    page.getByRole("link", { name: "Continue to booking" }),
  ).toHaveAttribute("href", "/en/dashboard/new-shipment");
  await page
    .getByRole("spinbutton", { name: "Weight (kg)", exact: true })
    .fill("3");
  await expect(page.locator(".quote-total")).toHaveCount(0);
});
test("shipment receipt preserves QR, public tracking link and print-only document", async ({
  page,
}, info) => {
  await fixture(page);
  await page.addInitScript(() => {
    window.print = () => {
      document.documentElement.dataset.printCalls = String(
        Number(document.documentElement.dataset.printCalls || 0) + 1,
      );
    };
  });
  await page.goto(`/en/dashboard/my-shipments/${id}`);
  await expect(
    page.getByRole("link", { name: "Public tracking", exact: true }),
  ).toHaveAttribute(
    "href",
    `/en/track-shipment?tracking=${shipment.trackingId}`,
  );
  await page
    .getByRole("button", { name: "Print receipt and label", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-print-calls", "1");
  await expect(page.locator(".receipt-total")).toContainText("75.00");
  await expect
    .poll(() =>
      page.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
        const pixels = canvas
          .getContext("2d")
          ?.getImageData(0, 0, canvas.width, canvas.height).data;
        if (!pixels) return false;
        for (let i = 0; i < pixels.length; i += 4)
          if (pixels[i] < 30 && pixels[i + 3] > 200) return true;
        return false;
      }),
    )
    .toBe(true);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".parcel-label")).toBeVisible();
  await expect(page.locator(".receipt-toolbar")).toBeHidden();
  await expect(page.locator("header").first()).toBeHidden();
  await page.screenshot({
    path: info.outputPath("receipt-print.png"),
    fullPage: true,
  });
});
