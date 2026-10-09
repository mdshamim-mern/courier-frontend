import RoleGuard from "@/components/auth/role-guard";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import type { ReactNode } from "react";
import styles from "@/components/modules/admin/admin.module.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["ADMIN"]}>
      <DashboardShell userRole="ADMIN">
        <div className={styles.workspace}>{children}</div>
      </DashboardShell>
    </RoleGuard>
  );
}
