import { useUiText } from "@/i18n/use-ui-text";
import UserManagementTable from "@/components/modules/admin/user-management-table";
import { AdminPageHeader } from "@/components/modules/admin/admin-ui";

export default function ManageUsersPage() {
  const ui = useUiText();
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={ui("Manage Users")}
        description={ui(
          "View, filter, and modify user roles and account statuses across the platform.",
        )}
      />
      <UserManagementTable />
    </div>
  );
}
