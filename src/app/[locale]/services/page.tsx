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
import type { Metadata } from "next";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "bn" ? "আমাদের সেবাসমূহ | Dropzo" : "Our Services | Dropzo",
  };
}
export default function ServicesPage() {
  const bn = useLocale() === "bn",
    t = (en: string, bangla: string) => (bn ? bangla : en);
  const services = [
    [
      "standard-delivery",
      "Standard Delivery",
      "সাধারণ ডেলিভারি",
      "Book only on an approved route. See the calculated fee and estimated delivery days before confirming.",
      "অনুমোদিত রুটে বুকিং করুন। নিশ্চিত করার আগে হিসাব করা মাশুল ও সম্ভাব্য সরবরাহের দিন দেখুন।",
    ],
    [
      "express-delivery",
      "Express Delivery",
      "জরুরি ডেলিভারি",
      "Available only where an express rate is approved. There is no blanket next-day delivery guarantee.",
      "জরুরি সেবার মূল্য অনুমোদিত রুটেই প্রযোজ্য। সব এলাকায় পরের দিন পৌঁছানোর নিশ্চয়তা নেই।",
    ],
    [
      "corporate-logistics",
      "Business Parcels",
      "ব্যবসায়িক পার্সেল",
      "Verified businesses can submit individual parcels or validated CSV batches and print labels.",
      "যাচাইকৃত ব্যবসায়ীরা একক পার্সেল বা যাচাই করা সিএসভি ব্যাচ দিতে ও লেবেল ছাপাতে পারবেন।",
    ],
    [
      "fragile-handling",
      "Fragile Items",
      "ভঙ্গুর পণ্য",
      "Declare the item type and packing instructions. Confirm acceptance and handling requirements with support before booking.",
      "পণ্যের ধরন ও মোড়কের নির্দেশনা দিন। বুকিংয়ের আগে গ্রহণযোগ্যতা ও বিশেষ ব্যবস্থার শর্ত সহায়তা দলের সঙ্গে নিশ্চিত করুন।",
    ],
    [
      "cash-on-delivery",
      "Cash on Delivery (COD)",
      "পণ্য নেওয়ার সময় টাকা সংগ্রহ",
      "Requires an approved business account. Exact collections and recorded payouts are tracked separately from delivery fees; transfers are not automatic.",
      "অনুমোদিত ব্যবসায়িক হিসাব লাগবে। সংগৃহীত টাকা ও নথিভুক্ত পাওনা পরিশোধ ডেলিভারি মাশুলের বাইরে পৃথক হিসাব হবে; টাকা স্বয়ংক্রিয়ভাবে পাঠানো হয় না।",
    ],
    [
      "ecommerce-fulfillment",
      "Warehousing and Fulfillment",
      "গুদাম ও পূর্ণাঙ্গ পণ্য ব্যবস্থাপনা",
      "Not available for booking. Warehouse operations have not been launched.",
      "বুকিংয়ের জন্য চালু নয়। গুদামের কার্যক্রম এখনো শুরু হয়নি।",
    ],
  ];
  return (
    <article className="page-wrap space-y-8">
      <h1 className="page-heading">{t("Our Services", "আমাদের সেবাসমূহ")}</h1>
      <p className="max-w-3xl text-lg text-muted-foreground">
        {t(
          "Dropzo's own delivery team handles collection and delivery on approved routes. Check availability first.",
          "ড্রপজোর নিজস্ব ডেলিভারিকর্মীরা অনুমোদিত রুটে সংগ্রহ ও সরবরাহের কাজ করবেন। আগে সেবার প্রাপ্যতা যাচাই করুন।",
        )}
      </p>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {services.map(([id, en, bangla, description, descriptionBn], index) => (
          <section
            id={id}
            key={id}
            className="glass-panel info-card scroll-mt-24 space-y-4 p-6"
          >
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
