import { useUiText } from "@/i18n/use-ui-text";
import DeliveryTasks from "@/components/modules/courier/delivery-tasks";

export default function DeliveriesPage() {
  const ui = useUiText();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {ui("My Deliveries")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ui(
            "Manage your assigned shipments and update delivery statuses.",
          )}{" "}
        </p>
      </div>
      <DeliveryTasks />
    </div>
  );
}
