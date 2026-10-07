import { useUiText } from "@/i18n/use-ui-text";
import CustomerOverview from "@/components/modules/customer/customer-overview";

export default function DashboardPage() {
  const ui = useUiText();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold tracking-tight">{ui("Dashboard")}</h1>
      <CustomerOverview />
    </div>
  );
}
