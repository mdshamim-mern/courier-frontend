import RoleGuard from "@/components/auth/role-guard";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import type { ReactNode } from "react";
import styles from "@/components/modules/courier/courier.module.css";

export default function CourierLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["COURIER"]}>
      <DashboardShell userRole="COURIER">
        <div className={styles.workspace} data-courier-workspace>
          {children}
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}
