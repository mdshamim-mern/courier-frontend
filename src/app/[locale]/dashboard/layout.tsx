import RoleGuard from "@/components/auth/role-guard";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import type { ReactNode } from "react";
import CustomerWorkspace from "@/components/modules/customer/customer-workspace";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["CUSTOMER"]}>
      <DashboardShell userRole="CUSTOMER">
        <CustomerWorkspace>{children}</CustomerWorkspace>
      </DashboardShell>
    </RoleGuard>
  );
}
