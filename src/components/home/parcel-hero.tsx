"use client";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Package,
  Truck,
  MapPin,
  ClipboardCheck,
  ScanLine,
  ArrowUpRight,
  UsersRound,
} from "lucide-react";
import DeliveryScene from "./delivery-scene";
import TrackForm from "@/components/modules/shipment-tracking/track-form";
import QuoteCalculator from "@/components/operations/quote-calculator";
import { HomeNetworkStats, HomePricingExample } from "./home-network";
import SampleReviews from "./sample-reviews";
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
      <section className="glass-panel home-tracking-panel">
        <div className="home-section-heading">
          <div>
            <span className="eyebrow">
              <ScanLine size={16} aria-hidden="true" />
              {t("SHIPMENT UPDATES", "পার্সেলের আপডেট")}
            </span>
            <h2>{t("Track your parcel", "পার্সেলের অবস্থা খুঁজুন")}</h2>
            <p>
              {t(
                "Have a tracking number? Check the latest recorded progress here.",
                "অনুসন্ধানসংখ্যা আছে? এখানে নথিভুক্ত সর্বশেষ অগ্রগতি দেখুন।",
              )}
            </p>
          </div>
          <Link className="text-link" href="/track-shipment">
            {t("Open tracking page", "অনুসন্ধানের পাতা খুলুন")}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <TrackForm />
      </section>
      <HomeNetworkStats />
      <section className="home-estimate-section">
        <div className="home-section-heading">
          <div>
            <span className="eyebrow">
              {t("PLAN YOUR DELIVERY", "ডেলিভারির পরিকল্পনা")}
            </span>
            <h2>
              {t("Know the charge before you book", "বুকিংয়ের আগে মাশুল জানুন")}
            </h2>
          </div>
          <Link className="text-link" href="/pricing">
            {t("Open cost calculator", "মাশুলের হিসাব খুলুন")}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <HomePricingExample />
        <QuoteCalculator />
      </section>
      <section className="home-process-section">
        <div className="home-section-heading">
          <div>
            <span className="eyebrow">
              {t("THE DELIVERY JOURNEY", "ডেলিভারির ধাপ")}
            </span>
            <h2>{t("From booking to handover", "বুকিং থেকে হস্তান্তর")}</h2>
            <p>
              {t(
                "Four clear stages, with updates recorded along the way.",
                "চারটি পরিষ্কার ধাপ এবং প্রতিটি পর্যায়ে নথিভুক্ত আপডেট।",
              )}
            </p>
          </div>
          <Link className="text-link" href="/services">
            {t("Explore our services", "আমাদের সেবা দেখুন")}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="home-process-grid">
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
              <article
                key={String(en)}
                className="glass-panel home-process-card"
              >
                <StepIcon className="icon-tile mb-4 p-3" />
                <span className="home-step-number" aria-hidden="true">
                  {new Intl.NumberFormat(bn ? "bn-BD" : "en-US")
                    .format(index + 1)
                    .padStart(bn ? 1 : 2, "0")}
                </span>
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
        </div>
      </section>
      <SampleReviews />
      <section className="glass-panel home-team-panel">
        <div className="home-team-copy">
          <span className="icon-tile">
            <UsersRound aria-hidden="true" />
          </span>
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
        </div>
        <div className="home-team-actions">
          <Link className="secondary-button" href="/courier-apply">
            {t("Apply as a delivery worker", "ডেলিভারিকর্মী হিসেবে আবেদন")}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          <Link className="secondary-button" href="/login?staff=1">
            {t("Staff sign in", "কর্মীদের প্রবেশ")}
          </Link>
        </div>
      </section>
    </div>
  );
}
