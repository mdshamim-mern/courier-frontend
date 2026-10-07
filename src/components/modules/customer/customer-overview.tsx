"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, CheckCircle } from "lucide-react";
import { useShipmentSummary } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import QueryError from "@/components/ui/query-error";

export default function CustomerOverview() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useShipmentSummary();
  const totalShipments = data?.data.totalShipments ?? 0;
  const pendingShipments = data?.data.activeShipments ?? 0;
  const deliveredShipments = data?.data.deliveredShipments ?? 0;
  if (error) return <QueryError retry={() => { void refetch(); }} />;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => router.push("/dashboard/new-shipment")}>
          + Create Shipment
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            <Package className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShipments}</div>
          </CardContent>
        </Card>
        <Card className="border-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active & Pending</CardTitle>
            <Truck className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingShipments}</div>
          </CardContent>
        </Card>
        <Card className="border-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredShipments}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
