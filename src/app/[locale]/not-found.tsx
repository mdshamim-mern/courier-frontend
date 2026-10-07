import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { SearchXIcon } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex max-w-md flex-col items-center gap-6">
        <div className="rounded-full bg-muted p-6 ring-1 ring-border">
          <SearchXIcon className="size-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Page Not Found
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The page you are looking for doesn't exist or has been moved. Please check the URL or return to the homepage.
          </p>
        </div>
        <Link href="/" className={cn(buttonVariants({ variant: "default", size: "lg" }), "mt-4")}>
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}