"use client";
import { useUrlState } from "@/hooks/use-url-state";
import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import { useMutation } from "@tanstack/react-query";
import { initiateStripePayment } from "@/api/payment.api";
import { useState } from "react";
import { useLocale } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import {
  useGetAllShipments,
  useGetSingleShipment,
  useCancelShipment,
  useInitiatePayment,
} from "@/hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import DataSkeleton from "@/components/ui/data-skeleton";
import { toast } from "@/components/ui/toast";
import QueryError from "@/components/ui/query-error";
import TablePagination from "@/components/ui/table-pagination";
import TrackingTimeline from "../shipment-tracking/tracking-timeline";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getApiErrorMessage } from "@/lib/api-error";
import { Link } from "@/i18n/navigation";

export default function ShipmentHistory() {
  const ui = useUiText();
  const bn = useLocale() === "bn";
  const [confirmCancelId, setConfirmCancelId] = useState("");
  const display = useUiFormat();
  const [page, setPage] = useUrlState("page", 1);
  const [selectedId, setSelectedId] = useState("");
  const { data, isPending, error, refetch } = useGetAllShipments({
    page,
    limit: 10,
  });
  const details = useGetSingleShipment(selectedId);
  const { mutate: cancel, isPending: canceling } = useCancelShipment();
  const { mutate: initiate, isPending: paying } = useInitiatePayment();
  const stripe = useMutation({
    mutationFn: initiateStripePayment,
    meta: { errorToastHandled: true },
  });
  if (error)
    return (
      <QueryError
        retry={() => {
          void refetch();
        }}
      />
    );
  if (isPending) return <DataSkeleton />;
  return (
    <div className="space-y-4">
      <div className="customer-table rounded-md border bg-card">
        <p className="p-4 text-xs text-muted-foreground sm:hidden">
          {ui("Actions")} →
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{ui("Tracking ID")}</TableHead>
              <TableHead>{ui("Date")}</TableHead>
              <TableHead>{ui("Receiver")}</TableHead>
              <TableHead>{ui("Price")}</TableHead>
              <TableHead>{ui("Status")}</TableHead>
              <TableHead>{ui("Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.length ? (
              data.data.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell className="font-mono">
                    <Link
                      className="customer-record-link"
                      title={shipment.trackingId}
                      href={`/dashboard/my-shipments/${shipment.id}`}
                    >
                      {shipment.trackingId}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {display.date(new Date(shipment.createdAt))}
                  </TableCell>
                  <TableCell>{shipment.receiverName}</TableCell>
                  <TableCell>৳{display.money(shipment.price)}</TableCell>
                  <TableCell>
                    {ui(shipment.status.replace(/_/g, " "))}
                    <p className="text-xs">{ui(shipment.paymentStatus)}</p>
                  </TableCell>
                  <TableCell>
                    <div className="shipment-row-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedId(shipment.id)}
                      >
                        {ui("Track")}
                      </Button>
                      <Dialog onOpenChange={() => setConfirmCancelId("")}>
                        <DialogTrigger
                          render={<Button variant="outline" size="sm" />}
                        >
                          <MoreHorizontal size={18} aria-hidden="true" />
                          {ui("Actions")}
                        </DialogTrigger>
                        <DialogContent className="shipment-action-panel sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>{ui("Actions")}</DialogTitle>
                          </DialogHeader>
                          <p className="break-all font-mono text-xs text-muted-foreground">
                            {shipment.trackingId}
                          </p>
                          <div className="shipment-action-options">
                            {!["PAID", "REFUNDED"].includes(
                              shipment.paymentStatus,
                            ) &&
                              !["CANCELLED", "RETURNED"].includes(
                                shipment.status,
                              ) && (
                                <>
                                  <Button
                                    size="sm"
                                    disabled={
                                      paying || stripe.isPending || canceling
                                    }
                                    onClick={() =>
                                      initiate(
                                        { shipmentId: shipment.id },
                                        {
                                          onSuccess: (response) => {
                                            const url = new URL(
                                              response.data.paymentUrl,
                                            );
                                            if (url.protocol !== "https:")
                                              return;
                                            window.location.assign(url.href);
                                          },
                                          onError: (failure) =>
                                            toast.add({
                                              title: ui("Payment Failed"),
                                              description: display.error(
                                                getApiErrorMessage(failure),
                                              ),
                                              type: "error",
                                            }),
                                        },
                                      )
                                    }
                                  >
                                    {ui("Pay Now")}
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    disabled={
                                      paying || stripe.isPending || canceling
                                    }
                                    onClick={() =>
                                      stripe.mutate(
                                        { shipmentId: shipment.id },
                                        {
                                          onSuccess: (response) => {
                                            const url = new URL(
                                              response.data.paymentUrl,
                                            );
                                            if (
                                              url.protocol === "https:" &&
                                              url.hostname ===
                                                "checkout.stripe.com"
                                            )
                                              window.location.assign(url.href);
                                          },
                                          onError: (failure) =>
                                            toast.add({
                                              title: "Payment Failed",
                                              description:
                                                getApiErrorMessage(failure),
                                              type: "error",
                                            }),
                                        },
                                      )
                                    }
                                  >
                                    {ui("Pay with Stripe")}
                                  </Button>
                                </>
                              )}
                            <Link
                              className="secondary-button"
                              href={`/dashboard/my-shipments/${shipment.id}`}
                            >
                              {bn ? "রসিদ ও বিস্তারিত" : "Receipt & details"}
                            </Link>
                            {shipment.paymentStatus === "UNPAID" && (
                              <Link
                                className="secondary-button"
                                href={`/payment/success?shipmentId=${shipment.id}`}
                              >
                                {ui("Check Payment")}
                              </Link>
                            )}
                            {shipment.status === "PENDING" &&
                              shipment.paymentStatus !== "PAID" && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={
                                    canceling || paying || stripe.isPending
                                  }
                                  onClick={() => {
                                    if (confirmCancelId !== shipment.id) {
                                      setConfirmCancelId(shipment.id);
                                      return;
                                    }
                                    cancel(shipment.id, {
                                      onSuccess: () =>
                                        toast.add({
                                          title: "Shipment Cancelled",
                                          type: "success",
                                        }),
                                      onError: (failure) =>
                                        toast.add({
                                          title: "Cancellation Failed",
                                          description:
                                            getApiErrorMessage(failure),
                                          type: "error",
                                        }),
                                    });
                                  }}
                                >
                                  {confirmCancelId === shipment.id
                                    ? bn
                                      ? "বাতিল নিশ্চিত করুন"
                                      : "Confirm cancellation"
                                    : ui("Cancel")}
                                </Button>
                              )}
                            {confirmCancelId === shipment.id && (
                              <p
                                role="alert"
                                className="text-sm text-destructive"
                              >
                                {bn
                                  ? "এই পার্সেলের বুকিং বাতিল করবেন? নিশ্চিত করতে আবার চাপুন।"
                                  : "Cancel this parcel booking? Confirm above to proceed."}
                              </p>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>{ui("No shipments found.")}</TableCell>
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
      <Dialog
        open={!!selectedId}
        onOpenChange={(open) => {
          if (!open) setSelectedId("");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{ui("Shipment Tracking")}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {details.isError ? (
              <QueryError
                retry={() => {
                  void details.refetch();
                }}
              />
            ) : details.isFetching ? (
              <DataSkeleton />
            ) : (
              <TrackingTimeline
                trackings={details.data?.data.trackings || []}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
