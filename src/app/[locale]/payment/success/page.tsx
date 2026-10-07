import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex max-w-md flex-col items-center gap-6 p-8 rounded-2xl bg-card shadow-xl ring-1 ring-border/50">
        <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
          <CheckCircle2 className="size-16 text-green-600 dark:text-green-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Payment Successful
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your transaction has been processed successfully. Your shipment is now confirmed and ready for dispatch.
          </p>
        </div>
        <Link href="/dashboard/my-shipments" className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full")}>
          View My Shipments
        </Link>
      </div>
    </div>
  );
}