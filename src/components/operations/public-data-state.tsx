"use client";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function PublicDataState({
  pending,
  retry,
  showSkeleton = true,
}: {
  pending: boolean;
  retry: () => void;
  showSkeleton?: boolean;
}) {
  const bn = useLocale() === "bn";
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    setSlow(false);
    if (!pending) return;
    const timer = setTimeout(() => setSlow(true), 5000);
    return () => clearTimeout(timer);
  }, [pending]);
  return (
    <div
      className="public-data-state"
      role={pending ? "status" : "alert"}
      aria-busy={pending}
    >
      <p>
        {pending
          ? bn
            ? "সেবার তথ্য আনা হচ্ছে…"
            : "Fetching service information…"
          : bn
            ? "সার্ভার থেকে তথ্য আনা যায়নি।"
            : "Service information could not be loaded."}
      </p>
      {pending && showSkeleton && (
        <div aria-hidden="true" className="public-state-skeleton">
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
        </div>
      )}
      {(slow || !pending) && (
        <>
          <p className="tool-caption">
            {bn
              ? "সার্ভার চালু হতে সময় লাগতে পারে অথবা সংযোগে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন; অনুমানভিত্তিক তথ্য বা মাশুল দেখানো হবে না।"
              : "The server may be starting up or the connection may be unavailable. Please retry; no guessed data or charges are shown."}
          </p>
          {!pending && (
            <Button variant="outline" onClick={retry}>
              {bn ? "আবার চেষ্টা করুন" : "Try again"}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
