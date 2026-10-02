"use client";

import { useState } from "react";
import { useGetAllShipments, useUpdateShipmentStatus } from "@/hooks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import TablePagination from "@/components/ui/table-pagination";

export default function DeliveryTasks() {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useGetAllShipments({ page, limit: 10 });
  const { mutate: updateStatus, isPending } = useUpdateShipmentStatus();

  const shipments = data?.data || [];
  const meta = data?.meta;

  const handleUpdateStatus = (id: string, currentStatus: string) => {
    let nextStatus = "";
    if (currentStatus === "ASSIGNED") nextStatus = "PICKED_UP";
    else if (currentStatus === "PICKED_UP") nextStatus = "IN_TRANSIT";
    else if (currentStatus === "IN_TRANSIT") nextStatus = "OUT_FOR_DELIVERY";
    else if (currentStatus === "OUT_FOR_DELIVERY") nextStatus = "DELIVERED";

    if (!nextStatus) return;

    updateStatus(
      { id, payload: { status: nextStatus } },
      {
        onSuccess: () => {
          toast.add({ title: "Status Updated", type: "success" });
          refetch();
        },
        onError: (err) => toast.add({ title: "Update Failed", description: err.message, type: "error" }),
      }
    );
  };

  const getButtonLabel = (status: string) => {
    switch (status) {
      case "ASSIGNED": return "Mark Picked Up";
      case "PICKED_UP": return "Mark In Transit";
      case "IN_TRANSIT": return "Out for Delivery";
      case "OUT_FOR_DELIVERY": return "Mark Delivered";
      default: return "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tracking ID</TableHead>
              <TableHead>Receiver</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : shipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No active delivery tasks.
                </TableCell>
              </TableRow>
            ) : (
              shipments.map((shipment: any) => (
                <TableRow key={shipment.id}>
                  <TableCell className="font-mono text-xs">{shipment.trackingId}</TableCell>
                  <TableCell>{shipment.receiverName}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{shipment.receiverAddress}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      {shipment.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {getButtonLabel(shipment.status) ? (
                      <Button
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleUpdateStatus(shipment.id, shipment.status)}
                      >
                        {getButtonLabel(shipment.status)}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Completed</span>
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
    </div>
  );
}