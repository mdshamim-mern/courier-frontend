import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return pageMetadata("track-shipment", params);
}
import { translateUi } from "@/i18n/ui";
import { getLocale } from "next-intl/server";
import TrackForm from "@/components/modules/shipment-tracking/track-form";
import { Link } from "@/i18n/navigation";
import { ScanLine, ShieldCheck, ArrowUpRight } from "lucide-react";

export default async function TrackShipmentPage() {
  const locale = await getLocale();
  const ui = (text: string) => translateUi(locale, text);
  const bn = locale === "bn";
  return (
    <div className="page-wrap logistics-public-page">
      <header className="glass-panel logistics-tool-hero">
        <div>
          <span className="eyebrow">
            <ScanLine size={16} aria-hidden="true" />
            {bn ? "পার্সেলের আপডেট" : "Shipment updates"}
          </span>
          <h1 className="page-heading">
            {bn ? "আপনার পার্সেল খুঁজুন" : ui("Track Your Parcel")}
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {bn
              ? "পার্সেলের বর্তমান অবস্থা জানতে অনুসন্ধানসংখ্যা লিখুন।"
              : ui(
                  "Enter your tracking ID to view the latest shipment updates.",
                )}
          </p>
        </div>
        <Link className="secondary-button" href="/contact">
          {bn ? "সহায়তা নিন" : "Get support"}
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </header>
      <div className="tracking-workspace">
        <section className="glass-panel tracking-search-panel">
          <h2>{bn ? "অনুসন্ধানসংখ্যা দিয়ে খুঁজুন" : "Find your shipment"}</h2>
          <p className="tool-caption">
            {bn
              ? "বুকিংয়ের রসিদ বা পার্সেলের লেবেল থেকে TRK- দিয়ে শুরু হওয়া সংখ্যা লিখুন।"
              : "Use the TRK- number from your booking receipt or parcel label."}
          </p>
          <TrackForm />
        </section>
        <aside className="glass-panel tracking-help-panel">
          <span className="icon-tile">
            <ShieldCheck aria-hidden="true" />
          </span>
          <h2>{bn ? "যা দেখতে পাবেন" : "Know what to expect"}</h2>
          <ol>
            <li>
              {bn ? "আপনার অনুসন্ধানসংখ্যা দিন।" : "Enter your tracking number."}
            </li>
            <li>
              {bn
                ? "সার্ভারে নথিভুক্ত সর্বশেষ অবস্থা ও ঘটনাগুলো দেখুন।"
                : "View the latest recorded status and timeline."}
            </li>
            <li>
              {bn
                ? "প্রয়োজনে একই সংখ্যা দিয়ে আবার হালনাগাদ তথ্য দেখুন।"
                : "Track again to check for new updates."}
            </li>
          </ol>
          <p className="tool-caption">
            {bn
              ? "এটি সরাসরি জিপিএস অবস্থান নয়। জনসাধারণের অনুসন্ধানে প্রাপকের যোগাযোগের তথ্য দেখানো হয় না।"
              : "This is not live GPS. Public tracking does not expose recipient contact details."}
          </p>
          <Link className="text-link" href="/coverage">
            {bn ? "সেবার এলাকা দেখুন" : "Explore service coverage"}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
