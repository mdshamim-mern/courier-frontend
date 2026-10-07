import { useUiText } from "@/i18n/use-ui-text";
import CourierOverview from "@/components/modules/courier/courier-overview";

export default function CourierDashboardPage() {
  const ui = useUiText();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {ui("Courier Dashboard")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ui("Overview of your deliveries and earnings.")}{" "}
        </p>
      </div>
      <CourierOverview />
    </div>
  );
}
