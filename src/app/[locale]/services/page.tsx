import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return pageMetadata("services", params);
}
import {
  Package,
  Zap,
  Store,
  ShieldCheck,
  Wallet,
  Warehouse,
} from "lucide-react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { services } from "@/content/services";
import Image from "next/image";
export default function ServicesPage() {
  const bn = useLocale() === "bn",
    t = (en: string, bangla: string) => (bn ? bangla : en);

  return (
    <article className="page-wrap space-y-8">
      <h1 className="page-heading">{t("Our Services", "আমাদের সেবাসমূহ")}</h1>
      <p className="max-w-3xl text-lg text-muted-foreground">
        {t(
          "Dropzo's own delivery team handles collection and delivery on approved routes. Check availability first.",
          "ড্রপজোর নিজস্ব ডেলিভারিকর্মীরা অনুমোদিত রুটে সংগ্রহ ও সরবরাহের কাজ করবেন। আগে সেবার প্রাপ্যতা যাচাই করুন।",
        )}
      </p>
      <div className="grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-4">
        {services.map(([id, en, bangla, description, descriptionBn], index) => (
          <section
            id={id}
            key={id}
            className="glass-panel info-card scroll-mt-24 space-y-4 p-6"
          >
            <Image
              src="/service-area.svg"
              alt={t("Parcel delivery illustration", "পার্সেল ডেলিভারির চিত্র")}
              width={400}
              height={220}
              className="w-full rounded-xl"
            />
            <span className="icon-tile">
              {index === 0 ? (
                <Package />
              ) : index === 1 ? (
                <Zap />
              ) : index === 2 ? (
                <Store />
              ) : index === 3 ? (
                <ShieldCheck />
              ) : index === 4 ? (
                <Wallet />
              ) : (
                <Warehouse />
              )}
            </span>
            <h2 className="text-xl font-semibold">{t(en, bangla)}</h2>
            <p>{t(description, descriptionBn)}</p>
            <Link href={`/services/${id}`} className="secondary-button">
              {t("View Details", "বিস্তারিত দেখুন")}
            </Link>
            {id !== "ecommerce-fulfillment" && (
              <Link className="inline-block underline" href="/pricing">
                {t("Check cost and availability", "খরচ ও প্রাপ্যতা যাচাই")}
              </Link>
            )}
          </section>
        ))}
      </div>
      <Link href="/dashboard/new-shipment" className="brand-button">
        {t("Send parcel", "পার্সেল পাঠান")}
      </Link>
    </article>
  );
}
