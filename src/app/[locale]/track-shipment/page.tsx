import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import TrackForm from "@/components/modules/shipment-tracking/track-form";

export const metadata: Metadata = { title: "Track Shipment | Dropzo", description: "Track your parcel using its tracking ID" };
export default async function TrackShipmentPage() {
  const bn = await getLocale() === "bn";
  return <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 bg-muted/20">
    <div className="text-center mb-10 max-w-2xl">
      <h1 className="text-4xl font-bold mb-4">{bn ? "আপনার পার্সেল খুঁজুন" : "Track Your Parcel"}</h1>
      <p className="text-muted-foreground">{bn ? "পার্সেলের বর্তমান অবস্থা জানতে অনুসন্ধানসংখ্যা লিখুন।" : "Enter your tracking ID to view the latest shipment updates."}</p>
    </div>
    <div className="w-full max-w-xl bg-card border rounded-2xl p-6 shadow-lg"><TrackForm /></div>
  </div>;
}
