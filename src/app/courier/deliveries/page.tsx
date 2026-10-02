import DeliveryTasks from "@/components/modules/courier/delivery-tasks";

export default function DeliveriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">My Deliveries</h1>
        <p className="text-sm text-muted-foreground">
          Manage your assigned shipments and update delivery statuses.
        </p>
      </div>
      <DeliveryTasks />
    </div>
  );
}