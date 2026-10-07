import { useUiText } from "@/i18n/use-ui-text";
import { Spinner } from "@/components/ui/spinner";

export default function CourierLoading() {
  const ui = useUiText();
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-4">
      <Spinner className="size-8 text-primary" />
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        {ui("Loading courier dashboard...")}{" "}
      </p>
    </div>
  );
}
