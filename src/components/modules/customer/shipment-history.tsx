"use client";

import { useState } from "react";
import { useGetAllShipments, useCancelShipment, useInitiatePayment } from "@/hooks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import TablePagination from "@/components/ui/table-pagination";
import { format } from "date-fns";
import TrackingTimeline from "../shipment-tracking/tracking-timeline";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ITrackingInfo {
  id: string;
  status: string;
  location: string;
  createdAt: string;
  timestamp?: string;
}

interface IShipmentHistory {
  id: string;
  trackingId: string;
  createdAt: string;
  receiverName: string;
  price: number;
  status: string;
  paymentStatus?: string;
  trackings?: ITrackingInfo[];
}

export default function ShipmentHistory() {
  const [page, setPage] = useState(1);
  const [selectedTracking, setSelectedTracking] = useState<ITrackingInfo[] | null>(null);
  
  const { data, isLoading, refetch } = useGetAllShipments({ page, limit: 10 });
  const { mutate: cancelShipment, isPending: isCanceling } = useCancelShipment();
  const { mutate: initiatePayment, isPending: isPaying } = useInitiatePayment();

  const shipments = data?.data || [];
  const meta = data?.meta;

  const handleCancel = (id: string) => {
    cancelShipment(id, {
      onSuccess: () => {
        toast.add({ title: "Shipment Cancelled", type: "success" });
        refetch();
      },
      onError: (err: Error) => toast.add({ title: "Cancellation Failed", description: err.message, type: "error" }),
    });
  };

  const handlePayment = (id: string) => {
    initiatePayment({ id }, {
      onSuccess: (res: any) => {
        if (res?.data?.paymentUrl) {
          window.location.href = res.data.paymentUrl;
        } else if (res?.data?.url) {
          window.location.href = res.data.url;
        } else {
          toast.add({ title: "Payment Initiation Failed", description: "No payment URL received", type: "error" });
        }
      },
      onError: (err: Error) => toast.add({ title: "Payment Failed", description: err.message, type: "error" }),
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tracking ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Receiver</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : shipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No shipments found.
                </TableCell>
              </TableRow>
            ) : (
              shipments.map((shipment: IShipmentHistory) => (
                <TableRow key={shipment.id}>
                  <TableCell className="font-mono text-xs">{shipment.trackingId}</TableCell>
                  <TableCell>{format(new Date(shipment.createdAt), "PP")}</TableCell>
                  <TableCell>{shipment.receiverName}</TableCell>
                  <TableCell>৳{shipment.price}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-secondary text-secondary-foreground w-max">
                        {shipment.status}
                      </span>
                      {shipment.paymentStatus && (
                        <span className={`px-2 py-1 rounded-full text-[10px] font-medium w-max ${shipment.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {shipment.paymentStatus}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {(shipment.paymentStatus === "PENDING" || shipment.paymentStatus === "UNPAID") && (
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => handlePayment(shipment.id)}
                        disabled={isPaying}
                      >
                        Pay Now
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setSelectedTracking(shipment.trackings || [])}>
                      Track
                    </Button>
                    {shipment.status === "PENDING" && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleCancel(shipment.id)}
                        disabled={isCanceling}
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {meta && meta.totalPages > 1 && (
        <TablePagination page={page} totalPages={meta.totalPages} handlePageChange={setPage} />
      )}

      <Dialog open={!!selectedTracking} onOpenChange={(open) => !open && setSelectedTracking(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Shipment Tracking</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-4">
            <TrackingTimeline trackings={selectedTracking || []} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}