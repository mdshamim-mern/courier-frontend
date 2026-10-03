import VerifyAccountForm from "@/components/form/verify-account-form";
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";

export default function VerifyAccountPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4 sm:p-8">
      <div className="w-full max-w-440px">
        <Suspense
          fallback={
            <div className="flex h-64 w-full items-center justify-center rounded-2xl bg-background shadow-xl ring-1 ring-border/50">
              <Spinner className="size-8 text-primary" />
            </div>
          }
        >
          <VerifyAccountForm />
        </Suspense>
      </div>
    </div>
  );
}