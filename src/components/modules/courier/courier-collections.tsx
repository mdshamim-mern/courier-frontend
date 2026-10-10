"use client";

import { useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/types";
import type { OperationsMine } from "@/types/operations.type";
import DataSkeleton from "@/components/ui/data-skeleton";
import QueryError from "@/components/ui/query-error";
import { EmptyStatePanel } from "@/components/ui/empty-state-panel";
import { Link } from "@/i18n/navigation";
import { CourierMetric, CourierNote, CourierPageHeader } from "./courier-ui";
import styles from "./courier.module.css";

export default function CourierCollections() {
  const bn = useLocale() === "bn",
    t = (en: string, bangla: string) => (bn ? bangla : en);
  const mine = useQuery({
    queryKey: ["operations-mine"],
    queryFn: () => apiClient<ApiResponse<OperationsMine>>("/operations/mine"),
  });
  const records = mine.data?.data.collections || [],
    totals = mine.data?.data.totals;
  const money = (value: string | undefined) =>
    value == null
      ? "—"
      : new Intl.NumberFormat(bn ? "bn-BD" : "en-BD", {
          style: "currency",
          currency: "BDT",
        }).format(Number(value));
  const date = (value: string) =>
    new Intl.DateTimeFormat(bn ? "bn-BD" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Dhaka",
    }).format(new Date(value));
  const captions: Record<string, string> = {
    COLLECTED: t("Collected by worker", "কর্মীর কাছে সংগৃহীত"),
    RECEIVED: t("Received by operator", "প্রতিষ্ঠান গ্রহণ করেছে"),
    PAID: t("Paid to merchant", "ব্যবসায়ীকে দেওয়া হয়েছে"),
  };
  return (
    <div className="space-y-6">
      <CourierPageHeader
        icon="cash"
        eyebrow={t("Delivery Management", "ডেলিভারি ব্যবস্থাপনা")}
        title={t("Cash Collections", "নগদ সংগ্রহ")}
        description={t(
          "Reconcile product cash collected from recipients and follow recorded handovers.",
          "প্রাপকের কাছ থেকে সংগৃহীত পণ্যের নগদ টাকা ও নথিভুক্ত হস্তান্তরের হিসাব মিলিয়ে নিন।",
        )}
        action={
          <button
            type="button"
            className="secondary-button"
            disabled={mine.isFetching}
            onClick={() => {
              void mine.refetch();
            }}
          >
            {t("Refresh ledger", "হিসাব হালনাগাদ করুন")}
          </button>
        }
      />
      {mine.isPending ? (
        <DataSkeleton />
      ) : mine.isError ? (
        <QueryError
          retry={() => {
            void mine.refetch();
          }}
        />
      ) : (
        <>
          <CourierNote>
            {t(
              "Online delivery-fee payments are separate. This ledger tracks product cash collected from the receiver. Operator receipt and merchant transfers are recorded manually; these cards do not send money.",
              "ডেলিভারি মাশুলের অনলাইন অর্থপ্রদান এই হিসাবের অংশ নয়। এখানে প্রাপকের কাছ থেকে সংগৃহীত পণ্যের টাকা দেখানো হয়। প্রতিষ্ঠানের গ্রহণ ও ব্যবসায়ীকে টাকা দেওয়া ম্যানুয়ালি নথিভুক্ত হয়; এই কার্ডগুলো টাকা পাঠায় না।",
            )}
          </CourierNote>
          {totals && (
            <div className={styles.metrics}>
              {(
                [
                  [
                    "expected",
                    "Booked product COD",
                    "বুকিংয়ে সংগ্রহযোগ্য পণ্যের টাকা",
                  ],
                  [
                    "collected",
                    "Collected from recipients",
                    "প্রাপকদের কাছ থেকে সংগৃহীত",
                  ],
                  ["heldByWorker", "Cash held by workers", "কর্মীদের কাছে নগদ"],
                  [
                    "awaitingCollection",
                    "Not yet collected",
                    "এখনো সংগ্রহ হয়নি",
                  ],
                  ["payable", "Net merchant payable", "মোট ব্যবসায়ীর নিট পাওনা"],
                  ["paid", "Paid to merchants", "ব্যবসায়ীকে দেওয়া হয়েছে"],
                  ["pending", "Remaining payable", "ব্যবসায়ীর বাকি পাওনা"],
                ] as const
              ).map(([key, en, bangla]) => (
                <CourierMetric
                  key={key}
                  icon="cash"
                  label={t(en, bangla)}
                  value={money(totals[key])}
                  accent={key === "heldByWorker"}
                />
              ))}
            </div>
          )}
          <div className={styles.sectionTitle}>
            <h2>
              {t("Product cash collection ledger", "পণ্যের টাকা সংগ্রহের হিসাব")}
            </h2>
            <span className={styles.badge}>
              {new Intl.NumberFormat(bn ? "bn-BD" : "en-BD").format(
                records.length,
              )}{" "}
              {t("records shown", "হিসাব দেখানো হচ্ছে")}
            </span>
          </div>
          {!records.length ? (
            <section className={styles.panel}>
              <EmptyStatePanel
                title={t(
                  "No cash collections recorded.",
                  "এখনো কোনো সংগ্রহের হিসাব নেই।",
                )}
              />
            </section>
          ) : (
            <div className={styles.ledgerGrid}>
              {records.map((record) => (
                <article
                  key={record.id}
                  className={`${styles.panel} ${styles.ledger}`}
                  data-courier-collection
                >
                  <div className={styles.ledgerTop}>
                    <strong>{money(record.amount)}</strong>
                    <span className={styles.badge}>
                      {captions[record.status] || record.status}
                    </span>
                  </div>
                  <dl className={styles.data}>
                    <div className="col-span-full">
                      <dt>{t("Shipment", "পার্সেল")}</dt>
                      <dd>
                        <Link
                          href={"/courier/shipments/" + record.shipmentId}
                          className="text-primary underline underline-offset-4"
                        >
                          {record.shipmentId}
                        </Link>
                      </dd>
                    </div>
                    <div>
                      <dt>{t("Handling fee", "সংগ্রহের মাশুল")}</dt>
                      <dd>{money(record.fee)}</dd>
                    </div>
                    <div>
                      <dt>{t("Merchant payable", "ব্যবসায়ীর পাওনা")}</dt>
                      <dd>{money(record.payable)}</dd>
                    </div>
                    {record.createdAt && (
                      <div className="col-span-full">
                        <dt>{t("Collection time", "সংগ্রহের সময়")}</dt>
                        <dd>{date(record.createdAt)}</dd>
                      </div>
                    )}
                    {record.receiptReference && (
                      <div className="col-span-full">
                        <dt>{t("Cash receipt", "গ্রহণের রসিদ")}</dt>
                        <dd>{record.receiptReference}</dd>
                      </div>
                    )}
                    {record.payoutReference && (
                      <div className="col-span-full">
                        <dt>{t("Payout reference", "টাকা দেওয়ার প্রমাণ")}</dt>
                        <dd>{record.payoutReference}</dd>
                      </div>
                    )}
                  </dl>
                </article>
              ))}
            </div>
          )}
          {records.length >= 200 && (
            <p className={styles.detail}>
              {t(
                "Showing the latest 200 records.",
                "সাম্প্রতিক ২০০টি হিসাব দেখানো হচ্ছে।",
              )}
            </p>
          )}
        </>
      )}
    </div>
  );
}
