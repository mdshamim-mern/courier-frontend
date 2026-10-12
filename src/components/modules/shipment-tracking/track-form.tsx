"use client";

import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import { useState, useEffect, useId } from "react";
import { Search, PackageCheck } from "lucide-react";
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
  const inputId = useId();
  const [trackingId, setTrackingId] = useUrlState("tracking", "");
  const [input, setInput] = useState(trackingId);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setInput(trackingId);
    setReady(true);
  }, [trackingId]);
  const result = useQuery({
    queryKey: ["public-tracking", trackingId],
    queryFn: () => trackShipment(trackingId),
    enabled: !!trackingId,
    retry: false,
  });
  return (
    <div className="space-y-6">
      <label htmlFor={inputId} className="tracking-input-label">
        {bn ? "পার্সেলের অনুসন্ধানসংখ্যা" : "Tracking ID"}
      </label>
      <SchemaForm
        schema={TrackingSchema}
        className="flex flex-col sm:flex-row gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const value = String(
            new FormData(event.currentTarget).get("trackingId") ?? "",
          )
            .trim()
            .toUpperCase();
          if (!/^TRK-[A-Z0-9-]{4,76}$/.test(value)) return;
          setInput(value);
          if (trackingId === value) void result.refetch();
          else setTrackingId(value);
        }}
      >
        <Input
          id={inputId}
          name="trackingId"
          disabled={!ready}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          required
          maxLength={80}
          pattern={"[Tt][Rr][Kk]-[A-Za-z0-9\\-]{4,76}"}
          placeholder="TRK-12345"
          aria-describedby={`${inputId}-hint`}
          aria-label={bn ? "পার্সেলের অনুসন্ধানসংখ্যা" : "Tracking ID"}
        />
        <Button type="submit" disabled={!ready || result.isFetching}>
          {result.isFetching ? (
            <Spinner />
          ) : (
            <Search size={17} aria-hidden="true" />
          )}
          {bn ? "খুঁজুন" : ui("Track")}
        </Button>
      </SchemaForm>
      <p id={`${inputId}-hint`} className="tool-caption">
        {bn
          ? "রসিদে থাকা অনুসন্ধানসংখ্যা দিন। ঘরের নমুনাটি শুধু বিন্যাসের উদাহরণ, আসল পার্সেলের নম্বর নয়।"
          : "Use the ID on your receipt. TRK-12345 is a format example, not a real parcel number."}
      </p>
      {result.isFetching && <DataSkeleton />}
      {result.isError && (
        <p role="alert" className="tracking-error">
          {display.error(
            getApiErrorMessage(
              result.error,
              bn ? "পার্সেলের তথ্য পাওয়া যায়নি।" : "Tracking unavailable",
            ),
          )}
        </p>
      )}
      {result.data?.data && (
        <section aria-live="polite" className="tracking-result">
          <div className="tracking-result-heading">
            <PackageCheck aria-hidden="true" />
            <div>
              <p className="font-mono break-all">
                {result.data.data.trackingId}
              </p>
              <strong>{ui(result.data.data.status.replace(/_/g, " "))}</strong>
            </div>
          </div>
          <div className="tracking-events">
            <TrackingTimeline trackings={result.data.data.trackings} />
          </div>
        </section>
      )}
    </div>
  );
}
