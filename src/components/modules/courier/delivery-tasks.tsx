"use client";

import { useUiText } from "@/i18n/use-ui-text";
import { useState } from "react";
import { useGetAllShipments, useUpdateShipmentStatus } from "@/hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import QueryError from "@/components/ui/query-error";
import TablePagination from "@/components/ui/table-pagination";
import { getApiErrorMessage } from "@/lib/api-error";
import type { ShipmentStatus } from "@/types";

const labels: Partial<Record<ShipmentStatus, string>> = {
  PICKED_UP: "Mark Picked Up",
  AT_ORIGIN_HUB: "Arrived at Origin Hub",
  IN_TRANSIT: "Start Hub Transfer",
  AT_DESTINATION_HUB: "Arrived at Destination Hub",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Mark Delivered",
  DELIVERY_FAILED: "Delivery Failed",
  RETURNED: "Mark Returned",
};
export default function DeliveryTasks() {
  const ui = useUiText();
  const [page, setPage] = useState(1);
  const { data, isPending, error, refetch } = useGetAllShipments({
    page,
    limit: 10,
  });
  const { mutate: updateStatus, isPending: updating } =
    useUpdateShipmentStatus();
  if (error)
    return (
      <QueryError
        retry={() => {
          void refetch();
        }}
      />
    );
  if (isPending) return <Spinner />;
  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{ui("Tracking ID")}</TableHead>
              <TableHead>{ui("Receiver")}</TableHead>
              <TableHead>{ui("Address")}</TableHead>
              <TableHead>{ui("Status")}</TableHead>
              <TableHead>{ui("Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.length ? (
              data.data.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell className="font-mono">
                    {shipment.trackingId}
                  </TableCell>
                  <TableCell>{shipment.receiverName}</TableCell>
                  <TableCell>{shipment.receiverAddress}</TableCell>
                  <TableCell>
                    {ui(shipment.status.replace(/_/g, " "))}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {shipment.allowedNextStatuses.map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={
                            status === "DELIVERY_FAILED"
                              ? "destructive"
                              : "outline"
                          }
                          disabled={updating}
                          onClick={() =>
                            updateStatus(
                              { id: shipment.id, payload: { status } },
                              {
                                onSuccess: () =>
                                  toast.add({
                                    title: "Status Updated",
                                    type: "success",
                                  }),
                                onError: (failure) =>
                                  toast.add({
                                    title: "Update Failed",
                                    description: getApiErrorMessage(failure),
                                    type: "error",
                                  }),
                              },
                            )
                          }
                        >
                          {ui(labels[status] || status.replace(/_/g, " "))}
                        </Button>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>
                  {ui("No delivery tasks found.")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {data?.meta && data.meta.totalPages > 1 && (
        <TablePagination
          page={page}
          totalPages={data.meta.totalPages}
          handlePageChange={setPage}
        />
      )}
    </div>
  );
}
