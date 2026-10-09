"use client";
import Papa from "papaparse";
import { useState } from "react";
import { useLocale } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { BookingSchema } from "@/validation/shipment.validation";
import type { ApiResponse, Shipment } from "@/types";
import type { Quote } from "@/types/operations.type";
import ParcelLabel from "./parcel-label";
import { Button } from "@/components/ui/button";
const columns = [
  "pickupAreaId",
  "receiverAreaId",
  "senderPhone",
  "pickupAddress",
  "receiverName",
  "receiverPhone",
  "receiverAddress",
  "weight",
  "pickupMode",
  "serviceType",
  "productType",
  "declaredValue",
  "codAmount",
  "requestedPickupAt",
  "deliveryInstructions",
];
export default function BulkBookings() {
  const bn = useLocale() === "bn",
    t = (en: string, bangla: string) => (bn ? bangla : en);
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]),
    [errors, setErrors] = useState<string[]>([]),
    [approved, setApproved] = useState(false);
  const quotes = useMutation({
    mutationFn: () =>
      apiClient<ApiResponse<Quote[]>>("/operations/quotes", {
        method: "POST",
        body: rows.map((row) =>
          Object.fromEntries(
            [
              "pickupAreaId",
              "receiverAreaId",
              "weight",
              "codAmount",
              "serviceType",
              "pickupMode",
              "requestedPickupAt",
            ].map((key) => [key, row[key]]),
          ),
        ),
      }),
  });
  const save = useMutation({
    mutationFn: () =>
      apiClient<ApiResponse<Shipment[]>>("/shipments/bulk", {
        method: "POST",
        body: rows.map((row, i) => ({
          ...row,
          quoteVersion: quotes.data?.data[i].rateUpdatedAt,
          quotedDeliveryCharge: Number(quotes.data?.data[i].deliveryCharge),
          quotedCodFee: Number(quotes.data?.data[i].codFee),
          quotedServiceType:
            quotes.data?.data[i].serviceType || row.serviceType,
        })),
      }),
  });
  function load(file?: File) {
    setRows([]);
    setErrors([]);
    setApproved(false);
    save.reset();
    quotes.reset();
    if (!file) return;
    if (file.size > 1024 * 1024 || !file.name.toLowerCase().endsWith(".csv")) {
      setErrors([
        t("Use a CSV file under 1 MB.", "১ মেগাবাইটের কম আকারের সিএসভি ফাইল দিন।"),
      ]);
      return;
    }
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (result) => {
        const problems: string[] = [],
          valid: Array<Record<string, unknown>> = [];
        if (
          result.errors.length ||
          result.data.length < 1 ||
          result.data.length > 100 ||
          columns.some((key) => !result.meta.fields?.includes(key)) ||
          (result.meta.fields ?? []).some((key) => !columns.includes(key))
        )
          problems.push(
            t(
              "Use the exact template columns and 1–100 rows.",
              "নমুনার সব কলাম অপরিবর্তিত রেখে ১–১০০টি সারি দিন।",
            ),
          );
        for (const [i, row] of result.data.slice(0, 100).entries()) {
          const parsed = BookingSchema.safeParse({
            ...row,
            weight: Number(row.weight),
            declaredValue: Number(row.declaredValue),
            codAmount: Number(row.codAmount),
          });
          if (!parsed.success)
            problems.push(
              t("Row ", "সারি ") +
                (i + 2) +
                ": " +
                parsed.error.issues
                  .map((issue) => issue.path.join("."))
                  .join(", "),
            );
          else valid.push({ ...parsed.data, requestId: crypto.randomUUID() });
        }
        setErrors(problems);
        if (!problems.length) setRows(valid);
      },
      error: () => setErrors([t("File could not be read.", "ফাইল পড়া যায়নি।")]),
    });
  }
  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold">
        {t("Bulk parcel booking", "একসঙ্গে একাধিক পার্সেল বুকিং")}
      </h1>
      <p>
        {t(
          "Use area IDs from the coverage page. Dates must be future ISO timestamps within 30 days. All rows are validated and booked together; one invalid route rejects the whole batch. Approved business accounts are required for COD.",
          "এলাকার পাতা থেকে পরিচয়সংখ্যা নিন। সময় পরবর্তী ৩০ দিনের মধ্যে আইএসও তারিখ হবে। সব সারি একসঙ্গে যাচাই ও বুকিং হবে; একটি রুট ভুল হলেও পুরো ব্যাচ বাতিল হবে। পণ্যের টাকা সংগ্রহে অনুমোদিত ব্যবসায়িক হিসাব লাগবে।",
        )}
      </p>
      <a
        download="dropzo-booking-template.csv"
        className="inline-block underline"
        href={
          "data:text/csv;charset=utf-8," +
          encodeURIComponent(`${columns.join(",")}\n`)
        }
      >
        {t("Download blank CSV template", "খালি সিএসভি নমুনা নামান")}
      </a>
      <label className="block">
        {t("CSV file", "সিএসভি ফাইল")}
        <input
          className="block max-w-full p-3"
          type="file"
          accept=".csv,text/csv"
          disabled={save.isPending || save.isSuccess}
          onChange={(e) => load(e.target.files?.[0])}
        />
      </label>
      {errors.length > 0 && (
        <ul role="alert" className="list-disc pl-5">
          {errors.map((error, i) => (
            <li key={String(i)}>{error}</li>
          ))}
        </ul>
      )}
      {rows.length > 0 && !save.isSuccess && (
        <div className="space-y-4">
          <h2>{t("Review before booking", "বুকিংয়ের আগে যাচাই করুন")}</h2>
          {rows.map((row, i) => (
            <p className="break-words rounded-md border p-3" key={String(i)}>
              {i + 1}. {String(row.receiverName)} ·{" "}
              {String(row.receiverAddress)} · {String(row.weight)}{" "}
              {t("kg", "কেজি")} · {String(row.codAmount)} {t("COD", "পণ্যের টাকা")}
            </p>
          ))}
          <Button
            disabled={quotes.isPending || save.isPending}
            onClick={() => {
              setApproved(false);
              quotes.mutate();
            }}
          >
            {t("Calculate every parcel charge", "প্রতিটি পার্সেলের খরচ হিসাব করুন")}
          </Button>
          {quotes.data?.data.map((quote, i) => (
            <div key={String(i)} className="rounded-md border p-3">
              <p>
                {t("Confirmed service: ", "নিশ্চিত সেবা: ")}
                {
                  (
                    {
                      STANDARD: t("Standard", "সাধারণ"),
                      EXPRESS: t("Express", "জরুরি"),
                      SAME_DAY: t("Same day", "একই দিন"),
                      NEXT_DAY: t("Next day", "পরের দিন"),
                    } as Record<string, string>
                  )[quote.serviceType || String(rows[i].serviceType)]
                }
              </p>
              <h3>
                {t("Parcel ", "পার্সেল ")}
                {i + 1}
              </h3>
              {(
                [
                  ["baseCharge", "Base charge", "মূল মাশুল"],
                  ["extraWeightCharge", "Extra weight", "বাড়তি ওজন"],
                  ["pickupFee", "Pickup fee", "সংগ্রহের মাশুল"],
                  ["deliveryCharge", "Total delivery fee", "মোট ডেলিভারি মাশুল"],
                  ["codFee", "COD fee", "টাকা সংগ্রহের মাশুল"],
                  ["merchantPayable", "Merchant receives", "ব্যবসায়ীর পাওনা"],
                ] as const
              ).map(([key, en, bangla]) => (
                <p key={key}>
                  {t(en, bangla)}:{" "}
                  {new Intl.NumberFormat(bn ? "bn-BD" : "en-BD", {
                    style: "currency",
                    currency: "BDT",
                  }).format(Number(quote[key]))}
                </p>
              ))}
            </div>
          ))}
          <label className="flex items-start gap-3">
            <input
              disabled={!quotes.data}
              type="checkbox"
              checked={approved}
              onChange={(e) => setApproved(e.target.checked)}
            />
            {t(
              "I have checked each parcel and its displayed charges.",
              "প্রতিটি পার্সেলের তথ্য ও উপরের মাশুল যাচাই ও অনুমোদন করেছি।",
            )}
          </label>
          <Button
            disabled={!approved || !quotes.data || save.isPending}
            onClick={() => save.mutate()}
          >
            {t("Confirm all bookings", "সব বুকিং নিশ্চিত করুন")}
          </Button>
        </div>
      )}
      {quotes.isError && (
        <p role="alert">
          {t(
            "Pricing unavailable. No bookings were submitted.",
            "মাশুল পাওয়া যায়নি। কোনো বুকিং পাঠানো হয়নি।",
          )}
        </p>
      )}
      {save.isError && (
        <p role="alert">
          {t(
            "Batch was not confirmed. Check pricing, coverage and account approval. Review your shipments before retrying after a connection error.",
            "ব্যাচ নিশ্চিত হয়নি। মূল্য, এলাকা ও অনুমোদন যাচাই করুন। সংযোগে ত্রুটি হলে পুনরায় চেষ্টার আগে নিজের বুকিং তালিকা দেখুন।",
          )}
        </p>
      )}
      {save.data && (
        <section className="parcel-print-root space-y-5">
          <h2>{t("Confirmed bookings and labels", "নিশ্চিত বুকিং ও লেবেল")}</h2>
          {save.data.data.map((shipment) => (
            <ParcelLabel key={shipment.id} shipment={shipment} />
          ))}
        </section>
      )}
    </section>
  );
}
