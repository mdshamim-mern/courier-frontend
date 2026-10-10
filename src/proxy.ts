import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware({
  locales: ["en", "bn"],
  defaultLocale: "en",
});

export async function proxy(request: NextRequest) {
  const match = request.nextUrl.pathname.match(
    /^\/(en|bn)\/(admin|courier|dashboard)(?:\/|$)/,
  );
  if (!match) return intlMiddleware(request);
  const [, locale, section] = match;
  const login = () => {
    const url = new URL(`/${locale}/login`, request.url);
    url.searchParams.set(
      "next",
      request.nextUrl.pathname.replace(/^\/(en|bn)/, ""),
    );
    const response = NextResponse.redirect(url);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  };
  const cookie = ["accessToken", "refreshToken"]
    .flatMap((name) => {
      const value = request.cookies.get(name)?.value;
      return value ? [`${name}=${encodeURIComponent(value)}`] : [];
    })
    .join("; ");
  if (!cookie) return login();
  const base =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api/v1";
  const headers = {
    Cookie: cookie,
    "X-Courier-Client": "1",
    Origin: request.nextUrl.origin,
  };
  let refreshed: string[] = [];
  try {
    let session = await fetch(`${base.replace(/\/$/, "")}/users/me`, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (session.status === 401 && request.cookies.has("refreshToken")) {
      const refresh = await fetch(
        `${base.replace(/\/$/, "")}/auth/refresh-token`,
        {
          method: "POST",
          headers,
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        },
      );
      if (!refresh.ok) return login();
      refreshed = refresh.headers.getSetCookie();
      const tokens = refreshed.map((value) => value.split(";")[0]).join("; ");
      session = await fetch(`${base.replace(/\/$/, "")}/users/me`, {
        headers: { ...headers, Cookie: tokens },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
    }
    if (session.status === 401 || session.status === 403) return login();
    if (!session.ok) throw new Error("Session verification unavailable");
    const body: { data?: { role?: string } } = await session.json();
    const role = body.data?.role;
    if (!["ADMIN", "COURIER", "CUSTOMER"].includes(role || "")) return login();
    const allowed = {
      admin: "ADMIN",
      courier: "COURIER",
      dashboard: "CUSTOMER",
    }[section];
    const response =
      role === allowed
        ? intlMiddleware(request)
        : NextResponse.redirect(
            new URL(
              `/${locale}/${role === "ADMIN" ? "admin" : role === "COURIER" ? "courier" : "dashboard"}`,
              request.url,
            ),
          );
    for (const value of refreshed) response.headers.append("Set-Cookie", value);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch {
    return new NextResponse(
      locale === "bn"
        ? "সেশন যাচাই করা যায়নি। আবার চেষ্টা করুন।"
        : "Session verification unavailable. Please retry.",
      {
        status: 503,
        headers: {
          "Cache-Control": "private, no-store",
          "Retry-After": "10",
          "Content-Type": "text/plain; charset=utf-8",
        },
      },
    );
  }
}
export const config = { matcher: ["/((?!api|_next|.*\\..*).*)"] };
