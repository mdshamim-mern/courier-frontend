import { useUiText } from "@/i18n/use-ui-text";
import CourierOverview from "@/components/modules/courier/courier-overview";
import { CourierPageHeader } from "@/components/modules/courier/courier-ui";

export default function CourierDashboardPage() {
  const ui = useUiText();
  return (
    <div className="flex flex-col gap-6">
      <CourierPageHeader
        icon="truck"
        eyebrow={ui("Delivery Management")}
        title={ui("Courier Dashboard")}
        description={ui("Overview of your deliveries and earnings.")}
      />
      <CourierOverview />
    </div>
  );
}
