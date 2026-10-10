import { setSession } from "./support/session";
import { test, expect, type Page } from "@playwright/test";
const id = "11111111-1111-4111-8111-111111111111",
  from = "22222222-2222-4222-8222-222222222222",
  to = "33333333-3333-4333-8333-333333333333",
  hub = "44444444-4444-4444-8444-444444444444";
const user = {
  id: from,
  name: "Customer",
  email: "test@example.test",
  role: "CUSTOMER",
  status: "ACTIVE",
};
const areas = [
  {
    id: from,
    name: "Mirpur",
    district: "Dhaka",
    upazila: "Mirpur",
    pickupEnabled: true,
    dropoffEnabled: true,
    deliveryEnabled: true,
  },
  {
    id: to,
    name: "Savar",
    district: "Dhaka",
    upazila: "Savar",
    pickupEnabled: true,
    dropoffEnabled: true,
    deliveryEnabled: true,
  },
];
const quote = {
  baseCharge: "80",
  extraWeightCharge: "20",
  pickupFee: "10",
  deliveryCharge: "110",
  codFee: "1",
  merchantPayable: "99",
  deliveryDays: 2,
  rateUpdatedAt: "2026-10-09T00:00:00.000Z",
  originHub: { name: "Mirpur hub", address: "Branch address" },
};
const shipment = {
  id,
  trackingId: "TRK-TEST123456",
  receiverName: "Receiver",
  receiverPhone: "01712345678",
  receiverAddress: "Savar address",
  pickupAddress: "Mirpur pickup",
  senderPhone: "01812345678",
  price: "110",
  weight: 2,
  codAmount: "100",
  status: "OUT_FOR_DELIVERY",
  paymentStatus: "PAID",
  allowedNextStatuses: ["DELIVERED", "DELIVERY_FAILED"],
  createdAt: "2026-10-09T00:00:00.000Z",
  trackings: [],
};
async function mock(page: Page, role = "CUSTOMER") {
  await setSession(page, role);
  await page.route("**/api/backend/**", (route) => {
    const path = new URL(route.request().url()).pathname.replace(
      "/api/backend",
      "",
    );
    if ((path === "/users/me" || path.startsWith("/auth/")) && role === "GUEST")
      return route.fulfill({ status: 401, json: { success: false } });
    const data =
      path === "/users/me"
        ? { ...user, role }
        : path === "/operations/coverage"
          ? areas
          : path === "/operations/quote"
            ? quote
            : path === "/operations/quotes"
              ? [quote, quote]
              : path === "/operations/mine"
                ? { business: null, application: null, collections: [] }
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
async function fillBooking(page: Page) {
  await page
    .getByRole("combobox", {
      name: "Pickup area (district / upazila / locality)",
      exact: true,
    })
    .selectOption(from);
  await page
    .getByRole("combobox", {
      name: "Delivery area (district / upazila / locality)",
      exact: true,
    })
    .selectOption(to);
  for (const [name, value] of [
    ["senderPhone", "01812345678"],
    ["pickupAddress", "Mirpur pickup"],
    ["receiverName", "Receiver"],
    ["receiverPhone", "01712345678"],
    ["receiverAddress", "Savar address"],
    ["weight", "2"],
    ["declaredValue", "100"],
    ["codAmount", "100"],
    [
      "requestedPickupAt",
      new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    ],
  ]) {
    if (["declaredValue", "codAmount", "weight", "requestedPickupAt"].includes(name) && await page.getByRole("button", { name: /Continue to parcel details|পণ্যের তথ্যে যান/ }).isVisible()) await page.getByRole("button", { name: /Continue to parcel details|পণ্যের তথ্যে যান/ }).click();
    await page.locator(`input[name="${name}"]`).fill(value);
  }
}
test("mobile Bengali home exposes booking, tracking and functional menu without invented statistics", async ({
  page,
}) => {
  await mock(page, "GUEST");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/bn");
  await expect(
    page.getByRole("heading", { name: "পার্সেল পাঠান। প্রতিটি ধাপ জানুন।" }),
  ).toBeVisible();
  await expect(
    page.locator('main a[href="/bn/dashboard/new-shipment"]'),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "পার্সেলের অনুসন্ধানসংখ্যা" }),
  ).toBeVisible();
  await expect(page.locator("main")).not.toContainText(/99.9%|10K|50\+|24\/7/);
  await page.locator(".mobile-menu summary").click();
  await expect(
    page.locator('.mobile-dropdown a[href="/bn/pricing"]'),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("booking login preserves the requested customer destination", async ({
  page,
}) => {
  await mock(page, "GUEST");
  let loggedIn = false;
  await page.route("**/api/backend/users/me", (route) =>
    route.fulfill({
      status: loggedIn ? 200 : 401,
      json: { success: loggedIn, data: loggedIn ? user : undefined },
    }),
  );
  await page.route("**/api/backend/auth/login", async (route) => {
    await setSession(page, "CUSTOMER");
    loggedIn = true;
    return route.fulfill({
      json: { success: true, data: { user, role: "CUSTOMER" } },
    });
  });
  await page.goto("/en/dashboard/new-shipment");
  await expect(page).toHaveURL(/login\?next=%2Fdashboard%2Fnew-shipment/);
  await page.getByLabel("Email Address").fill(user.email);
  await page.locator("#password").fill("Valid@12345");
  await page
    .locator("form")
    .getByRole("button", { name: "Login", exact: true })
    .click();
  await expect(page).toHaveURL(/\/en\/dashboard\/new-shipment$/);
  await expect(
    page.getByRole("heading", { name: "Book your parcel" }),
  ).toBeVisible();
});
test("booking shows cost before submission and sends area data without customer hub selection", async ({
  page,
}) => {
  await mock(page);
  let submitted = false;
  await page.route("**/api/backend/shipments", (route) => {
    const body = route.request().postDataJSON();
    expect(body.originHubId).toBeUndefined();
    expect(body.destinationHubId).toBeUndefined();
    expect(body.pickupAddress).toBe("Mirpur pickup");
    expect(body.requestId).toMatch(/^[a-f0-9-]{36}$/);
    expect(body.quoteVersion).toBe(quote.rateUpdatedAt);
    expect(body.quotedDeliveryCharge).toBe(110);
    submitted = true;
    return route.fulfill({ json: { success: true, data: shipment } });
  });
  await page.goto("/en/dashboard/new-shipment");
  await fillBooking(page);
  await page
    .getByRole("button", { name: "Review cost before booking" })
    .click();
  await expect(
    page.getByText("Total delivery fee:", { exact: false }),
  ).toBeVisible();
  expect(submitted).toBe(false);
  await expect(
    page.getByRole("button", { name: "Confirm booking" }),
  ).toBeDisabled();
  await page
    .getByLabel("I checked the addresses, charges and product details.")
    .check();
  await page.getByRole("button", { name: "Confirm booking" }).click();
  await expect(page).toHaveURL(new RegExp(`/my-shipments/${id}`));
  expect(submitted).toBe(true);
  await expect(page.getByLabel("Tracking QR code")).toBeVisible();
});
test("inactive pricing blocks booking rather than using a fallback price", async ({
  page,
}) => {
  await mock(page);
  await page.route("**/api/backend/operations/quote", (route) =>
    route.fulfill({
      status: 409,
      json: { success: false, message: "Approved pricing is not available" },
    }),
  );
  await page.goto("/en/dashboard/new-shipment");
  await fillBooking(page);
  await page
    .getByRole("button", { name: "Review cost before booking" })
    .click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "No approved price is available",
  );
  await expect(
    page.getByRole("button", { name: "Confirm booking" }),
  ).toHaveCount(0);
});
test("courier delivery requires a drawn recipient signature and exact collection input", async ({
  page,
}) => {
  await mock(page, "COURIER");
  let submitted = false;
  await page.route(`**/api/backend/shipments/${id}/status`, (route) => {
    const body = route.request().postDataJSON();
    expect(body.status).toBe("DELIVERED");
    expect(body.proof.signature).toMatch(/^data:image\/png;base64,/);
    expect(body.proof.acknowledged).toBe(true);
    expect(body.collectedAmount).toBe(100);
    submitted = true;
    return route.fulfill({
      json: { success: true, data: { ...shipment, status: "DELIVERED" } },
    });
  });
  await page.goto("/en/courier/deliveries");
  await page
    .getByRole("button", { name: "Mark Delivered", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Confirm recorded action" }),
  ).toBeDisabled();
  await page.getByLabel("Recipient name").fill("Receiver");
  await page.getByLabel("Exact cash collected").fill("100");
  const canvas = page.getByLabel("Recipient signature area"),
    box = await canvas.boundingBox();
  if (!box) throw Error("Missing signature surface");
  await page.mouse.move(box.x + 20, box.y + 30);
  await page.mouse.down();
  await page.mouse.move(box.x + 130, box.y + 60, { steps: 10 });
  await page.mouse.up();
  await page
    .getByLabel("The recipient confirmed receipt and signed here.")
    .check();
  await page.getByRole("button", { name: "Confirm recorded action" }).click();
  await expect(page.getByText("Status Updated", { exact: true })).toBeVisible();
  expect(submitted).toBe(true);
});
test("courier failure records the stated reason instead of a silent status update", async ({
  page,
}) => {
  await mock(page, "COURIER");
  let sent = false;
  await page.route(`**/api/backend/shipments/${id}/status`, (route) => {
    expect(route.request().postDataJSON()).toEqual({
      status: "DELIVERY_FAILED",
      note: "Receiver unavailable",
    });
    sent = true;
    return route.fulfill({ json: { success: true, data: shipment } });
  });
  await page.goto("/en/courier/deliveries");
  await page
    .getByRole("button", { name: "Delivery Failed", exact: true })
    .click();
  await page
    .getByLabel("Reason for failure or return")
    .fill("Receiver unavailable");
  await page.getByRole("button", { name: "Confirm recorded action" }).click();
  await expect(page.getByText("Status Updated", { exact: true })).toBeVisible();
  expect(sent).toBe(true);
});
test("administrator allocation only offers available matching-hub workers with capacity", async ({
  page,
}) => {
  await mock(page, "ADMIN");
  await page.route("**/api/backend/shipments?*", (route) =>
    route.fulfill({
      json: {
        success: true,
        data: [
          {
            ...shipment,
            status: "PENDING",
            originHubId: hub,
            allowedNextStatuses: [],
          },
        ],
        meta: { page: 1, totalPages: 1 },
      },
    }),
  );
  const workers = [
    ["Eligible", hub, true, 1],
    ["Wrong hub", from, true, 1],
    ["At capacity", hub, true, 5],
    ["Unavailable", hub, false, 0],
  ].map(([name, currentHubId, isAvailable, deliveries], i) => ({
    userId: `worker-${i}`,
    currentHubId,
    isAvailable,
    user: { name, _count: { deliveries } },
  }));
  await page.route("**/api/backend/operations/admin", (route) =>
    route.fulfill({
      json: {
        success: true,
        data: {
          couriers: workers,
          areas: [],
          rates: [],
          applications: [],
          businesses: [],
          collections: [],
        },
      },
    }),
  );
  await page.goto("/en/admin/all-shipments");
  await expect(
    page.getByRole("button", { name: "Assign pickup worker" }),
  ).toBeVisible();
  const select = page.getByLabel("Available worker and current load");
  await expect(select.locator("option")).toHaveCount(2);
  await expect(select).toContainText("Eligible");
  await expect(select).not.toContainText("Wrong hub");
});
test("CSV booking previews charges and prints a label for each confirmed parcel", async ({
  page,
}) => {
  await mock(page);
  const base = {
    pickupAreaId: from,
    receiverAreaId: to,
    senderPhone: "01812345678",
    pickupAddress: "Mirpur pickup",
    receiverName: "Receiver",
    receiverPhone: "01712345678",
    receiverAddress: "Savar address",
    weight: 2,
    pickupMode: "HOME",
    serviceType: "STANDARD",
    productType: "PARCEL",
    declaredValue: 100,
    codAmount: 100,
    requestedPickupAt: new Date(Date.now() + 86400000).toISOString(),
    deliveryInstructions: "Careful",
  };
  const fields = Object.keys(base);
  const csv = `${fields.join(",")}\n${[base, { ...base, receiverName: "Receiver Two" }].map((row) => fields.map((key) => String(row[key as keyof typeof row])).join(",")).join("\n")}`;
  await page.route("**/api/backend/shipments/bulk", (route) => {
    const body = route.request().postDataJSON();
    expect(body).toHaveLength(2);
    expect(body[0].quotedDeliveryCharge).toBe(110);
    expect(body[0].requestId).not.toBe(body[1].requestId);
    return route.fulfill({
      json: {
        success: true,
        data: [shipment, { ...shipment, id: to, trackingId: "TRK-TESTSECOND" }],
      },
    });
  });
  await page.goto("/en/dashboard/bulk");
  await page.getByLabel("CSV file").setInputFiles({
    name: "parcels.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(csv),
  });
  await expect(
    page.getByRole("button", { name: "Confirm all bookings" }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Calculate every parcel charge" })
    .click();
  await expect(
    page.getByText("Total delivery fee:", { exact: false }),
  ).toHaveCount(2);
  await page
    .getByLabel("I have checked each parcel and its displayed charges.")
    .check();
  await page.getByRole("button", { name: "Confirm all bookings" }).click();
  await expect(page.locator("article.parcel-label")).toHaveCount(2);
  await page.emulateMedia({ media: "print" });
  const pdf = await page.pdf({ format: "A4", printBackground: true });
  expect([
    ...pdf.toString("latin1").matchAll(/\/Type\s*\/Page\b/g),
  ]).toHaveLength(2);
});
test("courier applications require account verification and do not promise automatic access", async ({
  page,
}) => {
  await mock(page, "GUEST");
  await page.goto("/bn/courier-apply");
  await expect(
    page.getByText("আগে ব্যক্তিগত অ্যাকাউন্ট তৈরি ও যাচাই করুন। এরপর আবেদন পূরণ করুন।"),
  ).toBeVisible();
  await expect(page.locator('main a[href*="/register?next="]')).toBeVisible();
  await mock(page);
  await page.goto("/en/courier-apply");
  await expect(
    page.getByText("Approval does not happen automatically.", { exact: false }),
  ).toBeVisible();
});
test("registration exposes terms and privacy before account creation", async ({
  page,
}) => {
  await mock(page, "GUEST");
  await page.goto("/bn/register");
  await expect(page.locator('main a[href="/bn/terms"]')).toBeVisible();
  await expect(page.locator('main a[href="/bn/privacy"]')).toBeVisible();
});

test("Stripe delivery fee button uses the existing Stripe checkout route without invoking bKash", async ({
  page,
}) => {
  await mock(page);
  let called = false;
  await page.route("**/api/backend/payments/stripe/initiate", (route) => {
    expect(route.request().postDataJSON()).toEqual({ shipmentId: id });
    called = true;
    return route.fulfill({
      status: 503,
      json: { success: false, message: "Provider unavailable" },
    });
  });
  await page.route("**/api/backend/shipments?*", (route) =>
    route.fulfill({
      json: {
        success: true,
        data: [{ ...shipment, paymentStatus: "UNPAID" }],
        meta: { page: 1, totalPages: 1 },
      },
    }),
  );
  await page.goto("/bn/dashboard/my-shipments");
  await page
    .getByRole("button", { name: "স্ট্রাইপ দিয়ে পরিশোধ", exact: true })
    .click();
  await expect.poll(() => called).toBe(true);
  await expect(
    page.getByText("অর্থপ্রদান ব্যর্থ হয়েছে", { exact: true }),
  ).toBeVisible();
});

test("business onboarding submits payout details for review without granting approval", async ({
  page,
}) => {
  await mock(page);
  let called = false;
  const body = {
    shopName: "Test Shop",
    pickupAddress: "Mirpur shop address",
    contactNumber: "01812345678",
    accountName: "Test Owner",
    accountNumber: "123456789012",
    payoutMethod: "BANK",
  };
  await page.route("**/api/backend/operations/business", (route) => {
    expect(route.request().method()).toBe("PUT");
    expect(route.request().postDataJSON()).toEqual(body);
    called = true;
    return route.fulfill({
      json: { success: true, data: { id, ...body, approved: false } },
    });
  });
  await page.goto("/en/dashboard/business");
  for (const [key, value] of Object.entries(body).filter(
    ([key]) => key !== "payoutMethod",
  ))
    await page.locator('input[name="' + key + '"]').fill(value);
  await page.getByRole("button", { name: "Submit for review" }).click();
  await expect(
    page.getByText("Application saved for administrator review.", {
      exact: true,
    }),
  ).toBeVisible();
  expect(called).toBe(true);
});
test("verified customer can submit a staff application without choosing a hub or role", async ({
  page,
}) => {
  await mock(page);
  let called = false;
  await page.route("**/api/backend/operations/applications", (route) => {
    expect(route.request().postDataJSON()).toEqual({
      contactNumber: "01812345678",
      area: "Mirpur",
      vehicleType: "MOTORBIKE",
    });
    called = true;
    return route.fulfill({
      json: { success: true, data: { id, status: "PENDING" } },
    });
  });
  await page.goto("/en/courier-apply");
  await page.locator('input[name="contactNumber"]').fill("01812345678");
  await page.locator('input[name="area"]').fill("Mirpur");
  await page.locator('select[name="vehicleType"]').selectOption("MOTORBIKE");
  await page.getByRole("button", { name: "Submit for review" }).click();
  await expect(
    page.getByText("Application saved for administrator review.", {
      exact: true,
    }),
  ).toBeVisible();
  expect(called).toBe(true);
});
async function adminOperationsMock(
  page: Page,
  extra: Record<string, unknown> = {},
) {
  await mock(page, "ADMIN");
  await page.route("**/api/backend/operations/admin", (route) =>
    route.fulfill({
      json: {
        success: true,
        data: {
          couriers: [],
          areas,
          rates: [],
          applications: [],
          businesses: [],
          collections: [],
          payoutAccounts: [],
          ...extra,
        },
      },
    }),
  );
  await page.route("**/api/backend/hubs?*", (route) =>
    route.fulfill({
      json: {
        success: true,
        data: [
          {
            id: hub,
            name: "Mirpur hub",
            address: "Branch address",
            isActive: true,
          },
        ],
      },
    }),
  );
}
test("administrator explicitly configures service availability and approved tariffs", async ({
  page,
}) => {
  await adminOperationsMock(page);
  let areaSent = false,
    rateSent = false;
  const areaBody = {
    name: "Mirpur new",
    district: "Dhaka",
    upazila: "Mirpur",
    hubId: hub,
    pickupEnabled: true,
    dropoffEnabled: true,
    deliveryEnabled: true,
  };
  const rateBody = {
    pickupAreaId: from,
    receiverAreaId: to,
    serviceType: "STANDARD",
    baseWeight: 1,
    baseCharge: 80,
    extraPerKg: 20,
    pickupFee: 10,
    codPercent: 1,
    deliveryDays: 2,
    cutoffMinutes: 0,
    active: true,
  };
  await page.route("**/api/backend/operations/areas", (route) => {
    expect(route.request().postDataJSON()).toEqual(areaBody);
    areaSent = true;
    return route.fulfill({
      json: { success: true, data: { id, ...areaBody } },
    });
  });
  await page.route("**/api/backend/operations/rates", (route) => {
    expect(route.request().postDataJSON()).toEqual(rateBody);
    rateSent = true;
    return route.fulfill({
      json: { success: true, data: { id, ...rateBody } },
    });
  });
  await page.goto("/en/admin/operations");
  const areaForm = page.locator("form").filter({
    has: page.getByRole("heading", { name: "Service area", exact: true }),
  });
  for (const [key, value] of Object.entries(areaBody)) {
    const field = areaForm.locator('[name="' + key + '"]');
    if (typeof value === "boolean") await field.check();
    else if (key === "hubId") await field.selectOption(value);
    else await field.fill(value);
  }
  await areaForm.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(() => areaSent).toBe(true);
  const rateForm = page.locator("form").filter({
    has: page.getByRole("heading", {
      name: "Approved rate plan",
      exact: true,
    }),
  });
  for (const [key, value] of Object.entries(rateBody)) {
    const field = rateForm.locator('[name="' + key + '"]');
    if (typeof value === "boolean") await field.check();
    else if (typeof value === "number") await field.fill(String(value));
    else await field.selectOption(value);
  }
  await rateForm.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(() => rateSent).toBe(true);
});
test("manual payout records the approved account version and an existing transfer reference", async ({
  page,
}) => {
  const account = {
    id: to,
    userId: from,
    updatedAt: "2026-10-09T00:00:00.000Z",
    shopName: "Test Shop",
    pickupAddress: "Shop address",
    contactNumber: "01812345678",
    payoutMethod: "BANK",
    accountName: "Verified Owner",
    accountNumber: "123456789012",
    approved: true,
  };
  await adminOperationsMock(page, {
    payoutAccounts: [account],
    collections: [
      {
        id,
        shipmentId: to,
        merchantId: from,
        courierId: hub,
        amount: "100",
        fee: "1",
        payable: "99",
        status: "RECEIVED",
      },
    ],
  });
  let called = false;
  await page.route("**/api/backend/operations/collections/" + id, (route) => {
    expect(route.request().postDataJSON()).toEqual({
      action: "PAY",
      reference: "COMPLETED-TRANSFER-123",
      accountVersion: account.updatedAt,
    });
    called = true;
    return route.fulfill({
      json: { success: true, data: { id, status: "PAID" } },
    });
  });
  await page.goto("/en/admin/operations");
  await expect(
    page.getByText("Verify completed transfer to this approved account:", {
      exact: false,
    }),
  ).toContainText(account.accountNumber);
  await page.locator('input[name="reference"]').fill("COMPLETED-TRANSFER-123");
  await page.getByRole("button", { name: "Record completed payout" }).click();
  await expect.poll(() => called).toBe(true);
});

test("Bengali Stripe minimum-fee rejection explains the payment limitation", async ({
  page,
}) => {
  await mock(page);
  await page.route("**/api/backend/shipments?*", (route) =>
    route.fulfill({
      json: {
        success: true,
        data: [
          {
            ...shipment,
            status: "PENDING",
            paymentStatus: "UNPAID",
            price: "60",
          },
        ],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    }),
  );
  await page.route("**/api/backend/payments/stripe/initiate", (route) =>
    route.fulfill({
      status: 400,
      json: {
        success: false,
        message:
          "This delivery fee is below Stripe minimum; use another available payment method",
      },
    }),
  );
  await page.goto("/bn/dashboard/my-shipments");
  await page.getByRole("button", { name: "স্ট্রাইপ দিয়ে পরিশোধ" }).click();
  await expect(
    page.getByText(
      "এই ডেলিভারি মাশুল Stripe-এর ন্যূনতম অর্থের সীমার নিচে। অন্য চালু অর্থপ্রদানের মাধ্যম ব্যবহার করুন।",
    ),
  ).toBeVisible();
});
