"use client";
import { useMutation } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { placeName } from "@/i18n/geography";
import { useState } from "react";
import { SchemaForm } from "@/components/form/schema-form";
import { QuoteSchema } from "@/validation/operations.validation";
import { usePublicCoverage } from "@/hooks/use-public-coverage";
import PublicDataState from "./public-data-state";
import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/types";
import type { Quote } from "@/types/operations.type";
import { Button } from "@/components/ui/button";
import { Calculator, ShieldCheck, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
export default function QuoteCalculator() {
  const locale = useLocale(),
    bn = locale === "bn",
    t = (en: string, bangla: string) => (bn ? bangla : en);
  const [input, setInput] = useState({
    pickupAreaId: "",
    receiverAreaId: "",
    weight: 1,
    codAmount: 0,
    serviceType: "STANDARD",
    pickupMode: "HOME",
  });
  const areas = usePublicCoverage();
  const quote = useMutation({
    mutationFn: () =>
      apiClient<ApiResponse<Quote>>("/operations/quote", {
        method: "POST",
        body: input,
        timeout: 15000,
      }),
  });
  const money = (value: string) =>
    new Intl.NumberFormat(bn ? "bn-BD" : "en-BD", {
      style: "currency",
      currency: "BDT",
    }).format(Number(value));
  return (
    <section className="quote-workspace">
      <div className="glass-panel quote-form-panel">
        <span className="icon-tile">
          <Calculator aria-hidden="true" />
        </span>
        <h2 className="text-2xl font-bold">
          {t("Calculate delivery cost", "ডেলিভারির খরচ হিসাব করুন")}
        </h2>
        <p className="tool-caption">
          {t(
            "Choose your route, service and parcel weight. The estimate comes from approved server pricing.",
            "পথ, সেবা ও পার্সেলের ওজন বাছুন। সার্ভারের অনুমোদিত মূল্যতালিকা থেকে হিসাব আসবে।",
          )}
        </p>
        {areas.isPending || areas.isError ? (
          <PublicDataState
            pending={areas.isPending}
            retry={() => {
              void areas.refetch();
            }}
          />
        ) : !areas.data?.data.length ? (
          <p className="tool-caption" role="status">
            {t(
              "No approved service areas are available yet. Please check again later.",
              "এখনো অনুমোদিত সেবার এলাকা নেই। পরে আবার দেখুন।",
            )}
          </p>
        ) : (
          <SchemaForm
            schema={QuoteSchema}
            values={input}
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              quote.mutate();
            }}
          >
            {(["pickupAreaId", "receiverAreaId"] as const).map((key) => (
              <label key={key} className="space-y-2">
                {key === "pickupAreaId"
                  ? t("Pickup area", "সংগ্রহের এলাকা")
                  : t("Delivery area", "পৌঁছানোর এলাকা")}
                <select
                  required
                  disabled={quote.isPending}
                  className="block h-11 w-full rounded-md border px-3"
                  value={input[key]}
                  onChange={(e) => {
                    setInput({ ...input, [key]: e.target.value });
                    quote.reset();
                  }}
                >
                  <option value="">{t("Choose area", "এলাকা বাছুন")}</option>
                  {areas.data?.data
                    .filter((area) =>
                      key === "pickupAreaId"
                        ? input.pickupMode === "BRANCH"
                          ? area.dropoffEnabled
                          : area.pickupEnabled
                        : area.deliveryEnabled,
                    )
                    .map((area) => (
                      <option key={area.id} value={area.id}>
                        {placeName(area.name, locale)} —{" "}
                        {placeName(area.district, locale)}
                      </option>
                    ))}
                </select>
              </label>
            ))}
            <label>
              {t("Weight (kg)", "ওজন (কেজি)")}
              <input
                required
                disabled={quote.isPending}
                type="number"
                step="0.01"
                min="0.01"
                max="100"
                value={input.weight}
                className="block h-11 w-full rounded-md border px-3"
                onChange={(e) => {
                  setInput({ ...input, weight: Number(e.target.value) });
                  quote.reset();
                }}
              />
            </label>
            <label>
              {t("COD amount", "প্রাপকের কাছ থেকে সংগ্রহের টাকা")}
              <input
                required
                disabled={quote.isPending}
                type="number"
                step="0.01"
                min="0"
                max="1000000"
                value={input.codAmount}
                className="block h-11 w-full rounded-md border px-3"
                onChange={(e) => {
                  setInput({ ...input, codAmount: Number(e.target.value) });
                  quote.reset();
                }}
              />
            </label>
            <label>
              {t("Service", "সেবা")}
              <select
                disabled={quote.isPending}
                className="block h-11 w-full rounded-md border px-3"
                value={input.serviceType}
                onChange={(e) => {
                  setInput({ ...input, serviceType: e.target.value });
                  quote.reset();
                }}
              >
                <option value="STANDARD">{t("Standard", "সাধারণ")}</option>
                <option value="NEXT_DAY">
                  {t("Next day, if available", "পরের দিন, চালু থাকলে")}
                </option>
                <option value="SAME_DAY">
                  {t(
                    "Same day before noon, if available",
                    "দুপুর ১২টার আগে একই দিন, চালু থাকলে",
                  )}
                </option>
                <option value="EXPRESS">
                  {t("Express, if available", "জরুরি, চালু থাকলে")}
                </option>
              </select>
            </label>
            <label>
              {t("Collection method", "পার্সেল জমা দেওয়ার পদ্ধতি")}
              <select
                disabled={quote.isPending}
                className="block h-11 w-full rounded-md border px-3"
                value={input.pickupMode}
                onChange={(e) => {
                  setInput({
                    ...input,
                    pickupMode: e.target.value,
                    pickupAreaId: "",
                  });
                  quote.reset();
                }}
              >
                <option value="HOME">
                  {t("Collect from address", "ঠিকানা থেকে সংগ্রহ")}
                </option>
                <option value="BRANCH">
                  {t("Drop at assigned branch", "নির্ধারিত শাখায় জমা")}
                </option>
              </select>
            </label>
            <Button disabled={quote.isPending || areas.isPending} type="submit">
              {quote.isPending
                ? t("Calculating…", "হিসাব হচ্ছে…")
                : t("Calculate", "হিসাব দেখুন")}
            </Button>
          </SchemaForm>
        )}
      </div>
      <aside className="glass-panel quote-result-panel">
        <span className="icon-tile">
          <ShieldCheck aria-hidden="true" />
        </span>
        <h2>{t("Your delivery estimate", "আপনার ডেলিভারির সম্ভাব্য মাশুল")}</h2>
        {!quote.data && !quote.isError && (
          <p className="tool-caption">
            {t(
              "Calculate to see the delivery fee, charge breakdown and estimated delivery days. No booking or payment is made here.",
              "হিসাব করলে মাশুলের বিবরণ ও সম্ভাব্য সরবরাহের দিন দেখবেন। এখানে বুকিং বা অর্থপ্রদান হয় না।",
            )}
          </p>
        )}
        {quote.isError && (
          <p role="alert" className="tracking-error">
            {t(
              "Approved pricing is unavailable for this route. Booking is not available.",
              "এই পথে অনুমোদিত মূল্যতালিকা নেই। এখন বুকিং করা যাবে না।",
            )}
          </p>
        )}
        {quote.data && (
          <div aria-live="polite">
            <div>
              <p role="status">
                {t("Confirmed service: ", "নিশ্চিত সেবা: ")}
                {
                  (
                    {
                      STANDARD: t("Standard", "সাধারণ"),
                      EXPRESS: t("Express", "জরুরি"),
                      SAME_DAY: t("Same day", "একই দিন"),
                      NEXT_DAY: t("Next day", "পরের দিন"),
                    } as Record<string, string>
                  )[quote.data?.data.serviceType || input.serviceType]
                }
              </p>
            </div>
            <dl className="quote-breakdown">
              {(
                [
                  ["baseCharge", "Base delivery charge", "মূল মাশুল"],
                  [
                    "extraWeightCharge",
                    "Extra weight charge",
                    "বাড়তি ওজনের মাশুল",
                  ],
                  ["pickupFee", "Pickup charge", "সংগ্রহের মাশুল"],
                  [
                    "deliveryCharge",
                    "Delivery fee payable separately",
                    "আলাদা পরিশোধযোগ্য ডেলিভারি মাশুল",
                  ],
                  ["codFee", "COD handling charge", "টাকা সংগ্রহের মাশুল"],
                  [
                    "merchantPayable",
                    "Merchant receives from COD",
                    "সংগৃহীত টাকা থেকে ব্যবসায়ীর পাওনা",
                  ],
                ] as const
              ).map(([key, en, bangla]) => (
                <div
                  key={key}
                  className={key === "deliveryCharge" ? "quote-total" : ""}
                >
                  <dt>{t(en, bangla)}</dt>
                  <dd>{money(quote.data?.data[key])}</dd>
                </div>
              ))}
              <div className="flex justify-between">
                <dt>
                  {t(
                    "Estimated delivery days after pickup",
                    "সংগ্রহের পর সম্ভাব্য সরবরাহের দিন",
                  )}
                </dt>
                <dd>
                  {new Intl.NumberFormat(bn ? "bn-BD" : "en-US").format(
                    quote.data.data.deliveryDays,
                  )}
                </dd>
              </div>
            </dl>
          </div>
        )}
        <p className="tool-caption quote-disclaimer">
          {t(
            "Estimate only. Final pricing is recalculated by the server when you book. No GPS location is shown.",
            "এটি সম্ভাব্য হিসাব। বুকিংয়ের সময় সার্ভারে আবার মাশুল যাচাই হবে। সরাসরি অবস্থান-মানচিত্র দেখানো হয় না।",
          )}
        </p>
        <Link className="secondary-button" href="/dashboard/new-shipment">
          {t("Continue to booking", "বুকিংয়ে যান")}
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </aside>
    </section>
  );
}
