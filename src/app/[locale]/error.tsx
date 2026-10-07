"use client";

import { useUiText } from "@/i18n/use-ui-text";
import { Button } from "@/components/ui/button";
import { TriangleAlertIcon } from "lucide-react";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const ui = useUiText();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex max-w-md flex-col items-center gap-6">
        <div className="rounded-full bg-destructive/10 p-6 ring-1 ring-destructive/20">
          <TriangleAlertIcon className="size-12 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {ui("Something went wrong!")}{" "}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {ui(
              "We encountered an unexpected error while processing your request. Our team has been notified.",
            )}{" "}
          </p>
        </div>
        <div className="flex gap-4 mt-4">
          <Button onClick={() => reset()} variant="default" size="lg">
            {ui("Try again")}{" "}
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            size="lg"
          >
            {ui("Go to Homepage")}{" "}
          </Button>
        </div>
      </div>
    </div>
  );
}
