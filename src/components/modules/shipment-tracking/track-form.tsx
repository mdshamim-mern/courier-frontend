"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { trackShipment } from "@/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import TrackingTimeline from "./tracking-timeline";

export default function TrackForm() {
  const bn = useLocale() === "bn";
  const [input, setInput] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const result = useQuery({
    queryKey: ["public-tracking", trackingId], queryFn: () => trackShipment(trackingId),
    enabled: !!trackingId, retry: false,
  });
  return <div className="space-y-6">
    <form className="flex flex-col sm:flex-row gap-3" onSubmit={event => {
      event.preventDefault();
      const value = input.trim().toUpperCase();
      if (!/^TRK-[A-Z0-9-]{4,76}$/.test(value)) return;
      if (trackingId === value) void result.refetch(); else setTrackingId(value);
    }}>
      <Input value={input} onChange={event => setInput(event.target.value)} required maxLength={80}
        pattern={"TRK-[A-Za-z0-9\\-]{4,76}"} placeholder="TRK-..." aria-label={bn ? "পার্সেলের অনুসন্ধানসংখ্যা" : "Tracking ID"} />
      <Button type="submit" disabled={result.isFetching}>{result.isFetching ? <Spinner /> : bn ? "খুঁজুন" : "Track"}</Button>
    </form>
    {result.isError && <p role="alert">{getApiErrorMessage(result.error, bn ? "পার্সেলের তথ্য পাওয়া যায়নি।" : "Tracking unavailable")}</p>}
    {result.data?.data && <div aria-live="polite">
      <p className="font-semibold mb-4">{result.data.data.trackingId}</p>
      <TrackingTimeline trackings={result.data.data.trackings} />
    </div>}
  </div>;
}
