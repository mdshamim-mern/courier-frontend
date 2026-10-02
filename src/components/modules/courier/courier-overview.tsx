"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageCheck, Wallet } from "lucide-react";
import { useGetMe, useGetCourierHistoryAndEarnings } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourierOverview() {
  const { data: userData, isLoading: isUserLoading } = useGetMe();
  const courierId = userData?.data?.courier?.id;

  const { data: statsData, isLoading: isStatsLoading } = useGetCourierHistoryAndEarnings(courierId || "");
  const stats = statsData?.data;

  const isLoading = isUserLoading || isStatsLoading;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border-muted/20 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
          <PackageCheck className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalShipments || 0}</div>
        </CardContent>
      </Card>
      <Card className="border-muted/20 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <Wallet className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">৳ {stats?.totalEarnings?.toLocaleString() || 0}</div>
        </CardContent>
      </Card>
    </div>
  );
}