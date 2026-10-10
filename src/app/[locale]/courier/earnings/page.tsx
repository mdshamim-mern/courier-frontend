"use client";

import { useLocale } from "next-intl";
import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import { useGetMe, useGetCourierHistoryAndEarnings } from "@/hooks";
import QueryError from "@/components/ui/query-error";
import DataSkeleton from "@/components/ui/data-skeleton";
import { EmptyStatePanel } from "@/components/ui/empty-state-panel";
import {
  CourierPageHeader,
  CourierMetric,
  CourierNote,
} from "@/components/modules/courier/courier-ui";
import styles from "@/components/modules/courier/courier.module.css";
import { Link } from "@/i18n/navigation";

export default function EarningsPage() {
  const bn = useLocale() === "bn",
    ui = useUiText(),
    display = useUiFormat();
  const {
    data: userData,
    isLoading: userLoading,
    isError: userError,
    refetch: refreshUser,
  } = useGetMe();
  const courierId = userData?.data?.courier?.id;
  const { data, isLoading, error, refetch, isFetching } =
    useGetCourierHistoryAndEarnings(courierId || "");
  const stats = data?.data;
  const history = stats?.shipments?.slice(0, 6) || [];
  return (
    <div className="space-y-6">
      <CourierPageHeader
        icon="wallet"
        eyebrow={ui("Delivery Management")}
        title={ui("Earnings & History")}
        description={ui(
          "View your total earnings and delivery performance over time.",
        )}
        action={
          <button
            type="button"
            className="secondary-button"
            disabled={isFetching || userLoading || !courierId}
            onClick={() => {
              void refetch();
            }}
          >
            {bn ? "হালনাগাদ করুন" : "Refresh earnings"}
          </button>
        }
      />
      {userLoading || isLoading ? (
        <DataSkeleton />
      ) : error || userError ? (
        <QueryError
          retry={() => {
            void refreshUser();
            if (courierId) void refetch();
          }}
        />
      ) : (
        <>
          <div className={styles.metrics}>
            <CourierMetric
              accent
              icon="wallet"
              label={ui("Total Earnings")}
              value={
                stats?.totalEarnings == null
                  ? ui("Compensation needs configuration")
                  : "৳ " + display.money(stats.totalEarnings)
              }
              detail={
                bn
                  ? "সম্পন্ন ডেলিভারির কনফিগার করা পারিশ্রমিক"
                  : "Configured compensation for delivered parcels"
              }
            />
            <CourierMetric
              icon="parcels"
              label={ui("Completed Deliveries")}
              value={
                stats ? display.number(stats.completedDeliveries ?? 0) : "—"
              }
              detail={
                bn
                  ? "ডেলিভারি সম্পন্ন হিসেবে নথিভুক্ত"
                  : "Server-confirmed delivered parcels"
              }
            />
            <CourierMetric
              icon="check"
              label={ui("Performance Rate")}
              value={
                stats ? display.number(stats.performanceRate ?? 0) + "%" : "—"
              }
              detail={
                bn
                  ? "ডেলিভারির চেষ্টার ভিত্তিতে সফলতার হার"
                  : "Calculated from attempted deliveries"
              }
            />
          </div>
          <CourierNote>
            {bn
              ? "এখানে কর্মীর পারিশ্রমিক দেখানো হয়। প্রাপকের কাছ থেকে সংগৃহীত পণ্যের টাকা আলাদা নগদ সংগ্রহের হিসাবে আছে। এই পাতা স্বয়ংক্রিয় টাকা তোলা বা পরিশোধের সুবিধা নয়।"
              : "Earnings are worker compensation. Product cash collected from recipients belongs in the separate cash ledger. This page does not initiate withdrawals or payouts."}
          </CourierNote>
          <section className={styles.panel}>
            <div className={styles.sectionTitle}>
              <h2>
                {bn ? "সাম্প্রতিক ডেলিভারির ইতিহাস" : "Recent delivery history"}
              </h2>
              <Link
                href="/courier/deliveries"
                className="text-sm text-primary underline underline-offset-4"
              >
                {ui("My Deliveries")}
              </Link>
            </div>
            {!history.length ? (
              <EmptyStatePanel
                title={
                  bn
                    ? "এখনো ডেলিভারির ইতিহাস নেই।"
                    : "No delivery history recorded."
                }
              />
            ) : (
              <div className={styles.history}>
                {history.map((shipment) => (
                  <div key={shipment.id} className={styles.historyRow}>
                    <div>
                      <Link
                        href={"/courier/shipments/" + shipment.id}
                        className="text-primary underline underline-offset-4"
                      >
                        <strong>{shipment.trackingId}</strong>
                      </Link>
                      <p className={styles.detail}>
                        {shipment.receiverName} ·{" "}
                        {display.date(shipment.createdAt)}
                      </p>
                    </div>
                    <span className={styles.badge}>{ui(shipment.status)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
