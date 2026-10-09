"use client";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useState } from "react";
import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/types";
import type { ServiceArea } from "@/types/operations.type";
import QuoteCalculator from "./quote-calculator";
export default function CoverageList() {
  const bn = useLocale() === "bn",
    [search, setSearch] = useState("");
  const result = useQuery({
    queryKey: ["coverage"],
    queryFn: () =>
      apiClient<ApiResponse<ServiceArea[]>>("/operations/coverage"),
    retry: false,
  });
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <h1 className="text-3xl font-bold">
        {bn ? "সেবার এলাকা" : "Service coverage"}
      </h1>
      <label>
        {bn ? "জেলা, উপজেলা বা এলাকা খুঁজুন" : "Search district, upazila or area"}
        <input
          className="mt-2 block h-11 w-full rounded-md border px-3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      {result.isPending && <p>{bn ? "তথ্য আসছে…" : "Loading…"}</p>}
      {result.isError && (
        <p role="alert">
          {bn ? "এলাকার তথ্য পাওয়া যায়নি।" : "Coverage unavailable."}
        </p>
      )}
      {!result.isPending && !result.isError && !result.data?.data.length && (
        <p>
          {bn
            ? "এখনো কোনো সেবার এলাকা অনুমোদিত হয়নি।"
            : "No service area has been approved yet."}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {result.data?.data
          .filter((area) =>
            [area.name, area.district, area.upazila]
              .join(" ")
              .toLowerCase()
              .includes(search.toLowerCase()),
          )
          .map((area) => (
            <article className="rounded-xl border p-5" key={area.id}>
              <h2 className="font-semibold">{area.name}</h2>
              <p>
                {area.district} · {area.upazila}
              </p>
              <p>
                {bn ? "সংগ্রহ: " : "Pickup: "}
                {area.pickupEnabled
                  ? bn
                    ? "চালু"
                    : "Available"
                  : bn
                    ? "বন্ধ"
                    : "Unavailable"}
              </p>
              <p>
                {bn ? "হাবে জমা: " : "Branch drop-off: "}
                {area.dropoffEnabled
                  ? bn
                    ? "চালু"
                    : "Available"
                  : bn
                    ? "বন্ধ"
                    : "Unavailable"}
              </p>
              <p>
                {bn ? "পৌঁছানো: " : "Delivery: "}
                {area.deliveryEnabled
                  ? bn
                    ? "চালু"
                    : "Available"
                  : bn
                    ? "বন্ধ"
                    : "Unavailable"}
              </p>
            </article>
          ))}
      </div>
      <p className="text-sm">
        {bn
          ? "একাধিক বুকিংয়ের জন্য এলাকার পরিচয়সংখ্যা জানতে এলাকার নামের উপরে চাপুন।"
          : "For bulk booking, expand an area to copy its ID."}
      </p>
      {result.data?.data.map((area) => (
        <details key={area.id}>
          <summary>{area.name}</summary>
          <code className="break-all">{area.id}</code>
        </details>
      ))}
      <QuoteCalculator />
    </div>
  );
}
