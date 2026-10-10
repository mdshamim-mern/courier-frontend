"use client";
import { useUrlState } from "@/hooks/use-url-state";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Search, Check, Minus } from "lucide-react";
import { useLocale } from "next-intl";
import DataSkeleton from "@/components/ui/data-skeleton";
import QueryError from "@/components/ui/query-error";
import { placeName, placeSearch } from "@/i18n/geography";
import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/types";
import type { ServiceArea } from "@/types/operations.type";
import QuoteCalculator from "./quote-calculator";
export default function CoverageList() {
  const locale = useLocale(),
    bn = locale === "bn",
    [search, setSearch] = useUrlState("search", "");
  const t = (en: string, bangla: string) => (bn ? bangla : en);
  const result = useQuery({
    queryKey: ["coverage"],
    queryFn: () =>
      apiClient<ApiResponse<ServiceArea[]>>("/operations/coverage"),
    retry: false,
  });
  const filtered =
    result.data?.data.filter((area) =>
      placeSearch([area.name, area.district, area.upazila], search),
    ) ?? [];
  return (
    <div className="page-wrap space-y-8">
      <header className="space-y-3">
        <span className="eyebrow">
          {t("Our service network", "আমাদের সেবার নেটওয়ার্ক")}
        </span>
        <h1 className="page-heading">{t("Service coverage", "সেবার এলাকা")}</h1>
        <p className="max-w-2xl text-muted-foreground">
          {t(
            "Find an approved area and check how your parcel can be collected and delivered.",
            "অনুমোদিত এলাকা খুঁজে পার্সেল সংগ্রহ ও পৌঁছানোর সুবিধা যাচাই করুন।",
          )}
        </p>
      </header>
      <label className="glass-panel block p-5 sm:p-6">
        <span className="font-medium">
          {t("Search district, upazila or area", "জেলা, উপজেলা বা এলাকা খুঁজুন")}
        </span>
        <span className="relative mt-3 block">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-3.5 size-5 text-primary"
          />
          <input
            type="search"
            className="h-12 w-full rounded-xl border bg-background py-3 pl-12 pr-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </span>
      </label>
      {result.isPending && <DataSkeleton />}
      {result.isError && (
        <QueryError
          retry={() => {
            void result.refetch();
          }}
        />
      )}
      {!result.isPending && !result.isError && !result.data?.data.length && (
        <p>
          {t(
            "No service area has been approved yet.",
            "এখনো কোনো সেবার এলাকা অনুমোদিত হয়নি।",
          )}
        </p>
      )}
      {!result.isPending &&
        !result.isError &&
        !!result.data?.data.length &&
        !filtered.length && (
          <p role="status">
            {t(
              "No areas match your search.",
              "আপনার অনুসন্ধানের সঙ্গে কোনো এলাকা মেলেনি।",
            )}
          </p>
        )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((area) => (
          <article
            className="glass-panel info-card space-y-5 p-6"
            key={area.id}
          >
            <span className="icon-tile">
              <MapPin aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold">
                {placeName(area.name, locale)}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {placeName(area.district, locale)} ·{" "}
                {placeName(area.upazila, locale)}
              </p>
            </div>
            <dl className="space-y-3 text-sm">
              {[
                [t("Pickup", "সংগ্রহ"), area.pickupEnabled],
                [t("Branch drop-off", "হাবে জমা"), area.dropoffEnabled],
                [t("Delivery", "পৌঁছানো"), area.deliveryEnabled],
              ].map(([label, available]) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-2"
                  key={String(label)}
                >
                  <dt>{label}:</dt>
                  <dd
                    className={
                      available
                        ? "availability-badge"
                        : "availability-badge unavailable"
                    }
                  >
                    {available ? (
                      <Check aria-hidden="true" className="size-3.5" />
                    ) : (
                      <Minus aria-hidden="true" className="size-3.5" />
                    )}
                    {available ? t("Available", "চালু") : t("Unavailable", "বন্ধ")}
                  </dd>
                </div>
              ))}
            </dl>
            <details className="border-t pt-3 text-xs text-muted-foreground">
              <summary className="cursor-pointer font-medium">
                {t("Area ID for bulk booking", "একাধিক বুকিংয়ের এলাকার পরিচয়সংখ্যা")}
              </summary>
              <code className="mt-2 block break-all select-all">{area.id}</code>
            </details>
          </article>
        ))}
      </div>
      <QuoteCalculator />
    </div>
  );
}
