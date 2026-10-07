import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex max-w-md flex-col items-center gap-6 p-8 rounded-2xl bg-card shadow-xl ring-1 ring-border/50">
        <div className="rounded-full bg-yellow-100 p-4 dark:bg-yellow-900/30">
          <XCircle className="size-16 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Payment Cancelled
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            You have cancelled the payment process. Your shipment will remain in unpaid status.
          </p>
        </div>
        <Link href="/dashboard/payments" className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full")}>
          Go to Payments
        </Link>
      </div>
    </div>
  );
}