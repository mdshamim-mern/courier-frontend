"use client";

import { useRef, useState } from "react";
import { useLocale } from "next-intl";
import { RefreshCw } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api-error";
import styles from "./courier.module.css";

export default function CourierRefresh({
  label,
  refresh,
  fetching = false,
}: {
  label: string;
  refresh: () => Promise<void>;
  fetching?: boolean;
}) {
  const bn = useLocale() === "bn";
  const t = (en: string, bangla: string) => (bn ? bangla : en);
  const locked = useRef(false);
  const [pending, setPending] = useState(false);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const run = async () => {
    if (locked.current || fetching) return;
    locked.current = true;
    setPending(true);
    setError("");
    setCheckedAt(null);
    try {
      await refresh();
      setCheckedAt(new Date());
    } catch (failure) {
      const fallback = t(
        "Refresh failed. Please try again.",
        "হালনাগাদ করা যায়নি। আবার চেষ্টা করুন।",
      );
      setError(bn ? fallback : getApiErrorMessage(failure, fallback));
    } finally {
      locked.current = false;
      setPending(false);
    }
  };
  return (
    <div className={styles.refreshControl}>
      <button
        type="button"
        className="secondary-button"
        aria-label={label}
        aria-busy={pending}
        disabled={fetching || pending}
        onClick={() => {
          void run();
        }}
      >
        <RefreshCw
          size={16}
          aria-hidden="true"
          className={pending ? styles.refreshSpin : undefined}
        />
        {pending ? t("Refreshing…", "হালনাগাদ হচ্ছে…") : label}
      </button>
      {pending && (
        <p role="status">
          {t(
            "Fetching the latest server data…",
            "সার্ভার থেকে সর্বশেষ তথ্য আনা হচ্ছে…",
          )}
        </p>
      )}
      {checkedAt && (
        <p role="status">
          {t("Latest server data loaded at", "সার্ভারের সর্বশেষ তথ্য আনা হয়েছে")}{" "}
          {new Intl.DateTimeFormat(bn ? "bn-BD" : "en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: "Asia/Dhaka",
          }).format(checkedAt)}
          .{" "}
          {t(
            "Values remain unchanged if there are no new records.",
            "নতুন হিসাব না থাকলে অঙ্ক অপরিবর্তিত থাকবে।",
          )}
        </p>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
