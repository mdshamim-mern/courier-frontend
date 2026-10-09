"use client";
import { useLocale } from "next-intl";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useGetMe } from "@/hooks";
import { Link } from "@/i18n/navigation";
import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/types";
import type { OperationsMine } from "@/types/operations.type";
import { Button } from "@/components/ui/button";
import CollectionTable from "./collection-table";
export default function ProfileForms({
  kind,
}: {
  kind: "business" | "application" | "collections";
}) {
  const bn = useLocale() === "bn",
    t = (en: string, bangla: string) => (bn ? bangla : en),
    user = useGetMe();
  const mine = useQuery({
    queryKey: ["operations-mine"],
    queryFn: () => apiClient<ApiResponse<OperationsMine>>("/operations/mine"),
    enabled: !!user.data?.data && user.data.data.role !== "ADMIN",
  });
  const submit = useMutation({
    mutationFn: (body: Record<string, string>) =>
      apiClient(
        `/operations/${kind === "business" ? "business" : "applications"}`,
        { method: kind === "business" ? "PUT" : "POST", body },
      ),
    onSuccess: () => {
      void mine.refetch();
    },
  });
  if (user.isPending) return <p>{t("Loading…", "তথ্য আসছে…")}</p>;
  if (!user.data?.data)
    return (
      <div className="space-y-4">
        <p>
          {t(
            "Create and verify your personal account first. Then complete your application.",
            "আগে ব্যক্তিগত অ্যাকাউন্ট তৈরি ও যাচাই করুন। এরপর আবেদন পূরণ করুন।",
          )}
        </p>
        <Link
          className="brand-button"
          href={
            kind === "business"
              ? "/register?next=/dashboard/business"
              : "/register?next=/courier-apply"
          }
        >
          {t("Create account", "অ্যাকাউন্ট তৈরি")}
        </Link>
        <Link
          className="ml-4 underline"
          href={
            kind === "business"
              ? "/login?next=/dashboard/business"
              : "/login?next=/courier-apply"
          }
        >
          {t("Already registered? Sign in", "অ্যাকাউন্ট আছে? প্রবেশ করুন")}
        </Link>
      </div>
    );
  if (kind === "collections")
    return mine.isError ? (
      <p role="alert">{t("Records unavailable.", "হিসাব পাওয়া যায়নি।")}</p>
    ) : (
      <CollectionTable
        totals={mine.data?.data.totals}
        records={mine.data?.data.collections || []}
      />
    );
  if (user.data.data.role !== "CUSTOMER")
    return (
      <p>
        {t(
          "This application is for verified customer accounts. Staff cannot apply here.",
          "এই আবেদন যাচাইকৃত গ্রাহকের জন্য। কর্মীরা এখানে আবেদন করতে পারবেন না।",
        )}
      </p>
    );
  if (mine.isPending) return <p>{t("Loading…", "তথ্য আসছে…")}</p>;
  if (mine.isError)
    return (
      <p role="alert">
        {t(
          "Records unavailable. Please retry.",
          "হিসাব পাওয়া যায়নি। আবার চেষ্টা করুন।",
        )}
      </p>
    );
  const record =
    kind === "business"
      ? mine.data?.data.business
      : mine.data?.data.application;
  const fields =
    kind === "business"
      ? [
          ["shopName", "Shop name", "দোকানের নাম"],
          ["pickupAddress", "Pickup address", "সংগ্রহের ঠিকানা"],
          ["contactNumber", "Phone", "ফোন"],
          ["accountName", "Payout account holder", "টাকা পাওয়ার অ্যাকাউন্টের মালিক"],
          ["accountNumber", "Payout account number", "টাকা পাওয়ার অ্যাকাউন্ট নম্বর"],
        ]
      : [
          ["contactNumber", "Phone", "ফোন"],
          ["area", "Working area", "কাজের এলাকা"],
        ];
  return (
    <div className="space-y-5">
      {record && (
        <p role="status">
          {t("Review status: ", "যাচাইয়ের অবস্থা: ")}
          {kind === "business"
            ? mine.data?.data.business?.approved
              ? t("Approved", "অনুমোদিত")
              : t("Awaiting review", "যাচাইয়ের অপেক্ষায়")
            : mine.data?.data.application?.status === "APPROVED"
              ? t("Approved", "অনুমোদিত")
              : mine.data?.data.application?.status === "REJECTED"
                ? t(
                    "Rejected; you may update and reapply",
                    "অননুমোদিত; তথ্য বদলে আবার আবেদন করতে পারেন",
                  )
                : t("Awaiting review", "যাচাইয়ের অপেক্ষায়")}
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        {kind === "business"
          ? t(
              "Payout details require administrator verification. Editing them removes approval until reviewed. Delivery charges are paid separately; this is not an instant withdrawal facility.",
              "টাকা পাওয়ার তথ্য প্রশাসক যাচাই করবেন। তথ্য বদলালে পুনরায় অনুমোদন লাগবে। ডেলিভারি মাশুল আলাদা পরিশোধযোগ্য; এটি তাৎক্ষণিক টাকা তোলার ব্যবস্থা নয়।",
            )
          : t(
              "Approval does not happen automatically. A hub is assigned after review; sign in again after approval.",
              "স্বয়ংক্রিয় অনুমোদন হয় না। যাচাইয়ের পরে হাব বরাদ্দ হবে; অনুমোদনের পরে আবার প্রবেশ করতে হবে।",
            )}
      </p>
      <form
        key={record?.id || kind}
        className="glass-panel grid gap-5 p-5 sm:grid-cols-2 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          submit.mutate(
            Object.fromEntries(
              new FormData(e.currentTarget).entries(),
            ) as Record<string, string>,
          );
        }}
      >
        {fields.map(([key, en, bangla]) => (
          <label key={key}>
            {t(en, bangla)}
            <input
              className="mt-2 block min-h-11 w-full rounded-md border px-3"
              name={key}
              required
              minLength={key === "accountNumber" ? 8 : 2}
              maxLength={key === "pickupAddress" ? 500 : 255}
              defaultValue={
                record && key in record
                  ? String(record[key as keyof typeof record] ?? "")
                  : ""
              }
            />
          </label>
        ))}
        <label>
          {kind === "business"
            ? t("Payout method", "টাকা পাওয়ার মাধ্যম")
            : t("Vehicle", "যানবাহন")}
          <select
            defaultValue={
              kind === "business"
                ? (mine.data?.data.business?.payoutMethod ?? "BANK")
                : (mine.data?.data.application?.vehicleType ?? "BICYCLE")
            }
            name={kind === "business" ? "payoutMethod" : "vehicleType"}
            className="mt-2 block min-h-11 w-full rounded-md border px-3"
          >
            {(kind === "business"
              ? [
                  ["BANK", "Bank", "ব্যাংক"],
                  ["BKASH", "bKash", "বিকাশ"],
                ]
              : [
                  ["BICYCLE", "Bicycle", "সাইকেল"],
                  ["MOTORBIKE", "Motorbike", "মোটরসাইকেল"],
                  ["VAN", "Van", "ভ্যান"],
                ]
            ).map(([value, en, bangla]) => (
              <option key={value} value={value}>
                {t(en, bangla)}
              </option>
            ))}
          </select>
        </label>
        <Button
          type="submit"
          disabled={
            submit.isPending ||
            (kind === "application" &&
              !!record &&
              mine.data?.data.application?.status !== "REJECTED")
          }
        >
          {t("Submit for review", "যাচাইয়ের জন্য পাঠান")}
        </Button>
      </form>
      {submit.isError && (
        <p role="alert">
          {t(
            "Submission failed. Check the details or existing application.",
            "আবেদন পাঠানো যায়নি। তথ্য বা আগের আবেদনের অবস্থা যাচাই করুন।",
          )}
        </p>
      )}
      {submit.isSuccess && (
        <p role="status">
          {t(
            "Application saved for administrator review.",
            "প্রশাসকের যাচাইয়ের জন্য আবেদন সংরক্ষিত হয়েছে।",
          )}
        </p>
      )}
    </div>
  );
}
