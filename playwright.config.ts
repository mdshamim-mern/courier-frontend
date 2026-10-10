import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 45000,
  expect: { timeout: 10000 },
  workers: 1,
  fullyParallel: false,
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://localhost:3100",
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    trace: "retain-on-failure",
  },
  webServer: [{ command: "node e2e/support/session-server.mjs", url: "http://127.0.0.1:5101/health", reuseExistingServer: false }, {
    command: "npm run start -- --port 3100",
    url: "http://localhost:3100/en",
    timeout: 120000,
    reuseExistingServer: false,
    env: { API_BASE_URL: "http://127.0.0.1:5101/api/v1", NEXT_PUBLIC_GOOGLE_CLIENT_ID: "", NEXT_PUBLIC_ENABLE_DEMO_LOGIN: "true" },
  }],
});
