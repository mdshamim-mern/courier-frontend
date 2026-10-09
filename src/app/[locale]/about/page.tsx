import { PackageCheck, Route, Wallet, ShieldCheck } from "lucide-react";
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
    title: locale === "bn" ? "ড্রপজো সম্পর্কে | Dropzo" : "About Dropzo | Dropzo",
  };
}
export default function AboutPage() {
  const bn = useLocale() === "bn",
    t = (en: string, bangla: string) => (bn ? bangla : en);
  return (
    <article className="page-wrap space-y-8">
      <h1 className="page-heading">{t("About Dropzo", "ড্রপজো সম্পর্কে")}</h1>
      <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
        {t(
          "Dropzo uses its own approved delivery workers. Customers book a parcel; administrators assign pickup, route hubs and delivery work.",
          "ড্রপজো নিজের অনুমোদিত ডেলিভারিকর্মীদের দিয়ে পার্সেল সংগ্রহ ও পৌঁছে দেবে। গ্রাহক বুকিং করবেন; প্রশাসক সংগ্রহের দায়িত্ব, রুটের হাব ও ডেলিভারির কাজ বরাদ্দ করবেন।",
        )}
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        {[
          [
            "Our service process",
            "আমাদের কাজের ধাপ",
            "Booking → pickup assignment → collection → hub → transit → destination hub → delivery and recipient acknowledgment.",
            "বুকিং → সংগ্রহের কাজ বরাদ্দ → পার্সেল সংগ্রহ → হাব → পথে → গন্তব্যের হাব → ডেলিভারি ও প্রাপকের গ্রহণের নথি।",
          ],
          [
            "What tracking shows",
            "অনুসরণে যা দেখবেন",
            "Tracking displays recorded status and timestamps, not a worker's live GPS location.",
            "অনুসরণে নথিভুক্ত অবস্থা ও সময় দেখা যাবে; কর্মীর সরাসরি জিপিএস অবস্থান নয়।",
          ],
          [
            "Business payments",
            "ব্যবসায়ীর টাকার হিসাব",
            "Delivery charges are paid separately. Product cash collections and administrator-confirmed remittances have their own ledger.",
            "ডেলিভারি মাশুল আলাদা পরিশোধযোগ্য। পণ্যের টাকা সংগ্রহ ও প্রশাসকের নিশ্চিত করা টাকা হস্তান্তরের পৃথক হিসাব থাকবে।",
          ],
          [
            "Service commitments",
            "সেবার প্রতিশ্রুতি",
            "Coverage, charges and estimated delivery time depend on approved route settings. Confirm support hours with our contact team.",
            "অনুমোদিত রুটের সেটিং অনুযায়ী এলাকা, মাশুল ও সম্ভাব্য সময় নির্ধারিত হবে। সহায়তার সময় যোগাযোগ করে নিশ্চিত করুন।",
          ],
        ].map(([en, bangla, description, descriptionBn], index) => (
          <section
            className="glass-panel info-card space-y-4 p-6 sm:p-8"
            key={en}
          >
            <span className="icon-tile">
              {index === 0 ? (
                <PackageCheck />
              ) : index === 1 ? (
                <Route />
              ) : index === 2 ? (
                <Wallet />
              ) : (
                <ShieldCheck />
              )}
            </span>
            <h2 className="text-xl font-semibold">{t(en, bangla)}</h2>
            <p className="leading-relaxed text-muted-foreground">
              {t(description, descriptionBn)}
            </p>
          </section>
        ))}
      </div>
      <nav className="glass-panel flex flex-wrap gap-4 p-6">
        <Link className="secondary-button" href="/coverage">
          {t("Check service coverage", "সেবার এলাকা যাচাই")}
        </Link>
        <Link className="secondary-button" href="/pricing">
          {t("Calculate charges", "খরচ হিসাব")}
        </Link>
        <Link className="secondary-button" href="/contact">
          {t("Contact support", "সহায়তার যোগাযোগ")}
        </Link>
      </nav>
    </article>
  );
}
