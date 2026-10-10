"use client";

import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { getSingleShipment, reconcilePayment } from "@/api";
import { Link } from "@/i18n/navigation";
import { getApiErrorStatus, getApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import DataSkeleton from "@/components/ui/data-skeleton";
import QueryError from "@/components/ui/query-error";

export default function PaymentStatus({ shipmentId }: { shipmentId: string }) {
  const ui = useUiText();
  const display = useUiFormat();
  const bn = useLocale() === "bn";
  const queryClient = useQueryClient();
  const [checking, setChecking] = useState(true);
  const result = useQuery({
    queryKey: ["shipments", shipmentId],
    queryFn: () => getSingleShipment(shipmentId),
    enabled: !!shipmentId,
    retry: false,
    staleTime: 0,
    refetchInterval: (query) =>
      checking &&
      query.state.data?.data.paymentStatus !== "PAID" &&
      !query.state.error
        ? 2000
        : false,
  });
  const paid = result.data?.data.paymentStatus === "PAID";
  const verification = useMutation({
    mutationFn: () => reconcilePayment({ shipmentId }),
    onSuccess: () => {
      void result.refetch();
    },
  });
  useEffect(() => {
    const timer = setTimeout(() => setChecking(false), 45000);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (paid) {
      void queryClient.invalidateQueries({ queryKey: ["payments"] });
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    }
  }, [paid, queryClient]);
  if (!shipmentId)
    return (
      <p role="alert">
        {bn
          ? "অর্থপ্রদান যাচাই করার পরিচয়সংখ্যা নেই।"
          : ui("No shipment was provided for payment verification.")}
      </p>
    );
  if (getApiErrorStatus(result.error) === 401)
    return (
      <Link href="/login">
        {bn
          ? "অর্থপ্রদানের অবস্থা দেখতে প্রবেশ করুন"
          : ui("Sign in to view payment status")}
      </Link>
    );
  if (result.isError)
    return (
      <QueryError
        retry={() => {
          void result.refetch();
        }}
      />
    );
  if (result.isPending) return <DataSkeleton />;
  return (
    <div className="space-y-4" aria-live="polite">
      <h1 className="text-3xl font-bold">
        {paid
          ? bn
            ? "অর্থপ্রদান নিশ্চিত হয়েছে"
            : ui("Payment Confirmed")
          : bn
            ? "অর্থপ্রদান এখনও নিশ্চিত হয়নি"
            : ui("Payment Not Yet Confirmed")}
      </h1>
      <p>
        {paid
          ? bn
            ? "সার্ভারে আপনার অর্থপ্রদানের নথি সংরক্ষিত হয়েছে।"
            : ui("Your payment has been verified and recorded.")
          : bn
            ? "অর্থপ্রদানকারী প্রতিষ্ঠানের যাচাইয়ের জন্য অপেক্ষা করছি।"
            : ui("Awaiting verified payment confirmation from the provider.")}
      </p>
      <p className="font-mono">
        {result.data.data.trackingId} · {ui(result.data.data.paymentStatus)}
      </p>
      {!paid && (
        <Button
          variant="outline"
          disabled={result.isFetching || verification.isPending}
          onClick={() => verification.mutate()}
        >
          {bn ? "আবার যাচাই করুন" : ui("Check again")}
        </Button>
      )}
      {verification.isError && (
        <p role="alert">
          {display.error(getApiErrorMessage(verification.error))}
        </p>
      )}
      <p>
        <Link href="/dashboard/my-shipments">
          {bn ? "পার্সেলের তালিকায় যান" : ui("View My Shipments")}
        </Link>
      </p>
    </div>
  );
}
