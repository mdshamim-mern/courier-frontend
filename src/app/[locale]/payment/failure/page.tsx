import { Button } from "@/components/ui/button";
import { AlertOctagon } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function PaymentFailurePage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex max-w-md flex-col items-center gap-6 p-8 rounded-2xl bg-card shadow-xl ring-1 ring-border/50">
        <div className="rounded-full bg-destructive/10 p-4 dark:bg-destructive/20">
          <AlertOctagon className="size-16 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Payment Failed
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We were unable to process your payment at this time. Please check your credentials or try again with a different payment method.
          </p>
        </div>
        <div className="flex gap-3 w-full mt-4">
          <Button render={<Link href="/dashboard/payments" />} nativeButton={false} variant="outline" className="w-full">
            Back
          </Button>
          <Button render={<Link href="/dashboard/payments" />} nativeButton={false} className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
