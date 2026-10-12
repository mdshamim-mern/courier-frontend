"use client";

import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import {
  PackageCheck,
  ArrowLeft,
  ScanLine,
  CreditCard,
  Package,
  Coins,
} from "lucide-react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useGetMe, useGetSingleShipment } from "@/hooks";
import DataSkeleton from "@/components/ui/data-skeleton";
import QueryError from "@/components/ui/query-error";
import TrackingTimeline from "@/components/modules/shipment-tracking/tracking-timeline";
import ParcelLabel from "@/components/operations/parcel-label";
import CollectionTable from "@/components/operations/collection-table";
import Image from "next/image";
import { useLocale } from "next-intl";

export default function ShipmentDetailsPage() {
  const ui = useUiText();
  const display = useUiFormat();
  const bn = useLocale() === "bn";
  const t = (en: string, bangla: string) => (bn ? bangla : en);
  const { id } = useParams<{ id: string }>();
  const result = useGetSingleShipment(id);
  const user = useGetMe();
  if (result.isPending) return <DataSkeleton />;
  if (result.isError)
    return (
      <QueryError
        retry={() => {
          void result.refetch();
        }}
      />
    );
  const shipment = result.data.data;
  return (
    <div className="shipment-detail-workspace">
      <header className="glass-panel shipment-detail-hero">
        <span className="eyebrow">
          <PackageCheck size={16} aria-hidden="true" />
          {t("Shipment details", "পার্সেলের বিস্তারিত")}
        </span>
        <h1>{shipment.trackingId}</h1>
        <div className="shipment-status-line">
          <span>{ui(shipment.status.replace(/_/g, " "))}</span>
          <span>{ui(shipment.paymentStatus)}</span>
        </div>
        <p className="tool-caption">
          {t("Booked", "বুকিংয়ের সময়")}: {display.date(shipment.createdAt, true)}
        </p>
        <div className="shipment-detail-links">
          <Link className="secondary-button" href="/dashboard/my-shipments">
            <ArrowLeft size={16} aria-hidden="true" />
            {t("My Shipments", "আমার পার্সেলসমূহ")}
          </Link>
          <Link
            className="secondary-button"
            href={`/track-shipment?tracking=${encodeURIComponent(shipment.trackingId)}`}
          >
            <ScanLine size={16} aria-hidden="true" />
            {t("Public tracking", "জনসাধারণের অনুসন্ধান")}
          </Link>
        </div>
      </header>
      <section
        className="shipment-detail-stats"
        aria-label={t("Parcel summary", "পার্সেলের সংক্ষিপ্ত তথ্য")}
      >
        {[
          {
            Icon: CreditCard,
            label: t("Delivery fee", "ডেলিভারি মাশুল"),
            value: `৳${display.money(shipment.price)}`,
          },
          {
            Icon: Coins,
            label: t("Product COD", "প্রাপকের কাছ থেকে পণ্যের টাকা"),
            value: `৳${display.money(shipment.codAmount || 0)}`,
          },
          {
            Icon: Package,
            label: t("Weight (kg)", "ওজন (কেজি)"),
            value: display.number(shipment.weight),
          },
        ].map(({ Icon, label, value }) => (
          <article key={label} className="glass-panel">
            <Icon size={21} aria-hidden="true" />
            <p>{label}</p>
            <strong>{value}</strong>
          </article>
        ))}
      </section>
      <section className="glass-panel shipment-activity-panel">
        <h2>{t("Shipment activity", "পার্সেলের ঘটনাপঞ্জি")}</h2>
        <p className="tool-caption">
          {t(
            "Updates recorded by the delivery team. This is not live GPS.",
            "ডেলিভারি দলের নথিভুক্ত আপডেট। এটি সরাসরি জিপিএস অবস্থান নয়।",
          )}
        </p>
        <TrackingTimeline trackings={shipment.trackings || []} />
      </section>
      {user.data?.data.role === "CUSTOMER" && (
        <Link
          className="secondary-button shipment-payment-link"
          href="/dashboard/my-shipments"
        >
          <CreditCard size={17} aria-hidden="true" />
          {bn
            ? "পার্সেলের তালিকা ও মাশুল পরিশোধ"
            : "View parcels and pay delivery fee"}
        </Link>
      )}
      <ParcelLabel shipment={shipment} />
      {shipment.deliveryInstructions && (
        <p className="glass-panel shipment-instructions">
          {bn ? "বিশেষ নির্দেশনা: " : "Instructions: "}
          {shipment.deliveryInstructions}
        </p>
      )}
      {shipment.deliveryProof && (
        <section className="glass-panel shipment-activity-panel space-y-3">
          <h2>{bn ? "প্রাপকের গ্রহণের নথি" : "Recipient acknowledgment"}</h2>
          <p>
            {shipment.deliveryProof.receiverName} ·{" "}
            {new Intl.DateTimeFormat(bn ? "bn-BD" : "en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(shipment.deliveryProof.createdAt))}
          </p>
          <Image
            unoptimized
            width={480}
            height={160}
            src={shipment.deliveryProof.signature}
            alt={bn ? "প্রাপকের স্বাক্ষর" : "Recipient signature"}
            className="max-w-full border bg-white"
          />
          <p>
            {bn
              ? "এটি গ্রহণের নথি; এককালীন সংকেত দিয়ে পরিচয় যাচাই নয়।"
              : "This records receipt, not OTP-verified identity."}
          </p>
        </section>
      )}
      {shipment.collection && (
        <CollectionTable records={[shipment.collection]} />
      )}
    </div>
  );
}
