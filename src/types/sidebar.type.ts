import { ReactNode } from "react";

export interface SidebarItem {
  title: string;
  url: string;
  isActive?: boolean;
  icon?: ReactNode;
}

export interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

export type SidebarItems = SidebarGroup[];