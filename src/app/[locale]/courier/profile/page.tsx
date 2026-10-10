"use client";

import { useLocale } from "next-intl";
import { ProfileSchema } from "@/validation/operations.validation";
import DataSkeleton from "@/components/ui/data-skeleton";
import QueryError from "@/components/ui/query-error";
import { SchemaForm } from "@/components/form/schema-form";
import { useUiText } from "@/i18n/use-ui-text";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useGetMe, useUpdateMyProfile } from "@/hooks";
import { useEffect, useId, useState } from "react";
import {
  CourierNote,
  CourierPageHeader,
} from "@/components/modules/courier/courier-ui";
import styles from "@/components/modules/courier/courier.module.css";

export default function CourierProfilePage() {
  const bn = useLocale() === "bn";
  const ui = useUiText();
  const t = (en: string, bangla: string) => (bn ? bangla : en);
  const id = useId();
  const { data, isLoading, isError, refetch } = useGetMe();
  const { mutate: updateProfile, isPending } = useUpdateMyProfile();
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const user = data?.data;
  const courier = user?.courier;

  useEffect(() => {
    if (data?.data) {
      setName(data.data.name || "");
      setContactNumber(data.data.contactNumber || "");
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(
      { name, contactNumber },
      {
        onSuccess: () =>
          toast.add({ title: "Profile Updated", type: "success" }),
        onError: (err) =>
          toast.add({
            title: "Update Failed",
            description: err.message,
            type: "error",
          }),
      },
    );
  };

  return (
    <div className="space-y-6">
      <CourierPageHeader
        icon="profile"
        eyebrow={ui("Settings")}
        title={ui("My Profile")}
        description={ui("Manage your personal courier profile and settings.")}
      />
      {isError ? (
        <QueryError
          retry={() => {
            void refetch();
          }}
        />
      ) : isLoading ? (
        <DataSkeleton />
      ) : (
        <div className={styles.profileGrid}>
          <aside className={styles.identity}>
            <div className={styles.avatar} aria-hidden="true">
              {(user?.name || "Dropzo")
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => Array.from(part)[0])
                .join("")
                .toUpperCase()}
            </div>
            <h2>{user?.name}</h2>
            <p className={styles.detail}>{user?.email}</p>
            <span className={styles.badge}>{ui("Courier")}</span>
            <dl className={styles.data}>
              <div>
                <dt>{t("Account status", "অ্যাকাউন্টের অবস্থা")}</dt>
                <dd>{ui(user?.status || t("Not provided", "তথ্য দেওয়া নেই"))}</dd>
              </div>
              <div>
                <dt>{t("Work availability", "কাজের জন্য উপস্থিতি")}</dt>
                <dd>
                  {courier?.isAvailable == null
                    ? t("Not provided", "তথ্য দেওয়া নেই")
                    : courier.isAvailable
                      ? t("Available", "উপস্থিত")
                      : t("Unavailable", "অনুপস্থিত")}
                </dd>
              </div>
              <div>
                <dt>{t("Vehicle", "যানবাহন")}</dt>
                <dd>
                  {courier?.vehicleType
                    ? ui(courier.vehicleType)
                    : t("Not provided", "তথ্য দেওয়া নেই")}
                </dd>
              </div>
              {courier?.vehicleNumber && (
                <div>
                  <dt>{t("Vehicle number", "যানবাহনের নম্বর")}</dt>
                  <dd>{courier.vehicleNumber}</dd>
                </div>
              )}
            </dl>
          </aside>
          <section className={styles.panel}>
            <div className={styles.sectionTitle}>
              <h2>{ui("Profile Details")}</h2>
              <span className={styles.badge}>
                {t("Personal information", "ব্যক্তিগত তথ্য")}
              </span>
            </div>
            <CourierNote>
              {t(
                "Update your name and contact number here. Email, hub assignment and work availability are managed separately by the platform.",
                "এখানে নাম ও যোগাযোগের নম্বর বদলাতে পারবেন। ইমেইল, হাবের বরাদ্দ ও কাজের উপস্থিতি প্ল্যাটফর্ম আলাদাভাবে পরিচালনা করে।",
              )}
            </CourierNote>
            <SchemaForm
              schema={ProfileSchema}
              onSubmit={handleSubmit}
              className={styles.formFields}
            >
              <Field>
                <FieldLabel htmlFor={id + "-name"}>
                  {ui("Full Name")}
                </FieldLabel>
                <Input
                  id={id + "-name"}
                  name="name"
                  autoComplete="name"
                  value={name}
                  disabled={isPending}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={id + "-email"}>
                  {ui("Email Address")}
                </FieldLabel>
                <Input
                  id={id + "-email"}
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted/50 cursor-not-allowed"
                />
                <p className={styles.detail}>
                  {t(
                    "Your sign-in email is read-only.",
                    "প্রবেশের ইমেইল এখানে পরিবর্তন করা যায় না।",
                  )}
                </p>
              </Field>
              <Field>
                <FieldLabel htmlFor={id + "-phone"}>
                  {ui("Contact Number")}
                </FieldLabel>
                <Input
                  id={id + "-phone"}
                  name="contactNumber"
                  type="tel"
                  autoComplete="tel"
                  value={contactNumber}
                  disabled={isPending}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                />
              </Field>
              <div className={styles.formFooter}>
                <p className={styles.detail}>
                  {t(
                    "Changes are saved to your account.",
                    "পরিবর্তন আপনার অ্যাকাউন্টে সংরক্ষিত হবে।",
                  )}
                </p>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Spinner className="mr-2" />}
                  {ui("Save Changes")}
                </Button>
              </div>
            </SchemaForm>
          </section>
        </div>
      )}
    </div>
  );
}
