"use client";

import { useParams } from "next/navigation";
import { useGetSingleShipment } from "@/hooks";
import { Spinner } from "@/components/ui/spinner";
import QueryError from "@/components/ui/query-error";
import TrackingTimeline from "@/components/modules/shipment-tracking/tracking-timeline";

export default function ShipmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const result = useGetSingleShipment(id);
  if (result.isPending) return <Spinner />;
  if (result.isError) return <QueryError retry={() => { void result.refetch(); }} />;
  const shipment = result.data.data;
  return <div className="space-y-6">
    <h1 className="text-2xl font-bold">{shipment.trackingId}</h1>
    <p>{shipment.status.replace(/_/g, " ")} · {shipment.paymentStatus}</p>
    <p>{shipment.receiverName} · {shipment.receiverAddress}</p>
    <TrackingTimeline trackings={shipment.trackings || []} />
  </div>;
}
