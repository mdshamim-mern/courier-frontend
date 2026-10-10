"use client";

import { useLocale } from "next-intl";
import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import { useGetMe, useGetCourierHistoryAndEarnings } from "@/hooks";
import DataSkeleton from "@/components/ui/data-skeleton";
import QueryError from "@/components/ui/query-error";
import { Link } from "@/i18n/navigation";
import { CourierMetric, CourierNote, CourierQuickLinks } from "./courier-ui";
import styles from "./courier.module.css";

export default function CourierOverview() {
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
  const { data, isLoading, isError, refetch } = useGetCourierHistoryAndEarnings(
    courierId || "",
  );
  const stats = data?.data;
  if (userLoading || isLoading) return <DataSkeleton />;
  if (userError || isError)
    return (
      <QueryError
        retry={() => {
          void refreshUser();
          if (courierId) void refetch();
        }}
      />
    );
  return (
    <div className="space-y-6">
      <div className={styles.metrics}>
        <CourierMetric
          icon="route"
          label={bn ? "মোট বরাদ্দ করা পার্সেল" : "Assigned parcels"}
          value={stats ? display.number(stats.totalShipments ?? 0) : "—"}
          detail={
            bn ? "সার্ভারে নথিভুক্ত মোট বরাদ্দ" : "Your server-recorded assignments"
          }
        />
        <CourierMetric
          icon="parcels"
          label={ui("Total Deliveries")}
          value={stats ? display.number(stats.completedDeliveries ?? 0) : "—"}
          detail={bn ? "ডেলিভারি সম্পন্ন হিসেবে নথিভুক্ত" : "Recorded as delivered"}
        />
        <CourierMetric
          icon="check"
          label={ui("Performance Rate")}
          value={stats ? display.number(stats.performanceRate ?? 0) + "%" : "—"}
          detail={
            bn
              ? "ডেলিভারির চেষ্টা অনুযায়ী সফলতার হার"
              : "Successful deliveries among attempted deliveries"
          }
        />
        <CourierMetric
          icon="wallet"
          accent
          label={ui("Total Earnings")}
          value={
            stats?.totalEarnings == null
              ? ui("Compensation needs configuration")
              : "৳ " + display.money(stats.totalEarnings)
          }
          detail={
            bn
              ? "কনফিগার করা পারিশ্রমিক; পণ্যের নগদ টাকা নয়"
              : "Configured compensation, not product COD"
          }
        />
      </div>
      {!courierId && (
        <CourierNote>
          {bn
            ? "কুরিয়ার প্রোফাইল যুক্ত নেই। কাজের বরাদ্দের জন্য প্রশাসকের সঙ্গে যোগাযোগ করুন।"
            : "Your courier profile is not linked. Contact an administrator before accepting work."}
        </CourierNote>
      )}
      <div className={styles.sectionTitle}>
        <h2>{bn ? "কাজ শুরু করুন" : "Your work, in one place"}</h2>
        <Link
          href="/courier/earnings"
          className="text-sm font-medium text-primary underline underline-offset-4"
        >
          {ui("Earnings & History")}
        </Link>
      </div>
      <CourierQuickLinks bn={bn} />
      <CourierNote>
        {bn
          ? "কাজের তালিকা থেকে পার্সেল বাছুন। সংগ্রহ ও হাবে হস্তান্তরের ধাপ নথিভুক্ত করুন; ডেলিভারি শেষে প্রাপকের গ্রহণের প্রমাণ ও সংগৃহীত সঠিক নগদ টাকা দিন।"
          : "Open an assigned task, record pickup and hub handovers, then confirm delivery with recipient acknowledgment and the exact cash collected."}
      </CourierNote>
    </div>
  );
}
