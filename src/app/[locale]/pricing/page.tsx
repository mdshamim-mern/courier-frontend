import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return pageMetadata("pricing", params);
}
import QuoteCalculator from "@/components/operations/quote-calculator";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Calculator, ArrowUpRight } from "lucide-react";
export default async function PricingPage() {
  const bn = (await getLocale()) === "bn";
  return (
    <div className="page-wrap logistics-public-page">
      <header className="glass-panel logistics-tool-hero">
        <div>
          <span className="eyebrow">
            <Calculator size={16} aria-hidden="true" />
            {bn ? "সুস্পষ্ট মাশুল" : "Clear delivery charges"}
          </span>
          <h1 className="page-heading">
            {bn ? "ডেলিভারির খরচ" : "Delivery cost"}
          </h1>
          <p className="text-muted-foreground">
            {bn
              ? "আপনার পথ ও পার্সেলের তথ্য দিয়ে অনুমোদিত মাশুলের হিসাব দেখুন।"
              : "Check the approved charge for your route and parcel before booking."}
          </p>
        </div>
        <Link className="secondary-button" href="/coverage">
          {bn ? "সেবার এলাকা দেখুন" : "Check coverage"}
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </header>
      <QuoteCalculator />
    </div>
  );
}
