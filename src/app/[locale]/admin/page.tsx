import { useUiText } from "@/i18n/use-ui-text";
import AdminOverview from "@/components/modules/admin/admin-overview";
import { AdminPageHeader } from "@/components/modules/admin/admin-ui";

export default function AdminDashboardPage() {
  const ui = useUiText();
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={ui("Admin Dashboard")}
        description={ui(
          "Overview of platform statistics and recent activities.",
        )}
      />
      <AdminOverview />
    </div>
  );
}
