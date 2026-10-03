import CourierOverview from "@/components/modules/courier/courier-overview";

export default function CourierDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Courier Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your deliveries and earnings.
        </p>
      </div>
      <CourierOverview />
    </div>
  );
}