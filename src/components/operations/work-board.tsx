"use client";
import { useState } from "react";
import { useLocale } from "next-intl";
import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { useGetAllShipments } from "@/hooks";
import type { ApiResponse } from "@/types";
import type { OperationsAdmin } from "@/types/operations.type";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import ShipmentActions from "./shipment-actions";
import { useUiText } from "@/i18n/use-ui-text";
import {
  AdminFeedback,
  AdminPageHeader,
  RefreshButton,
  TestRecordBadge,
  isTestRecord,
} from "@/components/modules/admin/admin-ui";
import styles from "@/components/modules/admin/admin.module.css";
export default function WorkBoard({ admin = false }: { admin?: boolean }) {
  const ui = useUiText();
  const bn = useLocale() === "bn",
    t = (en: string, bangla: string) => (bn ? bangla : en);
  const [task, setTask] = useState(""),
    [page, setPage] = useState(1),
    [search, setSearch] = useState("");
  const records = useGetAllShipments({
    page,
    limit: 10,
    ...(task ? { task } : {}),
    searchTerm: search,
  });
  const workers = useQuery({
    queryKey: ["operations-admin"],
    queryFn: () => apiClient<ApiResponse<OperationsAdmin>>("/operations/admin"),
    enabled: admin,
  });
  const assign = useMutation({
    mutationFn: ({
      id,
      courierId,
      status,
    }: {
      id: string;
      courierId: string;
      status: string;
    }) =>
      apiClient(
        `/shipments/${id}${status === "PENDING" ? "/assign" : "/handoff"}`,
        { method: "PATCH", body: { courierId } },
      ),
    onSuccess: () => {
      void records.refetch();
      void workers.refetch();
    },
  });
  return (
    <section className="space-y-5">
      {admin ? (
        <AdminPageHeader
          title={t("Parcel work allocation", "পার্সেলের কাজ বরাদ্দ")}
          description={t(
            "Allocate pickups and hub handovers using each worker's availability and current load.",
            "কর্মীর উপস্থিতি ও কাজের চাপ অনুযায়ী সংগ্রহ এবং হাবে হস্তান্তরের কাজ বরাদ্দ করুন।",
          )}
          action={
            <RefreshButton
              refresh={() => {
                void records.refetch();
                void workers.refetch();
              }}
              pending={records.isFetching}
            />
          }
        />
      ) : (
        <h1 className="text-2xl font-bold">
          {t("My pickup and delivery tasks", "আমার সংগ্রহ ও ডেলিভারির কাজ")}
        </h1>
      )}
      <div className={admin ? styles.toolbar : "flex flex-wrap gap-3"}>
        <label>
          {t("Task filter", "কাজের ধরন")}
          <select
            className="ml-2 min-h-11 rounded-md border p-2"
            value={task}
            onChange={(e) => {
              setTask(e.target.value);
              setPage(1);
            }}
          >
            {[
              ["", "All", "সব"],
              ["TODAY", "Today", "আজকের কাজ"],
              ...(admin ? [["UNASSIGNED", "Unassigned", "বরাদ্দ বাকি"]] : []),
              ["PICKUP", "Pickup", "সংগ্রহ"],
              ["DELIVERY", "Delivery", "পৌঁছানো"],
              ["FAILED", "Failed delivery", "ব্যর্থ ডেলিভারি"],
              ["LATE", "Late", "দেরি হয়েছে"],
              ["URGENT", "Urgent", "জরুরি"],
            ].map(([value, en, bangla]) => (
              <option key={value} value={value}>
                {t(en, bangla)}
              </option>
            ))}
          </select>
        </label>
        <input
          className="min-h-11 rounded-md border px-3"
          aria-label={t("Search parcel", "পার্সেল খুঁজুন")}
          placeholder={t("Tracking number or receiver", "অনুসন্ধানসংখ্যা বা প্রাপক")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>
      {records.isPending && (
        <p role="status">{t("Loading parcels…", "পার্সেল লোড হচ্ছে…")}</p>
      )}
      {assign.isSuccess && (
        <AdminFeedback
          success={t("Work allocation saved.", "কাজের বরাদ্দ সংরক্ষিত।")}
        />
      )}
      {records.isError && (
        <p role="alert">{t("Tasks unavailable.", "কাজের তালিকা পাওয়া যায়নি।")}</p>
      )}
      {!records.isPending && !records.isError && !records.data?.data.length && (
        <p>{t("No matching tasks.", "এই ধরনের কোনো কাজ নেই।")}</p>
      )}
      {records.data?.data.map((shipment) => (
        <article
          key={shipment.id}
          className="space-y-3 rounded-xl border bg-card p-5"
        >
          <h2 className="break-all font-semibold">{shipment.trackingId}</h2>
          <div className="flex flex-wrap gap-2">
            <span className={styles.badge}>{ui(shipment.status)}</span>
            <span className={styles.badge}>{ui(shipment.paymentStatus)}</span>
            {isTestRecord(shipment) && <TestRecordBadge />}
          </div>
          <p>
            {t("Pickup: ", "সংগ্রহ: ")}
            {shipment.pickupAddress ||
              shipment.originHub?.address ||
              t("View assigned hub", "নির্ধারিত হাব দেখুন")}{" "}
            · {shipment.senderPhone}
          </p>
          <p>
            {t("Receiver: ", "প্রাপক: ")}
            {shipment.receiverName} · {shipment.receiverPhone}
          </p>
          <p>{shipment.receiverAddress}</p>
          {shipment.requestedPickupAt && (
            <p>
              {t("Requested collection time: ", "সংগ্রহের অনুরোধের সময়: ")}
              {new Intl.DateTimeFormat(bn ? "bn-BD" : "en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(shipment.requestedPickupAt))}
            </p>
          )}
          {shipment.estimatedDelivery && (
            <p>
              {t("Estimated delivery: ", "সম্ভাব্য সরবরাহ: ")}
              {new Intl.DateTimeFormat(bn ? "bn-BD" : "en-GB", {
                dateStyle: "medium",
              }).format(new Date(shipment.estimatedDelivery))}
            </p>
          )}
          <Link
            className="secondary-button"
            href={
              admin
                ? `/admin/shipments/${shipment.id}`
                : `/courier/shipments/${shipment.id}`
            }
          >
            {t("Details and label", "বিস্তারিত ও লেবেল")}
          </Link>
          {admin &&
            ["PENDING", "AT_ORIGIN_HUB", "AT_DESTINATION_HUB"].includes(
              shipment.status,
            ) && (
              <form
                className="flex flex-wrap gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  assign.mutate({
                    id: shipment.id,
                    courierId: String(
                      new FormData(e.currentTarget).get("courierId"),
                    ),
                    status: shipment.status,
                  });
                }}
              >
                <label>
                  {t(
                    "Available worker and current load",
                    "কর্মী ও বর্তমান কাজের চাপ",
                  )}
                  <select
                    required
                    name="courierId"
                    className="ml-2 min-h-11 rounded-md border p-2"
                  >
                    <option value="">{t("Choose worker", "কর্মী বাছুন")}</option>
                    {workers.data?.data.couriers
                      .filter(
                        (worker) =>
                          worker.userId !== shipment.courierId &&
                          worker.isAvailable &&
                          worker.user._count.deliveries < 5 &&
                          worker.currentHubId ===
                            (shipment.status === "AT_DESTINATION_HUB"
                              ? shipment.destinationHubId
                              : shipment.originHubId),
                      )
                      .map((worker) => (
                        <option key={worker.userId} value={worker.userId}>
                          {worker.user.name} ·{" "}
                          {new Intl.NumberFormat(bn ? "bn-BD" : "en-US").format(
                            worker.user._count.deliveries,
                          )}
                        </option>
                      ))}
                  </select>
                </label>
                <Button type="submit" disabled={assign.isPending}>
                  {shipment.status === "PENDING"
                    ? t("Assign pickup worker", "সংগ্রহের কর্মী বরাদ্দ")
                    : t("Handover at hub", "হাবে কর্মী হস্তান্তর")}
                </Button>
              </form>
            )}
          <ShipmentActions
            shipment={shipment}
            onSuccess={() => {
              void records.refetch();
            }}
          />
        </article>
      ))}
      {assign.isError && (
        <p role="alert">
          {t(
            "Assignment rejected. Check the worker hub and current workload.",
            "বরাদ্দ গ্রহণ হয়নি। কর্মীর হাব ও বর্তমান কাজের চাপ যাচাই করুন।",
          )}
        </p>
      )}
      {records.data?.meta && (
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            {t("Previous", "আগের পাতা")}
          </Button>
          <span>
            {new Intl.NumberFormat(bn ? "bn-BD" : "en-US").format(page)}
          </span>
          <Button
            variant="outline"
            disabled={page >= records.data.meta.totalPages}
            onClick={() => setPage(page + 1)}
          >
            {t("Next", "পরের পাতা")}
          </Button>
        </div>
      )}
    </section>
  );
}
