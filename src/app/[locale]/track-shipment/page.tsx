import { translateUi } from "@/i18n/ui";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import TrackForm from "@/components/modules/shipment-tracking/track-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "bn" ? "পার্সেল অনুসরণ | Dropzo" : "Track Shipment | Dropzo",
    description:
      locale === "bn"
        ? "অনুসন্ধানসংখ্যা দিয়ে পার্সেলের সর্বশেষ অবস্থা দেখুন।"
        : "Track your parcel using its tracking ID.",
  };
}
export default async function TrackShipmentPage() {
  const locale = await getLocale();
  const ui = (text: string) => translateUi(locale, text);
  const bn = locale === "bn";
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 bg-muted/20">
      <div className="text-center mb-10 max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">
          {bn ? "আপনার পার্সেল খুঁজুন" : ui("Track Your Parcel")}
        </h1>
        <p className="text-muted-foreground">
          {bn
            ? "পার্সেলের বর্তমান অবস্থা জানতে অনুসন্ধানসংখ্যা লিখুন।"
            : ui("Enter your tracking ID to view the latest shipment updates.")}
        </p>
      </div>
      <div className="w-full max-w-xl bg-card border rounded-2xl p-6 shadow-lg">
        <TrackForm />
      </div>
    </div>
  );
}
