"use client";

import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import { useState, useEffect } from "react";
import { SchemaForm } from "@/components/form/schema-form";
import { TrackingSchema } from "@/validation/operations.validation";
import { useUrlState } from "@/hooks/use-url-state";
import DataSkeleton from "@/components/ui/data-skeleton";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { trackShipment } from "@/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import TrackingTimeline from "./tracking-timeline";

export default function TrackForm() {
  const ui = useUiText();
  const display = useUiFormat();
  const bn = useLocale() === "bn";
  const [trackingId, setTrackingId] = useUrlState("tracking", "");
  const [input, setInput] = useState(trackingId);
  useEffect(() => {
    setInput(trackingId);
  }, [trackingId]);
  const result = useQuery({
    queryKey: ["public-tracking", trackingId],
    queryFn: () => trackShipment(trackingId),
    enabled: !!trackingId,
    retry: false,
  });
  return (
    <div className="space-y-6">
      <SchemaForm
        schema={TrackingSchema}
        className="flex flex-col sm:flex-row gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const value = input.trim().toUpperCase();
          if (!/^TRK-[A-Z0-9-]{4,76}$/.test(value)) return;
          if (trackingId === value) void result.refetch();
          else setTrackingId(value);
        }}
      >
        <Input
          name="trackingId"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          required
          maxLength={80}
          pattern={"TRK-[A-Za-z0-9\\-]{4,76}"}
          placeholder="TRK-..."
          aria-label={bn ? "পার্সেলের অনুসন্ধানসংখ্যা" : "Tracking ID"}
        />
        <Button type="submit" disabled={result.isFetching}>
          {result.isFetching ? <Spinner /> : bn ? "খুঁজুন" : ui("Track")}
        </Button>
      </SchemaForm>
      {result.isFetching && <DataSkeleton />}
      {result.isError && (
        <p role="alert">
          {display.error(
            getApiErrorMessage(
              result.error,
              bn ? "পার্সেলের তথ্য পাওয়া যায়নি।" : "Tracking unavailable",
            ),
          )}
        </p>
      )}
      {result.data?.data && (
        <div aria-live="polite">
          <p className="font-semibold mb-4">{result.data.data.trackingId}</p>
          <TrackingTimeline trackings={result.data.data.trackings} />
        </div>
      )}
    </div>
  );
}
