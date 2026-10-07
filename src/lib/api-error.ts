import type { FetchError } from "ofetch";

export function getApiErrorStatus(error: unknown): number | undefined {
  return (error as FetchError | undefined)?.response?.status;
}
export function getApiErrorMessage(error: unknown, fallback = "Unable to complete this request"): string {
  const data = (error as FetchError<{ message?: string }> | undefined)?.data;
  return typeof data?.message === "string" ? data.message : fallback;
}
