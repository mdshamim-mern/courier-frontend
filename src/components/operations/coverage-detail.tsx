"use client";
import { useLocale } from "next-intl";
import { usePublicCoverage } from "@/hooks/use-public-coverage";
import { placeName } from "@/i18n/geography";
import { Link } from "@/i18n/navigation";
import PublicDataState from "./public-data-state";
import Image from "next/image";

export default function CoverageDetail({ id }: { id: string }) {
  const locale = useLocale(),
    bn = locale === "bn";
  const t = (en: string, bangla: string) => (bn ? bangla : en);
  const result = usePublicCoverage();
  if (result.isPending || result.isError)
    return (
      <div className="page-wrap">
        <PublicDataState
          pending={result.isPending}
          retry={() => {
            void result.refetch();
          }}
        />
      </div>
    );
  const area = result.data?.data.find((a) => a.id === id);
  if (!area)
    return (
      <div className="page-wrap space-y-4">
        <h1>{t("Service area not found", "সেবার এলাকা পাওয়া যায়নি")}</h1>
        <Link href="/coverage" className="secondary-button">
          {t("Browse coverage", "সেবার এলাকা দেখুন")}
        </Link>
      </div>
    );
  return (
    <article className="page-wrap space-y-8">
      <Link href="/coverage" className="text-link">
        ← {t("All service areas", "সব সেবার এলাকা")}
      </Link>
      <header className="glass-panel grid gap-6 p-6 md:grid-cols-2">
        <div className="space-y-4">
          <p className="eyebrow">{t("Service area", "সেবার এলাকা")}</p>
          <h1 className="page-heading">{placeName(area.name, locale)}</h1>
          <p>
            {placeName(area.district, locale)} ·{" "}
            {placeName(area.upazila, locale)}
          </p>
        </div>
        <Image
          src="/service-area.svg"
          alt={t("Delivery network illustration", "ডেলিভারি নেটওয়ার্কের চিত্র")}
          width={400}
          height={220}
          className="w-full rounded-xl"
        />
      </header>
      <section className="glass-panel space-y-4 p-6">
        <h2 className="text-2xl font-semibold">{t("Overview", "পরিচিতি")}</h2>
        <p>
          {t(
            "Choose this area during booking. Available collection methods are shown below; route availability and the final charge are checked before confirmation.",
            "বুকিংয়ে এই এলাকা নির্বাচন করুন। সংগ্রহের সুবিধা নিচে দেখানো হয়েছে; নিশ্চিত করার আগে রুট ও চূড়ান্ত মাশুল যাচাই হবে।",
          )}
        </p>
      </section>
      <section className="glass-panel space-y-4 p-6">
        <h2 className="text-2xl font-semibold">
          {t("Key information", "প্রয়োজনীয় তথ্য")}
        </h2>
        <dl className="grid gap-4 sm:grid-cols-3">
          {[
            [t("Pickup", "সংগ্রহ"), area.pickupEnabled],
            [t("Branch drop-off", "হাবে জমা"), area.dropoffEnabled],
            [t("Delivery", "ডেলিভারি"), area.deliveryEnabled],
          ].map(([label, enabled]) => (
            <div key={String(label)}>
              <dt>{label}</dt>
              <dd className="font-semibold">
                {enabled ? t("Available", "চালু") : t("Unavailable", "বন্ধ")}
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap gap-3">
          <Link className="brand-button" href="/pricing">
            {t("Calculate delivery cost", "মাশুল হিসাব করুন")}
          </Link>
          <Link className="secondary-button" href="/dashboard/new-shipment">
            {t("Book a parcel", "পার্সেল বুক করুন")}
          </Link>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          {t("More areas in this district", "এই জেলার অন্য এলাকা")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {result.data?.data
            .filter((a) => a.id !== id && a.district === area.district)
            .slice(0, 4)
            .map((a) => (
              <Link
                key={a.id}
                className="glass-panel p-5 text-link"
                href={`/coverage/${encodeURIComponent(a.id)}`}
              >
                {placeName(a.name, locale)} ↗
              </Link>
            ))}
        </div>
      </section>
    </article>
  );
}
