"use client";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Package, Truck, MapPin, ClipboardCheck } from "lucide-react";
import DeliveryScene from "./delivery-scene";
import TrackForm from "@/components/modules/shipment-tracking/track-form";
import QuoteCalculator from "@/components/operations/quote-calculator";
export default function ParcelHero() {
  const bn = useLocale() === "bn",
    t = (en: string, bangla: string) => (bn ? bangla : en);
  return (
    <div className="page-wrap space-y-10">
      <section className="hero-panel">
        <div className="space-y-5">
          <p className="eyebrow">
            {t(
              "Dropzo · our own delivery team",
              "ড্রপজো · নিজস্ব ডেলিভারিকর্মীর সেবা",
            )}
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl xl:text-6xl">
            {t(
              "Send a parcel. Follow every step.",
              "পার্সেল পাঠান। প্রতিটি ধাপ জানুন।",
            )}
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            {t(
              "Check coverage and delivery cost, book a pickup and follow status updates through our hub network.",
              "এলাকা ও মাশুল যাচাই করে সংগ্রহের অনুরোধ দিন। আমাদের হাব ও ডেলিভারিকর্মীর মাধ্যমে পার্সেলের প্রতিটি ধাপ অনুসরণ করুন।",
            )}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link className="brand-button" href="/dashboard/new-shipment">
              {t("Send a parcel", "পার্সেল পাঠান")}
            </Link>
            <Link className="secondary-button" href="/merchant-register">
              {t("Register your business", "ব্যবসায়িক নিবন্ধন")}
            </Link>
          </div>
          <Link className="inline-block underline" href="/coverage">
            {t(
              "Check service areas before booking",
              "বুকিংয়ের আগে সেবার এলাকা দেখুন",
            )}
          </Link>
        </div>
        <div className="hero-art">
          <DeliveryScene />
          <p className="hero-art-caption">
            <ClipboardCheck
              aria-hidden="true"
              className="size-5 shrink-0 text-primary"
            />
            {t("From your doorstep to theirs", "আপনার দরজা থেকে প্রাপকের দরজায়")}
          </p>
        </div>
      </section>
      <section className="glass-panel p-6 sm:p-8">
        <h2 className="mb-4 text-2xl font-bold">
          {t("Track your parcel", "পার্সেলের অবস্থা খুঁজুন")}
        </h2>
        <TrackForm />
      </section>
      <QuoteCalculator />
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [
            Package,
            "Book",
            "বুকিং",
            "Provide sender and receiver details",
            "প্রেরক ও প্রাপকের তথ্য দিন",
          ],
          [
            Truck,
            "Pickup",
            "সংগ্রহ",
            "Our assigned worker collects the parcel",
            "বরাদ্দকৃত কর্মী পার্সেল সংগ্রহ করবেন",
          ],
          [
            MapPin,
            "Hub and route",
            "হাব ও পথ",
            "Follow recorded status updates",
            "নথিভুক্ত অবস্থা অনুসরণ করুন",
          ],
          [
            ClipboardCheck,
            "Handover",
            "হস্তান্তর",
            "Recipient acknowledgment is recorded",
            "প্রাপকের গ্রহণের প্রমাণ রাখা হবে",
          ],
        ].map(([Icon, en, bangla, description, bnDescription], index) => {
          const StepIcon = Icon as typeof Package;
          return (
            <article key={String(en)} className="glass-panel info-card p-6">
              <StepIcon className="icon-tile mb-4 p-3" />
              <h2 className="font-semibold">
                {new Intl.NumberFormat(bn ? "bn-BD" : "en-US").format(
                  index + 1,
                )}
                . {t(String(en), String(bangla))}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(String(description), String(bnDescription))}
              </p>
            </article>
          );
        })}
      </section>
      <section className="glass-panel flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
        <div>
          <h2 className="text-xl font-bold">
            {t("Join our delivery team", "আমাদের ডেলিভারিকর্মী দলে যোগ দিন")}
          </h2>
          <p>
            {t(
              "Applications require review and administrator approval.",
              "আবেদনের পরে যাচাই ও প্রশাসকের অনুমোদন প্রয়োজন।",
            )}
          </p>
        </div>
        <Link className="secondary-button" href="/courier-apply">
          {t("Apply as a delivery worker", "ডেলিভারিকর্মী হিসেবে আবেদন")}
        </Link>
        <Link className="underline" href="/login?staff=1">
          {t("Staff sign in", "কর্মীদের প্রবেশ")}
        </Link>
      </section>
    </div>
  );
}
