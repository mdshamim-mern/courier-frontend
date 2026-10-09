"use client";

import { useLocale } from "next-intl";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  FlaskConical,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getApiErrorMessage } from "@/lib/api-error";
import styles from "./admin.module.css";

export function useAdminText() {
  const bn = useLocale() === "bn";
  return (en: string, bangla: string) => (bn ? bangla : en);
}

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const t = useAdminText();
  return (
    <header className={styles.header}>
      <div>
        <span className={styles.eyebrow}>
          <ShieldCheck size={15} aria-hidden="true" />
          {t("ADMIN WORKSPACE", "প্রশাসকের কার্যক্ষেত্র")}
        </span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className={styles.headerAction}>{action}</div>}
    </header>
  );
}

export function AdminDialog({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <DialogContent className={styles.dialog}>
        <DialogHeader>
          <DialogTitle className={styles.dialogTitle}>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function AdminFeedback({
  error,
  success,
}: {
  error?: unknown;
  success?: string;
}) {
  const t = useAdminText();
  if (error) {
    const reason = getApiErrorMessage(
      error,
      t("Request failed. Please try again.", "অনুরোধ সম্পন্ন হয়নি। আবার চেষ্টা করুন।"),
    );
    return (
      <p role="alert" className={styles.error}>
        {reason ===
        "Hub is in use. Reassign its service areas, couriers and shipments before deletion."
          ? t(
              reason,
              "হাবটি ব্যবহৃত হচ্ছে। মুছতে হলে আগে এর এলাকা, কর্মী ও পার্সেল অন্য হাবে বরাদ্দ করুন।",
            )
          : reason}
      </p>
    );
  }
  return success ? (
    <p role="status" className={styles.success}>
      {success}
    </p>
  ) : null;
}

export function RefreshButton({
  refresh,
  pending = false,
}: {
  refresh: () => void;
  pending?: boolean;
}) {
  const t = useAdminText();
  return (
    <Button variant="outline" onClick={refresh} disabled={pending}>
      <RefreshCw size={16} aria-hidden="true" />
      {t("Refresh", "আবার লোড")}
    </Button>
  );
}

export function isTestRecord(record: {
  name?: string;
  email?: string;
  trackingId?: string;
  deliveryInstructions?: string | null;
}) {
  return (
    /@integration\.test$/i.test(record.email || "") ||
    /^Checkout Verification\b/i.test(record.name || "") ||
    /^Demo (Courier|Customer)$/i.test(record.name || "") ||
    /^rahim\.courier\d*@example\.com$/i.test(record.email || "") ||
    /^CHECKOUT-(STRIPE|BKASH)-/i.test(record.trackingId || "") ||
    /checkout verification fixture only/i.test(
      record.deliveryInstructions || "",
    )
  );
}

export function TestRecordBadge() {
  const t = useAdminText();
  return (
    <span className={styles.testBadge}>
      <FlaskConical size={12} aria-hidden="true" />
      {t("Test record", "পরীক্ষামূলক রেকর্ড")}
    </span>
  );
}

export function AdminShortcut({
  href,
  title,
  detail,
}: {
  href: string;
  title: string;
  detail: string;
}) {
  return (
    <Link href={href} className={styles.shortcut}>
      <div>
        <h2>{title}</h2>
        <p>{detail}</p>
      </div>
      <ArrowUpRight size={22} aria-hidden="true" />
    </Link>
  );
}
