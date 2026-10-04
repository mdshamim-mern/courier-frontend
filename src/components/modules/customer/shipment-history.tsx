"use client";

import { useState } from "react";
import { useGetAllShipments, useCancelShipment } from "@/hooks";
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
  trackings?: ITrackingInfo[];
}

export default function ShipmentHistory() {
  const [page, setPage] = useState(1);
  const [selectedTracking, setSelectedTracking] = useState<ITrackingInfo[] | null>(null);
  
  const { data, isLoading, refetch } = useGetAllShipments({ page, limit: 10 });
  const { mutate: cancelShipment, isPending: isCanceling } = useCancelShipment();

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
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      {shipment.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
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