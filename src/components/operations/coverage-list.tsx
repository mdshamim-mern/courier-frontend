"use client";
import { useUrlState } from "@/hooks/use-url-state";
import { MapPin, Search, Check, Minus, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { usePublicCoverage } from "@/hooks/use-public-coverage";
import PublicDataState from "./public-data-state";
import { placeName, placeSearch } from "@/i18n/geography";
import QuoteCalculator from "./quote-calculator";
import TablePagination from "@/components/ui/table-pagination";
import AreaPhoto from "./area-photo";
export default function CoverageList() {
  const locale = useLocale(),
    bn = locale === "bn",
    [search, setSearch] = useUrlState("search", "");
  const t = (en: string, bangla: string) => (bn ? bangla : en);
  const result = usePublicCoverage();
  const [district, setDistrict] = useUrlState("district", "");
  const [pickup, setPickup] = useUrlState("pickup", "");
  const [delivery, setDelivery] = useUrlState("delivery", "");
  const [sort, setSort] = useUrlState("sort", "asc");
  const [page, setPage] = useUrlState("page", 1);
  const filtered =
    result.data?.data
      .filter(
        (area) =>
          placeSearch([area.name, area.district, area.upazila], search) &&
          (!district || area.district === district) &&
          (!pickup || String(area.pickupEnabled) === pickup) &&
          (!delivery || String(area.deliveryEnabled) === delivery),
      )
      .sort(
        (a, b) =>
          (sort === "desc" ? -1 : 1) *
          placeName(a.name, locale).localeCompare(
            placeName(b.name, locale),
            locale,
          ),
      ) ?? [];
  const totalPages = Math.max(1, Math.ceil(filtered.length / 8));
  const currentPage = Math.min(page, totalPages);
  return (
    <div className="page-wrap logistics-public-page coverage-workspace">
      <header className="glass-panel logistics-tool-hero">
        <div>
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
        </div>
        <Link className="secondary-button" href="/dashboard/new-shipment">
          {t("Send a parcel", "পার্সেল পাঠান")}
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
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
      <div className="glass-panel grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <label>
          {t("District", "জেলা")}
          <select
            className="h-12 w-full rounded-xl border bg-background p-2"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            <option value="">{t("All districts", "সব জেলা")}</option>
            {[...new Set(result.data?.data.map((a) => a.district))]
              .sort()
              .map((d) => (
                <option key={d} value={d}>
                  {placeName(d, locale)}
                </option>
              ))}
          </select>
        </label>
        {(
          [
            [t("Pickup", "সংগ্রহ"), pickup, setPickup],
            [t("Delivery", "ডেলিভারি"), delivery, setDelivery],
          ] as const
        ).map(([label, value, update]) => (
          <label key={label}>
            {label}
            <select
              className="h-12 w-full rounded-xl border bg-background p-2"
              value={value}
              onChange={(e) => update(e.target.value)}
            >
              <option value="">{t("All", "সব")}</option>
              <option value="true">{t("Available", "চালু")}</option>
              <option value="false">{t("Unavailable", "বন্ধ")}</option>
            </select>
          </label>
        ))}
        <label>
          {t("Sort by name", "নাম অনুযায়ী সাজান")}
          <select
            className="h-12 w-full rounded-xl border bg-background p-2"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="asc">{t("A to Z", "ঊর্ধ্বক্রম")}</option>
            <option value="desc">{t("Z to A", "নিম্নক্রম")}</option>
          </select>
        </label>
      </div>
      {!result.isPending && !result.isError && (
        <p className="coverage-result-count" role="status">
          {t("Matching service areas", "মিলে যাওয়া সেবার এলাকা")}:{" "}
          <strong>
            {new Intl.NumberFormat(bn ? "bn-BD" : "en-BD").format(
              filtered.length,
            )}
          </strong>
        </p>
      )}
      {(result.isPending || result.isError) && (
        <PublicDataState
          pending={result.isPending}
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
      <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.slice((currentPage - 1) * 8, currentPage * 8).map((area) => (
          <article
            className="glass-panel info-card coverage-area-card space-y-5 p-6"
            key={area.id}
          >
            <AreaPhoto name={area.name} locale={locale} />
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
            <p className="text-sm text-muted-foreground">
              {t(
                "Check collection and delivery options for this approved service area.",
                "অনুমোদিত এই এলাকায় সংগ্রহ ও ডেলিভারির সুবিধা দেখুন।",
              )}
            </p>
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
            <Link
              className="secondary-button w-full"
              href={`/coverage/${encodeURIComponent(area.id)}`}
            >
              {t("View Details", "বিস্তারিত দেখুন")}
            </Link>
          </article>
        ))}
      </div>
      <TablePagination
        page={currentPage}
        totalPages={totalPages}
        handlePageChange={setPage}
      />
      <div id="delivery-estimate" className="coverage-estimate">
        <QuoteCalculator />
      </div>
    </div>
  );
}
