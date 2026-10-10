import { useUiText } from "@/i18n/use-ui-text";
import DeliveryTasks from "@/components/modules/courier/delivery-tasks";
import { CourierPageHeader } from "@/components/modules/courier/courier-ui";

export default function DeliveriesPage() {
  const ui = useUiText();
  return (
    <div className="flex flex-col gap-6">
      <CourierPageHeader
        icon="route"
        eyebrow={ui("Delivery Management")}
        title={ui("My Deliveries")}
        description={ui(
          "Manage your assigned shipments and update delivery statuses.",
        )}
      />
      <DeliveryTasks />
    </div>
  );
}
