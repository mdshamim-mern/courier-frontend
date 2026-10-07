import { useUiText } from "@/i18n/use-ui-text";
import { ShieldAlert } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function AccessDenied() {
  const ui = useUiText();
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex flex-col items-center gap-6 max-w-md">
        <div className="rounded-full bg-destructive/10 p-6 ring-1 ring-destructive/20">
          <ShieldAlert className="size-12 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {ui("Access Denied")}{" "}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {ui(
              "You do not have the required permissions to view this page. If you believe this is a mistake, please contact your administrator.",
            )}{" "}
          </p>
        </div>
        <Button
          render={<Link href="/" />}
          nativeButton={false}
          variant="default"
          size="lg"
          className="mt-4 w-full sm:w-auto"
        >
          {ui("Return to Homepage")}{" "}
        </Button>
      </div>
    </div>
  );
}
