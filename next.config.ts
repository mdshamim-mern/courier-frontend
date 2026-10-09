import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");
const upstream =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1";
const apiUrl = new URL(upstream);
if (
  !["http:", "https:"].includes(apiUrl.protocol) ||
  apiUrl.username ||
  apiUrl.password
)
  throw new Error("Invalid API_BASE_URL");

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${upstream.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/backend/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
          },
        ],
      },
    ];
  },
};
export default withNextIntl(nextConfig);
