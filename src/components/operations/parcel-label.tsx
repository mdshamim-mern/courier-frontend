"use client";
import { useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import QRCode from "qrcode";
import type { Shipment } from "@/types";
import { useUiText } from "@/i18n/use-ui-text";
import { Button } from "@/components/ui/button";
export default function ParcelLabel({ shipment }: { shipment: Shipment }) {
  const ui = useUiText();
  const bn = useLocale() === "bn",
    qr = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (qr.current)
      void QRCode.toCanvas(qr.current, shipment.trackingId, {
        width: 160,
        errorCorrectionLevel: "M",
      }).catch(() => undefined);
  }, [shipment.trackingId]);
  const money = (value: string | number) =>
    new Intl.NumberFormat(bn ? "bn-BD" : "en-BD", {
      style: "currency",
      currency: "BDT",
    }).format(Number(value));
  return (
    <section className="parcel-print-root space-y-4">
      <Button variant="outline" onClick={() => window.print()}>
        {bn ? "রসিদ ও লেবেল ছাপান" : "Print receipt and label"}
      </Button>
      <article className="parcel-label space-y-3 rounded-xl border bg-white p-6 text-black">
        <h2 className="text-2xl font-bold">Dropzo</h2>
        <p>
          {bn ? "মাশুলের অবস্থা: " : "Delivery fee status: "}
          {ui(shipment.paymentStatus)}
        </p>
        <p>
          {new Intl.DateTimeFormat(bn ? "bn-BD" : "en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(shipment.createdAt))}
        </p>
        {shipment.priceBreakdown && (
          <div>
            {(
              [
                ["baseCharge", "Base charge", "মূল মাশুল"],
                ["extraWeightCharge", "Extra weight", "বাড়তি ওজন"],
                ["pickupFee", "Pickup fee", "সংগ্রহের মাশুল"],
              ] as const
            ).map(([key, en, bangla]) => (
              <p key={key}>
                {bn ? bangla : en}: {money(shipment.priceBreakdown?.[key] ?? 0)}
              </p>
            ))}
          </div>
        )}
        <p className="break-all font-mono">{shipment.trackingId}</p>
        <canvas
          ref={qr}
          aria-label={bn ? "অনুসন্ধানসংখ্যার কিউআর" : "Tracking QR code"}
        />
        <p>
          {bn ? "প্রাপক: " : "Receiver: "}
          {shipment.receiverName}
        </p>
        <p>{shipment.receiverPhone}</p>
        <p>{shipment.receiverAddress}</p>
        <p>
          {bn ? "সংগ্রহের ঠিকানা: " : "Pickup address: "}
          {shipment.pickupAddress}
        </p>
        <p>{shipment.senderPhone}</p>
        <p>
          {bn ? "ডেলিভারি মাশুল: " : "Delivery fee: "}
          {money(shipment.price)}
        </p>
        <p>
          {bn ? "প্রাপকের কাছ থেকে পণ্যের টাকা: " : "Product COD: "}
          {money(shipment.codAmount || 0)}
        </p>
        <p>
          {bn ? "ওজন (কেজি): " : "Weight (kg): "}
          {new Intl.NumberFormat(bn ? "bn-BD" : "en-US").format(
            Number(shipment.weight),
          )}
        </p>
      </article>
    </section>
  );
}
