import type { SidebarItems } from "@/types";

const prefix = "/dashboard";

export const customerRoutes: SidebarItems = [
  {
    title: "Shipments",
    items: [
      {
        title: "Overview",
        url: `${prefix}`,
      },
      {
        title: "New Shipment",
        url: `${prefix}/new-shipment`,
      },
      {
        title: "My Shipments",
        url: `${prefix}/my-shipments`,
      },
    ],
  },
  {
    title: "Billing & Settings",
    items: [
      {
        title: "Payments",
        url: `${prefix}/payments`,
      },
      {
        title: "Profile",
        url: `${prefix}/profile`,
      },
    ],
  },
];