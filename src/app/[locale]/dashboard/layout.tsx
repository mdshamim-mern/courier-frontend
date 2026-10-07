import RoleGuard from "@/components/auth/role-guard";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import type { ReactNode } from "react";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["CUSTOMER"]}>
      <DashboardShell userRole="CUSTOMER">{children}</DashboardShell>
    </RoleGuard>
  );
}
