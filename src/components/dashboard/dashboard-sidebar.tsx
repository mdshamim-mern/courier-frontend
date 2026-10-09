"use client";

import { useUiText } from "@/i18n/use-ui-text";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Logo from "@/assets/svg/Logo";
import type { UserRole, SidebarItems } from "@/types";
import { adminRoutes, courierRoutes, customerRoutes } from "@/routes";
import { Link, usePathname } from "@/i18n/navigation";

const sidebarRoutes: Record<UserRole, SidebarItems> = {
  ADMIN: adminRoutes,
  COURIER: courierRoutes,
  CUSTOMER: customerRoutes,
};

export function DashboardSidebar({ userRole }: { userRole: UserRole }) {
  const ui = useUiText();
  const pathname = usePathname();
  const routes: SidebarItems = sidebarRoutes[userRole] || [];

  return (
    <Sidebar>
      <SidebarHeader className="py-4">
        <Link href="/">
          <div className="flex items-center gap-3 px-2">
            <Logo className="size-9" />
            <span className="brand-wordmark">Dropzo</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {routes.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              {ui(group.title)}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={pathname === item.url}
                    >
                      {ui(item.title)}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
