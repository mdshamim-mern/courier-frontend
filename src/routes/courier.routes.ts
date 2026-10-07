import type { SidebarItems } from "@/types";

const prefix = "/courier";

export const courierRoutes: SidebarItems = [
  {
    title: "Delivery Management",
    items: [
      {
        title: "Overview",
        url: `${prefix}`,
      },
      {
        title: "My Deliveries",
        url: `${prefix}/deliveries`,
      },
      {
        title: "Earnings",
        url: `${prefix}/earnings`,
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        title: "Profile",
        url: `${prefix}/profile`,
      },
    ],
  },
];