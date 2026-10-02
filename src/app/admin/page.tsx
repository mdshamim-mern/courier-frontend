import AdminOverview from "@/components/modules/admin/admin-overview";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of platform statistics and recent activities.
        </p>
      </div>
      <AdminOverview />
    </div>
  );
}