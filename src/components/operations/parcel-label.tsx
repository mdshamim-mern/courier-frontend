"use client";
import { useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import QRCode from "qrcode";
import type { Shipment } from "@/types";
import { useUiText } from "@/i18n/use-ui-text";
import { Button } from "@/components/ui/button";
import { Printer, PackageCheck } from "lucide-react";
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
      <div className="receipt-toolbar">
        <div>
          <h2>{bn ? "রসিদ ও পার্সেলের লেবেল" : "Receipt & parcel label"}</h2>
          <p className="tool-caption">
            {bn
              ? "নিজের রেকর্ডের জন্য সংরক্ষণ করুন অথবা পার্সেলের সঙ্গে লেবেল দিন।"
              : "Keep a copy for your records or attach the label to your parcel."}
          </p>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer size={17} aria-hidden="true" />
          {bn ? "রসিদ ও লেবেল ছাপান" : "Print receipt and label"}
        </Button>
      </div>
      <article className="parcel-label receipt-document">
        <header className="receipt-document-header">
          <div>
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
          </div>
          <PackageCheck aria-hidden="true" size={32} />
        </header>
        <div className="receipt-code-block">
          <div>
            <p className="tool-caption">
              {bn ? "পার্সেলের অনুসন্ধানসংখ্যা" : "Tracking ID"}
            </p>
            <p className="break-all font-mono">{shipment.trackingId}</p>
            <p className="tool-caption">
              {bn
                ? "কিউআর কোডে এই অনুসন্ধানসংখ্যা আছে।"
                : "The QR code contains this tracking number."}
            </p>
          </div>
          <canvas
            ref={qr}
            role="img"
            aria-label={bn ? "অনুসন্ধানসংখ্যার কিউআর" : "Tracking QR code"}
          />
        </div>
        <div className="receipt-address-grid">
          <section>
            <h3>{bn ? "প্রাপকের তথ্য" : "Deliver to"}</h3>
            <p>{shipment.receiverName}</p>
            <p>{shipment.receiverPhone}</p>
            <p>{shipment.receiverAddress}</p>
          </section>
          <section>
            <h3>{bn ? "সংগ্রহের তথ্য" : "Collect from"}</h3>
            <p>{shipment.pickupAddress || "—"}</p>
            <p>{shipment.senderPhone || "—"}</p>
          </section>
        </div>
        <dl className="receipt-amounts">
          {shipment.priceBreakdown &&
            (
              [
                ["baseCharge", "Base charge", "মূল মাশুল"],
                ["extraWeightCharge", "Extra weight", "বাড়তি ওজন"],
                ["pickupFee", "Pickup fee", "সংগ্রহের মাশুল"],
              ] as const
            ).map(([key, en, bangla]) => (
              <div className="receipt-charge-row" key={key}>
                <dt>{bn ? bangla : en}</dt>
                <dd>{money(shipment.priceBreakdown?.[key] ?? 0)}</dd>
              </div>
            ))}
          <div className="receipt-charge-row receipt-total">
            <dt>{bn ? "ডেলিভারি মাশুল" : "Delivery fee"}</dt>
            <dd>{money(shipment.price)}</dd>
          </div>
          <div className="receipt-charge-row">
            <dt>{bn ? "প্রাপকের কাছ থেকে পণ্যের টাকা" : "Product COD"}</dt>
            <dd>{money(shipment.codAmount || 0)}</dd>
          </div>
          <div className="receipt-charge-row">
            <dt>{bn ? "ওজন (কেজি)" : "Weight (kg)"}</dt>
            <dd>
              {new Intl.NumberFormat(bn ? "bn-BD" : "en-US").format(
                Number(shipment.weight),
              )}
            </dd>
          </div>
        </dl>
        <p className="receipt-footer-note">
          {bn
            ? "ডেলিভারি মাশুল ও প্রাপকের কাছ থেকে সংগ্রহযোগ্য পণ্যের টাকা আলাদা। এই রসিদ অর্থপ্রদান নিশ্চিত করে না; উপরের মাশুলের অবস্থা দেখুন।"
            : "Delivery fees and product COD are separate. This receipt does not confirm payment; refer to the fee status above."}
        </p>
      </article>
    </section>
  );
}
