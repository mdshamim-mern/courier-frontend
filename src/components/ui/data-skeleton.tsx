import { Skeleton } from "./skeleton";
import { useLocale } from "next-intl";

export default function DataSkeleton() {
  const label = useLocale() === "bn" ? "তথ্য লোড হচ্ছে" : "Loading data";
  return (
    <div
      role="status"
      aria-label={label}
      className="w-full space-y-5 p-4 motion-reduce:animate-none"
    >
      <span className="sr-only">{label}</span>
      <Skeleton className="h-8 w-2/3 max-w-72" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((key) => (
          <Skeleton key={key} className="h-28 rounded-2xl" />
        ))}
      </div>
      {[1, 2, 3, 4].map((key) => (
        <Skeleton key={key} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}
