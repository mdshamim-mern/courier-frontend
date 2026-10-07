import { useUiText } from "@/i18n/use-ui-text";
import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  const ui = useUiText();
  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label={ui("Loading")}
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
