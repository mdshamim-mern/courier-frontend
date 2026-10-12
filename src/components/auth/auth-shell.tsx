"use client";
import type { ReactNode } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  PackageCheck,
  ScanLine,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";

export default function AuthShell({
  mode,
  children,
}: {
  mode: "login" | "register";
  children: ReactNode;
}) {
  const bn = useLocale() === "bn";
  const t = (en: string, bangla: string) => (bn ? bangla : en);
  const register = mode === "register";
  return (
    <div className={`auth-workspace auth-${mode}`}>
      <aside className="glass-panel auth-story">
        <span className="eyebrow">
          <PackageCheck size={16} aria-hidden="true" />
          {t("YOUR DROPZO WORKSPACE", "আপনার ড্রপজো অ্যাকাউন্ট")}
        </span>
        <h2>
          {register
            ? t(
                "One account. Every parcel in view.",
                "এক অ্যাকাউন্টে সব পার্সেলের তথ্য।",
              )
            : t(
                "Your deliveries, together in one place.",
                "আপনার সব ডেলিভারির তথ্য এক জায়গায়।",
              )}
        </h2>
        <p>
          {register
            ? t(
                "Create a customer account to book parcels and follow their progress. Email verification is required after registration.",
                "পার্সেল বুকিং ও আপডেট দেখার জন্য গ্রাহক অ্যাকাউন্ট তৈরি করুন। নিবন্ধনের পরে ইমেইল যাচাই প্রয়োজন।",
              )
            : t(
                "Sign in to manage bookings, check shipment updates and view your payment records.",
                "বুকিং পরিচালনা, পার্সেলের আপডেট ও অর্থপ্রদানের নথি দেখতে প্রবেশ করুন।",
              )}
        </p>
        <div className="auth-feature-list">
          {[
            {
              Icon: PackageCheck,
              title: t("Book with clear details", "সঠিক তথ্য দিয়ে বুকিং"),
              text: t(
                "Review the approved delivery charge before confirming.",
                "নিশ্চিত করার আগে অনুমোদিত ডেলিভারি মাশুল দেখুন।",
              ),
            },
            {
              Icon: ScanLine,
              title: t("Follow recorded updates", "নথিভুক্ত আপডেট দেখুন"),
              text: t(
                "Use your tracking number to check shipment progress.",
                "অনুসন্ধানসংখ্যা দিয়ে পার্সেলের অগ্রগতি দেখুন।",
              ),
            },
            {
              Icon: ShieldCheck,
              title: t("Keep your account private", "অ্যাকাউন্টের তথ্য গোপন রাখুন"),
              text: t(
                "Never share your password or verification code.",
                "পাসওয়ার্ড বা যাচাইয়ের সংকেত কারও সঙ্গে ভাগ করবেন না।",
              ),
            },
          ].map(({ Icon, title, text }) => (
            <div key={title}>
              <span className="icon-tile">
                <Icon size={21} aria-hidden="true" />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
        <Link className="text-link" href="/coverage">
          {t("Explore our service areas", "আমাদের সেবার এলাকা দেখুন")}
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
        <Link className="text-link" href="/contact">
          {t("Need help signing in?", "প্রবেশ করতে সহায়তা লাগবে?")}
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </aside>
      <section className="glass-panel auth-form-panel">{children}</section>
    </div>
  );
}
