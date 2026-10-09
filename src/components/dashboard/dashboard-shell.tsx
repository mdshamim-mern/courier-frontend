"use client";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DashboardSidebar } from "./dashboard-sidebar";
import { useUiText } from "@/i18n/use-ui-text";
import type { ReactNode } from "react";
import type { UserRole } from "@/types";
export default function DashboardShell({
  children,
  userRole,
}: {
  children: ReactNode;
  userRole: UserRole;
}) {
  const ui = useUiText();
  return (
    <SidebarProvider className="dashboard-shell">
      <DashboardSidebar userRole={userRole} />
      <SidebarInset>
        <header className="dashboard-toolbar">
          <SidebarTrigger className="-ml-1" />
          <span className="text-sm font-medium text-muted-foreground">
            {ui("Dashboard")}
          </span>
        </header>
        <div className="dashboard-content">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
