"use client";
import { useState, useRef } from "react";
import { useLocale } from "next-intl";
import { placeName } from "@/i18n/geography";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { ApiResponse, Hub } from "@/types";
import type { OperationsAdmin } from "@/types/operations.type";
import { Button } from "@/components/ui/button";
import CollectionTable from "./collection-table";
import {
  AdminFeedback,
  AdminPageHeader,
  RefreshButton,
} from "@/components/modules/admin/admin-ui";
import styles from "@/components/modules/admin/admin.module.css";
type Field = {
  key: string;
  en: string;
  bn: string;
  type?: string;
  options?: Array<[string, string]>;
};
function SettingForm({
  title,
  fields,
  endpoint,
  value,
  refresh,
}: {
  title: string;
  fields: Field[];
  endpoint: string;
  value?: Record<string, unknown>;
  refresh: () => void;
}) {
  const bn = useLocale() === "bn";
  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiClient(endpoint, { method: value?.id ? "PATCH" : "POST", body }),
    onSuccess: refresh,
  });
  return (
    <form
      className="space-y-4 rounded-xl border p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget),
          body: Record<string, unknown> = {};
        for (const field of fields)
          body[field.key] =
            field.type === "checkbox"
              ? data.has(field.key)
              : field.type === "number"
                ? Number(data.get(field.key))
                : String(data.get(field.key));
        mutation.mutate(body);
      }}
    >
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <label
            htmlFor={`${title}-${field.key}`}
            key={field.key}
            className="block"
          >
            {bn ? field.bn : field.en}
            {field.options ? (
              <select
                required
                id={`${title}-${field.key}`}
                name={field.key}
                defaultValue={String(value?.[field.key] ?? "")}
                className="mt-2 block min-h-11 w-full rounded-md border px-3"
              >
                <option value="">{bn ? "বাছুন" : "Choose"}</option>
                {field.options.map(([id, label]) => (
                  <option value={id} key={id}>
                    {label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                required={
                  field.type !== "checkbox" && field.key !== "cutoffMinutes"
                }
                type={field.type || "text"}
                id={`${title}-${field.key}`}
                name={field.key}
                defaultValue={
                  field.type === "checkbox"
                    ? undefined
                    : String(value?.[field.key] ?? "")
                }
                defaultChecked={
                  field.type === "checkbox"
                    ? Boolean(value?.[field.key])
                    : undefined
                }
                step={field.type === "number" ? "0.01" : undefined}
                min={field.type === "number" ? "0" : undefined}
                maxLength={field.type === "number" ? undefined : 255}
                className={
                  field.type === "checkbox"
                    ? "ml-3"
                    : "mt-2 block min-h-11 w-full rounded-md border px-3"
                }
              />
            )}
          </label>
        ))}
      </div>
      <Button type="submit" disabled={mutation.isPending}>
        {bn ? "সংরক্ষণ করুন" : "Save"}
      </Button>
      <AdminFeedback error={mutation.error} />
    </form>
  );
}
export default function AdminSettings() {
  const locale = useLocale(),
    bn = locale === "bn",
    t = (en: string, bangla: string) => (bn ? bangla : en);
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null),
    rateRef = useRef<HTMLDivElement>(null);
  const [editingArea, setArea] = useState<
      Record<string, unknown> | undefined
    >(),
    [editingRate, setRate] = useState<Record<string, unknown> | undefined>();
  const query = useQuery({
    queryKey: ["operations-admin"],
    queryFn: () => apiClient<ApiResponse<OperationsAdmin>>("/operations/admin"),
  });
  const hubs = useQuery({
    queryKey: ["hubs"],
    queryFn: () =>
      apiClient<ApiResponse<Hub[]>>("/hubs", { params: { limit: 100 } }),
  });
  const mutation = useMutation({
    mutationFn: ({
      endpoint,
      body,
    }: {
      endpoint: string;
      body: Record<string, unknown>;
    }) => apiClient(endpoint, { method: "PATCH", body }),
    onSuccess: () => {
      void query.refetch();
      void queryClient.invalidateQueries({ queryKey: ["couriers"] });
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
  const areas = query.data?.data.areas || [],
    options = areas.map(
      (area) => [area.id, placeName(area.name, locale)] as [string, string],
    ),
    hubOptions =
      hubs.data?.data.map(
        (hub) => [hub.id, placeName(hub.name, locale)] as [string, string],
      ) || [];
  const refresh = () => {
    setSaved(true);
    void query.refetch();
    void queryClient.invalidateQueries({ queryKey: ["coverage"] });
    setArea(undefined);
    setRate(undefined);
  };
  const review = (
    e: React.FormEvent<HTMLFormElement>,
    endpoint: string,
    courier: boolean,
  ) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    mutation.mutate({
      endpoint,
      body: {
        approved: data.has("approved"),
        note: String(data.get("note")),
        ...(courier && data.get("hubId")
          ? { hubId: String(data.get("hubId")) }
          : {}),
      },
    });
  };
  if (query.isError)
    return (
      <div className="space-y-4">
        <AdminFeedback error={query.error} />
        <RefreshButton
          refresh={() => {
            void query.refetch();
          }}
        />
      </div>
    );
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t(
          "Operations settings and approvals",
          "কার্যক্রমের সেটিংস ও অনুমোদন",
        )}
        description={t(
          "Manage approved service areas, delivery rates, worker reviews and manual cash records.",
          "অনুমোদিত সেবার এলাকা, মাশুল, কর্মীর আবেদন ও ম্যানুয়াল নগদ হিসাব পরিচালনা করুন।",
        )}
        action={
          <RefreshButton
            refresh={() => {
              void query.refetch();
            }}
            pending={query.isFetching}
          />
        }
      />
      <p className={styles.note}>
        {t(
          "Activate only services you can deliver. Payout references record completed transfers outside this app; these controls do not send money.",
          "বাস্তবে দিতে পারবেন এমন সেবাই চালু করুন। টাকা দেওয়ার প্রমাণ দিয়ে অ্যাপের বাইরে সম্পন্ন হস্তান্তর নথিভুক্ত হবে; এই বোতাম টাকা পাঠায় না।",
        )}
      </p>
      <nav
        className={styles.toolbar}
        aria-label={t("Operations sections", "কার্যক্রমের বিভাগ")}
      >
        {[
          ["#service-areas", "Service areas", "সেবার এলাকা"],
          ["#rate-plans", "Rate plans", "মূল্যতালিকা"],
          ["#worker-reviews", "Worker reviews", "কর্মীর আবেদন"],
          ["#business-reviews", "Business reviews", "ব্যবসার আবেদন"],
          ["#cash-records", "Cash records", "নগদ হিসাব"],
        ].map(([href, en, bangla]) => (
          <a key={href} href={href} className="secondary-button">
            {t(en, bangla)}
          </a>
        ))}
      </nav>
      {query.isPending && (
        <p role="status">{t("Loading settings…", "সেটিংস লোড হচ্ছে…")}</p>
      )}
      {mutation.isSuccess && (
        <AdminFeedback
          success={t(
            "Decision recorded. Current server data has been refreshed.",
            "সিদ্ধান্ত নথিভুক্ত। সার্ভারের বর্তমান তথ্য আপডেট হয়েছে।",
          )}
        />
      )}
      {saved && <AdminFeedback success={t("Saved.", "সংরক্ষিত হয়েছে।")} />}
      <div id="service-areas" ref={areaRef} className="scroll-mt-44">
        {editingArea && (
          <div className={styles.toolbar}>
            <p>
              {t("Editing area: ", "এলাকা সম্পাদনা: ")}
              {placeName(String(editingArea.name), locale)}
            </p>
            <Button variant="outline" onClick={() => setArea(undefined)}>
              {t("Cancel editing", "সম্পাদনা বাতিল")}
            </Button>
          </div>
        )}
        <SettingForm
          key={String(editingArea?.id || "new-area")}
          title={t("Service area", "সেবার এলাকা")}
          endpoint={`/operations/areas${editingArea?.id ? `/${editingArea.id}` : ""}`}
          value={editingArea}
          refresh={refresh}
          fields={[
            { key: "name", en: "Area name", bn: "এলাকার নাম" },
            { key: "district", en: "District", bn: "জেলা" },
            { key: "upazila", en: "Upazila", bn: "উপজেলা" },
            {
              key: "hubId",
              en: "Assigned hub",
              bn: "নির্ধারিত হাব",
              options: hubOptions,
            },
            {
              key: "pickupEnabled",
              en: "Pickup available",
              bn: "সংগ্রহ চালু",
              type: "checkbox",
            },
            {
              key: "dropoffEnabled",
              en: "Branch drop-off available",
              bn: "হাবে জমা চালু",
              type: "checkbox",
            },
            {
              key: "deliveryEnabled",
              en: "Delivery available",
              bn: "পৌঁছানো চালু",
              type: "checkbox",
            },
          ]}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {areas.map((area) => (
          <button
            type="button"
            className="glass-panel min-h-16 p-4 text-left"
            key={area.id}
            onClick={() => {
              setArea({ ...area });
              requestAnimationFrame(() =>
                areaRef.current?.scrollIntoView({ block: "start" }),
              );
            }}
          >
            {t("Edit area: ", "এলাকা সম্পাদনা: ")}
            {placeName(area.name, locale)}
          </button>
        ))}
      </div>
      <div id="rate-plans" ref={rateRef} className="scroll-mt-44">
        {editingRate && (
          <div className={styles.toolbar}>
            <p>
              {t(
                "Editing an existing approved rate plan.",
                "বিদ্যমান অনুমোদিত মূল্যতালিকা সম্পাদনা করছেন।",
              )}
            </p>
            <Button variant="outline" onClick={() => setRate(undefined)}>
              {t("Cancel editing", "সম্পাদনা বাতিল")}
            </Button>
          </div>
        )}
        <SettingForm
          key={String(editingRate?.id || "new-rate")}
          title={t("Approved rate plan", "অনুমোদিত মূল্যতালিকা")}
          endpoint={`/operations/rates${editingRate?.id ? `/${editingRate.id}` : ""}`}
          value={editingRate}
          refresh={refresh}
          fields={[
            {
              key: "pickupAreaId",
              en: "Pickup area",
              bn: "সংগ্রহের এলাকা",
              options,
            },
            {
              key: "receiverAreaId",
              en: "Delivery area",
              bn: "পৌঁছানোর এলাকা",
              options,
            },
            {
              key: "serviceType",
              en: "Service",
              bn: "সেবা",
              options: [
                ["STANDARD", t("Standard", "সাধারণ")],
                ["SAME_DAY", t("Same day", "একই দিন")],
                ["NEXT_DAY", t("Next day", "পরের দিন")],
                ["EXPRESS", t("Express", "জরুরি")],
              ],
            },
            ...[
              ["baseWeight", "Included weight (kg)", "মূল মাশুলের অন্তর্ভুক্ত ওজন"],
              ["baseCharge", "Base delivery fee", "মূল ডেলিভারি মাশুল"],
              [
                "extraPerKg",
                "Per additional started kg",
                "বাড়তি প্রতি শুরু হওয়া কেজির মাশুল",
              ],
              ["pickupFee", "Pickup fee", "সংগ্রহের মাশুল"],
              ["codPercent", "COD handling percentage", "টাকা সংগ্রহের শতকরা মাশুল"],
              ["deliveryDays", "Estimated delivery days", "সম্ভাব্য সরবরাহের দিন"],
              [
                "cutoffMinutes",
                "Same-day cutoff minutes after midnight (noon: 720)",
                "একই দিনের শেষ সময়: মধ্যরাতের পর মিনিট (দুপুর: ৭২০)",
              ],
            ].map(([key, en, bangla]) => ({
              key,
              en,
              bn: bangla,
              type: "number",
            })),
            {
              key: "active",
              en: "Approve and activate pricing",
              bn: "মূল্য অনুমোদন করে চালু করুন",
              type: "checkbox",
            },
          ]}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {query.data?.data.rates.map((rate) => (
          <button
            className="glass-panel min-h-16 p-4 text-left"
            type="button"
            key={String(rate.id)}
            onClick={() => {
              setRate(rate);
              requestAnimationFrame(() =>
                rateRef.current?.scrollIntoView({ block: "start" }),
              );
            }}
          >
            {t("Edit rate: ", "মূল্য সম্পাদনা: ")}
            {placeName(
              areas.find((area) => area.id === rate.pickupAreaId)?.name || "",
              locale,
            )}{" "}
            →{" "}
            {placeName(
              areas.find((area) => area.id === rate.receiverAreaId)?.name || "",
              locale,
            )}
            <span className="mt-1 block text-xs text-muted-foreground">
              {{
                STANDARD: t("Standard", "সাধারণ"),
                SAME_DAY: t("Same day", "একই দিন"),
                NEXT_DAY: t("Next day", "পরের দিন"),
              }[String(rate.serviceType)] ||
                String(rate.serviceType).replaceAll("_", " ")}{" "}
              · ৳
              {new Intl.NumberFormat(bn ? "bn-BD" : "en-US").format(
                Number(rate.baseCharge),
              )}
            </span>
          </button>
        ))}
      </div>
      <h2 id="worker-reviews" className="scroll-mt-44 text-2xl font-bold">
        {t("Pending applications", "যাচাইয়ের অপেক্ষায় আবেদন")}
      </h2>
      {!query.isPending && !query.data?.data.applications.length && (
        <p className={styles.note}>
          {t("No pending worker applications.", "কর্মীর কোনো আবেদন অপেক্ষায় নেই।")}
        </p>
      )}
      {query.data?.data.applications.map((application) => (
        <form
          className="space-y-3 rounded-xl border p-5"
          key={application.id}
          onSubmit={(e) =>
            review(e, `/operations/applications/${application.id}/review`, true)
          }
        >
          <h3>
            {application.user?.name} · {application.area} ·{" "}
            {application.contactNumber}
          </h3>
          <label>
            {t("Hub", "হাব")}
            <select name="hubId" className="ml-3 rounded-md border p-3">
              <option value="">
                {t("Select hub for approval", "অনুমোদনের জন্য হাব বাছুন")}
              </option>
              {hubOptions.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <input type="checkbox" name="approved" />{" "}
            {t("Verified and approve", "যাচাই শেষে অনুমোদন")}
          </label>
          <input
            required
            minLength={2}
            name="note"
            className="block min-h-11 w-full rounded-md border px-3"
            aria-label={t("Review reason", "যাচাইয়ের কারণ")}
            placeholder={t("Review reason", "যাচাইয়ের কারণ")}
          />
          <Button type="submit" disabled={mutation.isPending}>
            {t("Record decision", "সিদ্ধান্ত নথিভুক্ত করুন")}
          </Button>
        </form>
      ))}
      <h2 id="business-reviews" className="scroll-mt-44 text-2xl font-bold">
        {t("Business account reviews", "ব্যবসার অ্যাকাউন্ট যাচাই")}
      </h2>
      {!query.isPending && !query.data?.data.businesses.length && (
        <p className={styles.note}>
          {t(
            "No business accounts waiting for review.",
            "ব্যবসার কোনো অ্যাকাউন্ট যাচাইয়ের অপেক্ষায় নেই।",
          )}
        </p>
      )}
      {query.data?.data.businesses.map((business) => (
        <form
          className="space-y-3 rounded-xl border p-5"
          key={business.id}
          onSubmit={(e) =>
            review(e, `/operations/business/${business.id}/review`, false)
          }
        >
          <h3>
            {business.shopName} · {business.user?.name}
          </h3>
          <p>
            {business.pickupAddress} · {business.contactNumber}
          </p>
          <p>
            {business.payoutMethod} · {business.accountName} ·{" "}
            {business.accountNumber}
          </p>
          <label>
            <input type="checkbox" name="approved" />{" "}
            {t(
              "Verified payout ownership and approve",
              "টাকা পাওয়ার অ্যাকাউন্টের মালিকানা যাচাই করে অনুমোদন",
            )}
          </label>
          <input
            required
            minLength={2}
            name="note"
            className="block min-h-11 w-full rounded-md border px-3"
            aria-label={t("Review reason", "যাচাইয়ের কারণ")}
            placeholder={t("Review reason", "যাচাইয়ের কারণ")}
          />
          <Button type="submit" disabled={mutation.isPending}>
            {t("Record decision", "সিদ্ধান্ত নথিভুক্ত করুন")}
          </Button>
        </form>
      ))}
      <h2 id="cash-records" className="scroll-mt-44 text-2xl font-bold">
        {t("Cash collection records", "নগদ সংগ্রহের হিসাব")}
      </h2>
      <CollectionTable records={query.data?.data.collections || []} />
      {query.data?.data.collections.map((record) => (
        <form
          key={record.id}
          className="space-y-3 rounded-xl border p-4"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            mutation.mutate({
              endpoint: `/operations/collections/${record.id}`,
              body: {
                action: record.status === "COLLECTED" ? "RECEIVE" : "PAY",
                reference: String(form.get("reference")),
                ...(record.status === "RECEIVED"
                  ? {
                      accountVersion: query.data?.data.payoutAccounts.find(
                        (account) => account.userId === record.merchantId,
                      )?.updatedAt,
                    }
                  : {}),
              },
            });
          }}
        >
          <p className="break-all">{record.shipmentId}</p>
          {record.status === "RECEIVED" && (
            <p>
              {t(
                "Verify completed transfer to this approved account: ",
                "এই অনুমোদিত হিসাবে টাকা হস্তান্তর সম্পন্ন হয়েছে কি না যাচাই করুন: ",
              )}
              {
                query.data?.data.payoutAccounts.find(
                  (account) => account.userId === record.merchantId,
                )?.accountName
              }{" "}
              ·{" "}
              {
                query.data?.data.payoutAccounts.find(
                  (account) => account.userId === record.merchantId,
                )?.accountNumber
              }
            </p>
          )}
          <label>
            {record.status === "COLLECTED"
              ? t("Verified cash receipt reference", "যাচাইকৃত নগদ গ্রহণের রসিদ")
              : t(
                  "Completed payout transaction reference",
                  "সম্পন্ন টাকা দেওয়ার লেনদেনের প্রমাণ",
                )}
            <input
              name="reference"
              required
              minLength={6}
              maxLength={100}
              className="mt-2 block min-h-11 w-full rounded-md border px-3"
            />
          </label>
          <Button type="submit" disabled={mutation.isPending}>
            {record.status === "COLLECTED"
              ? t("Record cash received", "নগদ গ্রহণ নথিভুক্ত করুন")
              : t("Record completed payout", "সম্পন্ন টাকা দেওয়া নথিভুক্ত করুন")}
          </Button>
        </form>
      ))}
      {mutation.isError && (
        <p role="alert">
          {t(
            "The change was rejected. Review the current state and required details.",
            "পরিবর্তন গ্রহণ করা হয়নি। বর্তমান অবস্থা ও প্রয়োজনীয় তথ্য যাচাই করুন।",
          )}
        </p>
      )}
    </div>
  );
}
