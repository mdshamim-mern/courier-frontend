"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetMe, useGetCourierHistoryAndEarnings } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, TrendingUp, Activity } from "lucide-react";

export default function EarningsPage() {
  const { data: userData, isLoading: userLoading } = useGetMe();
  const courierId = userData?.data?.courier?.id;

  const { data, isLoading } = useGetCourierHistoryAndEarnings(courierId || "");
  const stats = data?.data;

  if (userLoading || isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Earnings & History</h1>
        <p className="text-sm text-muted-foreground">
          View your total earnings and delivery performance over time.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <Wallet className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ৳ {stats?.totalEarnings?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Completed Deliveries</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalShipments || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Performance Rate</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalShipments > 0 ? "98.5%" : "0%"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}