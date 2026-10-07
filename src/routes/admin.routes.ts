import type { SidebarItems } from "@/types";

const prefix = "/admin";

export const adminRoutes: SidebarItems = [
  {
    title: "Management",
    items: [
      {
        title: "Overview",
        url: `${prefix}`,
      },
      {
        title: "Manage Users",
        url: `${prefix}/manage-users`,
      },
      {
        title: "Manage Couriers",
        url: `${prefix}/manage-couriers`,
      },
      {
        title: "Hubs",
        url: `${prefix}/hubs`,
      },
      {
        title: "All Shipments",
        url: `${prefix}/all-shipments`,
      },
    ],
  },
];