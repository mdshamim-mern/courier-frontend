import { Spinner } from "@/components/ui/spinner";

export default function CourierLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-4">
      <Spinner className="size-8 text-primary" />
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        Loading courier dashboard...
      </p>
    </div>
  );
}