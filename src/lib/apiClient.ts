import { ofetch, type FetchOptions, type FetchError } from "ofetch";

const transport = ofetch.create({
  baseURL: "/api/backend",
  credentials: "include",
  retry: 0,
  timeout: 20000,
  headers: { "X-Courier-Client": "1" },
});
const publicAuthPaths = new Set(["/auth/login", "/auth/register", "/auth/verify-email", "/auth/refresh-token", "/auth/google", "/auth/forgot-password", "/auth/reset-password", "/auth/logout"]);
let refreshPromise: Promise<unknown> | null = null;

export default async function apiClient<T = unknown>(request: string, options: FetchOptions<"json"> = {}): Promise<T> {
  try {
    return await transport<T>(request, options);
  } catch (error) {
    const failure = error as FetchError;
    if (failure.response?.status !== 401 || publicAuthPaths.has(request) || request.startsWith("/shipments/track/")) throw error;
    if (!refreshPromise) {
      refreshPromise = transport("/auth/refresh-token", { method: "POST" }).finally(() => { refreshPromise = null; });
    }
    await refreshPromise;
    return transport<T>(request, options);
  }
}
