"use client";

import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, Truck, Users } from "lucide-react";
import { useGetDashboardStats } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminShortcut, RefreshButton, useAdminText } from "./admin-ui";
import styles from "./admin.module.css";
import AnalyticsCharts from "./analytics-charts";

export default function AdminOverview() {
  const ui = useUiText();
  const display = useUiFormat();
  const t = useAdminText();
  const { data, isLoading, isError, refetch, isFetching } =
    useGetDashboardStats();
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
      <div
        role="alert"
        className="flex min-h-32 flex-wrap items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/10 p-5 text-destructive"
      >
        {ui("Failed to load dashboard statistics.")}{" "}
        <RefreshButton
          refresh={() => {
            void refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={styles.toolbar}>
        <p className={styles.secondary}>
          {t(
            "Live database totals, including retained test records. Revenue sums provider-confirmed paid delivery fees, not COD proceeds.",
            "পরীক্ষামূলক রেকর্ডসহ ডেটাবেসের বর্তমান মোট হিসাব। আয় হলো নিশ্চিত PAID ডেলিভারি মাশুল; পণ্যের টাকা নয়।",
          )}
        </p>
        <RefreshButton
          refresh={() => {
            void refetch();
          }}
          pending={isFetching}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              {ui("Total Revenue")}
            </CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ৳ {display.money(stats.totalRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              {ui("Total Customers")}
            </CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {display.number(stats.totalCustomers)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              {ui("Total Couriers")}
            </CardTitle>
            <Truck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {display.number(stats.totalCouriers)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              {ui("Total Shipments")}
            </CardTitle>
            <Package className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {display.number(stats.totalShipments)}
            </div>
          </CardContent>
        </Card>
      </div>
      <AnalyticsCharts stats={stats} />
      <div className={styles.shortcuts}>
        <AdminShortcut
          href="/admin/operations"
          title={t("Review & configure", "যাচাই ও সেটিংস")}
          detail={t(
            "Review businesses and workers, service areas and approved rates.",
            "ব্যবসা ও কর্মীর আবেদন, সেবার এলাকা এবং অনুমোদিত মাশুল যাচাই করুন।",
          )}
        />
        <AdminShortcut
          href="/admin/all-shipments"
          title={t("Allocate parcel work", "পার্সেলের কাজ বরাদ্দ")}
          detail={t(
            "Assign pickups, hand over at hubs and follow delayed parcels.",
            "সংগ্রহের কাজ বরাদ্দ, হাবে হস্তান্তর ও দেরি হওয়া পার্সেল দেখুন।",
          )}
        />
        <AdminShortcut
          href="/admin/audit-logs"
          title={t("Inspect the audit trail", "পরিবর্তনের ইতিহাস")}
          detail={t(
            "Inspect server-recorded administration and payment events.",
            "সার্ভারে নথিভুক্ত প্রশাসনিক ও পেমেন্টের ঘটনা দেখুন।",
          )}
        />
      </div>
    </div>
  );
}
