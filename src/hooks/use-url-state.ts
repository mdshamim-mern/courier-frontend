"use client";

import { useSearchParams } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";

export function useUrlState<T extends string | number>(
  key: string,
  fallback: T,
): [
  T extends number ? number : string,
  Dispatch<SetStateAction<T extends number ? number : string>>,
] {
  type Value = T extends number ? number : string;
  const params = useSearchParams();
  const raw = params.get(key);
  const number = Number(raw);
  const value = (
    typeof fallback === "number"
      ? raw && Number.isSafeInteger(number) && number > 0
        ? number
        : fallback
      : (raw ?? fallback)
  ) as Value;
  const setValue: Dispatch<SetStateAction<Value>> = (next) => {
    const url = new URL(window.location.href);
    const currentRaw = url.searchParams.get(key);
    const current = (
      typeof fallback === "number"
        ? Number(currentRaw) || fallback
        : (currentRaw ?? fallback)
    ) as Value;
    const resolved = typeof next === "function" ? next(current) : next;
    if (String(resolved) === String(fallback)) url.searchParams.delete(key);
    else url.searchParams.set(key, String(resolved));
    if (key !== "page") url.searchParams.delete("page");
    if (url.href !== window.location.href) {
      if (key === "page") window.history.pushState(null, "", url.href);
      else window.history.replaceState(null, "", url.href);
    }
  };
  return [value, setValue];
}
