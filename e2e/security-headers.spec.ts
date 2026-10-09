import { test, expect } from "@playwright/test";

for (const locale of ["en", "bn"]) {
  test(
    locale +
      " production responses prevent framing and unsafe embedded objects",
    async ({ request }) => {
      for (const route of ["login", "privacy", "payment/success"]) {
        const response = await request.get(`/${locale}/${route}`);
        expect(response.status()).toBe(200);
        const headers = response.headers();
        expect(headers["x-frame-options"]).toBe("DENY");
        expect(headers["x-content-type-options"]).toBe("nosniff");
        expect(headers["referrer-policy"]).toBe(
          "strict-origin-when-cross-origin",
        );
        expect(headers["content-security-policy"]).toContain(
          "frame-ancestors 'none'",
        );
        expect(headers["content-security-policy"]).toContain(
          "object-src 'none'",
        );
        expect(headers["content-security-policy"]).toContain("base-uri 'self'");
      }
    },
  );
}
