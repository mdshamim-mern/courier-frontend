"use client";
import { useState } from "react";
import { useLocale } from "next-intl";
import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { ApiResponse, Hub } from "@/types";
import type { OperationsAdmin } from "@/types/operations.type";
import { Button } from "@/components/ui/button";
import CollectionTable from "./collection-table";
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
      {mutation.isError && (
        <p role="alert">
          {bn
            ? "সংরক্ষণ হয়নি। তথ্য ও অনুমতি যাচাই করুন।"
            : "Not saved. Check values and permissions."}
        </p>
      )}
      {mutation.isSuccess && (
        <p role="status">{bn ? "সংরক্ষিত হয়েছে।" : "Saved."}</p>
      )}
    </form>
  );
}
export default function AdminSettings() {
  const bn = useLocale() === "bn",
    t = (en: string, bangla: string) => (bn ? bangla : en);
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
    },
  });
  const areas = query.data?.data.areas || [],
    options = areas.map((area) => [area.id, area.name] as [string, string]),
    hubOptions =
      hubs.data?.data.map((hub) => [hub.id, hub.name] as [string, string]) ||
      [];
  const refresh = () => {
    void query.refetch();
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
    return <p role="alert">{t("Settings unavailable.", "সেটিংস পাওয়া যায়নি।")}</p>;
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        {t("Operations settings and approvals", "কার্যক্রমের সেটিংস ও অনুমোদন")}
      </h1>
      <p>
        {t(
          "No rates or service areas are invented. Review and activate only services you can deliver. Payout references record transfers already completed outside this app; these controls do not send money.",
          "কোনো মূল্য বা এলাকা কল্পনা করে বসানো হয়নি। বাস্তবে দিতে পারবেন এমন সেবাই যাচাই করে চালু করুন। টাকা দেওয়ার প্রমাণ দিয়ে অ্যাপের বাইরে ইতোমধ্যে সম্পন্ন হস্তান্তর নথিভুক্ত হবে; এই বোতাম টাকা পাঠায় না।",
        )}
      </p>
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
      <div className="flex flex-wrap gap-3">
        {areas.map((area) => (
          <button
            type="button"
            className="rounded-md border p-3"
            key={area.id}
            onClick={() => setArea({ ...area })}
          >
            {t("Edit area: ", "এলাকা সম্পাদনা: ")}
            {area.name}
          </button>
        ))}
      </div>
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
      <div className="flex flex-wrap gap-3">
        {query.data?.data.rates.map((rate) => (
          <button
            className="rounded-md border p-3"
            type="button"
            key={String(rate.id)}
            onClick={() => setRate(rate)}
          >
            {t("Edit rate: ", "মূল্য সম্পাদনা: ")}
            {areas.find((area) => area.id === rate.pickupAreaId)?.name} →{" "}
            {areas.find((area) => area.id === rate.receiverAreaId)?.name}
          </button>
        ))}
      </div>
      <h2 className="text-2xl font-bold">
        {t("Pending applications", "যাচাইয়ের অপেক্ষায় আবেদন")}
      </h2>
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
