import type { Page } from "@playwright/test";
export async function setSession(page: Page, role: string) {
  if (role === "GUEST") { await page.context().clearCookies(); return; }
  await page.context().addCookies([{ name: "accessToken", value: "e2e-" + role, url: "http://localhost:3100", httpOnly: true, sameSite: "Lax" }]);
}
