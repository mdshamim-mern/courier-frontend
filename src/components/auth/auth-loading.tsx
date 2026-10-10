import { useUiText } from "@/i18n/use-ui-text";
import DataSkeleton from "@/components/ui/data-skeleton";

export default function AuthLoading({
  label = "Authenticating...",
}: {
  label?: string;
}) {
  const ui = useUiText();
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-lg bg-card px-6 py-4 text-card-foreground shadow-lg ring-1 ring-border">
        <DataSkeleton />
        <span className="font-medium tracking-tight">{ui(label)}</span>
      </div>
    </div>
  );
}
