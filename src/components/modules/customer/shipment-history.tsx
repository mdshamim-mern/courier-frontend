"use client";

import { useState } from "react";
import { useGetAllShipments, useGetSingleShipment, useCancelShipment, useInitiatePayment } from "@/hooks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import QueryError from "@/components/ui/query-error";
import TablePagination from "@/components/ui/table-pagination";
import { format } from "date-fns";
import TrackingTimeline from "../shipment-tracking/tracking-timeline";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getApiErrorMessage } from "@/lib/api-error";
import { Link } from "@/i18n/navigation";

export default function ShipmentHistory() {
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState("");
  const { data, isPending, error, refetch } = useGetAllShipments({ page, limit: 10 });
  const details = useGetSingleShipment(selectedId);
  const { mutate: cancel, isPending: canceling } = useCancelShipment();
  const { mutate: initiate, isPending: paying } = useInitiatePayment();
  if (error) return <QueryError retry={() => { void refetch(); }} />;
  if (isPending) return <Spinner />;
  return <div className="space-y-4"><div className="rounded-md border bg-card"><Table>
    <TableHeader><TableRow><TableHead>Tracking ID</TableHead><TableHead>Date</TableHead><TableHead>Receiver</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
    <TableBody>{data?.data.length ? data.data.map(shipment => <TableRow key={shipment.id}>
      <TableCell className="font-mono">{shipment.trackingId}</TableCell><TableCell>{format(new Date(shipment.createdAt), "PP")}</TableCell>
      <TableCell>{shipment.receiverName}</TableCell><TableCell>৳{Number(shipment.price).toFixed(2)}</TableCell>
      <TableCell>{shipment.status.replace(/_/g, " ")}<p className="text-xs">{shipment.paymentStatus}</p></TableCell>
      <TableCell><div className="flex flex-wrap gap-2">
        {!["PAID", "REFUNDED"].includes(shipment.paymentStatus) && !["CANCELLED", "RETURNED"].includes(shipment.status) && <Button size="sm" disabled={paying || canceling}
          onClick={() => initiate({ shipmentId: shipment.id }, {
            onSuccess: response => {
              const url = new URL(response.data.paymentUrl);
              if (url.protocol !== "https:") return;
              window.location.assign(url.href);
            },
            onError: failure => toast.add({ title: "Payment Failed", description: getApiErrorMessage(failure), type: "error" }),
          })}>Pay Now</Button>}
        <Button variant="outline" size="sm" onClick={() => setSelectedId(shipment.id)}>Track</Button>
        {shipment.paymentStatus === "UNPAID" && <Link className="text-sm underline" href={`/payment/success?shipmentId=${shipment.id}`}>Check Payment</Link>}
        {shipment.status === "PENDING" && shipment.paymentStatus !== "PAID" && <Button variant="destructive" size="sm" disabled={canceling || paying}
          onClick={() => cancel(shipment.id, {
            onSuccess: () => toast.add({ title: "Shipment Cancelled", type: "success" }),
            onError: failure => toast.add({ title: "Cancellation Failed", description: getApiErrorMessage(failure), type: "error" }),
          })}>Cancel</Button>}
      </div></TableCell>
    </TableRow>) : <TableRow><TableCell colSpan={6}>No shipments found.</TableCell></TableRow>}</TableBody>
  </Table></div>
    {data?.meta && data.meta.totalPages > 1 && <TablePagination page={page} totalPages={data.meta.totalPages} handlePageChange={setPage} />}
    <Dialog open={!!selectedId} onOpenChange={open => { if (!open) setSelectedId(""); }}>
      <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Shipment Tracking</DialogTitle></DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {details.isError ? <QueryError retry={() => { void details.refetch(); }} /> : details.isFetching ? <Spinner /> : <TrackingTimeline trackings={details.data?.data.trackings || []} />}
        </div>
      </DialogContent>
    </Dialog>
  </div>;
}
