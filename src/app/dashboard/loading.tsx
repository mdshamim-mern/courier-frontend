import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-50" />
        <Skeleton className="h-4 w-75" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-30 w-full rounded-xl" />
        <Skeleton className="h-30 w-full rounded-xl" />
        <Skeleton className="h-30 w-full rounded-xl" />
      </div>
      <Skeleton className="h-100 w-full rounded-xl mt-4" />
    </div>
  );
}