"use client";

import { useUiText } from "@/i18n/use-ui-text";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useGetMe, useGetSingleShipment } from "@/hooks";
import { Spinner } from "@/components/ui/spinner";
import QueryError from "@/components/ui/query-error";
import TrackingTimeline from "@/components/modules/shipment-tracking/tracking-timeline";
import ParcelLabel from "@/components/operations/parcel-label";
import CollectionTable from "@/components/operations/collection-table";
import Image from "next/image";
import { useLocale } from "next-intl";

export default function ShipmentDetailsPage() {
  const ui = useUiText();
  const bn = useLocale() === "bn";
  const { id } = useParams<{ id: string }>();
  const result = useGetSingleShipment(id);
  const user = useGetMe();
  if (result.isPending) return <Spinner />;
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{shipment.trackingId}</h1>
      <p>
        {ui(shipment.status.replace(/_/g, " "))} · {ui(shipment.paymentStatus)}
      </p>
      <p>
        {shipment.receiverName} · {shipment.receiverAddress}
      </p>
      <TrackingTimeline trackings={shipment.trackings || []} />
      {user.data?.data.role === "CUSTOMER" && (
        <Link className="inline-block underline" href="/dashboard/my-shipments">
          {bn
            ? "পার্সেলের তালিকা ও মাশুল পরিশোধ"
            : "View parcels and pay delivery fee"}
        </Link>
      )}
      <ParcelLabel shipment={shipment} />
      {shipment.deliveryInstructions && (
        <p>
          {bn ? "বিশেষ নির্দেশনা: " : "Instructions: "}
          {shipment.deliveryInstructions}
        </p>
      )}
      {shipment.deliveryProof && (
        <section className="space-y-3 rounded-xl border p-4">
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
