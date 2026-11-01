import { notFound } from "next/navigation";
import { services } from "@/content/services";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const service = services.find((s) => s[0] === slug);
  if (!service) notFound();
  const bn = locale === "bn",
    t = (en: string, bangla: string) => (bn ? bangla : en);
  return (
    <article className="page-wrap space-y-8">
      <Link href="/services" className="text-link">
        ← {t("All services", "সব সেবা")}
      </Link>
      <header className="glass-panel grid gap-6 p-6 md:grid-cols-2">
        <div className="space-y-4">
          <p className="eyebrow">Dropzo</p>
          <h1 className="page-heading">{t(service[1], service[2])}</h1>
        </div>
        <Image
          src="/service-area.svg"
          width={400}
          height={220}
          className="w-full rounded-xl"
          alt={t("Parcel delivery illustration", "পার্সেল ডেলিভারির চিত্র")}
        />
      </header>
      <section className="glass-panel space-y-4 p-6">
        <h2 className="text-2xl font-semibold">{t("Overview", "পরিচিতি")}</h2>
        <p>{t(service[3], service[4])}</p>
        <h2 className="text-2xl font-semibold">
          {t("Key information", "প্রয়োজনীয় তথ্য")}
        </h2>
        <p>
          {t(
            "Availability depends on approved routes. Delivery fees are calculated from the route, weight, service and collection method. Product COD is recorded separately.",
            "সেবার প্রাপ্যতা অনুমোদিত রুটের ওপর নির্ভর করে। রুট, ওজন, সেবা ও সংগ্রহের পদ্ধতি অনুযায়ী মাশুল হিসাব হয়। পণ্যের COD আলাদা হিসাবে থাকে।",
          )}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/coverage" className="secondary-button">
            {t("Check coverage", "সেবার এলাকা দেখুন")}
          </Link>
          <Link
            href={slug === "ecommerce-fulfillment" ? "/contact" : "/pricing"}
            className="brand-button"
          >
            {slug === "ecommerce-fulfillment"
              ? t("Ask about availability", "সেবার প্রাপ্যতা জানুন")
              : t("Calculate cost", "মাশুল হিসাব করুন")}
          </Link>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          {t("Related services", "অন্যান্য সেবা")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services
            .filter((s) => s[0] !== slug)
            .slice(0, 4)
            .map((s) => (
              <Link
                className="glass-panel p-5 text-link"
                href={`/services/${s[0]}`}
                key={s[0]}
              >
                {t(s[1], s[2])} ↗
              </Link>
            ))}
        </div>
      </section>
    </article>
  );
}
