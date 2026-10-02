import { LoaderIcon } from "lucide-react";

export default function AuthLoading({
  label = "Authenticating...",
}: {
  label?: string;
}) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-lg bg-card px-6 py-4 text-card-foreground shadow-lg ring-1 ring-border">
        <LoaderIcon className="size-5 animate-spin text-primary" />
        <span className="font-medium tracking-tight">{label}</span>
      </div>
    </div>
  );
}