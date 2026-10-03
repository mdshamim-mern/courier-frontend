import UserManagementTable from "@/components/modules/admin/user-management-table";

export default function ManageUsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Manage Users</h1>
        <p className="text-sm text-muted-foreground">
          View, filter, and modify user roles and account statuses across the platform.
        </p>
      </div>
      <UserManagementTable />
    </div>
  );
}