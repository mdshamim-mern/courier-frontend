"use client";
import { useLocale } from "next-intl";
import { placeName } from "@/i18n/geography";
import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import apiClient from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import type { ApiResponse, Shipment } from "@/types";
import type { ServiceArea, Quote } from "@/types/operations.type";
import { BookingSchema } from "@/validation/shipment.validation";
export default function CreateShipmentForm() {
  const locale = useLocale(),
    bn = locale === "bn",
    t = (en: string, bangla: string) => (bn ? bangla : en),
    router = useRouter();
  const areas = useQuery({
    queryKey: ["coverage"],
    queryFn: () =>
      apiClient<ApiResponse<ServiceArea[]>>("/operations/coverage"),
    retry: false,
  });
  const [payload, setPayload] = useState<Record<string, string | number>>({
    pickupAreaId: "",
    receiverAreaId: "",
    weight: 1,
    codAmount: 0,
    serviceType: "STANDARD",
    pickupMode: "HOME",
    senderPhone: "",
    pickupAddress: "",
    receiverName: "",
    receiverPhone: "",
    receiverAddress: "",
    productType: "PARCEL",
    declaredValue: 0,
    requestedPickupAt: "",
    deliveryInstructions: "",
  });
  const [accepted, setAccepted] = useState(false);
  const requestId = useRef("");
  const [invalid, setInvalid] = useState(false);
  const quote = useMutation({
    mutationFn: () =>
      apiClient<ApiResponse<Quote>>("/operations/quote", {
        method: "POST",
        body: {
          pickupAreaId: payload.pickupAreaId,
          receiverAreaId: payload.receiverAreaId,
          weight: payload.weight,
          codAmount: payload.codAmount,
          serviceType: payload.serviceType,
          pickupMode: payload.pickupMode,
          requestedPickupAt: new Date(
            String(payload.requestedPickupAt),
          ).toISOString(),
        },
      }),
  });
  const create = useMutation({
    mutationFn: () => {
      if (!quote.data) throw new Error("Review pricing before booking");
      if (!requestId.current) requestId.current = crypto.randomUUID();
      return apiClient<ApiResponse<Shipment>>("/shipments", {
        method: "POST",
        body: {
          ...payload,
          requestId: requestId.current,
          quoteVersion: quote.data?.data.rateUpdatedAt,
          quotedDeliveryCharge: Number(quote.data?.data.deliveryCharge),
          quotedCodFee: Number(quote.data?.data.codFee),
          quotedServiceType:
            quote.data.data.serviceType || String(payload.serviceType),
          requestedPickupAt: new Date(
            String(payload.requestedPickupAt),
          ).toISOString(),
        },
      });
    },
    onSuccess: (res) => router.push(`/dashboard/my-shipments/${res.data.id}`),
  });
  const update = (key: string, value: string | number) => {
    setPayload({
      ...payload,
      [key]: value,
      ...(key === "pickupMode" ? { pickupAreaId: "" } : {}),
    });
    quote.reset();
    setAccepted(false);
    setInvalid(false);
    requestId.current = "";
  };
  const style =
    "mt-2 block min-h-11 w-full rounded-md border bg-background px-3 py-2";
  const fields = [
    ["senderPhone", "Sender phone", "প্রেরকের ফোন", "tel"],
    [
      "pickupAddress",
      "Pickup address or branch instructions",
      "সংগ্রহের ঠিকানা বা শাখায় জমার নির্দেশনা",
      "text",
    ],
    ["receiverName", "Receiver name", "প্রাপকের নাম", "text"],
    ["receiverPhone", "Receiver phone", "প্রাপকের ফোন", "tel"],
    [
      "receiverAddress",
      "House, road and delivery address",
      "বাড়ি, রাস্তা ও পৌঁছানোর ঠিকানা",
      "text",
    ],
    ["weight", "Weight (kg)", "ওজন (কেজি)", "number"],
    ["declaredValue", "Product value", "পণ্যের মূল্য", "number"],
    [
      "codAmount",
      "Collect from receiver (COD)",
      "প্রাপকের কাছ থেকে সংগ্রহযোগ্য টাকা",
      "number",
    ],
    [
      "requestedPickupAt",
      "Requested pickup time",
      "সংগ্রহের অনুরোধের সময়",
      "datetime-local",
    ],
  ];
  return (
    <section className="glass-panel mx-auto max-w-3xl space-y-6 p-5 sm:p-8">
      <h1 className="text-2xl font-bold">
        {t("Book your parcel", "পার্সেল বুকিং করুন")}
      </h1>
      <p>
        {t(
          "Dropzo assigns the route and hubs. The delivery fee is paid separately online; COD is the product amount collected from the receiver.",
          "ড্রপজো পথ ও হাব নির্ধারণ করবে। ডেলিভারি মাশুল অনলাইনে আলাদা পরিশোধযোগ্য; প্রাপকের কাছ থেকে পণ্যের টাকা সংগ্রহ আলাদা হিসাব।",
        )}
      </p>
      {areas.isError && (
        <p role="alert">
          {t(
            "Coverage unavailable. Please retry later.",
            "এলাকার তথ্য পাওয়া যায়নি। পরে চেষ্টা করুন।",
          )}
        </p>
      )}
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          const date = new Date(String(payload.requestedPickupAt));
          const valid =
            !Number.isNaN(date.getTime()) &&
            BookingSchema.safeParse({
              ...payload,
              requestedPickupAt: date.toISOString(),
            }).success;
          setInvalid(!valid);
          if (!valid) return;
          if (!quote.data) quote.mutate();
          else if (accepted) create.mutate();
        }}
      >
        {(["pickupAreaId", "receiverAreaId"] as const).map((key) => (
          <label key={key}>
            {key === "pickupAreaId"
              ? t(
                  "Pickup area (district / upazila / locality)",
                  "সংগ্রহের এলাকা (জেলা / উপজেলা / এলাকা)",
                )
              : t(
                  "Delivery area (district / upazila / locality)",
                  "প্রাপকের এলাকা (জেলা / উপজেলা / এলাকা)",
                )}
            <select
              className={style}
              value={payload[key]}
              onChange={(e) => update(key, e.target.value)}
              required
            >
              <option value="">{t("Select area", "এলাকা বাছুন")}</option>
              {areas.data?.data
                .filter((area) =>
                  key === "pickupAreaId"
                    ? payload.pickupMode === "BRANCH"
                      ? area.dropoffEnabled
                      : area.pickupEnabled
                    : area.deliveryEnabled,
                )
                .map((area) => (
                  <option key={area.id} value={area.id}>
                    {placeName(area.district, locale)} /{" "}
                    {placeName(area.upazila, locale)} /{" "}
                    {placeName(area.name, locale)}
                  </option>
                ))}
            </select>
          </label>
        ))}
        {fields.map(([key, en, bangla, type]) => (
          <label key={key}>
            {t(en, bangla)}
            <input
              required
              className={style}
              name={key}
              type={type}
              value={payload[key]}
              min={
                type === "number"
                  ? key === "weight"
                    ? "0.01"
                    : "0"
                  : undefined
              }
              max={
                type === "number"
                  ? key === "weight"
                    ? "100"
                    : "1000000"
                  : undefined
              }
              step={type === "number" ? "0.01" : undefined}
              maxLength={
                type === "text" ? 500 : type === "tel" ? 14 : undefined
              }
              onChange={(e) =>
                update(
                  key,
                  type === "number" ? Number(e.target.value) : e.target.value,
                )
              }
            />
          </label>
        ))}
        <label>
          {t("Product type", "পণ্যের ধরন")}
          <select
            className={style}
            value={payload.productType}
            onChange={(e) => update("productType", e.target.value)}
          >
            {[
              ["PARCEL", "Parcel", "পার্সেল"],
              ["DOCUMENT", "Document", "নথি"],
              ["FRAGILE", "Fragile", "ভঙ্গুর"],
            ].map(([value, en, bangla]) => (
              <option key={value} value={value}>
                {t(en, bangla)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Service", "সেবা")}
          <select
            className={style}
            value={payload.serviceType}
            onChange={(e) => update("serviceType", e.target.value)}
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
              {t("Express if approved", "অনুমোদিত জরুরি সেবা")}
            </option>
          </select>
        </label>
        <label>
          {t("Pickup method", "সংগ্রহের পদ্ধতি")}
          <select
            className={style}
            value={payload.pickupMode}
            onChange={(e) => update("pickupMode", e.target.value)}
          >
            <option value="HOME">
              {t("Collect from my address", "আমার ঠিকানা থেকে সংগ্রহ")}
            </option>
            <option value="BRANCH">
              {t("Drop at assigned branch", "নির্ধারিত শাখায় জমা")}
            </option>
          </select>
        </label>
        <label>
          {t("Special instructions", "বিশেষ নির্দেশনা")}
          <textarea
            className={style}
            maxLength={500}
            value={payload.deliveryInstructions}
            onChange={(e) => update("deliveryInstructions", e.target.value)}
          />
        </label>
        {quote.data && (
          <div
            className="space-y-2 rounded-xl border p-4 sm:col-span-2"
            aria-live="polite"
          >
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
                )[quote.data?.data.serviceType || String(payload.serviceType)]
              }
            </p>
            {payload.pickupMode === "BRANCH" && (
              <p>
                {t("Assigned branch: ", "নির্ধারিত শাখা: ")}
                {placeName(quote.data.data.originHub.name, locale)} ·{" "}
                {quote.data.data.originHub.address}
              </p>
            )}
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
                }).format(Number(quote.data?.data[key]))}
              </p>
            ))}
            <p>
              {t("Estimated delivery days: ", "সম্ভাব্য সরবরাহের দিন: ")}
              {new Intl.NumberFormat(bn ? "bn-BD" : "en-US").format(
                quote.data.data.deliveryDays,
              )}
            </p>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              {t(
                "I checked the addresses, charges and product details.",
                "ঠিকানা, মাশুল ও পণ্যের তথ্য যাচাই করেছি।",
              )}
            </label>
          </div>
        )}
        {(quote.isError || create.isError) && (
          <p role="alert" className="sm:col-span-2">
            {t(
              "Booking failed. Check service availability, approved pricing, pickup time and business approval for COD.",
              "বুকিং হয়নি। এলাকা, অনুমোদিত মূল্য, সংগ্রহের সময় এবং টাকা সংগ্রহের জন্য ব্যবসায়িক অনুমোদন যাচাই করুন।",
            )}
          </p>
        )}
        {invalid && (
          <p role="alert" className="sm:col-span-2">
            {t(
              "Check phone numbers, addresses, value and a future pickup time within 30 days.",
              "ফোন, ঠিকানা, মূল্য ও পরবর্তী ৩০ দিনের মধ্যে সংগ্রহের সময় যাচাই করুন।",
            )}
          </p>
        )}
        <Button
          type="submit"
          disabled={
            quote.isPending ||
            create.isPending ||
            areas.isPending ||
            (!!quote.data && !accepted)
          }
        >
          {quote.data
            ? t("Confirm booking", "বুকিং নিশ্চিত করুন")
            : t("Review cost before booking", "বুকিংয়ের আগে মাশুল দেখুন")}
        </Button>
      </form>
    </section>
  );
}
