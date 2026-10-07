import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware({ locales: ["en", "bn"], defaultLocale: "en" });

export function proxy(request: NextRequest) {
  return intlMiddleware(request);
}
export const config = { matcher: ["/((?!api|_next|.*\\..*).*)"] };
