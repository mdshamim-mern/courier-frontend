"use client";

import type { ReactNode } from "react";
import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ArrowUpRight, PackageCheck, ShieldCheck } from "lucide-react";

const pages: Record<string, [string, string, string, string]> = {
  "/dashboard": [
    "Dashboard",
    "ড্যাশবোর্ড",
    "Your parcels, payments and next steps. All in one place.",
    "আপনার পার্সেল, অর্থপ্রদান ও পরবর্তী কাজ—সব এক জায়গায়।",
  ],
  "/dashboard/business": [
    "Business Account",
    "ব্যবসায়িক অ্যাকাউন্ট",
    "Manage your business details and administrator-reviewed payout information.",
    "ব্যবসার তথ্য ও প্রশাসকের যাচাইযোগ্য টাকা পাওয়ার তথ্য পরিচালনা করুন।",
  ],
  "/dashboard/collections": [
    "Cash Collections",
    "নগদ সংগ্রহ",
    "Follow collected product cash and recorded merchant remittances.",
    "পণ্যের টাকা সংগ্রহ ও ব্যবসায়ীকে হস্তান্তরের নথি দেখুন।",
  ],
  "/dashboard/bulk": [
    "Bulk Shipments",
    "একসঙ্গে পার্সেল বুকিং",
    "Import, validate and review every parcel before confirming your batch.",
    "ফাইল থেকে তথ্য নিন, যাচাই করুন এবং মাশুল দেখে বুকিং নিশ্চিত করুন।",
  ],
  "/dashboard/new-shipment": [
    "New Shipment",
    "নতুন পার্সেল",
    "Three clear steps. Approved charges. A booking you can follow.",
    "তিনটি পরিষ্কার ধাপ, অনুমোদিত মাশুল এবং অনুসরণযোগ্য বুকিং।",
  ],
  "/dashboard/my-shipments": [
    "My Shipments",
    "আমার পার্সেলসমূহ",
    "View and track all your active and past shipments.",
    "চলমান ও আগের সব পার্সেল দেখুন ও অনুসরণ করুন।",
  ],
  "/dashboard/payments": [
    "Payment History",
    "অর্থপ্রদানের ইতিহাস",
    "View your transaction records and payment statuses.",
    "লেনদেনের নথি ও অর্থপ্রদানের অবস্থা দেখুন।",
  ],
  "/dashboard/profile": [
    "My Profile",
    "আমার প্রোফাইল",
    "Manage your personal information and settings.",
    "আপনার ব্যক্তিগত তথ্য ও সেটিং পরিচালনা করুন।",
  ],
};

export default function CustomerWorkspace({
  children,
}: {
  children: ReactNode;
}) {
  const path = usePathname();
  const bn = useLocale() === "bn";
  const page = pages[path];
  return (
    <div className="customer-workspace">
      {page && (
        <header className="customer-hero glass-panel">
          <div>
            <p className="customer-eyebrow">
              <PackageCheck size={16} aria-hidden="true" />
              {bn ? "পার্সেল পরিচালনা" : "SHIPMENT WORKSPACE"}
            </p>
            <h1>{page[bn ? 1 : 0]}</h1>
            <p className="customer-intro">{page[bn ? 3 : 2]}</p>
          </div>
          <Link
            className="secondary-button"
            href={
              path === "/dashboard/new-shipment"
                ? "/coverage"
                : "/dashboard/new-shipment"
            }
          >
            {path === "/dashboard/new-shipment"
              ? bn
                ? "সেবার এলাকা"
                : "Check coverage"
              : bn
                ? "পার্সেল পাঠান"
                : "Send a parcel"}
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </header>
      )}
      <div className={page ? "customer-page-body" : "customer-record-body"}>
        {children}
      </div>
      {page && (
        <aside className="customer-help glass-panel">
          <span>
            <ShieldCheck size={19} aria-hidden="true" />
            {bn
              ? "সঠিক তথ্য দিয়ে বুকিং করুন। সহায়তা প্রয়োজন?"
              : "Book with clear information. Need a hand?"}
          </span>
          <Link href="/contact">
            {bn ? "সহায়তার যোগাযোগ" : "Contact support"}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </aside>
      )}
    </div>
  );
}
