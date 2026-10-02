"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, Truck, Users } from "lucide-react";
import { useGetDashboardStats } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminOverview() {
  const { data, isLoading, isError } = useGetDashboardStats();
  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10 text-destructive">
        Failed to load dashboard statistics.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳ {stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Couriers</CardTitle>
            <Truck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCouriers.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            <Package className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalShipments.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}