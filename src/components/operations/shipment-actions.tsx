"use client";
import {
  AcknowledgmentSchema,
  FailureSchema,
} from "@/validation/operations.validation";
import { SchemaForm } from "@/components/form/schema-form";
import { useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { Shipment, ShipmentStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useUiText } from "@/i18n/use-ui-text";
export default function ShipmentActions({
  shipment,
  onSuccess,
}: {
  shipment: Shipment;
  onSuccess: () => void;
}) {
  const bn = useLocale() === "bn",
    ui = useUiText(),
    t = (en: string, bangla: string) => (bn ? bangla : en);
  const canvas = useRef<HTMLCanvasElement>(null),
    drawing = useRef(false),
    [signed, setSigned] = useState(false),
    [target, setTarget] = useState<ShipmentStatus | null>(null);
  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiClient(`/shipments/${shipment.id}/status`, {
        method: "PATCH",
        body,
      }),
    onSuccess: () => {
      setTarget(null);
      setSigned(false);
      toast.add({ type: "success", title: ui("Status Updated") });
      onSuccess();
    },
  });
  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const surface = canvas.current,
      ctx = surface?.getContext("2d");
    if (!surface || !ctx) return;
    const box = surface.getBoundingClientRect();
    ctx.lineTo(
      ((event.clientX - box.left) * surface.width) / box.width,
      ((event.clientY - box.top) * surface.height) / box.height,
    );
    ctx.stroke();
    setSigned(true);
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {shipment.allowedNextStatuses
          .filter((status) => status !== "CANCELLED")
          .map((status) => (
            <Button
              key={status}
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => {
                if (
                  ["DELIVERED", "DELIVERY_FAILED", "RETURNED"].includes(status)
                ) {
                  setTarget(status);
                  setSigned(false);
                } else mutation.mutate({ status });
              }}
            >
              {ui(
                (
                  {
                    PICKED_UP: "Mark Picked Up",
                    AT_ORIGIN_HUB: "Arrived at Origin Hub",
                    IN_TRANSIT: "Start Hub Transfer",
                    AT_DESTINATION_HUB: "Arrived at Destination Hub",
                    OUT_FOR_DELIVERY: "Out for Delivery",
                    DELIVERED: "Mark Delivered",
                    DELIVERY_FAILED: "Delivery Failed",
                    RETURNED: "Mark Returned",
                  } as Record<string, string>
                )[status] || status,
              )}
            </Button>
          ))}
      </div>
      {target && (
        <SchemaForm
          schema={target === "DELIVERED" ? AcknowledgmentSchema : FailureSchema}
          className="space-y-4 rounded-xl border p-4"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            if (target === "DELIVERED") {
              if (!signed || !canvas.current) return;
              mutation.mutate({
                status: target,
                proof: {
                  receiverName: String(form.get("receiverName")),
                  signature: canvas.current.toDataURL("image/png"),
                  acknowledged: form.has("acknowledged"),
                },
                collectedAmount: Number(form.get("collectedAmount") || 0),
              });
            } else
              mutation.mutate({
                status: target,
                note: String(form.get("note")),
              });
          }}
        >
          {target === "DELIVERED" ? (
            <>
              <p>
                {t(
                  "Ask the recipient to sign after receiving the parcel. This is a recorded acknowledgment, not OTP identity verification.",
                  "পার্সেল পাওয়ার পরে প্রাপককে স্বাক্ষর করতে বলুন। এটি গ্রহণের নথিভুক্ত প্রমাণ, পরিচয়ের যাচাইসংকেত পরীক্ষা নয়।",
                )}
              </p>
              <label>
                {t("Recipient name", "গ্রহণকারীর নাম")}
                <input
                  required
                  minLength={2}
                  name="receiverName"
                  className="mt-2 block min-h-11 w-full rounded-md border px-3"
                />
              </label>
              <canvas
                ref={canvas}
                width={480}
                height={160}
                aria-label={t("Recipient signature area", "প্রাপকের স্বাক্ষরের স্থান")}
                className="h-40 w-full touch-none rounded-lg border bg-white"
                onPointerDown={(e) => {
                  const ctx = e.currentTarget.getContext("2d"),
                    box = e.currentTarget.getBoundingClientRect();
                  if (!ctx) return;
                  drawing.current = true;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  ctx.strokeStyle = "#111";
                  ctx.lineWidth = 2;
                  ctx.beginPath();
                  ctx.moveTo(
                    ((e.clientX - box.left) * 480) / box.width,
                    ((e.clientY - box.top) * 160) / box.height,
                  );
                }}
                onPointerMove={move}
                onPointerUp={() => {
                  drawing.current = false;
                }}
                onPointerCancel={() => {
                  drawing.current = false;
                }}
              />
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  canvas.current?.getContext("2d")?.clearRect(0, 0, 480, 160);
                  setSigned(false);
                }}
              >
                {t("Clear signature", "স্বাক্ষর মুছুন")}
              </Button>
              {Number(shipment.codAmount || 0) > 0 && (
                <label className="block">
                  {t("Exact cash collected", "সংগৃহীত সঠিক নগদ টাকা")}
                  <input
                    required
                    name="collectedAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    className="mt-2 block min-h-11 w-full rounded-md border px-3"
                  />
                </label>
              )}
              <label className="flex items-start gap-2">
                <input required type="checkbox" name="acknowledged" />
                {t(
                  "The recipient confirmed receipt and signed here.",
                  "প্রাপক গ্রহণ নিশ্চিত করে এখানে স্বাক্ষর করেছেন।",
                )}
              </label>
            </>
          ) : (
            <label>
              {t("Reason for failure or return", "ব্যর্থতা বা ফেরতের কারণ")}
              <textarea
                required
                minLength={5}
                maxLength={500}
                name="note"
                className="mt-2 block w-full rounded-md border p-3"
              />
            </label>
          )}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={
                mutation.isPending || (target === "DELIVERED" && !signed)
              }
            >
              {t("Confirm recorded action", "নথিভুক্ত কাজ নিশ্চিত করুন")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setTarget(null)}
            >
              {t("Close", "বন্ধ করুন")}
            </Button>
          </div>
        </SchemaForm>
      )}
      {mutation.isError && (
        <p role="alert">
          {t(
            "Update rejected. Check permissions, current state, delivery payment and required proof.",
            "পরিবর্তন গ্রহণ হয়নি। অনুমতি, বর্তমান ধাপ, ডেলিভারি মাশুল ও প্রয়োজনীয় প্রমাণ যাচাই করুন।",
          )}
        </p>
      )}
    </div>
  );
}
